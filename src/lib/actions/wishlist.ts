"use server";

import prisma from "@/lib/prisma";

/**
 * Server Action to toggle a product in user's database wishlist.
 * If present -> removes it.
 * If absent -> adds it.
 * Gracefully handles unique constraints.
 */
export async function toggleWishlistAction(
  userId: string,
  productId: string
): Promise<{ success: boolean; action: "added" | "removed"; error?: string }> {
  try {
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });
      return { success: true, action: "removed" };
    } else {
      await prisma.wishlistItem.create({
        data: {
          userId,
          productId,
        },
      });
      return { success: true, action: "added" };
    }
  } catch (error: any) {
    console.error("toggleWishlistAction error:", error);
    return { success: false, action: "removed", error: error.message };
  }
}

/**
 * Server Action to explicitly remove a product from user's database wishlist.
 */
export async function removeWishlistItemAction(userId: string, productId: string) {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId, productId },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Server Action to fetch all wishlist items of a logged-in user from Neon/Prisma.
 */
export async function getDatabaseWishlistAction(userId: string) {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: "asc" } },
            category: true,
            variants: true,
          },
        },
      },
      orderBy: { addedAt: "desc" },
    });

    return { success: true, items };
  } catch (error: any) {
    return { success: false, items: [], error: error.message };
  }
}

/**
 * Server Action to merge guest wishlist product IDs into database when user logs in.
 */
export async function mergeGuestWishlistAction(
  userId: string,
  productIds: string[]
) {
  try {
    for (const productId of productIds) {
      await prisma.wishlistItem.upsert({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        update: {},
        create: {
          userId,
          productId,
        },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("mergeGuestWishlistAction error:", error);
    return { success: false, error: error.message };
  }
}
