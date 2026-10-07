import React, { useState, useEffect } from 'react';
import { BusinessType, Product, Order, PaymentMethod, AddOn } from './types';
import { addOrder, updateOrder } from './storage';

interface AddOrderFormProps {
  business: BusinessType;
  products: Product[];
  editOrder?: Order | null;
  onOrderAdded: () => void;
  onBack: () => void;
}

const AddOrderForm: React.FC<AddOrderFormProps> = ({ business, products, editOrder, onOrderAdded, onBack }) => {
  const isEditing = !!editOrder;

  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [addons, setAddons] = useState<AddOn[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (editOrder) {
      setCustomerName(editOrder.customer_name);
      setContactNumber(editOrder.contact_number);
      setAddress(editOrder.address);
      setSelectedProduct(editOrder.product_id);
      setQuantity(editOrder.quantity.toString());
      setNotes(editOrder.notes || '');
      setDeliveryDate(editOrder.delivery_date || '');
      setPaymentMethod(editOrder.payment_method);
      setAddons(editOrder.addons || []);
    }
  }, [editOrder]);

  const businessProducts = products.filter(p => p.category === business);
  const selectedProd = businessProducts.find(p => p.id === selectedProduct);

  const themeColors = business === 'puan'
    ? { btn: 'bg-sky-400 hover:bg-sky-500', header: 'from-sky-400 to-sky-500' }
    : { btn: 'bg-pink-300 hover:bg-pink-400', header: 'from-pink-300 to-pink-400' };

  const businessName = business === 'puan' ? 'Nihawi Puan' : 'Cake-A-Licious';

  // Calculate total price
  const basePrice = selectedProd ? selectedProd.price * (parseInt(quantity) || 1) : 0;
  const addonsTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
  const totalPrice = basePrice + addonsTotal;

  const handleAddAddon = () => {
    setAddons([...addons, { name: '', price: 0 }]);
  };

  const handleRemoveAddon = (index: number) => {
    setAddons(addons.filter((_, i) => i !== index));
  };

  const handleUpdateAddon = (index: number, field: keyof AddOn, value: string | number) => {
    const updated = [...addons];
    updated[index] = { ...updated[index], [field]: value };
    setAddons(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !contactNumber || !address || !selectedProduct || !selectedProd) return;

    const qty = parseInt(quantity) || 1;
    const orderData: Omit<Order, 'id'> = {
      product_id: selectedProduct,
      product_name: selectedProd.name,
      customer_name: customerName,
      contact_number: contactNumber,
      address: address,
      payment_method: paymentMethod,
      quantity: qty,
      total_price: totalPrice,
      addons: addons.filter(a => a.name.trim() !== ''),
      status: editOrder?.status || 'pending',
      notes: notes || undefined,
      business,
      delivery_date: deliveryDate || undefined,
    };

    if (isEditing && editOrder) {
      await updateOrder(editOrder.id, orderData);
    } else {
      await addOrder(orderData);
    }

    setShowSuccess(true);
    setTimeout(() => {
      onOrderAdded();
    }, 1200);
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4 animate-bounce">✅</div>
        <p className="text-lg font-semibold text-gray-700">
          {isEditing ? 'Order Updated!' : 'Order Added!'}
        </p>
        <p className="text-sm text-gray-500 mt-1">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`bg-gradient-to-r ${themeColors.header} rounded-2xl p-4 text-white flex justify-between items-center`}>
        <h2 className="text-lg font-bold">
          {isEditing ? '✏️ Edit Order' : `${business === 'puan' ? '🧵' : '🎂'} New Order`}
        </h2>
        {isEditing && (
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
            {businessName}
          </span>
        )}
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

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📞 Contact Number *
          </label>
          <input
            type="tel"
            value={contactNumber}
            onChange={e => setContactNumber(e.target.value)}
            placeholder="Phone number"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-gray-800"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📍 Delivery Address *
          </label>
          <textarea
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Full delivery address"
            required
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-gray-800 resize-none"
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

        {/* Add-ons Section */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-lg">✨</span>
              Add-ons (Optional)
            </label>
            <button
              type="button"
              onClick={handleAddAddon}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-white text-xs font-medium rounded-lg transition-colors"
            >
              + Add Item
            </button>
          </div>

          {addons.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-2">
              No add-ons yet. Tap "+ Add Item" to add extras.
            </p>
          ) : (
            <div className="space-y-2">
              {addons.map((addon, index) => (
                <div key={index} className="flex gap-2 items-center bg-white rounded-lg p-2 border border-amber-100">
                  <input
                    type="text"
                    value={addon.name}
                    onChange={e => handleUpdateAddon(index, 'name', e.target.value)}
                    placeholder="Add-on name"
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-amber-400 outline-none"
                  />
                  <input
                    type="number"
                    value={addon.price || ''}
                    onChange={e => handleUpdateAddon(index, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="₹"
                    min="0"
                    className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-amber-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAddon(index)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            💳 Payment Method *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('cod')}
              className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                paymentMethod === 'cod'
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-500'
              }`}
            >
              💵 Cash on Delivery
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('online')}
              className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                paymentMethod === 'online'
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-500'
              }`}
            >
              📱 Online Payment
            </button>
          </div>
        </div>

        {/* Total Preview */}
        {selectedProd && (
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Base Price:</span>
              <span className="text-gray-700">₹{basePrice.toLocaleString()}</span>
            </div>
            {addonsTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Add-ons:</span>
                <span className="text-gray-700">+₹{addonsTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold border-t border-blue-200 pt-1 mt-1">
              <span className="text-blue-700">Total Amount:</span>
              <span className="text-blue-700">₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-400">Payment:</span>
              <span className="text-gray-500">{paymentMethod === 'cod' ? '💵 COD' : '📱 Online'}</span>
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
            rows={2}
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
            {isEditing ? 'Save Changes ✓' : 'Add Order ✓'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOrderForm;
