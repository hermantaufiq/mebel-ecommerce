"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  toggleWishlistAction,
  removeWishlistItemAction,
  mergeGuestWishlistAction,
  getDatabaseWishlistAction,
} from "@/lib/actions/wishlist";

export type WishlistItem = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  category?: string;
  material?: string;
  status?: string;
  description?: string;
  rating?: number;
  colorSwatches?: string[];
};

interface WishlistState {
  items: WishlistItem[];
  isGuest: boolean;
  userId: string | null;

  // Actions
  toggleWishlist: (item: Omit<WishlistItem, "id">) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
  setUserId: (userId: string | null) => void;
  mergeGuestWishlistToDatabase: (userId: string) => Promise<void>;
  fetchDatabaseWishlist: (userId: string) => Promise<void>;
  getCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isGuest: true,
      userId: null,

      setUserId: (userId) => {
        set({ userId, isGuest: !userId });
      },

      isWishlisted: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },

      toggleWishlist: async (itemData) => {
        const previousItems = [...get().items];
        const exists = previousItems.some(
          (item) => item.productId === itemData.productId
        );

        let updatedItems: WishlistItem[];
        if (exists) {
          updatedItems = previousItems.filter(
            (item) => item.productId !== itemData.productId
          );
        } else {
          updatedItems = [
            ...previousItems,
            {
              ...itemData,
              id: `wish-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            },
          ];
        }

        // 1. Optimistic instant UI update
        set({ items: updatedItems });

        // 2. Server Action for logged in user
        const { userId, isGuest } = get();
        if (!isGuest && userId) {
          const res = await toggleWishlistAction(userId, itemData.productId);
          if (!res.success) {
            // 3. Rollback on failure
            set({ items: previousItems });
            console.error("Gagal sinkronisasi wishlist ke database:", res.error);
          }
        }
      },

      removeFromWishlist: async (productId) => {
        const previousItems = [...get().items];
        const updatedItems = previousItems.filter(
          (item) => item.productId !== productId
        );

        set({ items: updatedItems });

        const { userId, isGuest } = get();
        if (!isGuest && userId) {
          const res = await removeWishlistItemAction(userId, productId);
          if (!res.success) {
            set({ items: previousItems });
          }
        }
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      mergeGuestWishlistToDatabase: async (userId) => {
        const guestProductIds = get().items.map((i) => i.productId);
        if (guestProductIds.length > 0) {
          await mergeGuestWishlistAction(userId, guestProductIds);
        }
        await get().fetchDatabaseWishlist(userId);
      },

      fetchDatabaseWishlist: async (userId) => {
        const res = await getDatabaseWishlistAction(userId);
        if (res.success && res.items) {
          const formattedItems: WishlistItem[] = res.items.map((db: any) => ({
            id: db.id,
            productId: db.productId,
            name: db.product.name,
            slug: db.product.slug,
            image:
              db.product.images[0]?.url ||
              "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
            price: db.product.price,
            category: db.product.category?.name,
            material: db.product.material,
            status: db.product.status,
            description: db.product.description,
            rating: db.product.rating,
          }));

          set({
            items: formattedItems,
            userId,
            isGuest: false,
          });
        }
      },

      getCount: () => get().items.length,
    }),
    {
      name: "maison-lumina-wishlist",
      partialize: (state) => ({
        items: state.items,
        isGuest: state.isGuest,
        userId: state.userId,
      }),
    }
  )
);
