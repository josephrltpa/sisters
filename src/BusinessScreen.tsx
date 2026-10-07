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

const BusinessScreen: React.FC<BusinessScreenProps> = ({ business, onBack }) => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const refreshData = () => {
    setProducts(getProducts());
    setOrders(getOrders(business));
  };

  useEffect(() => {
    refreshData();
  }, [business]);

  const themeColors = business === 'puan'
    ? { gradient: 'from-purple-500 to-indigo-600', nav: 'bg-purple-500' }
    : { gradient: 'from-pink-500 to-rose-600', nav: 'bg-pink-500' };

  const emoji = business === 'puan' ? '🧵' : '🎂';
  const businessName = business === 'puan' ? 'Mizo Puan' : 'Cakes';

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard business={business} orders={orders} />;
      case 'orders':
        return <OrdersList business={business} orders={orders} onRefresh={refreshData} />;
      case 'add-order':
        return <AddOrderForm business={business} products={products} onOrderAdded={() => { refreshData(); setView('orders'); }} onBack={() => setView('orders')} />;
      case 'products':
        return <ProductsList business={business} products={products} onRefresh={refreshData} />;
      default:
        return <Dashboard business={business} orders={orders} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className={`bg-gradient-to-r ${themeColors.gradient} text-white px-4 py-3 flex items-center gap-3 shadow-md sticky top-0 z-10`}>
        <button onClick={onBack} className="p-1 active:opacity-70">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-xl">{emoji}</span>
        <h1 className="font-bold text-lg">{businessName}</h1>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 pb-24">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex shadow-lg">
        <button
          onClick={() => setView('dashboard')}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${view === 'dashboard' ? `${themeColors.nav.replace('bg-', 'text-')}` : 'text-gray-400'}`}
        >
          <span className="text-xl">📊</span>
          <span className="text-xs font-medium">Dashboard</span>
        </button>
        <button
          onClick={() => setView('orders')}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${view === 'orders' || view === 'add-order' ? `${themeColors.nav.replace('bg-', 'text-')}` : 'text-gray-400'}`}
        >
          <span className="text-xl">📋</span>
          <span className="text-xs font-medium">Orders</span>
        </button>
        <button
          onClick={() => setView('add-order')}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${view === 'add-order' ? `${themeColors.nav.replace('bg-', 'text-')}` : 'text-gray-400'}`}
        >
          <span className="text-xl">➕</span>
          <span className="text-xs font-medium">New Order</span>
        </button>
        <button
          onClick={() => setView('products')}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${view === 'products' ? `${themeColors.nav.replace('bg-', 'text-')}` : 'text-gray-400'}`}
        >
          <span className="text-xl">📦</span>
          <span className="text-xs font-medium">Products</span>
        </button>
      </nav>
    </div>
  );
};

export default BusinessScreen;
