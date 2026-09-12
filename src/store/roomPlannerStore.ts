'use client';

import { create } from 'zustand';
import { PlacedRoomItem, Product } from '@/types';

type RoomType = 'ruang-tamu' | 'kamar-tidur' | 'ruang-makan';

interface RoomPlannerState {
  roomType: RoomType;
  placedItems: PlacedRoomItem[];
  showGrid: boolean;
  setRoomType: (type: RoomType) => void;
  addToCanvas: (product: Product) => void;
  removeFromCanvas: (instanceId: string) => void;
  updatePosition: (instanceId: string, x: number, y: number) => void;
  resetCanvas: () => void;
  toggleGrid: () => void;
  getItemCount: () => number;
  getTotalEstimate: () => number;
}

export const useRoomPlannerStore = create<RoomPlannerState>()((set, get) => ({
  roomType: 'ruang-tamu',
  placedItems: [],
  showGrid: true,

  setRoomType: (type) => set({ roomType: type, placedItems: [] }),

  addToCanvas: (product) => {
    const instanceId = `canvas-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newItem: PlacedRoomItem = {
      instanceId,
      productId: product.id,
      product,
      x: 50 + Math.random() * 40 - 20,
      y: 50 + Math.random() * 40 - 20,
      rotation: 0,
      width: 80,
      height: 80,
    };
    set({ placedItems: [...get().placedItems, newItem] });
  },

  removeFromCanvas: (instanceId) => {
    set({ placedItems: get().placedItems.filter((item) => item.instanceId !== instanceId) });
  },

  updatePosition: (instanceId, x, y) => {
    const updated = get().placedItems.map((item) =>
      item.instanceId === instanceId ? { ...item, x, y } : item
    );
    set({ placedItems: updated });
  },

  resetCanvas: () => set({ placedItems: [] }),

  toggleGrid: () => set({ showGrid: !get().showGrid }),

  getItemCount: () => get().placedItems.length,

  getTotalEstimate: () =>
    get().placedItems.reduce((sum, item) => sum + item.product.price, 0),
}));
