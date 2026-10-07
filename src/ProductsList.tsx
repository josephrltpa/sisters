import React, { useState } from 'react';
import { BusinessType, Product } from './types';
import { addProduct, deleteProduct, generateId } from './storage';

interface ProductsListProps {
  business: BusinessType;
  products: Product[];
  onRefresh: () => void;
}

const ProductsList: React.FC<ProductsListProps> = ({ business, products, onRefresh }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const businessProducts = products.filter(p => p.category === business);

  const themeColors = business === 'puan'
    ? { btn: 'bg-purple-500', header: 'from-purple-500 to-indigo-600', light: 'bg-purple-50' }
    : { btn: 'bg-pink-500', header: 'from-pink-500 to-rose-600', light: 'bg-pink-50' };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;

    const product: Product = {
      id: generateId(),
      name: newName,
      price: parseFloat(newPrice),
      category: business,
      description: newDesc || undefined,
    };

    addProduct(product);
    setNewName('');
    setNewPrice('');
    setNewDesc('');
    setShowAddForm(false);
    onRefresh();
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setDeleteConfirm(null);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className={`bg-gradient-to-r ${themeColors.header} rounded-2xl p-4 text-white flex justify-between items-center`}>
        <h2 className="text-lg font-bold">
          {business === 'puan' ? '🧵 Puan Collection' : '🎂 Cake Menu'}
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-white/20 px-3 py-1.5 rounded-lg text-sm font-medium active:bg-white/30"
        >
          {showAddForm ? '✕ Close' : '+ Add'}
        </button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {business === 'puan' ? 'Puan Name' : 'Cake Name'} *
            </label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={business === 'puan' ? 'e.g., Puanlen, Puanngai...' : 'e.g., Chocolate Truffle...'}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-purple-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹) *</label>
            <input
              type="number"
              min="0"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
              placeholder="Enter price"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-purple-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
            <input
              type="text"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Brief description..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-purple-400 outline-none"
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2.5 rounded-lg text-white font-medium text-sm ${themeColors.btn}`}
          >
            Add Product ✓
          </button>
        </form>
      )}

      {/* Products List */}
      {businessProducts.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-2">{business === 'puan' ? '🧵' : '🎂'}</div>
          <p className="text-gray-500 text-sm">No products yet</p>
          <p className="text-gray-400 text-xs">Tap "+ Add" to add your first item</p>
        </div>
      ) : (
        <div className="space-y-2">
          {businessProducts.map(product => (
            <div key={product.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">{product.name}</div>
                {product.description && (
                  <div className="text-xs text-gray-400 mt-0.5">{product.description}</div>
                )}
                <div className="text-sm font-semibold text-green-600 mt-1">₹{product.price.toLocaleString()}</div>
              </div>
              {deleteConfirm === product.id ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(product.id)}
                  className="text-gray-400 p-2 hover:text-red-400"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsList;
