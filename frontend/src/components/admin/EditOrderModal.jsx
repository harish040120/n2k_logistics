import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';

const ROUTES = ['Route A', 'Route B', 'Route C', 'Route D', 'Route E', 'Route F'];
const PAYMENT_OPTIONS = ['Paid', 'To Pay'];

function EditOrderModal({ isOpen, onClose, order, onSave }) {
  const [formData, setFormData] = useState({
    fromAddress: '',
    toAddress: '',
    phoneNumber: '',
    quantity: '',
    weight: '',
    paymentOption: 'Paid',
    route: 'Route A'
  });

  useEffect(() => {
    if (order) {
      setFormData({
        ...order,
        fromAddress: order.fromAddress || '',
        toAddress: order.toAddress || '',
        phoneNumber: order.phoneNumber || '',
        quantity: order.quantity || '',
        weight: order.weight || '',
        paymentOption: order.paymentOption || 'Paid',
        route: order.route || 'Route A'
      });
    }
  }, [order]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Panel className="bg-white rounded p-6 w-full max-w-md">
          <Dialog.Title className="text-lg font-bold">Edit Order</Dialog.Title>
          <form className="space-y-4 mt-4">
            {/* Other form inputs */}
            <input
              type="text"
              name="fromAddress"
              placeholder="From Address"
              value={formData.fromAddress}
              onChange={handleChange}
              className="w-full border p-2"
            />
            <input
              type="text"
              name="toAddress"
              placeholder="To Address"
              value={formData.toAddress}
              onChange={handleChange}
              className="w-full border p-2"
            />
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full border p-2"
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full border p-2"
            />
            <input
              type="number"
              name="weight"
              placeholder="Weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full border p-2"
            />
            <select
              name="paymentOption"
              value={formData.paymentOption}
              onChange={handleChange}
              className="w-full border p-2"
            >
              {PAYMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              name="route"
              value={formData.route}
              onChange={handleChange}
              className="w-full border p-2"
            >
              {ROUTES.map((route) => (
                <option key={route} value={route}>
                  {route}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">
                Save
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default EditOrderModal;