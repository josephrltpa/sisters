export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'puan' | 'cake';
  description?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'completed';
  notes?: string;
  business: 'puan' | 'cake';
  delivery_date?: string;
  created_at?: string;
}

export type BusinessType = 'puan' | 'cake';
export type ViewType = 'home' | 'dashboard' | 'orders' | 'products' | 'add-order' | 'add-product';
