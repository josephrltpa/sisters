import React, { useState } from 'react';
import { BusinessType, Order } from './types';
import { updateOrderStatus, deleteOrder } from './storage';

interface OrdersListProps {
  business: BusinessType;
  orders: Order[];
  onRefresh: () => void;
  onEdit: (order: Order) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ business, orders, onRefresh, onEdit }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  }).sort((a, b) => {
    // Sort by delivery_date, fallback to created_at if delivery_date is null
    const dateA = a.delivery_date || a.created_at || '';
    const dateB = b.delivery_date || b.created_at || '';
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  }).map(order => ({
    ...order,
    items: order.items || [],
    customer_name: order.customer_name || 'Unknown Customer',
    contact_number: order.contact_number || '',
    address: order.address || '',
    total_price: order.total_price || 0,
    payment_method: order.payment_method || 'cod'
  }));

  const handleToggleStatus = async (order: Order) => {
    const newStatus = order.status === 'pending' ? 'completed' : 'pending';
    await updateOrderStatus(order.id, newStatus);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await deleteOrder(id);
    setShowConfirm(null);
    onRefresh();
  };

  const themeColors = business === 'puan'
    ? { badge: 'bg-sky-100 text-sky-700', btn: 'bg-sky-400' }
    : { badge: 'bg-pink-100 text-pink-500', btn: 'bg-pink-300' };

  return (
    <div className="space-y-3">
      {/* Filter Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
        {(['all', 'pending', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              filter === f 
                ? 'bg-white shadow-sm text-gray-800' 
                : 'text-gray-500'
            }`}
          >
            {f === 'all' ? '📋 All' : f === 'pending' ? '⏳ Pending' : '✅ Done'}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-gray-500 text-sm">No orders found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Order Header */}
              <div 
                className="p-4 cursor-pointer active:bg-gray-50"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-800">{order.customer_name || 'Unknown Customer'}</div>
                    <div className="text-sm text-gray-600">
                      {(order.items?.length || 0)} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'pending' 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {order.status === 'pending' ? '⏳ Pending' : '✅ Done'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>₹{(order.total_price || 0).toLocaleString()}</span>
                  <span>
                    {order.delivery_date 
                      ? `📅 ${new Date(order.delivery_date).toLocaleDateString('en-GB')}`
                      : order.created_at 
                        ? new Date(order.created_at).toLocaleDateString('en-GB')
                        : 'No date'}
                  </span>
                </div>

                {/* Expand indicator */}
                <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <span>{expandedOrder === order.id ? '▲' : '▼'}</span>
                  <span>Tap for details</span>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50 space-y-2">
                  {/* Contact */}
                  {order.contact_number && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm">📞</span>
                      <div>
                        <div className="text-xs text-gray-400">Contact</div>
                        <a href={`tel:${order.contact_number}`} className="text-sm text-blue-600 font-medium">
                          {order.contact_number}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {order.address && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm">📍</span>
                      <div>
                        <div className="text-xs text-gray-400">Address</div>
                        <div className="text-sm text-gray-700">{order.address}</div>
                      </div>
                    </div>
                  )}

                  {/* Payment */}
                  <div className="flex items-start gap-2">
                    <span className="text-sm">💳</span>
                    <div>
                      <div className="text-xs text-gray-400">Payment</div>
                      <div className={`text-sm font-medium ${
                        order.payment_method === 'cod' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '📱 Online Payment'}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Date */}
                  {order.delivery_date && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm">📅</span>
                      <div>
                        <div className="text-xs text-gray-400">Delivery Date</div>
                        <div className="text-sm text-gray-700">{new Date(order.delivery_date).toLocaleDateString('en-GB')}</div>
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  {order.items && order.items.length > 0 ? (
                    <div className="flex items-start gap-2">
                      <span className="text-sm">🛍️</span>
                      <div className="flex-1">
                        <div className="text-xs text-gray-400 mb-2">Items</div>
                        <div className="space-y-3">
                          {order.items.map((item, idx) => {
                            // Ensure item has all required fields
                            const safeItem = {
                              product_name: item.product_name || 'Unknown Product',
                              quantity: item.quantity || 1,
                              unit_price: item.unit_price || 0,
                              item_total: item.item_total || 0,
                              addons: Array.isArray(item.addons) ? item.addons : []
                            };
                            
                            return (
                              <div key={idx} className="bg-white rounded-lg p-2 border border-gray-200">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-800">
                                      {safeItem.product_name} × {safeItem.quantity}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      ₹{safeItem.unit_price} each
                                    </div>
                                  </div>
                                  <div className="text-sm font-semibold text-blue-700">
                                    ₹{safeItem.item_total.toLocaleString()}
                                  </div>
                                </div>
                                {safeItem.addons.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-gray-100">
                                    <div className="text-xs text-gray-400 mb-1">✨ Add-ons</div>
                                    {safeItem.addons.map((addon: any, addonIdx: number) => (
                                      <div key={addonIdx} className="flex justify-between text-xs">
                                        <span className="text-gray-600">{addon.name || 'Add-on'}</span>
                                        <span className="text-amber-600">+₹{addon.price || 0}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic">No items in this order</div>
                  )}

                  {/* Notes */}
                  {order.notes && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm">📝</span>
                      <div>
                        <div className="text-xs text-gray-400">Notes</div>
                        <div className="text-sm text-gray-700 italic">{order.notes}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="px-4 pb-3 flex gap-2">
                <button
                  onClick={() => handleToggleStatus(order)}
                  className={`flex-1 py-2 rounded-lg text-white text-sm font-medium ${themeColors.btn} active:opacity-80`}
                >
                  {order.status === 'pending' ? '✅ Mark Done' : '↩️ Reopen'}
                </button>
                <button
                  onClick={() => onEdit(order)}
                  className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium active:bg-amber-200"
                >
                  ✏️ Edit
                </button>
                {showConfirm === order.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setShowConfirm(null)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirm(order.id)}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersList;
