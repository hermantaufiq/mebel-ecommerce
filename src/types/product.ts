export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit?: string;
  };
  material?: string;
  finish?: string[];
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
}
