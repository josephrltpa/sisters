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

  // Parse items JSON string back to array, handle undefined/null and migrate old format
  return (data || []).map(order => {
    let items: any[] = [];
    
    try {
      // Try to parse items if it exists
      if (order.items) {
        if (typeof order.items === 'string') {
          try {
            items = JSON.parse(order.items);
            if (!Array.isArray(items)) {
              items = [];
            }
          } catch (e) {
            console.error('Error parsing items JSON:', e);
            items = [];
          }
        } else if (Array.isArray(order.items)) {
          items = order.items;
        }
      }
      // If no items array, migrate from old format (product_id, product_name, quantity, addons)
      else if (order.product_id || order.product_name) {
        // Parse addons if it's a string
        let addons: any[] = [];
        if (order.addons) {
          if (typeof order.addons === 'string') {
            try {
              addons = JSON.parse(order.addons);
            } catch (e) {
              addons = [];
            }
          } else if (Array.isArray(order.addons)) {
            addons = order.addons;
          }
        }
        
        items = [{
          product_id: order.product_id || '',
          product_name: order.product_name || 'Unknown Product',
          quantity: order.quantity || 1,
          unit_price: order.total_price || 0,
          addons: addons,
          item_total: order.total_price || 0
        }];
      }
    } catch (error) {
      console.error('Error migrating order:', error, order);
      items = [];
    }
    
    // Ensure all required fields have fallback values
    return {
      ...order,
      items,
      customer_name: order.customer_name || 'Unknown Customer',
      contact_number: order.contact_number || '',
      address: order.address || '',
      total_price: order.total_price || 0,
      payment_method: order.payment_method || 'cod',
      status: order.status || 'pending',
      business: order.business || 'puan'
    };
  });
}

export async function addOrder(order: Omit<Order, 'id'>) {
  // Convert items array to JSON string for Supabase
  const orderData = {
    ...order,
    items: JSON.stringify(order.items || [])
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
  // Convert items array to JSON string if present
  const updateData = {
    ...updates,
    items: updates.items ? JSON.stringify(updates.items) : undefined
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
