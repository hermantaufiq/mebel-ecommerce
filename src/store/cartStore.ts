"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  syncCartItemAction,
  updateCartQtyAction,
  removeCartItemAction,
  validateCartStockAction,
  mergeGuestCartAction,
  getDatabaseCartAction,
} from "@/lib/actions/cart";
import { calculateCartTotals } from "@/lib/cart-calculations";

export type CartItem = {
  id: string; // client-generated temp id OR DB id
  productId: string;
  variantId: string | null;
  name: string;
  image: string;
  unitPrice: number; // includes variant priceOffset
  qty: number;
  maxStock: number;
  material?: string;
  variantLabel?: string;
  slug?: string;
};

interface CartState {
  items: CartItem[];
  isGuest: boolean;
  userId: string | null;
  installService: boolean;
  deliveryDate: string;
  deliverySlot: string;
  isAdding: boolean;

  // Actions
  addItem: (item: Omit<CartItem, "id">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQty: (id: string, qty: number) => Promise<void>;
  clearCart: () => void;
  setUserId: (userId: string | null) => void;
  toggleInstallService: () => void;
  setDeliveryDate: (date: string) => void;
  setDeliverySlot: (slot: string) => void;
  mergeGuestCartToDatabase: (userId: string) => Promise<void>;
  validateCartStock: () => Promise<{ adjusted: boolean; messages: string[] }>;

  // Derived helpers
  getItemCount: () => number;
  getSubtotal: () => number;
}

// Helper debounce timer map for fast clicks on qty +/-
const debounceTimers: Record<string, NodeJS.Timeout> = {};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isGuest: true,
      userId: null,
      installService: true,
      deliveryDate: "2026-09-18",
      deliverySlot: "Slot Pagi (09:00 - 13:00 WIB)",
      isAdding: false,

      setUserId: (userId) => {
        set({ userId, isGuest: !userId });
      },

      toggleInstallService: () => {
        set({ installService: !get().installService });
      },

      setDeliveryDate: (deliveryDate) => {
        set({ deliveryDate });
      },

      setDeliverySlot: (deliverySlot) => {
        set({ deliverySlot });
      },

      addItem: async (newItemData) => {
        if (get().isAdding) return; // Prevent double submit race condition
        set({ isAdding: true });

        const previousItems = [...get().items];
        const { items, userId, isGuest } = get();

        // 2.2 Item identity: productId + variantId
        const existingIndex = items.findIndex(
          (i) =>
            i.productId === newItemData.productId &&
            (i.variantId || null) === (newItemData.variantId || null)
        );

        let targetItem: CartItem;
        let updatedItems: CartItem[];

        if (existingIndex >= 0) {
          const current = items[existingIndex];
          const newQty = Math.min(
            current.qty + (newItemData.qty || 1),
            current.maxStock || 99
          );
          targetItem = { ...current, qty: newQty };
          updatedItems = [...items];
          updatedItems[existingIndex] = targetItem;
        } else {
          targetItem = {
            ...newItemData,
            id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            qty: Math.min(
              newItemData.qty || 1,
              newItemData.maxStock || 99
            ),
          };
          updatedItems = [...items, targetItem];
        }

        // 1. Optimistic update
        set({ items: updatedItems });

        // 2. If logged in, sync with database
        if (!isGuest && userId) {
          const res = await syncCartItemAction(userId, {
            productId: targetItem.productId,
            variantId: targetItem.variantId,
            qty: targetItem.qty,
          });

          if (!res.success) {
            // 3. Rollback on failure
            set({ items: previousItems });
            console.error("Gagal sinkronisasi cart ke server:", res.error);
          }
        }

        set({ isAdding: false });
      },

      removeItem: async (id) => {
        const previousItems = [...get().items];
        const target = previousItems.find((i) => i.id === id);
        if (!target) return;

        // 1. Optimistic update
        set({ items: previousItems.filter((i) => i.id !== id) });

        // 2. Sync to database if logged in
        const { userId, isGuest } = get();
        if (!isGuest && userId) {
          const res = await removeCartItemAction(
            userId,
            target.productId,
            target.variantId
          );
          if (!res.success) {
            // Rollback
            set({ items: previousItems });
          }
        }
      },

      updateQty: async (id, newQty) => {
        const previousItems = [...get().items];
        const target = previousItems.find((i) => i.id === id);
        if (!target) return;

        // 2.3 Rule: Minimum qty = 1. Tombol "-" pada qty=1 menghapus item
        if (newQty <= 0) {
          return get().removeItem(id);
        }

        // Clamped by maxStock
        const validQty = Math.min(newQty, target.maxStock || 99);

        // 1. Optimistic instant UI update
        set({
          items: previousItems.map((i) =>
            i.id === id ? { ...i, qty: validQty } : i
          ),
        });

        // 2. Debounced (400ms) sync to database for logged in users
        const { userId, isGuest } = get();
        if (!isGuest && userId) {
          if (debounceTimers[id]) {
            clearTimeout(debounceTimers[id]);
          }

          debounceTimers[id] = setTimeout(async () => {
            await updateCartQtyAction(
              userId,
              target.productId,
              target.variantId,
              validQty
            );
            delete debounceTimers[id];
          }, 400);
        }
      },

      clearCart: () => {
        set({ items: [] });
      },

      mergeGuestCartToDatabase: async (userId: string) => {
        const guestItems = get().items;
        if (guestItems.length === 0) {
          const dbRes = await getDatabaseCartAction(userId);
          if (dbRes.success && dbRes.items && dbRes.items.length > 0) {
            const dbItems: CartItem[] = dbRes.items.map((dbItem: any) => {
              const variant = dbItem.product?.variants?.find(
                (v: any) => v.id === dbItem.variantId
              );
              const priceOffset = variant?.priceOffset || 0;
              return {
                id: dbItem.id,
                productId: dbItem.productId,
                variantId: dbItem.variantId,
                name: dbItem.product?.name || "Produk",
                image:
                  dbItem.product?.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
                unitPrice: (dbItem.product?.price || 0) + priceOffset,
                qty: dbItem.qty,
                maxStock: variant?.stock || 10,
                material: dbItem.product?.material,
                variantLabel: variant?.label,
                slug: dbItem.product?.slug,
              };
            });
            set({ items: dbItems, userId, isGuest: false });
          } else {
            set({ userId, isGuest: false });
          }
          return;
        }

        const payload = guestItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          qty: item.qty,
        }));

        const res = await mergeGuestCartAction(userId, payload);
        if (res.success && res.items) {
          // Format DB items into CartItem shape
          const mergedItems: CartItem[] = res.items.map((dbItem: any) => {
            const variant = dbItem.product.variants.find(
              (v: any) => v.id === dbItem.variantId
            );
            const priceOffset = variant?.priceOffset || 0;
            return {
              id: dbItem.id,
              productId: dbItem.productId,
              variantId: dbItem.variantId,
              name: dbItem.product.name,
              image:
                dbItem.product.images[0]?.url ||
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
              unitPrice: dbItem.product.price + priceOffset,
              qty: dbItem.qty,
              maxStock: variant?.stock || 10,
              material: dbItem.product.material,
              variantLabel: variant?.label,
              slug: dbItem.product.slug,
            };
          });

          set({
            items: mergedItems,
            userId,
            isGuest: false,
          });
        } else {
          set({ userId, isGuest: false });
        }
      },

      validateCartStock: async () => {
        const { items } = get();
        if (items.length === 0) {
          return { adjusted: false, messages: [] };
        }

        const validationPayload = items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          qty: i.qty,
        }));

        try {
          const results = await validateCartStockAction(validationPayload);
          let adjusted = false;
          const messages: string[] = [];

          const updatedItems = items.map((item) => {
            const match = results.find(
              (r) =>
                r.productId === item.productId &&
                (r.variantId || null) === (item.variantId || null)
            );

            if (match) {
              if (match.isAdjusted) {
                adjusted = true;
                messages.push(
                  `Stok untuk "${item.name}" tersisa ${match.availableStock}. Kuantitas disesuaikan otomatis.`
                );
                return {
                  ...item,
                  qty: match.adjustedQty,
                  maxStock: match.availableStock,
                };
              }
              return {
                ...item,
                maxStock: match.availableStock,
              };
            }
            return item;
          });

          if (adjusted) {
            set({ items: updatedItems });
          }

          return { adjusted, messages };
        } catch (e) {
          console.error("validateCartStock error:", e);
          return { adjusted: false, messages: [] };
        }
      },

      // 2.4 Centralized calculations
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },

      getSubtotal: () => {
        const { subtotal } = calculateCartTotals(get().items);
        return subtotal;
      },
    }),
    {
      name: "maison-lumina-cart",
      partialize: (state) => ({
        items: state.items,
        isGuest: state.isGuest,
        userId: state.userId,
        installService: state.installService,
        deliveryDate: state.deliveryDate,
        deliverySlot: state.deliverySlot,
      }),
    }
  )
);
