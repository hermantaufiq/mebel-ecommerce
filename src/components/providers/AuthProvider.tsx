"use client";

import * as React from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

function SessionSync() {
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const userId = session.user.id;
      const cartStore = useCartStore.getState();
      const wishlistStore = useWishlistStore.getState();

      if (cartStore.userId !== userId) {
        cartStore.setUserId(userId);
        cartStore.mergeGuestCartToDatabase(userId);
      }

      if (wishlistStore.userId !== userId) {
        wishlistStore.setUserId(userId);
        wishlistStore.mergeGuestWishlistToDatabase(userId);
      }
    } else if (status === "unauthenticated") {
      const cartStore = useCartStore.getState();
      const wishlistStore = useWishlistStore.getState();

      if (cartStore.userId !== null) {
        cartStore.setUserId(null);
      }
      if (wishlistStore.userId !== null) {
        wishlistStore.setUserId(null);
      }
    }
  }, [session, status]);

  return null;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync />
      {children}
    </SessionProvider>
  );
}
