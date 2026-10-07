import React, { useState, useEffect } from 'react';
import { BusinessType, ViewType, Product, Order } from './types';
import { getProducts, getOrders } from './storage';
import Dashboard from './Dashboard';
import OrdersList from './OrdersList';
import AddOrderForm from './AddOrderForm';
import ProductsList from './ProductsList';

interface BusinessScreenProps {
  business: BusinessType;
  onBack: () => void;
}

const PuanLogoSmall = () => (
  <svg viewBox="0 0 32 32" className="w-7 h-7">
    <rect x="4" y="4" width="24" height="24" rx="3" fill="#0ea5e9" opacity="0.2"/>
    <line x1="7" y1="10" x2="25" y2="10" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="7" y1="16" x2="25" y2="16" stroke="#0369a1" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="7" y1="22" x2="25" y2="22" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="6" x2="12" y2="26" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="20" y1="6" x2="20" y2="26" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round"/>
    <polygon points="16,8 19,16 16,24 13,16" fill="none" stroke="#0c4a6e" strokeWidth="1"/>
  </svg>
);

const CakeLogoSmall = () => (
  <svg viewBox="0 0 32 32" className="w-7 h-7">
    <rect x="6" y="17" width="20" height="10" rx="2" fill="#fbcfe8"/>
    <rect x="6" y="17" width="20" height="4" rx="2" fill="#f9a8d4"/>
    <rect x="8" y="11" width="16" height="7" rx="2" fill="#f9a8d4"/>
    <rect x="8" y="11" width="16" height="3" rx="2" fill="#f472b6"/>
    <circle cx="10" cy="17" r="1.5" fill="#fff1f2"/>
    <circle cx="16" cy="17.5" r="1.5" fill="#fff1f2"/>
    <circle cx="22" cy="17" r="1.5" fill="#fff1f2"/>
    <circle cx="16" cy="9" r="2.5" fill="#fb7185"/>
    <path d="M16 6.5 Q18 4 19 5" stroke="#4ade80" strokeWidth="1" fill="none" strokeLinecap="round"/>
  </svg>
);

const BusinessScreen: React.FC<BusinessScreenProps> = ({ business, onBack }) => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const refreshData = async () => {
    const [productsData, ordersData] = await Promise.all([
      getProducts(),
      getOrders(business)
    ]);
    setProducts(productsData);
    setOrders(ordersData);
  };

  useEffect(() => {
    refreshData();
  }, [business]);

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setView('add-order');
  };

  const handleBackFromForm = () => {
    setEditingOrder(null);
    setView('orders');
  };

  const handleOrderAdded = async () => {
    setEditingOrder(null);
    await refreshData();
    setView('orders');
  };

  const themeColors = business === 'puan'
    ? { gradient: 'from-sky-400 to-sky-500', navActive: 'text-sky-500' }
    : { gradient: 'from-pink-300 to-pink-400', navActive: 'text-pink-500' };

  const businessName = business === 'puan' ? 'Nihawi Puan' : 'Cake-A-Licious';
  const subtitle = business === 'puan' ? 'Traditional Mizo Textiles' : 'Freshly Baked Goodness';

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard business={business} orders={orders} />;
      case 'orders':
        return <OrdersList business={business} orders={orders} onRefresh={refreshData} onEdit={handleEditOrder} />;
      case 'add-order':
        return (
          <AddOrderForm 
            business={business} 
            products={products} 
            editOrder={editingOrder}
            onOrderAdded={handleOrderAdded} 
            onBack={handleBackFromForm} 
          />
        );
      case 'products':
        return <ProductsList business={business} products={products} onRefresh={refreshData} />;
      default:
        return <Dashboard business={business} orders={orders} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className={`bg-gradient-to-r ${themeColors.gradient} text-white px-4 py-3 shadow-md sticky top-0 z-10`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 active:opacity-70">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              {business === 'puan' ? <PuanLogoSmall /> : <CakeLogoSmall />}
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">{businessName}</h1>
              <p className="text-[10px] text-white/70 leading-tight">{subtitle}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 pb-24">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex shadow-lg">
        <button
          onClick={() => { setEditingOrder(null); setView('dashboard'); }}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${view === 'dashboard' ? themeColors.navActive : 'text-gray-400'}`}
        >
          <span className="text-xl">📊</span>
          <span className="text-[10px] font-medium">Dashboard</span>
        </button>
        <button
          onClick={() => { setEditingOrder(null); setView('orders'); }}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${view === 'orders' || view === 'add-order' ? themeColors.navActive : 'text-gray-400'}`}
        >
          <span className="text-xl">📋</span>
          <span className="text-[10px] font-medium">Orders</span>
        </button>
        <button
          onClick={() => { setEditingOrder(null); setView('add-order'); }}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${view === 'add-order' && !editingOrder ? themeColors.navActive : 'text-gray-400'}`}
        >
          <span className="text-xl">➕</span>
          <span className="text-[10px] font-medium">New Order</span>
        </button>
        <button
          onClick={() => { setEditingOrder(null); setView('products'); }}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${view === 'products' ? themeColors.navActive : 'text-gray-400'}`}
        >
          <span className="text-xl">📦</span>
          <span className="text-[10px] font-medium">Products</span>
        </button>
      </nav>
    </div>
  );
};

export default BusinessScreen;
