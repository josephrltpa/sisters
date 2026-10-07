import React from 'react';
import { BusinessType, Order } from './types';

interface DashboardProps {
  business: BusinessType;
  orders: Order[];
}

const Dashboard: React.FC<DashboardProps> = ({ business, orders }) => {
  const pending = orders.filter(o => o.status === 'pending');
  const completed = orders.filter(o => o.status === 'completed');
  const totalRevenue = completed.reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingRevenue = pending.reduce((sum, o) => sum + o.totalPrice, 0);

  const themeColors = business === 'puan' 
    ? { gradient: 'from-purple-500 to-indigo-600', light: 'bg-purple-50', text: 'text-purple-700', accent: 'bg-purple-100' }
    : { gradient: 'from-pink-500 to-rose-600', light: 'bg-pink-50', text: 'text-pink-700', accent: 'bg-pink-100' };

  const emoji = business === 'puan' ? '🧵' : '🎂';
  const businessName = business === 'puan' ? 'Mizo Puan' : 'Cake Orders';

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className={`bg-gradient-to-r ${themeColors.gradient} rounded-2xl p-5 text-white shadow-lg`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{emoji}</span>
          <h2 className="text-xl font-bold">{businessName}</h2>
        </div>
        <p className="text-white/80 text-sm">Dashboard Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`${themeColors.light} rounded-xl p-4 border border-gray-100`}>
          <div className="text-2xl font-bold text-gray-800">{pending.length}</div>
          <div className="text-xs text-gray-500 mt-1">⏳ Pending Orders</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-800">{completed.length}</div>
          <div className="text-xs text-gray-500 mt-1">✅ Completed</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-800">₹{totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">💰 Total Earned</div>
        </div>
        <div className={`${themeColors.accent} rounded-xl p-4 border border-gray-100`}>
          <div className="text-2xl font-bold text-gray-800">₹{pendingRevenue.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">📋 Pending Amount</div>
        </div>
      </div>

      {/* Recent Pending Orders */}
      {pending.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
            Recent Pending
          </h3>
          <div className="space-y-2">
            {pending.slice(0, 3).map(order => (
              <div key={order.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.productName} × {order.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700">₹{order.totalPrice.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString()}</div>
                  </div>
                </div>
                {order.notes && (
                  <div className="mt-1 text-xs text-gray-400 italic">📝 {order.notes}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="text-center py-10">
          <div className="text-5xl mb-3">{emoji}</div>
          <p className="text-gray-500">No orders yet!</p>
          <p className="text-gray-400 text-sm">Add your first order to get started</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
