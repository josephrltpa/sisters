import React, { useState, useMemo } from 'react';
import { BusinessType, Order } from './types';
import { getOrderMonthKey, getCurrentMonthKey, formatMonthLabel } from './dateUtils';

interface DashboardProps {
  business: BusinessType;
  orders: Order[];
}

const Dashboard: React.FC<DashboardProps> = ({ business, orders }) => {
  const [timeframe, setTimeframe] = useState<'this-month' | 'all-time'>('this-month');
  const currentMonthKey = getCurrentMonthKey();
  const currentMonthLabel = formatMonthLabel(currentMonthKey);

  // Ensure all orders have required fields
  const safeOrders = useMemo(() => {
    return orders.map(order => ({
      ...order,
      items: order.items || [],
      customer_name: order.customer_name || 'Unknown Customer',
      total_price: order.total_price || 0
    }));
  }, [orders]);

  // Compute lifetime earnings and orders
  const lifetimeCompleted = safeOrders.filter(o => o.status === 'completed');
  const lifetimeRevenue = lifetimeCompleted.reduce((sum, o) => sum + (o.total_price || 0), 0);

  // Filter orders according to selected timeframe
  const displayOrders = useMemo(() => {
    if (timeframe === 'all-time') return safeOrders;
    return safeOrders.filter(o => getOrderMonthKey(o) === currentMonthKey);
  }, [safeOrders, timeframe, currentMonthKey]);

  const pending = displayOrders.filter(o => o.status === 'pending');
  const completed = displayOrders.filter(o => o.status === 'completed');
  const revenue = completed.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const pendingRevenue = pending.reduce((sum, o) => sum + (o.total_price || 0), 0);

  // Recent pending from all orders (urgent orders should always be visible)
  const recentPending = safeOrders
    .filter(o => o.status === 'pending')
    .slice(0, 3);

  const themeColors = business === 'puan'
    ? {
        gradient: 'from-sky-400 to-sky-500',
        light: 'bg-sky-50',
        text: 'text-sky-700',
        accent: 'bg-sky-100',
        toggleActive: 'bg-white text-sky-700 shadow-sm'
      }
    : {
        gradient: 'from-pink-300 to-pink-400',
        light: 'bg-pink-50',
        text: 'text-pink-600',
        accent: 'bg-pink-100',
        toggleActive: 'bg-white text-pink-600 shadow-sm'
      };

  const emoji = business === 'puan' ? '🧵' : '🎂';
  const businessName = business === 'puan' ? 'Nihawi Puan' : 'Cake-A-Licious';

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

      {/* Timeframe Selector Pill */}
      <div className="flex justify-between items-center bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setTimeframe('this-month')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            timeframe === 'this-month' ? themeColors.toggleActive : 'text-gray-500'
          }`}
        >
          📅 This Month ({currentMonthLabel})
        </button>
        <button
          onClick={() => setTimeframe('all-time')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            timeframe === 'all-time' ? themeColors.toggleActive : 'text-gray-500'
          }`}
        >
          🌐 All-Time
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`${themeColors.light} rounded-xl p-4 border border-gray-100`}>
          <div className="text-2xl font-bold text-gray-800">{pending.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            ⏳ {timeframe === 'this-month' ? 'Pending This Month' : 'Pending Orders'}
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-800">{completed.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            ✅ {timeframe === 'this-month' ? 'Completed This Month' : 'Completed'}
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-800">₹{revenue.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">
            💰 {timeframe === 'this-month' ? 'Earned This Month' : 'Total Earned'}
          </div>
          {timeframe === 'this-month' && lifetimeRevenue > revenue && (
            <div className="text-[10px] text-gray-400 mt-0.5">
              ₹{lifetimeRevenue.toLocaleString()} all-time
            </div>
          )}
        </div>
        <div className={`${themeColors.accent} rounded-xl p-4 border border-gray-100`}>
          <div className="text-2xl font-bold text-gray-800">₹{pendingRevenue.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">📋 Pending Amount</div>
        </div>
      </div>

      {/* Recent Pending Orders */}
      {recentPending.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
            Urgent / Recent Pending
          </h3>
          <div className="space-y-2">
            {recentPending.map(order => (
              <div key={order.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-800 text-sm">
                      {order.customer_name || 'Unknown Customer'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(order.items?.length || 0)} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700">
                      ₹{(order.total_price || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {order.delivery_date
                        ? `📅 ${new Date(order.delivery_date).toLocaleDateString('en-GB')}`
                        : new Date(order.created_at || '').toLocaleDateString('en-GB')}
                    </div>
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

      {/* Empty State for Selected Timeframe */}
      {displayOrders.length === 0 && orders.length > 0 && (
        <div className="text-center py-6 bg-white rounded-2xl border border-gray-100 p-4">
          <div className="text-3xl mb-1">📅</div>
          <p className="text-gray-600 text-sm font-medium">No orders in {currentMonthLabel} yet</p>
          <p className="text-gray-400 text-xs mt-1">
            New orders for this month will show up here.
          </p>
          <button
            onClick={() => setTimeframe('all-time')}
            className="mt-2 text-xs text-blue-600 font-medium hover:underline"
          >
            View all-time stats ({orders.length} total orders)
          </button>
        </div>
      )}

      {/* Empty State when no orders exist at all */}
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
