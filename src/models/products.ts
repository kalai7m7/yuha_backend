// models/Product.ts

export interface ProductImage {
  image_url: string;
  alt_text: string;
}

/** To fetch products from db */
export interface Product {
  product_id: number;
  p_name: string;
  description: string;
  short_description: string;
  price: number;
  offer_price: number;
  offer_label: string;
  finish_type: string;
  delivery_time: string;
  count: number;
  category: string;
  occasion_type: string;
  created_at: Date;
  images: ProductImage[];
}

/** To insert a new product */
export interface ProductInput {
  p_name: string;
  description?: string;
  short_description?: string;
  price: number;
  offer_price?: number;
  offer_label?: string;
  finish_type_id?: number;
  delivery_time?: string;
  count?: number;
  category_id?: number;
  occasion_type_id?: number;
}
