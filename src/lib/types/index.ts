export interface ProductVariant {
  id: string;
  productId: string;
  type: 'material_kayu' | 'warna_kain' | 'ukuran' | string;
  label: string;
  hexOrSwatch?: string | null;
  priceOffset: number;
  stock: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  sortOrder: number;
}

export interface Dimensions {
  panjang: number; // in cm
  lebar: number;   // in cm
  tinggi: number;  // in cm
}

export interface ProductAttributes {
  seatHeight?: string;
  cushionDensity?: string;
  frameConstruction?: string;
  fabricType?: string;
  finish?: string;
  woodOrigin?: string;
  [key: string]: any;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // in IDR
  material: string;
  status: 'Ready Stock' | 'Pre-Order' | 'Bestseller' | 'Terbatas' | string;
  statusDetail?: string; // e.g., 'Pre-Order (3 Minggu)'
  rating: number;
  reviewCount: number;
  dimensions?: Dimensions;
  attributes?: ProductAttributes;
  categoryId: string;
  categoryName?: string;
  room?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  colorSwatches?: string[]; // hex codes for quick card display
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  room: 'Ruang Tamu' | 'Kamar Tidur' | 'Ruang Makan' | 'Ruang Kerja' | 'Pencahayaan' | 'Dekorasi';
  productCount?: number;
}

export interface CartItem {
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
}

export interface WishlistItem {
  id?: string;
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
}

export interface UserAddress {
  id: string;
  recipient: string;
  phone: string;
  fullAddress: string;
  notes?: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  tier: 'VIP' | 'Regular';
  loyaltyPoints: number;
  avatarUrl?: string;
  addresses: UserAddress[];
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  variantLabel?: string;
  qty: number;
  priceAtOrder: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. #ML-88492
  userId: string;
  status: 'Diterima' | 'Disiapkan di Workshop' | 'Sedang Dikirim' | 'Selesai & Dirakit' | 'Selesai';
  subtotal: number;
  shippingFee: number;
  installFee: number;
  tax: number;
  total: number;
  paymentMethod: 'Transfer Bank (BCA)' | 'Transfer Bank (Mandiri)' | 'Cicilan 0% (12x)' | 'QRIS / E-Wallet';
  paymentStatus: 'Pending' | 'Lunas';
  shippingDate?: string;
  shippingSlot?: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  deliveryNotes?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface PlacedRoomItem {
  instanceId: string;
  productId: string;
  product: Product;
  x: number; // percentage or px on canvas
  y: number;
  rotation: number; // in degrees (0, 90, 180, 270)
  width: number;
  height: number;
}

export type RewardCategory = 'voucher' | 'layanan' | 'garansi' | 'pengiriman';

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: RewardCategory | string;
  pointsCost: number;
  minTier: 'Regular' | 'Silver' | 'Gold' | 'Platinum' | string;
  stock: number | null;
  isActive: boolean;
  validityDays: number | null;
  createdAt: string | Date;
}

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  reward?: Reward;
  pointsSpent: number;
  status: 'Aktif' | 'Terpakai' | 'Kedaluwarsa';
  redeemedAt: string | Date;
  expiresAt?: string | Date | null;
  usedAt?: string | Date | null;
  voucherCode?: string | null;
}

