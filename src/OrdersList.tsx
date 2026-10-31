import React, { useState, useMemo } from 'react';
import { BusinessType, Order } from './types';
import { updateOrderStatus, deleteOrder } from './storage';
import { getOrderMonthKey, formatMonthLabel, getCurrentMonthKey } from './dateUtils';

interface OrdersListProps {
  business: BusinessType;
  orders: Order[];
  onRefresh: () => void;
  onEdit: (order: Order) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ business, orders, onRefresh, onEdit }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});

  const currentMonthKey = getCurrentMonthKey();

  // Normalize order items and fields
  const safeOrders = useMemo(() => {
    return orders.map(order => ({
      ...order,
      items: order.items || [],
      customer_name: order.customer_name || 'Unknown Customer',
      contact_number: order.contact_number || '',
      address: order.address || '',
      total_price: order.total_price || 0,
      payment_method: order.payment_method || 'cod'
    }));
  }, [orders]);

  // Extract unique available months from all orders
  const availableMonths = useMemo(() => {
    const monthCounts = new Map<string, { count: number; total: number }>();

    safeOrders.forEach(o => {
      const key = getOrderMonthKey(o);
      const prev = monthCounts.get(key) || { count: 0, total: 0 };
      monthCounts.set(key, {
        count: prev.count + 1,
        total: prev.total + (o.total_price || 0)
      });
    });

    const keys = Array.from(monthCounts.keys());
    keys.sort((a, b) => {
      if (a === 'other') return 1;
      if (b === 'other') return -1;
      return b.localeCompare(a); // latest month first (e.g. 2026-11 > 2026-10)
    });

    return keys.map(key => ({
      key,
      label: formatMonthLabel(key),
      count: monthCounts.get(key)?.count || 0,
      total: monthCounts.get(key)?.total || 0,
      isCurrent: key === currentMonthKey
    }));
  }, [safeOrders, currentMonthKey]);

  // Filter orders by status, month, and search query
  const filteredOrders = useMemo(() => {
    return safeOrders.filter(o => {
      // Status filter
      if (filter !== 'all' && o.status !== filter) return false;

      // Month filter
      if (selectedMonth !== 'all' && getOrderMonthKey(o) !== selectedMonth) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (o.customer_name || '').toLowerCase().includes(q);
        const phoneMatch = (o.contact_number || '').includes(q);
        const addrMatch = (o.address || '').toLowerCase().includes(q);
        const notesMatch = (o.notes || '').toLowerCase().includes(q);
        const itemsMatch = o.items.some(item =>
          (item.product_name || '').toLowerCase().includes(q)
        );
        if (!nameMatch && !phoneMatch && !addrMatch && !notesMatch && !itemsMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort by delivery_date, fallback to created_at
      const dateA = a.delivery_date || a.created_at || '';
      const dateB = b.delivery_date || b.created_at || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [safeOrders, filter, selectedMonth, searchQuery]);

  // Group filtered orders by month
  const groupedOrders = useMemo(() => {
    const groups: { key: string; label: string; orders: typeof filteredOrders; total: number; isCurrent: boolean }[] = [];
    const map = new Map<string, typeof filteredOrders>();

    filteredOrders.forEach(order => {
      const key = getOrderMonthKey(order);
      const list = map.get(key) || [];
      list.push(order);
      map.set(key, list);
    });

    const sortedKeys = Array.from(map.keys()).sort((a, b) => {
      if (a === 'other') return 1;
      if (b === 'other') return -1;
      return b.localeCompare(a); // latest month first
    });

    sortedKeys.forEach(key => {
      const monthOrders = map.get(key) || [];
      const total = monthOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
      groups.push({
        key,
        label: formatMonthLabel(key),
        orders: monthOrders,
        total,
        isCurrent: key === currentMonthKey
      });
    });

    return groups;
  }, [filteredOrders, currentMonthKey]);

  // Helper to check if a month is collapsed
  // By default, current month (or the first/latest month) is expanded, older months are collapsed
  const isMonthCollapsed = (monthKey: string, index: number) => {
    if (collapsedMonths[monthKey] !== undefined) {
      return collapsedMonths[monthKey];
    }
    // Default: keep the first (latest) month expanded; collapse older months
    return index > 0;
  };

  const toggleMonthCollapse = (monthKey: string, index: number) => {
    const currentVal = isMonthCollapsed(monthKey, index);
    setCollapsedMonths(prev => ({
      ...prev,
      [monthKey]: !currentVal
    }));
  };

  const handleExpandAll = () => {
    const next: Record<string, boolean> = {};
    groupedOrders.forEach(g => { next[g.key] = false; });
    setCollapsedMonths(next);
  };

  const handleCollapseAll = () => {
    const next: Record<string, boolean> = {};
    groupedOrders.forEach(g => { next[g.key] = true; });
    setCollapsedMonths(next);
  };

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
    ? {
        badge: 'bg-sky-100 text-sky-700',
        btn: 'bg-sky-400',
        text: 'text-sky-600',
        headerBg: 'bg-sky-50 border-sky-100'
      }
    : {
        badge: 'bg-pink-100 text-pink-600',
        btn: 'bg-pink-300',
        text: 'text-pink-600',
        headerBg: 'bg-pink-50 border-pink-100'
      };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search orders by customer, item, phone..."
          className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:border-sky-400 focus:ring-1 focus:ring-sky-200 outline-none transition-all text-gray-800 placeholder-gray-400 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Tabs (All / Pending / Done) */}
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

      {/* Month Selector Bar & Controls */}
      <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-2.5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-xs">📅</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 text-xs bg-transparent border-none text-gray-700 font-medium focus:ring-0 cursor-pointer outline-none truncate"
          >
            <option value="all">All Months ({orders.length} total)</option>
            {availableMonths.map(m => (
              <option key={m.key} value={m.key}>
                {m.label} ({m.count} order{m.count !== 1 ? 's' : ''}){m.isCurrent ? ' • Current' : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedMonth === 'all' && groupedOrders.length > 1 && (
          <div className="flex gap-1 text-[11px] text-gray-400 flex-shrink-0">
            <button
              onClick={handleExpandAll}
              className="px-2 py-0.5 rounded hover:bg-gray-100 hover:text-gray-600"
            >
              Expand
            </button>
            <span>•</span>
            <button
              onClick={handleCollapseAll}
              className="px-2 py-0.5 rounded hover:bg-gray-100 hover:text-gray-600"
            >
              Collapse
            </button>
          </div>
        )}

        {selectedMonth !== 'all' && (
          <button
            onClick={() => setSelectedMonth('all')}
            className="text-[11px] text-sky-600 font-medium px-2 py-0.5 rounded hover:bg-sky-50 flex-shrink-0"
          >
            Show All
          </button>
        )}
      </div>

      {/* Orders List / Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-gray-600 text-sm font-medium">No orders found</p>
          <p className="text-gray-400 text-xs mt-1">
            {searchQuery
              ? 'Try adjusting your search terms'
              : selectedMonth !== 'all'
                ? `No ${filter !== 'all' ? filter : ''} orders in ${formatMonthLabel(selectedMonth)}`
                : 'No orders match this filter'}
          </p>
          {selectedMonth !== 'all' && (
            <button
              onClick={() => setSelectedMonth('all')}
              className="mt-3 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              View All Months
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {groupedOrders.map((group, groupIdx) => {
            const collapsed = isMonthCollapsed(group.key, groupIdx);

            return (
              <div key={group.key} className="space-y-2">
                {/* Month Group Header (Collapsible Section) */}
                <div
                  onClick={() => toggleMonthCollapse(group.key, groupIdx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border cursor-pointer select-none transition-all active:scale-[0.99] ${
                    group.isCurrent
                      ? `${themeColors.headerBg} shadow-xs`
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-bold">
                      {collapsed ? '▶' : '▼'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800">
                          {group.label}
                        </span>
                        {group.isCurrent && (
                          <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.2 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {group.orders.length} order{group.orders.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-gray-800">
                      ₹{group.total.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {collapsed ? 'Tap to view' : 'Tap to hide'}
                    </div>
                  </div>
                </div>

                {/* Orders under this month */}
                {!collapsed && (
                  <div className="space-y-2 pl-1 pr-1">
                    {group.orders.map(order => (
                      <div
                        key={order.id}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all"
                      >
                        {/* Order Header */}
                        <div
                          className="p-4 cursor-pointer active:bg-gray-50"
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-semibold text-gray-800">
                                {order.customer_name || 'Unknown Customer'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {(order.items?.length || 0)} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'pending'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {order.status === 'pending' ? '⏳ Pending' : '✅ Done'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span className="font-medium text-gray-700">₹{(order.total_price || 0).toLocaleString()}</span>
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
                                  <a
                                    href={`tel:${order.contact_number}`}
                                    className="text-sm text-blue-600 font-medium"
                                  >
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
                                <div
                                  className={`text-sm font-medium ${
                                    order.payment_method === 'cod' ? 'text-green-600' : 'text-blue-600'
                                  }`}
                                >
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
                                  <div className="text-sm text-gray-700">
                                    {new Date(order.delivery_date).toLocaleDateString('en-GB')}
                                  </div>
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
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersList;
