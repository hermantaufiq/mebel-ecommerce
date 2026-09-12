import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      items,
      recipientName,
      recipientPhone,
      recipientAddress,
      deliveryNotes,
      paymentMethod,
      installService,
      subtotal,
      shippingFee = 0,
      installFee = 0,
      discount = 0,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Keranjang belanja kosong" },
        { status: 400 }
      );
    }

    // Find default demo user or create
    let user = await prisma.user.findFirst({
      where: { email: "dian.sastro@example.com" },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: recipientName || "Dian Sastrowardoyo",
          email: "dian.sastro@example.com",
          tier: "VIP",
        },
      });
    }

    const orderNumber = `ML-${Math.floor(10000 + Math.random() * 90000)}`;
    const total = Math.max(0, subtotal + shippingFee + installFee - discount);

    // Get a fallback product if id does not match directly
    const firstProduct = await prisma.product.findFirst({ select: { id: true } });

    // Resolve valid product IDs — supports both old and new CartItem format
    const orderItemsData = await Promise.all(
      items.map(async (item: any) => {
        const rawId = item.productId || item.product?.id || item.id;
        const slug = item.slug || item.product?.slug;

        let validProduct = null;
        if (rawId) {
          validProduct = await prisma.product.findUnique({
            where: { id: rawId },
            select: { id: true, price: true },
          });
        }
        if (!validProduct && slug) {
          validProduct = await prisma.product.findUnique({
            where: { slug },
            select: { id: true, price: true },
          });
        }
        const finalProductId = validProduct?.id || firstProduct?.id;

        // Price priority: item.price (unitPrice from cart) > item.unitPrice > product DB price > 0
        const priceAtOrder = Math.round(
          item.price || item.unitPrice || item.product?.price || validProduct?.price || 0
        );

        return {
          productId: finalProductId!,
          variantLabel: item.variantLabel || null,
          qty: item.qty || 1,
          priceAtOrder,
        };
      })
    );

    // Save order & items to database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: "Diterima",
        subtotal: Math.round(subtotal),
        shippingFee: Math.round(shippingFee),
        installFee: Math.round(installFee),
        tax: 0,
        total: Math.round(total),
        paymentMethod: paymentMethod || "Transfer VA",
        paymentStatus: "Pending",
        shippingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 days
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      order,
    });
  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses pesanan" },
      { status: 500 }
    );
  }
}
