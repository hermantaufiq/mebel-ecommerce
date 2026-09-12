"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Heart, ShoppingBag, User, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NavDropdown from "@/components/layout/NavDropdown";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Koleksi", href: "/koleksi" },
  { label: "Craftsmanship", href: "/craftsmanship" },
  { label: "Room Planner", href: "/room-planner" },
  { label: "Sale", href: "/koleksi?sale=true" },
];

const roomCategories = [
  { label: "Ruang Tamu", href: "/koleksi?room=ruang-tamu" },
  { label: "Kamar Tidur", href: "/koleksi?room=kamar-tidur" },
  { label: "Ruang Makan", href: "/koleksi?room=ruang-makan" },
  { label: "Ruang Kerja", href: "/koleksi?room=ruang-kerja" },
];

export default function Header() {
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const cartStoreCount = useCartStore((s) =>
    s.items ? s.items.reduce((sum, i) => sum + i.qty, 0) : 0
  );
  const wishlistStoreCount = useWishlistStore((s) =>
    s.items ? s.items.length : 0
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const wishlistCount = mounted ? wishlistStoreCount : 0;
  const cartCount = mounted ? cartStoreCount : 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur border-b border-border-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[70px]">
          {/* Mobile hamburger menu (Sheet trigger on left) */}
          <div className="flex items-center lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="p-2 -ml-2 text-text-primary hover:text-accent transition-colors focus:outline-none"
                  aria-label="Buka menu"
                >
                  <Menu size={22} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[360px] p-6 bg-background flex flex-col justify-between overflow-y-auto">
                <div>
                  <SheetHeader className="text-left mb-6">
                    <SheetTitle className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-[#D8D2C4] rounded flex items-center justify-center text-xs font-semibold text-text-secondary">
                        ML
                      </div>
                      <span className="font-serif text-lg font-bold tracking-wider text-dark">
                        MAISON LUMINA
                      </span>
                    </SheetTitle>
                  </SheetHeader>

                  {/* Mobile Search */}
                  <div className="relative mb-6">
                    <Input
                      type="text"
                      placeholder="Cari furniture..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-9 h-10 text-sm bg-white border-border-soft rounded-lg"
                    />
                    <Search
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                    />
                  </div>

                  {/* Mobile Navigation List */}
                  <nav className="flex flex-col space-y-1">
                    <Link
                      href="/"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2.5 rounded-md text-sm font-medium text-text-primary hover:bg-dark/5 transition-colors"
                    >
                      Beranda
                    </Link>

                    {/* Shop by Room sub-items */}
                    <div className="px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary/80 mb-2">
                        Shop by Room
                      </p>
                      <div className="pl-2 space-y-1 border-l border-border-soft">
                        {roomCategories.map((room) => (
                          <Link
                            key={room.label}
                            href={room.href}
                            onClick={() => setMobileOpen(false)}
                            className="block px-2.5 py-1.5 rounded text-sm text-text-secondary hover:text-accent hover:bg-dark/5 transition-colors"
                          >
                            {room.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <Link
                      href="/koleksi"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2.5 rounded-md text-sm font-medium text-text-primary hover:bg-dark/5 transition-colors"
                    >
                      Koleksi
                    </Link>
                    <Link
                      href="/craftsmanship"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2.5 rounded-md text-sm font-medium text-text-primary hover:bg-dark/5 transition-colors"
                    >
                      Craftsmanship
                    </Link>
                    <Link
                      href="/room-planner"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2.5 rounded-md text-sm font-medium text-text-primary hover:bg-dark/5 transition-colors"
                    >
                      Room Planner
                    </Link>
                    <Link
                      href="/koleksi?sale=true"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2.5 rounded-md text-sm font-medium text-accent hover:bg-dark/5 transition-colors"
                    >
                      Sale
                    </Link>
                  </nav>
                </div>

                {/* Mobile Bottom User Links */}
                <div className="pt-6 border-t border-border-soft mt-6 space-y-2">
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-text-primary hover:bg-dark/5"
                  >
                    <span className="flex items-center gap-2">
                      <Heart size={16} /> Wishlist
                    </span>
                    {wishlistCount > 0 && (
                      <Badge variant="secondary" className="bg-accent text-white text-xs">
                        {wishlistCount}
                      </Badge>
                    )}
                  </Link>
                  <Link
                    href="/keranjang"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-text-primary hover:bg-dark/5"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingBag size={16} /> Keranjang
                    </span>
                    {cartCount > 0 && (
                      <Badge variant="secondary" className="bg-accent text-white text-xs">
                        {cartCount}
                      </Badge>
                    )}
                  </Link>
                  <Link
                    href="/akun"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-text-primary hover:bg-dark/5"
                  >
                    <User size={16} /> Akun Saya
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Left: Logo placeholder + Brand name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#D8D2C4] border border-border-soft rounded flex items-center justify-center text-xs font-semibold text-text-secondary shadow-sm">
                ML
              </div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-wider text-dark group-hover:text-accent transition-colors">
                MAISON LUMINA
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-text-primary hover:text-accent transition-colors"
            >
              Beranda
            </Link>
            <NavDropdown />
            <Link
              href="/koleksi"
              className="text-sm font-medium text-text-primary hover:text-accent transition-colors"
            >
              Koleksi
            </Link>
            <Link
              href="/craftsmanship"
              className="text-sm font-medium text-text-primary hover:text-accent transition-colors"
            >
              Craftsmanship
            </Link>
            <Link
              href="/room-planner"
              className="text-sm font-medium text-text-primary hover:text-accent transition-colors"
            >
              Room Planner
            </Link>
            <Link
              href="/koleksi?sale=true"
              className="text-sm font-medium text-accent hover:underline transition-all"
            >
              Sale
            </Link>
          </nav>

          {/* Right: Search Input + 3 Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input with right-aligned icon */}
            <div className="relative hidden md:block w-44 xl:w-56">
              <Input
                type="text"
                placeholder="Cari furniture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8 h-9 text-xs bg-white/80 border-border-soft rounded-full focus-visible:ring-dark"
              />
              <Search
                size={15}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
              />
            </div>

            {/* Wishlist Icon with Badge */}
            <Link
              href="/wishlist"
              className="relative p-2 text-text-primary hover:text-accent transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 text-[10px] font-bold flex items-center justify-center rounded-full bg-accent text-white border-none"
                >
                  {wishlistCount}
                </Badge>
              )}
            </Link>

            {/* Cart Icon with Badge */}
            <Link
              href="/keranjang"
              className="relative p-2 text-text-primary hover:text-accent transition-colors"
              aria-label="Keranjang"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 text-[10px] font-bold flex items-center justify-center rounded-full bg-accent text-white border-none"
                >
                  {cartCount}
                </Badge>
              )}
            </Link>

            {/* Account Avatar */}
            <Link href="/akun" aria-label="Akun" className="ml-1">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 bg-dark text-white cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
                <AvatarFallback className="bg-dark text-white">
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
