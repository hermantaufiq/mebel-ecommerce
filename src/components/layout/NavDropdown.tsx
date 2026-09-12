"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Armchair, Bed, Utensils, Briefcase } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roomItems = [
  {
    label: "Ruang Tamu",
    href: "/koleksi?room=ruang-tamu",
    description: "Sofa artisanal, coffee table, & lounge chair",
    icon: Armchair,
  },
  {
    label: "Kamar Tidur",
    href: "/koleksi?room=kamar-tidur",
    description: "Ranjang jati, bedside table, & drawer",
    icon: Bed,
  },
  {
    label: "Ruang Makan",
    href: "/koleksi?room=ruang-makan",
    description: "Meja makan solid teak & kursi rotan",
    icon: Utensils,
  },
  {
    label: "Ruang Kerja",
    href: "/koleksi?room=ruang-kerja",
    description: "Meja kerja minimalis & rak buku zen",
    icon: Briefcase,
  },
];

export default function NavDropdown() {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="flex items-center gap-1.5 py-1 text-sm font-medium text-text-primary hover:text-accent transition-colors outline-none focus:outline-none"
        onMouseEnter={() => setOpen(true)}
      >
        <span>Shop by Room</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 text-text-secondary ${
            open ? "rotate-180 text-accent" : ""
          }`}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-72 p-2 bg-background border border-border-soft rounded-lg shadow-elevated"
        onMouseLeave={() => setOpen(false)}
      >
        <div className="px-3 py-2 border-b border-border-soft/60 mb-1">
          <p className="text-xs font-serif font-bold text-dark tracking-wide uppercase">
            Pilihan Ruangan
          </p>
          <p className="text-[11px] text-text-secondary">
            Eksplorasi furniture terkurasi per ruangan
          </p>
        </div>
        {roomItems.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem key={item.label} asChild className="cursor-pointer">
              <Link
                href={item.href}
                className="flex items-start gap-3 p-2.5 rounded-md hover:bg-dark/5 transition-colors group"
                onClick={() => setOpen(false)}
              >
                <div className="p-1.5 rounded-md bg-dark/5 text-dark group-hover:bg-accent/10 group-hover:text-accent transition-colors shrink-0">
                  <Icon size={16} />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-text-secondary line-clamp-1">
                    {item.description}
                  </div>
                </div>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
