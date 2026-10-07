import React, { useState } from 'react';
import { BusinessType, Order } from './types';
import { updateOrderStatus, deleteOrder } from './storage';

interface OrdersListProps {
  business: BusinessType;
  orders: Order[];
  onRefresh: () => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ business, orders, onRefresh }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  }).sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());

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
            <div key={order.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-gray-800">{order.customer_name}</div>
                  <div className="text-sm text-gray-600">{order.product_name} × {order.quantity}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'pending' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {order.status === 'pending' ? '⏳ Pending' : '✅ Done'}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                <span>₹{order.total_price.toLocaleString()}</span>
                <span>{new Date(order.created_at || '').toLocaleDateString()}</span>
              </div>

              {order.notes && (
                <div className="text-xs text-gray-400 italic mb-3 bg-gray-50 rounded-lg p-2">
                  📝 {order.notes}
                </div>
              )}

              {order.delivery_date && (
                <div className="text-xs text-blue-600 mb-3">
                  📅 Delivery: {new Date(order.delivery_date).toLocaleDateString()}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleStatus(order)}
                  className={`flex-1 py-2 rounded-lg text-white text-sm font-medium ${themeColors.btn} active:opacity-80`}
                >
                  {order.status === 'pending' ? '✅ Mark Done' : '↩️ Reopen'}
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
