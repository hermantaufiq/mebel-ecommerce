"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Hotspot {
  x: number; // percentage from left
  y: number; // percentage from top
  title: string;
  price: string;
}

interface RoomData {
  name: string;
  slug: string;
  image: string;
  description: string;
  hotspots: Hotspot[];
}

const rooms: RoomData[] = [
  {
    name: "Ruang Tamu",
    slug: "ruang-tamu",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80",
    description: "Kehangatan ruang keluarga dengan harmoni kayu jati solid dan sofa lengkung berlapis bouclé lembut.",
    hotspots: [
      { x: 38, y: 62, title: "Komorebi Curved Sofa", price: "Rp 14.500.000" },
      { x: 55, y: 78, title: "Sabi Organic Coffee Table", price: "Rp 5.200.000" },
      { x: 76, y: 55, title: "Astra Minimalist Armchair", price: "Rp 4.850.000" },
    ],
  },
  {
    name: "Kamar Tidur",
    slug: "kamar-tidur",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&q=80",
    description: "Suasana peristirahatan hening bernuansa Zen dengan ranjang platform rendah dan nakas minimalis.",
    hotspots: [
      { x: 50, y: 65, title: "Nami Low Platform Bed", price: "Rp 12.800.000" },
      { x: 80, y: 70, title: "Zenith Bedside Drawer", price: "Rp 2.900.000" },
    ],
  },
  {
    name: "Ruang Makan",
    slug: "ruang-makan",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&q=80",
    description: "Meja makan kayu jati berpadu kursi anyaman tali alami untuk kehangatan santap bersama keluarga.",
    hotspots: [
      { x: 48, y: 68, title: "Hikari Solid Teak Dining Table", price: "Rp 11.500.000" },
      { x: 32, y: 72, title: "Tsubaki Woven Dining Chair", price: "Rp 2.450.000" },
    ],
  },
  {
    name: "Ruang Kerja",
    slug: "ruang-kerja",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1600&q=80",
    description: "Fokus dan inspirasi dalam kesederhanaan meja kerja fungsional dan rak buku jati terbuka.",
    hotspots: [
      { x: 45, y: 65, title: "Kanso Minimalist Writing Desk", price: "Rp 6.800.000" },
      { x: 82, y: 48, title: "Zenith Solid Teak Bookcase", price: "Rp 8.400.000" },
    ],
  },
];

export default function ShopByRoom() {
  const [activeTab, setActiveTab] = React.useState(0);
  const currentRoom = rooms[activeTab];

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">
              INSPIRASI RUANGAN
            </p>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-dark">
              Shop by Room
            </h2>
          </div>
          <Link
            href={`/koleksi?room=${currentRoom.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-dark hover:text-accent transition-colors group"
          >
            <span>Jelajahi {currentRoom.name}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Room Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {rooms.map((room, idx) => (
            <button
              key={room.name}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === idx
                  ? "bg-dark text-white shadow-sm"
                  : "bg-white text-text-secondary border border-border-soft hover:bg-white/80 hover:text-dark"
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>

        {/* Interactive Room Canvas */}
        <div className="relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[21/10] shadow-soft border border-border-soft group">
          <img
            src={currentRoom.image}
            alt={currentRoom.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
          />

          {/* Dark gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent pointer-events-none" />

          {/* Interactive Hotspot Dots */}
          {currentRoom.hotspots.map((h, i) => (
            <div
              key={i}
              className="absolute z-20 group/spot"
              style={{ left: `${h.x}%`, top: `${h.y}%`, transform: "translate(-50%, -50%)" }}
            >
              {/* Pulsing Outer Ring */}
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-white/40 opacity-75" />
                <button
                  type="button"
                  aria-label={`Hotspot ${h.title}`}
                  className="relative w-6 h-6 rounded-full bg-white text-dark shadow-md flex items-center justify-center cursor-pointer hover:scale-115 transition-transform"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                </button>

                {/* Tooltip on hover */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/spot:opacity-100 pointer-events-none transition-all duration-200 min-w-[160px] bg-dark/95 text-white p-2.5 rounded-lg shadow-elevated backdrop-blur-sm text-center">
                  <p className="text-xs font-serif font-bold leading-snug">{h.title}</p>
                  <p className="text-[11px] text-accent font-semibold mt-0.5">{h.price}</p>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-dark/95 rotate-45" />
                </div>
              </div>
            </div>
          ))}

          {/* Room Description Badge */}
          <div className="absolute bottom-6 left-6 right-6 sm:max-w-md bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-border-soft/60">
            <h3 className="font-serif text-lg font-bold text-dark mb-1">
              {currentRoom.name}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {currentRoom.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
