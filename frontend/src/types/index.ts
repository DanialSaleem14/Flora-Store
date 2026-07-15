export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  featured: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  discountPrice?: number | null;
  description: string;
  shortDescription: string;
  sku: string;
  stock: number;
  category?: Category | string | null;
  tags: string[];
  featured: boolean;
  published: boolean;
  archived: boolean;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface Address {
  _id?: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

export interface Page {
  _id: string;
  key: string;
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  isSystem: boolean;
}

export interface Testimonial {
  _id?: string;
  name: string;
  text: string;
  rating: number;
  avatar?: string;
}

export interface HomepageSection {
  key:
    | 'hero'
    | 'featuredProducts'
    | 'categories'
    | 'promoBanner'
    | 'latestProducts'
    | 'testimonials'
    | 'newsletter';
  enabled: boolean;
  order: number;
}

export interface Website {
  _id?: string;
  storeName: string;
  logo: string;
  hero: {
    title: string;
    subtitle: string;
    image: string;
    buttonText: string;
    buttonLink: string;
  };
  about: string;
  footer: {
    text: string;
    columns: { title: string; links: { label: string; url: string }[] }[];
  };
  contact: { email: string; phone: string; address: string };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    tiktok: string;
  };
  testimonials: Testimonial[];
  homepageSections: HomepageSection[];
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    buttonStyle: 'rounded' | 'square' | 'pill';
    borderRadius: string;
    defaultMode: 'light' | 'dark';
    favicon: string;
    bannerImages: string[];
  };
  settings: {
    storeEmail: string;
    phone: string;
    address: string;
    currency: string;
    timezone: string;
    language: string;
    seo: {
      metaTitle: string;
      metaDescription: string;
      metaKeywords: string;
      gaId: string;
    };
  };
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
}

export type OrderStatus = 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    zip: string;
    country: string;
  };
  paymentMethod: 'card' | 'cod';
  status: OrderStatus;
  createdAt: string;
  deliveredAt: string | null;
}
