import React, { useState } from 'react';
import { BusinessType, Product, Order } from './types';
import { addOrder, generateId } from './storage';

interface AddOrderFormProps {
  business: BusinessType;
  products: Product[];
  onOrderAdded: () => void;
  onBack: () => void;
}

const AddOrderForm: React.FC<AddOrderFormProps> = ({ business, products, onOrderAdded, onBack }) => {
  const [customerName, setCustomerName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const businessProducts = products.filter(p => p.category === business);
  const selectedProd = businessProducts.find(p => p.id === selectedProduct);

  const themeColors = business === 'puan'
    ? { btn: 'bg-sky-400 hover:bg-sky-500', header: 'from-sky-400 to-sky-500' }
    : { btn: 'bg-pink-300 hover:bg-pink-400', header: 'from-pink-300 to-pink-400' };

  const businessName = business === 'puan' ? 'Nihawi Puan' : 'Cake-A-Licious';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedProduct || !selectedProd) return;

    const qty = parseInt(quantity) || 1;
    const order: Omit<Order, 'id'> = {
      product_id: selectedProduct,
      product_name: selectedProd.name,
      customer_name: customerName,
      quantity: qty,
      total_price: selectedProd.price * qty,
      status: 'pending',
      notes: notes || undefined,
      business,
      delivery_date: deliveryDate || undefined,
    };

    await addOrder(order);
    setShowSuccess(true);
    setTimeout(() => {
      onOrderAdded();
    }, 1200);
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4 animate-bounce">✅</div>
        <p className="text-lg font-semibold text-gray-700">Order Added!</p>
        <p className="text-sm text-gray-500 mt-1">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`bg-gradient-to-r ${themeColors.header} rounded-2xl p-4 text-white`}>
        <h2 className="text-lg font-bold">
          {business === 'puan' ? '🧵' : '🎂'} New Order — {businessName}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            👤 Customer Name *
          </label>
          <input
            type="text"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-gray-800"
          />
        </div>

        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {business === 'puan' ? '🧵 Select Puan' : '🎂 Select Cake'} *
          </label>
          {businessProducts.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-700">
              ⚠️ No products added yet. Please add products first!
            </div>
          ) : (
            <select
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-gray-800 bg-white"
            >
              <option value="">Choose {business === 'puan' ? 'puan' : 'cake'}...</option>
              {businessProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} - ₹{p.price}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            🔢 Quantity *
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-gray-800"
          />
        </div>

        {/* Total Preview */}
        {selectedProd && (
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-blue-700">₹{(selectedProd.price * (parseInt(quantity) || 1)).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Delivery Date (for cakes) */}
        {business === 'cake' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 Delivery Date
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={e => setDeliveryDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-gray-800"
            />
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📝 Notes {business === 'cake' ? '(flavor, design, etc.)' : '(color, pattern, etc.)'}
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any special instructions..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-gray-800 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium active:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={businessProducts.length === 0}
            className={`flex-1 py-3 rounded-xl text-white font-medium ${themeColors.btn} active:opacity-80 disabled:opacity-50`}
          >
            Add Order ✓
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOrderForm;
