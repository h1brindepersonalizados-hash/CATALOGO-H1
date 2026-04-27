export interface PriceTier {
  range: string;
  price: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  image: string;
  tiers: PriceTier[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  theme: string;
}

export interface BudgetRequest {
  items: CartItem[];
  eventDate: string;
  clientName: string;
  phoneNumber: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

export interface AppSettings {
  logo: string;
  phone: string;
  adminPassword: string;
  categories: string[];
  banners: Banner[];
  themeColor: string;
  menuIcon: 'diamond' | 'bag' | 'custom';
  customMenuIcon?: string;
}

export type Category = string;
export const DEFAULT_CATEGORIES: Category[] = ['Tudo', 'Necessaires', 'Mochilas', 'Bolsas', 'Frasqueiras', 'Kits Corporativos', 'Brindes'];
