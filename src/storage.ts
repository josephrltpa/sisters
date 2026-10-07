import { Product, Order } from './types';

const PRODUCTS_KEY = 'order_tracker_products';
const ORDERS_KEY = 'order_tracker_orders';

export function getProducts(): Product[] {
  const data = localStorage.getItem(PRODUCTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function addProduct(product: Product) {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
}

export function deleteProduct(id: string) {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
}

export function getOrders(business?: 'puan' | 'cake'): Order[] {
  const data = localStorage.getItem(ORDERS_KEY);
  const orders: Order[] = data ? JSON.parse(data) : [];
  if (business) {
    return orders.filter(o => o.business === business);
  }
  return orders;
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function addOrder(order: Order) {
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
}

export function updateOrderStatus(id: string, status: 'pending' | 'completed') {
  const orders = getOrders().map(o => 
    o.id === id ? { ...o, status } : o
  );
  saveOrders(orders);
}

export function deleteOrder(id: string) {
  const orders = getOrders().filter(o => o.id !== id);
  saveOrders(orders);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
