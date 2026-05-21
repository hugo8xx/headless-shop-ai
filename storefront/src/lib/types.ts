export type Product = {
  id: string;
  odoo_id?: number;
  name: string;
  slug: string;
  price: number;
  currency: string;
  image_url: string;
  in_stock: boolean;
  qty_available: number;
  category: { id: number; name: string } | null;
  description?: string;
  ai_description?: string;
  attributes?: { name: string; values: string[] }[];
  images?: string[];
};

export type Category = {
  id: number;
  name: string;
  parent_id: number | null;
  product_count: number;
};

export type CartLine = {
  id: number;
  product_id: string;
  product_name: string;
  image_url: string;
  qty: number;
  unit_price: number;
  subtotal: number;
};

export type Cart = {
  token: string;
  items: CartLine[];
  item_count: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
};

export type OrderTimeline = {
  state: string;
  label: string;
  done: boolean;
}[];

export type Order = {
  id: number;
  order_name: string;
  state: string;
  date_order: string;
  total: number;
  currency: string;
  items: { product_name: string; qty: number; subtotal: number }[];
  shipping: {
    name: string;
    street: string;
    city: string;
    zip: string;
    country: string;
  };
  timeline: OrderTimeline;
};

export type ApiEnvelope<T> =
  | { success: true; data: T; meta?: Record<string, unknown> }
  | { success: false; error: { code: string; message: string } };
