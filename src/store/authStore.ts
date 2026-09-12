'use client';

// TODO(Tahap 5): Ganti sistem auth manual ini dengan NextAuth.js/Lucia yang proper.
// Jangan biarkan dua sistem auth berjalan bersamaan saat migrasi nanti.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types';
import {
  loginAction,
  registerAction,
  logoutAction,
  getCurrentUserAction,
  type AuthUser,
} from '@/lib/actions/auth';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

interface AuthState {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await loginAction(email, password);
          if (res.success && res.user) {
            const profile: UserProfile = {
              id: res.user.id,
              name: res.user.name,
              email: res.user.email,
              tier: (res.user.tier as any) || 'Regular',
              loyaltyPoints: res.user.loyaltyPoints || 0,
              addresses: res.user.addresses || [],
            };
            set({ user: profile, isLoggedIn: true, isLoading: false });

            // Sync with cart and wishlist stores
            try {
              const cartStore = useCartStore.getState();
              cartStore.setUserId(profile.id);
              cartStore.mergeGuestCartToDatabase(profile.id);

              const wishlistStore = useWishlistStore.getState();
              wishlistStore.setUserId(profile.id);
              wishlistStore.mergeGuestWishlistToDatabase(profile.id);
            } catch (syncErr) {
              console.error('Error syncing cart/wishlist on login:', syncErr);
            }

            return { success: true };
          } else {
            set({ isLoading: false });
            return { success: false, error: res.error || 'Email atau kata sandi salah' };
          }
        } catch (err: any) {
          set({ isLoading: false });
          return { success: false, error: 'Gagal menghubungi server autentikasi' };
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await registerAction(name, email, password);
          if (res.success && res.user) {
            const profile: UserProfile = {
              id: res.user.id,
              name: res.user.name,
              email: res.user.email,
              tier: 'Regular',
              loyaltyPoints: 0,
              addresses: [],
            };
            set({ user: profile, isLoggedIn: true, isLoading: false });

            try {
              const cartStore = useCartStore.getState();
              cartStore.setUserId(profile.id);

              const wishlistStore = useWishlistStore.getState();
              wishlistStore.setUserId(profile.id);
            } catch (syncErr) {
              console.error('Error syncing stores on register:', syncErr);
            }

            return { success: true };
          } else {
            set({ isLoading: false });
            return { success: false, error: res.error || 'Gagal mendaftar' };
          }
        } catch (err: any) {
          set({ isLoading: false });
          return { success: false, error: 'Gagal menghubungi server autentikasi' };
        }
      },

      logout: async () => {
        await logoutAction();
        set({ user: null, isLoggedIn: false });
        try {
          useCartStore.getState().setUserId(null);
          useWishlistStore.getState().setUserId(null);
        } catch (err) {
          console.error('Error resetting stores on logout:', err);
        }
      },

      checkSession: async () => {
        try {
          const serverUser = await getCurrentUserAction();
          if (serverUser) {
            const profile: UserProfile = {
              id: serverUser.id,
              name: serverUser.name,
              email: serverUser.email,
              tier: (serverUser.tier as any) || 'Regular',
              loyaltyPoints: serverUser.loyaltyPoints || 0,
              addresses: serverUser.addresses || [],
            };
            set({ user: profile, isLoggedIn: true });
          } else if (get().isLoggedIn) {
            // Cookie expired on server
            set({ user: null, isLoggedIn: false });
          }
        } catch (err) {
          console.error('checkSession error:', err);
        }
      },
    }),
    {
      name: 'maison-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
