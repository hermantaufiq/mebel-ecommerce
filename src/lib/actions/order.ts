"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateCartTotals } from "@/lib/cart-calculations";

export interface OrderItemInput {
  productId: string;
  variantId: string | null;
  qty: number;
}

export interface CreateOrderPayload {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  deliveryNote?: string;
  deliveryDate?: string;
  deliverySlot?: string;
  installService: boolean;
  paymentMethod: string;
  items: OrderItemInput[];
}

export interface CreateOrderResult {
  success: boolean;
  error?: string;
  orderNumber?: string;
  orderId?: string;
}

/**
 * Fetch saved addresses for the active user.
 */
export async function getUserAddressesAction(userId?: string) {
  try {
    const session = await auth();
    const activeUserId = userId || session?.user?.id;
    if (!activeUserId) return [];

    const addresses = await prisma.address.findMany({
      where: { userId: activeUserId },
      orderBy: { isDefault: "desc" },
    });

    return addresses;
  } catch (err) {
    console.error("getUserAddressesAction error:", err);
    return [];
  }
}

/**
 * Generates a unique order number (format ML-XXXXX).
 */
async function generateUniqueOrderNumber(): Promise<string> {
  let isUnique = false;
  let orderNum = "";

  while (!isUnique) {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    orderNum = `ML-${randomDigits}`;

    const existing = await prisma.order.findUnique({
      where: { orderNumber: orderNum },
      select: { id: true },
    });

    if (!existing) {
      isUnique = true;
    }
  }

  return orderNum;
}

/**
 * Server Action to create an Order and OrderItems atomically.
 * Re-validates current prices and stock from the PostgreSQL database to prevent client tampering.
 */
export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResult> {
  try {
    // 1. Authenticate user from NextAuth session
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return {
        success: false,
        error: "Silakan masuk ke akun Anda terlebih dahulu untuk menyelesaikan pesanan.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return {
        success: false,
        error: "Akun pengguna tidak ditemukan. Harap masuk kembali.",
      };
    }

    // 2. Validate payload input basics
    if (!payload.recipientName || payload.recipientName.trim().length < 3) {
      return { success: false, error: "Nama penerima wajib diisi minimal 3 karakter." };
    }
    if (!payload.recipientPhone || !/^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(payload.recipientPhone.replace(/[\s-]/g, ""))) {
      return { success: false, error: "Nomor telepon / WhatsApp tidak valid." };
    }
    if (!payload.shippingAddress || payload.shippingAddress.trim().length < 10) {
      return { success: false, error: "Alamat pengiriman wajib diisi minimal 10 karakter." };
    }
    if (!payload.paymentMethod) {
      return { success: false, error: "Metode pembayaran wajib dipilih." };
    }
    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: "Keranjang belanja Anda kosong." };
    }

    // 3. Server-side re-validation of prices and stock against PostgreSQL database
    const verifiedItems: {
      productId: string;
      variantId: string | null;
      variantLabel: string | null;
      unitPrice: number;
      qty: number;
    }[] = [];

    for (const item of payload.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product) {
        return {
          success: false,
          error: `Produk dengan ID ${item.productId} tidak ditemukan di katalog kami.`,
        };
      }

      let unitPrice = product.price;
      let variantLabel: string | null = null;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          return {
            success: false,
            error: `Varian yang dipilih untuk produk "${product.name}" tidak ditemukan.`,
          };
        }

        // Strict stock verification
        if (variant.stock < item.qty) {
          return {
            success: false,
            error: `Stok untuk "${product.name} (${variant.label})" tidak mencukupi (sisa: ${variant.stock}, diminta: ${item.qty}).`,
          };
        }

        unitPrice = product.price + variant.priceOffset;
        variantLabel = variant.label;
      } else {
        // Fallback check if product has variants
        const totalVariantStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
        const availableStock = totalVariantStock > 0 ? totalVariantStock : 10;
        if (availableStock < item.qty) {
          return {
            success: false,
            error: `Stok untuk "${product.name}" tidak mencukupi (sisa: ${availableStock}, diminta: ${item.qty}).`,
          };
        }
      }

      verifiedItems.push({
        productId: product.id,
        variantId: item.variantId,
        variantLabel,
        unitPrice,
        qty: item.qty,
      });
    }

    // 4. Recalculate totals on server using single-source calculateCartTotals
    const totals = calculateCartTotals(
      verifiedItems.map((vi) => ({ unitPrice: vi.unitPrice, qty: vi.qty })),
      {
        shippingFee: 0, // Free shipping in Jabodetabek
        installFee: 0,  // Free installation service
        applyTax: true, // 11% PPN
      }
    );

    // 5. Generate unique orderNumber
    const orderNumber = await generateUniqueOrderNumber();

    // 6. Execute atomic database transaction
    const order = await prisma.$transaction(async (tx) => {
      // a. Decrement stock for purchased variants
      for (const vi of verifiedItems) {
        if (vi.variantId) {
          await tx.productVariant.update({
            where: { id: vi.variantId },
            data: {
              stock: {
                decrement: vi.qty,
              },
            },
          });
        }
      }

      // b. Create Order & OrderItems
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: "Diterima",
          subtotal: totals.subtotal,
          shippingFee: totals.shippingFee,
          installFee: totals.installFee,
          tax: totals.tax,
          total: totals.total,
          paymentMethod: payload.paymentMethod,
          paymentStatus: "Pending", // As specified, pending until gateway integration
          recipientName: payload.recipientName.trim(),
          recipientPhone: payload.recipientPhone.trim(),
          shippingAddress: payload.shippingAddress.trim(),
          deliveryNote: payload.deliveryNote?.trim() || null,
          deliveryDate: payload.deliveryDate ? new Date(payload.deliveryDate) : null,
          deliverySlot: payload.deliverySlot || null,
          installService: payload.installService,
          items: {
            create: verifiedItems.map((vi) => ({
              productId: vi.productId,
              variantLabel: vi.variantLabel,
              qty: vi.qty,
              priceAtOrder: vi.unitPrice,
            })),
          },
        },
      });

      // c. Empty database cart for this user
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return newOrder;
    });

    return {
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
    };
  } catch (error: any) {
    console.error("createOrder error:", error);
    return {
      success: false,
      error: error.message || "Gagal memproses pesanan. Silakan coba beberapa saat lagi.",
    };
  }
}

/**
 * Server Action to fetch an Order by orderNumber with strict ownership verification.
 */
export async function getOrderDetailsAction(orderNumber: string) {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: "NOT_FOUND" as const };
    }

    // Enforce ownership: user can only see their own order
    if (order.userId !== sessionUserId) {
      return { success: false, error: "FORBIDDEN" as const };
    }

    return { success: true, order };
  } catch (err: any) {
    console.error("getOrderDetailsAction error:", err);
    return { success: false, error: "SERVER_ERROR" as const };
  }
}
