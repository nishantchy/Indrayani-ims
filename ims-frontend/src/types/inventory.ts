export type ProductStatus = "in_stock" | "out_of_stock" | "discontinued";

export interface ProductImage {
  image_id: string;
  image_url: string;
}

export interface StockUpdate {
  quantity: number;
  notes?: string;
  date: string;
}

export interface SaleRecord {
  quantity: number;
  sale_price: number;
  notes?: string;
  date: string;
}

export interface Inventory {
  _id: string;
  category_id: string;
  name: string;
  model_number: string;
  dealer_id: string;
  dealer_price: number;
  description?: string;
  image_id?: string;
  product_code: string;
  slug: string;
  stock: number;
  total_stock_received: number;
  total_sales: number;
  status: ProductStatus;
  stock_updates: StockUpdate[];
  sales_history: SaleRecord[];
  images: ProductImage[];
  created_at: string;
  category_name: string;
  dealer_name: string;
}
