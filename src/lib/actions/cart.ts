"use server";

import prisma from "@/lib/prisma";

export interface SyncCartItemPayload {
  productId: string;
  variantId: string | null;
  qty: number;
}

export interface StockValidationResult {
  productId: string;
  variantId: string | null;
  availableStock: number;
  originalQty: number;
  adjustedQty: number;
  isAdjusted: boolean;
}

/**
 * Validates stock of all cart items against the PostgreSQL database.
 * Detects if manual changes in Prisma Studio or stock depletion occurred.
 */
export async function validateCartStockAction(
  items: SyncCartItemPayload[]
): Promise<StockValidationResult[]> {
  const results: StockValidationResult[] = [];

  for (const item of items) {
    let availableStock = 10; // Default fallback stock

    if (item.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true },
      });
      if (variant) {
        availableStock = variant.stock;
      }
    } else {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });
      if (product) {
        const totalVariantStock = product.variants.reduce(
          (sum, v) => sum + v.stock,
          0
        );
        availableStock = totalVariantStock > 0 ? totalVariantStock : 10;
      }
    }

    const adjustedQty = Math.max(1, Math.min(item.qty, availableStock));
    results.push({
      productId: item.productId,
      variantId: item.variantId,
      availableStock,
      originalQty: item.qty,
      adjustedQty,
      isAdjusted: item.qty > availableStock,
    });
  }

  return results;
}

/**
 * Server Action to add/update an item in the user's persistent database cart.
 */
export async function syncCartItemAction(
  userId: string,
  payload: SyncCartItemPayload
) {
  try {
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId: payload.productId,
        variantId: payload.variantId,
      },
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: payload.qty },
      });
      return { success: true, item: updated };
    } else {
      const created = await prisma.cartItem.create({
        data: {
          userId,
          productId: payload.productId,
          variantId: payload.variantId,
          qty: payload.qty,
        },
      });
      return { success: true, item: created };
    }
  } catch (error: any) {
    console.error("syncCartItemAction error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action to update quantity of a specific cart item.
 */
export async function updateCartQtyAction(
  userId: string,
  productId: string,
  variantId: string | null,
  qty: number
) {
  try {
    if (qty <= 0) {
      return removeCartItemAction(userId, productId, variantId);
    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
        variantId,
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty },
      });
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Server Action to remove an item from database cart.
 */
export async function removeCartItemAction(
  userId: string,
  productId: string,
  variantId: string | null
) {
  try {
    await prisma.cartItem.deleteMany({
      where: {
        userId,
        productId,
        variantId,
      },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Server Action to merge guest cart into database when user logs in.
 * Prevents duplicates by summing quantities for matching productId + variantId.
 */
export async function mergeGuestCartAction(
  userId: string,
  guestItems: SyncCartItemPayload[]
) {
  try {
    for (const item of guestItems) {
      const existing = await prisma.cartItem.findFirst({
        where: {
          userId,
          productId: item.productId,
          variantId: item.variantId,
        },
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { qty: existing.qty + item.qty },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            userId,
            productId: item.productId,
            variantId: item.variantId,
            qty: item.qty,
          },
        });
      }
    }

    // Fetch complete updated cart from database
    const dbCartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: "asc" } },
            variants: true,
          },
        },
      },
    });

    return { success: true, items: dbCartItems };
  } catch (error: any) {
    console.error("mergeGuestCartAction error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action to fetch full cart items for a logged in user from database.
 */
export async function getDatabaseCartAction(userId: string) {
  try {
    const dbCartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: "asc" } },
            variants: true,
          },
        },
      },
    });
    return { success: true, items: dbCartItems };
  } catch (error: any) {
    console.error("getDatabaseCartAction error:", error);
    return { success: false, items: [], error: error.message };
  }
}
