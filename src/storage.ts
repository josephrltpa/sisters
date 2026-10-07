import { supabase } from './supabaseClient';
import { Product, Order } from './types';

// Products
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data || [];
}

export async function addProduct(product: Omit<Product, 'id'>) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) {
    console.error('Error adding product:', error);
    throw error;
  }
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Orders
export async function getOrders(business?: 'puan' | 'cake'): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (business) {
    query = query.eq('business', business);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  // Parse addons JSON string back to array
  return (data || []).map(order => ({
    ...order,
    addons: typeof order.addons === 'string' ? JSON.parse(order.addons) : (order.addons || [])
  }));
}

export async function addOrder(order: Omit<Order, 'id'>) {
  // Convert addons array to JSON string for Supabase
  const orderData = {
    ...order,
    addons: JSON.stringify(order.addons || [])
  };

  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();

  if (error) {
    console.error('Error adding order:', error);
    throw error;
  }
  return data;
}

export async function updateOrderStatus(id: string, status: 'pending' | 'completed') {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function updateOrder(id: string, updates: Partial<Omit<Order, 'id'>>) {
  // Convert addons array to JSON string if present
  const updateData = {
    ...updates,
    addons: updates.addons ? JSON.stringify(updates.addons) : undefined
  };

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

export async function deleteOrder(id: string) {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

export function generateId(): string {
  return crypto.randomUUID();
}
