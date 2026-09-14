"use client";

import * as React from "react";
import Link from "next/link";
import { CreditCard, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="w-full bg-background border-t border-border-soft mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Kolom 1: Brand */}
          <div className="space-y-3">
            <h3 className="font-serif text-xl font-bold text-dark tracking-wide">
              Maison Lumina
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Curated contemporary furniture blending artisanal craftsmanship with minimalist elegance for mindful living spaces.
            </p>
          </div>

          {/* Kolom 2: Newsletter */}
          <div className="space-y-3">
            <h4 className="font-sans text-sm font-semibold text-dark tracking-wide">
              Newsletter
            </h4>
            <p className="text-sm text-text-secondary">
              Dapatkan e-lookbook gratis dan penawaran eksklusif.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <Input
                type="email"
                placeholder="Alamat Email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-border-soft text-sm focus-visible:ring-dark"
              />
              <Button
                type="submit"
                className="w-full bg-dark text-white hover:bg-dark/90 font-medium text-sm transition-colors"
              >
                {subscribed ? "✓ Berlangganan!" : "Berlangganan"}
              </Button>
            </form>
          </div>

          {/* Kolom 3: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-sans text-sm font-semibold text-dark tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Tentang Kami", href: "/craftsmanship" },
                { label: "Kebijakan Pengiriman", href: "#" },
                { label: "Garansi & Perawatan", href: "#" },
                { label: "Hubungi Kami", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 4: Pembayaran & Kontak */}
          <div className="space-y-3">
            <h4 className="font-sans text-sm font-semibold text-dark tracking-wide">
              Pembayaran &amp; Kontak
            </h4>
            <div className="space-y-1.5 text-sm text-text-secondary">
              <p>halo@maisonlumina.com</p>
              <p>+62 21 5558 9999</p>
              <p>Senin - Minggu (09:00 - 18:00)</p>
            </div>
            {/* Baris Icon Pembayaran */}
            <div className="pt-2">
              <p className="text-xs text-text-secondary/80 mb-2">Metode Pembayaran:</p>
              <div className="flex items-center gap-3 text-dark">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-border-soft bg-white text-xs font-medium">
                  <CreditCard size={15} />
                  <span>Kartu Kredit</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-border-soft bg-white text-xs font-medium">
                  <Wallet size={15} />
                  <span>E-Wallet / VA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Separator tipis */}
      <Separator className="bg-border-soft" />

      {/* Bawah footer: copyright & policy links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
        <p>© 2024 Maison Lumina. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="#" className="hover:text-accent transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="#" className="hover:text-accent transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
