export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'puan' | 'cake';
  description?: string;
  created_at?: string;
}

export type PaymentMethod = 'cod' | 'online';

export interface AddOn {
  name: string;
  price: number;
}

export interface Order {
  id: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  contact_number: string;
  address: string;
  payment_method: PaymentMethod;
  quantity: number;
  total_price: number;
  addons: AddOn[];
  status: 'pending' | 'completed';
  notes?: string;
  business: 'puan' | 'cake';
  delivery_date?: string;
  created_at?: string;
}

export type BusinessType = 'puan' | 'cake';
export type ViewType = 'home' | 'dashboard' | 'orders' | 'products' | 'add-order' | 'add-product';
