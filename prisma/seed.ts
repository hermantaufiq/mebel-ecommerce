import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Clearing existing catalog data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log("📁 Seeding categories...");
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Sofa & Lounge",
        slug: "sofa-lounge",
        room: "Ruang Tamu",
      },
    }),
    prisma.category.create({
      data: {
        name: "Kursi Aksen",
        slug: "kursi-aksen",
        room: "Ruang Tamu",
      },
    }),
    prisma.category.create({
      data: {
        name: "Meja Kopi & Samping",
        slug: "meja-kopi-samping",
        room: "Ruang Tamu",
      },
    }),
    prisma.category.create({
      data: {
        name: "Credenza & Konsol",
        slug: "credenza-konsol",
        room: "Ruang Tamu",
      },
    }),
    prisma.category.create({
      data: {
        name: "Kamar Tidur",
        slug: "kamar-tidur",
        room: "Kamar Tidur",
      },
    }),
    prisma.category.create({
      data: {
        name: "Ruang Makan",
        slug: "ruang-makan",
        room: "Ruang Makan",
      },
    }),
    prisma.category.create({
      data: {
        name: "Ruang Kerja",
        slug: "ruang-kerja",
        room: "Ruang Kerja",
      },
    }),
  ]);

  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  console.log("🛋️ Seeding products...");
  const productsData = [
    {
      name: "Astra Minimalist Armchair",
      slug: "astra-minimalist-armchair",
      categorySlug: "kursi-aksen",
      price: 4850000,
      material: "Kayu Jati Solid",
      status: "Ready Stock",
      rating: 4.9,
      reviewCount: 48,
      description:
        "Didesain dengan siluet ramping bernuansa Japandi, Astra Armchair memadukan rangka kayu jati solid bersertifikasi legal dengan bantalan busa berkepadatan tinggi berbalut kain linen premium. Kenyamanan ergonomis berpadu estetika ketenangan alami.",
      dimensions: { panjang: 82, lebar: 78, tinggi: 75 },
      attributes: {
        tinggiDudukan: "42 cm",
        materialBusa: "High-Density Resilient Foam",
        konstruksi: "Mortise & Tenon Joint Tradisional",
        finishing: "Natural Matte Teak Oil (Non-Toxic)",
      },
      images: [
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&q=80",
        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1200&q=80",
      ],
      variants: [
        { type: "material_kayu", label: "Jati Natural", hexOrSwatch: "#C19A6B", priceOffset: 0, stock: 12 },
        { type: "material_kayu", label: "Jati Walnut Gelap", hexOrSwatch: "#543D2B", priceOffset: 250000, stock: 8 },
        { type: "warna_kain", label: "Oatmeal Linen", hexOrSwatch: "#E6DEC8", priceOffset: 0, stock: 10 },
        { type: "warna_kain", label: "Charcoal Slate", hexOrSwatch: "#3D4246", priceOffset: 0, stock: 6 },
        { type: "warna_kain", label: "Sage Green", hexOrSwatch: "#8E9E82", priceOffset: 150000, stock: 4 },
      ],
    },
    {
      name: "Komorebi 3-Seater Curved Sofa",
      slug: "komorebi-curved-sofa",
      categorySlug: "sofa-lounge",
      price: 14500000,
      material: "Bouclé Fabric",
      status: "Ready Stock",
      rating: 5.0,
      reviewCount: 32,
      description:
        "Komorebi terinspirasi dari bias sinar matahari yang menembus celah dedaunan. Bentuk lengkung organik menghadirkan dinamika visual yang lembut, dibalut kain bouclé tebal bertekstur nyaman dengan bantalan bulu angsa sintetis ultra-lembut.",
      dimensions: { panjang: 220, lebar: 95, tinggi: 72 },
      attributes: {
        tinggiDudukan: "40 cm",
        materialBusa: "Memory Foam & Feather Blend",
        konstruksi: "Solid Teak Internal Frame",
        finishing: "Fabric Protection Nano-Coating",
      },
      images: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80",
        "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?w=1200&q=80",
      ],
      variants: [
        { type: "warna_kain", label: "Cream Bouclé", hexOrSwatch: "#F4F0EA", priceOffset: 0, stock: 7 },
        { type: "warna_kain", label: "Warm Sand", hexOrSwatch: "#D3C5B4", priceOffset: 0, stock: 5 },
        { type: "warna_kain", label: "Muted Olive", hexOrSwatch: "#69715F", priceOffset: 350000, stock: 3 },
      ],
    },
    {
      name: "Sabi Organic Coffee Table",
      slug: "sabi-organic-coffee-table",
      categorySlug: "meja-kopi-samping",
      price: 5200000,
      material: "Kayu Jati Solid",
      status: "Ready Stock",
      rating: 4.8,
      reviewCount: 27,
      description:
        "Menghargai ketidaksempurnaan alami kayu jati padat dengan siluet asimetris organik. Dibuat langsung oleh tangan pengrajin Jepara dengan teknik sambungan pasak tradisional tanpa paku logam.",
      dimensions: { panjang: 120, lebar: 65, tinggi: 42 },
      attributes: {
        tinggiDudukan: "-",
        materialBusa: "-",
        konstruksi: "100% Solid Plantation Teak Mortise",
        finishing: "Organic Wax Matte Finish",
      },
      images: [
        "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=1200&q=80",
        "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=1200&q=80",
      ],
      variants: [
        { type: "material_kayu", label: "Jati Bleached", hexOrSwatch: "#E5D8C3", priceOffset: 0, stock: 14 },
        { type: "material_kayu", label: "Jati Natural", hexOrSwatch: "#C19A6B", priceOffset: 0, stock: 9 },
      ],
    },
    {
      name: "Enso Rattan Sideboard Credenza",
      slug: "enso-rattan-sideboard",
      categorySlug: "credenza-konsol",
      price: 8900000,
      material: "Rotan Alami",
      status: "Pre-Order",
      rating: 4.9,
      reviewCount: 19,
      description:
        "Penyimpanan berestetika Zen yang menyatukan pintu anyaman rotan pitrit halus dengan bodi jati solid. Ventilasi alami rotan menjaga kelembapan bagian dalam kabinet tetap seimbang dan tahan lama.",
      dimensions: { panjang: 160, lebar: 45, tinggi: 80 },
      attributes: {
        tinggiDudukan: "-",
        materialBusa: "-",
        konstruksi: "Handwoven Natural Rattan Webbing",
        finishing: "Clear Protective Topcoat",
      },
      images: [
        "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80",
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      ],
      variants: [
        { type: "material_kayu", label: "Jati Natural & Rotan", hexOrSwatch: "#D1AC79", priceOffset: 0, stock: 5 },
        { type: "material_kayu", label: "Black Teak & Rotan", hexOrSwatch: "#2C2A29", priceOffset: 450000, stock: 4 },
      ],
    },
    {
      name: "Nami Low Platform Bed",
      slug: "nami-low-platform-bed",
      categorySlug: "kamar-tidur",
      price: 12800000,
      material: "Kayu Jati Solid",
      status: "Ready Stock",
      rating: 4.9,
      reviewCount: 41,
      description:
        "Tempat tidur platform rendah terinspirasi tatami Jepang. Rangka kokoh kayu jati solid dengan sandaran kepala bersudut ergonomis dan nakas mengambang yang terintegrasi di sisi ranjang.",
      dimensions: { panjang: 215, lebar: 195, tinggi: 85 },
      attributes: {
        tinggiDudukan: "26 cm (Platform)",
        materialBusa: "-",
        konstruksi: "Japanese Wood Joinery Slats",
        finishing: "Satin Smooth Non-Toxic Oil",
      },
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80",
        "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1200&q=80",
      ],
      variants: [
        { type: "material_kayu", label: "Natural Warm Teak", hexOrSwatch: "#C19A6B", priceOffset: 0, stock: 6 },
        { type: "material_kayu", label: "Dark Walnut Stained", hexOrSwatch: "#4B3621", priceOffset: 500000, stock: 3 },
      ],
    },
    {
      name: "Hikari Solid Teak Dining Table",
      slug: "hikari-dining-table",
      categorySlug: "ruang-makan",
      price: 11500000,
      material: "Kayu Jati Solid",
      status: "Ready Stock",
      rating: 5.0,
      reviewCount: 35,
      description:
        "Meja makan solid berkapasitas 6-8 orang dengan tepi bevel lembut dan kaki silang arsitektural. Top table tebal 4 cm memperlihatkan serat kayu jati alami yang memikat.",
      dimensions: { panjang: 200, lebar: 95, tinggi: 76 },
      attributes: {
        tinggiDudukan: "-",
        materialBusa: "-",
        konstruksi: "Double Breadboard Ends & Bridged Trestle",
        finishing: "Food-Safe Water Resistant Oil",
      },
      images: [
        "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&q=80",
        "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=1200&q=80",
      ],
      variants: [
        { type: "material_kayu", label: "Jati Natural Satin", hexOrSwatch: "#C19A6B", priceOffset: 0, stock: 8 },
        { type: "material_kayu", label: "Smoked Brown Oak", hexOrSwatch: "#6F563E", priceOffset: 300000, stock: 5 },
      ],
    },
    {
      name: "Tsubaki Woven Dining Chair",
      slug: "tsubaki-dining-chair",
      categorySlug: "ruang-makan",
      price: 2450000,
      material: "Rotan Alami",
      status: "Ready Stock",
      rating: 4.8,
      reviewCount: 56,
      description:
        "Kursi makan ringan namun sangat kokoh dengan dudukan anyaman tali rami alami dan sandaran lengkung jati yang menopang postur tubuh dengan sempurna saat bersantap santai.",
      dimensions: { panjang: 54, lebar: 52, tinggi: 78 },
      attributes: {
        tinggiDudukan: "45 cm",
        materialBusa: "-",
        konstruksi: "Danish Cord Handwoven Pattern",
        finishing: "Natural Clear Coat",
      },
      images: [
        "https://images.unsplash.com/photo-1503602642458-232111445657?w=1200&q=80",
        "https://images.unsplash.com/photo-1580481077195-c328ad026210?w=1200&q=80",
      ],
      variants: [
        { type: "warna_kain", label: "Natural Cord", hexOrSwatch: "#DFD4C0", priceOffset: 0, stock: 24 },
        { type: "warna_kain", label: "Black Cord", hexOrSwatch: "#2B2B2B", priceOffset: 100000, stock: 16 },
      ],
    },
    {
      name: "Kanso Minimalist Writing Desk",
      slug: "kanso-writing-desk",
      categorySlug: "ruang-kerja",
      price: 6800000,
      material: "Kayu Jati Solid",
      status: "Ready Stock",
      rating: 4.9,
      reviewCount: 22,
      description:
        "Kanso merayakan prinsip kesederhanaan pikiran dalam bekerja. Dilengkapi dua laci tersembunyi dengan rel kayu presisi serta slot manajemen kabel tersembunyi di bawah meja.",
      dimensions: { panjang: 140, lebar: 65, tinggi: 75 },
      attributes: {
        tinggiDudukan: "-",
        materialBusa: "-",
        konstruksi: "Integrated Cable Organiser & Beveled Drawer",
        finishing: "Scratch-Resistant Polyurethane Matte",
      },
      images: [
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&q=80",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80",
      ],
      variants: [
        { type: "material_kayu", label: "Natural Teak", hexOrSwatch: "#C19A6B", priceOffset: 0, stock: 10 },
        { type: "material_kayu", label: "Espresso Teak", hexOrSwatch: "#3B2F2F", priceOffset: 200000, stock: 6 },
      ],
    },
    {
      name: "Kyoto Low Lounge Chair",
      slug: "kyoto-low-lounge-chair",
      categorySlug: "kursi-aksen",
      price: 5400000,
      material: "Linen Premium",
      status: "Ready Stock",
      rating: 4.9,
      reviewCount: 39,
      description:
        "Kursi lounge santai berketinggian rendah dengan bantalan tebal berlapis kain linen bertekstur lembut. Menghadirkan atmosfer spa ryokan Jepang ke ruang santai Anda.",
      dimensions: { panjang: 86, lebar: 82, tinggi: 70 },
      attributes: {
        tinggiDudukan: "36 cm",
        materialBusa: "Multi-Density Pocket Spring Core",
        konstruksi: "Dowelled Teak Frame",
        finishing: "Water-Repellent Fabric",
      },
      images: [
        "https://images.unsplash.com/photo-1580481077195-c328ad026210?w=1200&q=80",
        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&q=80",
      ],
      variants: [
        { type: "warna_kain", label: "Warm Sand", hexOrSwatch: "#D3C5B4", priceOffset: 0, stock: 8 },
        { type: "warna_kain", label: "Earthy Terracotta", hexOrSwatch: "#B5652F", priceOffset: 150000, stock: 5 },
      ],
    },
    {
      name: "Mizu Round Nesting Side Tables",
      slug: "mizu-nesting-side-tables",
      categorySlug: "meja-kopi-samping",
      price: 3600000,
      material: "Kayu Jati Solid",
      status: "Ready Stock",
      rating: 4.7,
      reviewCount: 18,
      description:
        "Set 2 meja samping bundar bertingkat yang dapat disusun menyatu atau dipisah saat menjamu tamu. Kaki silinder berprofil ramping memperkuat kesan modern minimalis.",
      dimensions: { panjang: 55, lebar: 55, tinggi: 50 },
      attributes: {
        tinggiDudukan: "-",
        materialBusa: "-",
        konstruksi: "Turned Solid Wood Cylindrical Legs",
        finishing: "Natural Satin Oil",
      },
      images: [
        "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=1200&q=80",
        "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=1200&q=80",
      ],
      variants: [
        { type: "material_kayu", label: "Jati Natural", hexOrSwatch: "#C19A6B", priceOffset: 0, stock: 15 },
        { type: "material_kayu", label: "Blackened Teak", hexOrSwatch: "#252220", priceOffset: 150000, stock: 11 },
      ],
    },
    {
      name: "Yugen Modular 2-Seater Sofa",
      slug: "yugen-modular-sofa",
      categorySlug: "sofa-lounge",
      price: 9800000,
      material: "Linen Premium",
      status: "Pre-Order",
      rating: 4.8,
      reviewCount: 15,
      description:
        "Sofa modular fleksibel yang dapat digabungkan dengan modul ottoman atau chaise lounge tambahan. Jahitan piping tersembunyi menonjolkan kerapian craftsmanship tingkat tinggi.",
      dimensions: { panjang: 180, lebar: 90, tinggi: 74 },
      attributes: {
        tinggiDudukan: "42 cm",
        materialBusa: "High-Resilience HR35 Foam",
        konstruksi: "Reinforced Kiln-Dried Teak Base",
        finishing: "Removable Washable Cushion Covers",
      },
      images: [
        "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?w=1200&q=80",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
      ],
      variants: [
        { type: "warna_kain", label: "Oatmeal Fabric", hexOrSwatch: "#E6DEC8", priceOffset: 0, stock: 4 },
        { type: "warna_kain", label: "Stone Grey", hexOrSwatch: "#8C8C8C", priceOffset: 0, stock: 3 },
      ],
    },
    {
      name: "Komorebi Media Console",
      slug: "komorebi-media-console",
      categorySlug: "credenza-konsol",
      price: 7600000,
      material: "Kayu Jati Solid",
      status: "Ready Stock",
      rating: 4.9,
      reviewCount: 29,
      description:
        "Konsol TV minimalis dengan pintu geser kisi-kisi kayu jati (slat door) yang memungkinkan sinyal remote tetap tembus tanpa perlu membuka pintu kabinet.",
      dimensions: { panjang: 180, lebar: 42, tinggi: 52 },
      attributes: {
        tinggiDudukan: "-",
        materialBusa: "-",
        konstruksi: "Slatted Sliding Louver Doors",
        finishing: "Natural Matte Clear Topcoat",
      },
      images: [
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
        "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80",
      ],
      variants: [
        { type: "material_kayu", label: "Jati Natural", hexOrSwatch: "#C19A6B", priceOffset: 0, stock: 7 },
        { type: "material_kayu", label: "Deep Walnut", hexOrSwatch: "#4A3728", priceOffset: 250000, stock: 5 },
      ],
    },
    {
      name: "Zenith Solid Teak Bookcase",
      slug: "zenith-solid-teak-bookcase",
      categorySlug: "ruang-kerja",
      price: 8400000,
      material: "Kayu Jati Solid",
      status: "Ready Stock",
      rating: 4.8,
      reviewCount: 14,
      description:
        "Rak buku terbuka 5 tingkat berproporsi tinggi yang kokoh, sempurna untuk memajang koleksi buku seni, vas keramik, dan tanaman hias dalam harmoni Zen.",
      dimensions: { panjang: 100, lebar: 35, tinggi: 190 },
      attributes: {
        tinggiDudukan: "-",
        materialBusa: "-",
        konstruksi: "Reinforced Solid Wood Shelving Tiers",
        finishing: "Matte Organic Oil",
      },
      images: [
        "https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=1200&q=80",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80",
      ],
      variants: [
        { type: "material_kayu", label: "Jati Natural", hexOrSwatch: "#C19A6B", priceOffset: 0, stock: 9 },
      ],
    },
  ];

  for (const p of productsData) {
    const categoryId = catMap.get(p.categorySlug);
    if (!categoryId) continue;

    const createdProduct = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        categoryId: categoryId,
        price: p.price,
        material: p.material,
        status: p.status,
        rating: p.rating,
        reviewCount: p.reviewCount,
        description: p.description,
        dimensions: p.dimensions,
        attributes: p.attributes,
        images: {
          create: p.images.map((url, idx) => ({
            url,
            sortOrder: idx,
            altText: `${p.name} - Tampilan ${idx + 1}`,
          })),
        },
        variants: {
          create: p.variants.map((v) => ({
            type: v.type,
            label: v.label,
            hexOrSwatch: v.hexOrSwatch,
            priceOffset: v.priceOffset,
            stock: v.stock,
          })),
        },
      },
    });

    console.log(`✓ Created product: ${createdProduct.name}`);
  }

  console.log("🎁 Seeding reward catalog (7 functional rewards)...");
  // Clear existing rewards and redemptions
  await prisma.rewardRedemption.deleteMany();
  await prisma.reward.deleteMany();

  const rewards = await Promise.all([
    prisma.reward.create({
      data: {
        name: "Voucher Potongan Rp 500.000",
        description: "Voucher diskon senilai Rp 500.000 untuk pembelian berikutnya. Berlaku 90 hari setelah ditukar.",
        category: "voucher",
        pointsCost: 500,
        minTier: "Regular",
        stock: null,
        isActive: true,
        validityDays: 90,
      },
    }),
    prisma.reward.create({
      data: {
        name: "Voucher Potongan Rp 1.500.000",
        description: "Voucher diskon premium senilai Rp 1.500.000 untuk pembelian berikutnya. Berlaku 90 hari setelah ditukar.",
        category: "voucher",
        pointsCost: 1200,
        minTier: "Silver",
        stock: null,
        isActive: true,
        validityDays: 90,
      },
    }),
    prisma.reward.create({
      data: {
        name: "Konsultasi Desain Interior Personal (1 Sesi)",
        description: "Satu sesi konsultasi desain interior personal bersama konsultan atelier kami, mencakup rencana tata letak dan rekomendasi furnitur untuk ruang Anda.",
        category: "layanan",
        pointsCost: 800,
        minTier: "Silver",
        stock: 10,
        isActive: true,
        validityDays: null,
      },
    }),
    prisma.reward.create({
      data: {
        name: "Upgrade Jasa Perakitan Premium",
        description: "Upgrade ke layanan perakitan premium — tim perakitan khusus, jadwal fleksibel, dan perlindungan lantai premium selama proses perakitan.",
        category: "layanan",
        pointsCost: 400,
        minTier: "Regular",
        stock: null,
        isActive: true,
        validityDays: null,
      },
    }),
    prisma.reward.create({
      data: {
        name: "Extended Warranty +1 Tahun",
        description: "Perpanjangan garansi struktur +1 tahun untuk 1 produk pilihan Anda, mencakup cacat bahan dan kerusakan struktural.",
        category: "garansi",
        pointsCost: 1000,
        minTier: "Gold",
        stock: null,
        isActive: true,
        validityDays: null,
      },
    }),
    prisma.reward.create({
      data: {
        name: "Prioritas Slot Pengiriman",
        description: "Pilih tanggal pengiriman apa pun yang Anda inginkan tanpa batasan slot yang tersedia — prioritas jadwal atelier untuk Anda.",
        category: "pengiriman",
        pointsCost: 300,
        minTier: "Regular",
        stock: null,
        isActive: true,
        validityDays: null,
      },
    }),
    prisma.reward.create({
      data: {
        name: "Gratis Ongkir Luar Jabodetabek (1x)",
        description: "Gratis biaya pengiriman untuk 1 pesanan ke luar area Jabodetabek (Bandung, Surabaya, Yogyakarta, dan kota besar lainnya).",
        category: "pengiriman",
        pointsCost: 600,
        minTier: "Silver",
        stock: null,
        isActive: true,
        validityDays: null,
      },
    }),
  ]);
  console.log(`✓ Created ${rewards.length} rewards`);

  console.log("👤 Seeding demo Silver user (Dian Sastrowardoyo)...");
  const hashedPassword = bcrypt.hashSync("demo1234", 10);
  // Demo user has totalSpending = Rp 28.500.000 -> Silver tier (10jt-50jt)
  // loyaltyPoints = Math.floor(28_500_000 / 100_000) = 285 earned, minus 0 redeemed
  const demoUser = await prisma.user.upsert({
    where: { email: "dian.sastro@example.com" },
    update: {
      passwordHash: hashedPassword,
      totalSpending: 28_500_000,
      tier: "Silver",
      loyaltyPoints: 285,
    },
    create: {
      name: "Dian Sastrowardoyo",
      email: "dian.sastro@example.com",
      passwordHash: hashedPassword,
      totalSpending: 28_500_000,
      tier: "Silver",
      loyaltyPoints: 285,
      addresses: {
        create: {
          recipient: "Dian Sastrowardoyo",
          phone: "+62 812-3456-7890",
          fullAddress: "Jl. Senopati Raya No. 42, Kebayoran Baru, Jakarta Selatan 12190",
          isDefault: true,
        },
      },
    },
  });
  console.log(`✓ Demo user: ${demoUser.name} (${demoUser.tier}, ${demoUser.loyaltyPoints} pts, totalSpending: Rp ${demoUser.totalSpending.toLocaleString("id-ID")})`);

  console.log("📦 Seeding demo orders for Dian Sastrowardoyo...");
  await prisma.orderItem.deleteMany({ where: { order: { userId: demoUser.id } } });
  await prisma.order.deleteMany({ where: { userId: demoUser.id } });

  const sampleProducts = await prisma.product.findMany({ take: 2 });

  if (sampleProducts.length > 0) {
    // 1. Completed order (contributes Rp 28.500.000 to totalSpending & 285 points)
    await prisma.order.create({
      data: {
        orderNumber: "ML-2026-08129",
        userId: demoUser.id,
        status: "Selesai",
        loyaltyProcessed: true,
        subtotal: 28_500_000,
        total: 28_500_000,
        paymentMethod: "Transfer Bank BCA",
        paymentStatus: "Lunas",
        recipientName: "Dian Sastrowardoyo",
        shippingAddress: "Jl. Senopati Raya No. 42, Kebayoran Baru, Jakarta Selatan 12190",
        items: {
          create: [
            {
              productId: sampleProducts[0].id,
              qty: 1,
              priceAtOrder: 28_500_000,
              variantLabel: "Solid Teak / Natural Matte",
            },
          ],
        },
      },
    });

    // 2. Active in-transit order (ready for user to test 'Konfirmasi Pesanan Diterima')
    if (sampleProducts.length > 1) {
      await prisma.order.create({
        data: {
          orderNumber: "ML-2026-09201",
          userId: demoUser.id,
          status: "Dikirim",
          loyaltyProcessed: false,
          subtotal: 4_200_000,
          total: 4_200_000,
          paymentMethod: "QRIS",
          paymentStatus: "Lunas",
          recipientName: "Dian Sastrowardoyo",
          shippingAddress: "Jl. Senopati Raya No. 42, Kebayoran Baru, Jakarta Selatan 12190",
          items: {
            create: [
              {
                productId: sampleProducts[1].id,
                qty: 1,
                priceAtOrder: 4_200_000,
                variantLabel: "Standard Edition",
              },
            ],
          },
        },
      });
    }
    console.log("✓ Created demo orders (1 Selesai with loyalty processed, 1 Dikirim ready to confirm)");
  }

  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

