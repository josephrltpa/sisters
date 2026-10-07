export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'puan' | 'cake';
  description?: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'completed';
  date: string;
  notes?: string;
  business: 'puan' | 'cake';
  deliveryDate?: string;
}

export type BusinessType = 'puan' | 'cake';
export type ViewType = 'home' | 'dashboard' | 'orders' | 'products' | 'add-order' | 'add-product';
