import React, { useState, useEffect } from 'react';
import { BusinessType, Product, Order, PaymentMethod, OrderItem, AddOn } from './types';
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
  const [notes, setNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (editOrder) {
      setCustomerName(editOrder.customer_name);
      setContactNumber(editOrder.contact_number);
      setAddress(editOrder.address);
      setNotes(editOrder.notes || '');
      setDeliveryDate(editOrder.delivery_date || '');
      setPaymentMethod(editOrder.payment_method);
      setItems(editOrder.items || []);
    }
  }, [editOrder]);

  const businessProducts = products.filter(p => p.category === business);

  const themeColors = business === 'puan'
    ? { btn: 'bg-sky-400 hover:bg-sky-500', header: 'from-sky-400 to-sky-500' }
    : { btn: 'bg-pink-300 hover:bg-pink-400', header: 'from-pink-300 to-pink-400' };

  const businessName = business === 'puan' ? 'Nihawi Puan' : 'Cake-A-Licious';

  const totalPrice = items.reduce((sum, item) => sum + item.item_total, 0);

  const handleAddItem = () => {
    setItems([...items, {
      product_id: '',
      product_name: '',
      quantity: 1,
      unit_price: 0,
      addons: [],
      item_total: 0
    }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };
    
    // If product changed, update product_name and unit_price
    if (field === 'product_id') {
      const product = businessProducts.find(p => p.id === value);
      if (product) {
        item.product_name = product.name;
        item.unit_price = product.price;
      }
    }
    
    // Recalculate item total
    const addonsTotal = item.addons.reduce((sum: number, addon: AddOn) => sum + addon.price, 0);
    item.item_total = (item.unit_price * item.quantity) + addonsTotal;
    
    updated[index] = item;
    setItems(updated);
  };

  const handleAddAddon = (itemIndex: number) => {
    const updated = [...items];
    updated[itemIndex].addons.push({ name: '', price: 0 });
    setItems(updated);
  };

  const handleRemoveAddon = (itemIndex: number, addonIndex: number) => {
    const updated = [...items];
    updated[itemIndex].addons = updated[itemIndex].addons.filter((_, i) => i !== addonIndex);
    
    // Recalculate item total
    const addonsTotal = updated[itemIndex].addons.reduce((sum, addon) => sum + addon.price, 0);
    updated[itemIndex].item_total = (updated[itemIndex].unit_price * updated[itemIndex].quantity) + addonsTotal;
    
    setItems(updated);
  };

  const handleUpdateAddon = (itemIndex: number, addonIndex: number, field: keyof AddOn, value: string | number) => {
    const updated = [...items];
    updated[itemIndex].addons[addonIndex] = { ...updated[itemIndex].addons[addonIndex], [field]: value };
    
    // Recalculate item total
    const addonsTotal = updated[itemIndex].addons.reduce((sum, addon) => sum + addon.price, 0);
    updated[itemIndex].item_total = (updated[itemIndex].unit_price * updated[itemIndex].quantity) + addonsTotal;
    
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderData: Omit<Order, 'id'> = {
      customer_name: customerName,
      contact_number: contactNumber,
      address: address,
      payment_method: paymentMethod,
      items: items.filter(item => item.product_id), // Remove empty items
      total_price: totalPrice,
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
            👤 Customer Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-gray-800"
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📞 Contact Number
          </label>
          <input
            type="tel"
            value={contactNumber}
            onChange={e => setContactNumber(e.target.value)}
            placeholder="Phone number"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-gray-800"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📍 Delivery Address
          </label>
          <textarea
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Full delivery address"
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-gray-800 resize-none"
          />
        </div>

        {/* Items Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-lg">🛍️</span>
              Items
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
            >
              + Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">
              No items yet. Tap "+ Add Item" to add products.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-blue-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500">Item #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      ✕ Remove
                    </button>
                  </div>

                  {/* Product Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {business === 'puan' ? '🧵 Select Puan' : '🎂 Select Cake'}
                    </label>
                    {businessProducts.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-700">
                        ⚠️ No products added yet
                      </div>
                    ) : (
                      <select
                        value={item.product_id}
                        onChange={e => handleUpdateItem(index, 'product_id', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 outline-none bg-white"
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
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      🔢 Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 outline-none"
                    />
                  </div>

                  {/* Add-ons for this item */}
                  <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-600">✨ Add-ons</span>
                      <button
                        type="button"
                        onClick={() => handleAddAddon(index)}
                        className="text-xs px-2 py-1 bg-amber-400 hover:bg-amber-500 text-white rounded transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                    {item.addons.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-1">No add-ons</p>
                    ) : (
                      <div className="space-y-2">
                        {item.addons.map((addon, addonIndex) => (
                          <div key={addonIndex} className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={addon.name}
                              onChange={e => handleUpdateAddon(index, addonIndex, 'name', e.target.value)}
                              placeholder="Add-on name"
                              className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:border-amber-400 outline-none"
                            />
                            <input
                              type="number"
                              value={addon.price || ''}
                              onChange={e => handleUpdateAddon(index, addonIndex, 'price', parseFloat(e.target.value) || 0)}
                              placeholder="₹"
                              min="0"
                              className="w-16 px-2 py-1 text-xs border border-gray-200 rounded focus:border-amber-400 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveAddon(index, addonIndex)}
                              className="text-red-400 hover:text-red-600 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Item Total */}
                  <div className="text-right text-sm font-semibold text-blue-700">
                    Item Total: ₹{item.item_total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            💳 Payment Method
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
        {totalPrice > 0 && (
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <div className="flex justify-between text-sm font-bold">
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
            📝 Notes
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
            disabled={items.length === 0}
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
