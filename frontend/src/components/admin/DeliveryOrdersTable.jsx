import React, { useState, useEffect } from 'react';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import config from '@config';

const defaultStatusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in transit': 'bg-blue-100 text-blue-800',
    'in-transit': 'bg-blue-100 text-blue-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'delayed': 'bg-orange-100 text-orange-800',
    'unknown': 'bg-gray-100 text-gray-800'
};

function StatusBadge({ status, color }) {
  const bgColor = color || defaultStatusColors['unknown'];

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor}`}>
      {status || 'Unknown'}
    </span>
  );
}

function DeliveryOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  const API_BASE_URL = config.API_BASE_URL || 'http://localhost:5000/api';

  const fetchStatusOptions = async () => {
     try {
        const response = await axios.get(`${API_BASE_URL}/order-status`);
        if (Array.isArray(response.data) && response.data.every(s => s.name && s.color)) {
             setStatusOptions(response.data);
        } else {
            console.warn('Fetched status options format invalid or incomplete. Using defaults.', response.data);
            setStatusOptions(Object.entries(defaultStatusColors)
                .filter(([name]) => name !== 'unknown')
                .map(([name, color]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), color }))
            );
        }
     } catch (err) {
         console.error('Error fetching status options:', err);
         setStatusOptions(Object.entries(defaultStatusColors)
             .filter(([name]) => name !== 'unknown')
             .map(([name, color]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), color }))
         );
     }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/orders`);
        setOrders(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(`Failed to load orders: ${err.response?.data?.error || err.message || 'Please try again later.'}`);
        setOrders([]);
      }
    };

    const fetchFormData = async () => {
      try {
        const [routesResponse, paymentMethodsResponse, itemTypesResponse] = await Promise.all([
           axios.get(`${API_BASE_URL}/routes`),
           axios.get(`${API_BASE_URL}/payment-methods`),
           axios.get(`${API_BASE_URL}/item-types`),
           fetchStatusOptions()
        ]);

        setRoutes(Array.isArray(routesResponse.data) ? routesResponse.data : []);
        setPaymentMethods(Array.isArray(paymentMethodsResponse.data) ? paymentMethodsResponse.data : []);
        setItemTypes(Array.isArray(itemTypesResponse.data) ? itemTypesResponse.data : []);

      } catch (err) {
        console.error('Error fetching form data (routes, payment, items, status):', err);
        setError(prevError => prevError ? `${prevError}\nFailed to load dropdown options.` : 'Failed to load dropdown options.');
        setRoutes([]);
        setPaymentMethods([]);
        setItemTypes([]);
      }
    };

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchOrders(),
                fetchFormData()
            ]);
        } catch (err) {
            console.error("Error during combined data fetching:", err);
            setError("An unexpected error occurred while loading data.");
        } finally {
            setLoading(false);
        }
    };

    fetchAllData();

  }, [API_BASE_URL]);


  const getStatusColor = (statusName) => {
    const normalizedStatusName = statusName?.toLowerCase();
    const statusOption = statusOptions.find(s => s.name?.toLowerCase() === normalizedStatusName);

    if (statusOption && statusOption.color) {
        return statusOption.color;
    }
    return defaultStatusColors[normalizedStatusName] || defaultStatusColors['unknown'];
  };


  const handleEditOrder = (order) => {
    setCurrentOrder(order);
    setIsEditModalOpen(true);
  };

  const handleUpdateOrder = async (updatedFields) => {
    if (!currentOrder) {
        console.error("Cannot update order: currentOrder is null.");
        alert("An error occurred. Please close the modal and try again.");
        return;
      }

      const orderIdToUpdate = currentOrder.id;

      try {
        const payload = {
          ...updatedFields,
          invoiceDate: updatedFields.invoiceDate ? new Date(updatedFields.invoiceDate).toISOString().split('T')[0] : null,
          quantity: updatedFields.quantity !== '' && !isNaN(Number(updatedFields.quantity)) ? Number(updatedFields.quantity) : null,
          weight: updatedFields.weight !== '' && !isNaN(Number(updatedFields.weight)) ? Number(updatedFields.weight) : null,
          invoiceValue: updatedFields.invoiceValue !== '' && !isNaN(Number(updatedFields.invoiceValue)) ? Number(updatedFields.invoiceValue) : null,
          lrCharge: updatedFields.lrCharge !== '' && !isNaN(Number(updatedFields.lrCharge)) ? Number(updatedFields.lrCharge) : null,
          frightCharge: updatedFields.frightCharge !== '' && !isNaN(Number(updatedFields.frightCharge)) ? Number(updatedFields.frightCharge) : null,
          fuelSurcharge: updatedFields.fuelSurcharge !== '' && !isNaN(Number(updatedFields.fuelSurcharge)) ? Number(updatedFields.fuelSurcharge) : null,
          ieCharge: updatedFields.ieCharge !== '' && !isNaN(Number(updatedFields.ieCharge)) ? Number(updatedFields.ieCharge) : null,
          doorDeliveryCharge: updatedFields.doorDeliveryCharge !== '' && !isNaN(Number(updatedFields.doorDeliveryCharge)) ? Number(updatedFields.doorDeliveryCharge) : null,
          hamali: updatedFields.hamali !== '' && !isNaN(Number(updatedFields.hamali)) ? Number(updatedFields.hamali) : null,
        };

        await axios.put(`${API_BASE_URL}/orders/${orderIdToUpdate}`, payload);

        setOrders(prevOrders => prevOrders.map(order =>
            order.id === orderIdToUpdate
            ? { ...order, ...payload }
            : order
        ));

        setIsEditModalOpen(false);
        setCurrentOrder(null);

      } catch (err) {
        console.error('Error updating order:', err.response ? err.response.data : err.message);
        const errorMsg = err.response?.data?.error
                         || err.response?.data?.message
                         || (typeof err.response?.data === 'string' ? err.response.data : null)
                         || err.message
                         || 'An unknown error occurred. Please try again.';
        alert(`Failed to update order: ${errorMsg}`);
      }
  };


  if (loading) return <div className="text-center py-4">Loading orders...</div>;
  if (error) return <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">{error}</div>;

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Recent Delivery Orders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
             <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LR Num</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From/To District</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight/Qty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length > 0 ? (
              orders.map((order) => (
                <OrderRow
                  key={order.id || order.lr_number}
                  order={order}
                  onEditOrder={handleEditOrder}
                  statusColor={getStatusColor(order.status)}
                />
              ))
            ) : (
               <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No orders found.</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && currentOrder && (
        <EditOrderModal
          order={currentOrder}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentOrder(null);
          }}
          onSave={handleUpdateOrder}
          routes={routes}
          paymentMethods={paymentMethods}
          itemTypes={itemTypes}
          statusOptions={statusOptions}
        />
      )}
    </div>
  );
}

function OrderRow({ order, onEditOrder, statusColor }) {
  return (
    <tr>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {order.lr_number || `ID: ${order.id}`}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <StatusBadge status={order.status} color={statusColor} />
      </td>
       <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
        {order.route || '-'}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
        {order.from_district || '?'} → {order.to_district || '?'}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
        {order.weight ?? '-'}kg / {order.quantity ?? '-'} units
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
        {order.item_type || '-'}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
        {order.payment_method || '-'}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={() => onEditOrder(order)}
          className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          aria-label={`Edit order ${order.lr_number || order.id}`}
        >
          <PencilIcon className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
}

function EditOrderModal({ order, onClose, onSave, routes, paymentMethods, itemTypes, statusOptions }) {
   const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      console.warn("Could not format date:", dateString, e);
      return '';
    }
  };

  const [formData, setFormData] = useState({
    fromName: order.from_name || '',
    fromAddress: order.from_address || '',
    fromDistrict: order.from_district || '',
    fromPhone: order.from_phone || '',
    toName: order.to_name || '',
    toAddress: order.to_address || '',
    toDistrict: order.to_district || '',
    toPhone: order.to_phone || '',
    quantity: order.quantity ?? '',
    weight: order.weight ?? '',
    itemType: order.item_type || '',
    invoiceNumber: order.invoice_number || '',
    invoiceDate: formatDateForInput(order.invoice_date),
    invoiceValue: order.invoice_value ?? '',
    lrCharge: order.lr_charge ?? '',
    frightCharge: order.fright_charge ?? '',
    fuelSurcharge: order.fuel_surcharge ?? '',
    ieCharge: order.ie_charge ?? '',
    doorDeliveryCharge: order.door_delivery_charge ?? '',
    hamali: order.hamali ?? '',
    route: order.route || '',
    paymentMethod: order.payment_method || '',
    termsDelivery: order.terms_of_delivery || '',
    status: order.status || '',
    eWayBill: order.eway_bill || '',
});


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };


  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
         <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg z-10">
          <h3 className="text-xl font-semibold text-gray-900">Edit Order {order.lr_number ? `#${order.lr_number}` : `(ID: ${order.id})`}</h3>
          <button
             onClick={onClose}
             className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
             aria-label="Close modal"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form id="editOrderForm" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                 <option value="">Select Status</option>
                {statusOptions.map((option) => (
                  <option key={option.name} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="route" className="block mb-2 text-sm font-medium text-gray-900">Route</label>
              <select
                id="route"
                name="route"
                value={formData.route}
                onChange={handleChange}
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                 <option value="">Select Route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.name}>{route.name}</option>
                ))}
              </select>
            </div>

             <div>
               <label htmlFor="fromName" className="block mb-2 text-sm font-medium text-gray-900">From Name</label>
               <input type="text" id="fromName" name="fromName" value={formData.fromName} onChange={handleChange} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
             </div>
             <div>
               <label htmlFor="toName" className="block mb-2 text-sm font-medium text-gray-900">To Name</label>
               <input type="text" id="toName" name="toName" value={formData.toName} onChange={handleChange} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
             </div>

            <div>
              <label htmlFor="fromAddress" className="block mb-2 text-sm font-medium text-gray-900">From Address</label>
              <input type="text" id="fromAddress" name="fromAddress" value={formData.fromAddress} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            </div>
            <div>
              <label htmlFor="toAddress" className="block mb-2 text-sm font-medium text-gray-900">To Address</label>
              <input type="text" id="toAddress" name="toAddress" value={formData.toAddress} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            </div>

             <div>
               <label htmlFor="fromDistrict" className="block mb-2 text-sm font-medium text-gray-900">From District</label>
               <input type="text" id="fromDistrict" name="fromDistrict" value={formData.fromDistrict} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
             </div>
             <div>
               <label htmlFor="toDistrict" className="block mb-2 text-sm font-medium text-gray-900">To District</label>
               <input type="text" id="toDistrict" name="toDistrict" value={formData.toDistrict} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
             </div>

            <div>
              <label htmlFor="fromPhone" className="block mb-2 text-sm font-medium text-gray-900">From Phone</label>
              <input type="tel" id="fromPhone" name="fromPhone" value={formData.fromPhone} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            </div>
            <div>
              <label htmlFor="toPhone" className="block mb-2 text-sm font-medium text-gray-900">To Phone</label>
              <input type="tel" id="toPhone" name="toPhone" value={formData.toPhone} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            </div>

            <div>
              <label htmlFor="itemType" className="block mb-2 text-sm font-medium text-gray-900">Item Type</label>
              <select
                id="itemType"
                name="itemType"
                value={formData.itemType}
                onChange={handleChange}
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                 <option value="">Select Item Type</option>
                {itemTypes.map((type) => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
              </select>
            </div>
             <div>
               <label htmlFor="paymentMethod" className="block mb-2 text-sm font-medium text-gray-900">Payment Method</label>
               <select
                 id="paymentMethod"
                 name="paymentMethod"
                 value={formData.paymentMethod}
                 onChange={handleChange}
                 required
                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
               >
                 <option value="">Select Payment Method</option>
                 {paymentMethods.map((method) => (
                   <option key={method.id} value={method.name}>{method.name}</option>
                 ))}
               </select>
             </div>


            <div>
              <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-900">Quantity</label>
              <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} min="0" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            </div>
            <div>
              <label htmlFor="weight" className="block mb-2 text-sm font-medium text-gray-900">Weight (kg)</label>
              <input type="number" id="weight" name="weight" value={formData.weight} onChange={handleChange} min="0" step="0.01" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            </div>

            <div>
              <label htmlFor="invoiceNumber" className="block mb-2 text-sm font-medium text-gray-900">Invoice Number</label>
              <input type="text" id="invoiceNumber" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            </div>
            <div>
              <label htmlFor="invoiceDate" className="block mb-2 text-sm font-medium text-gray-900">Invoice Date</label>
              <input type="date" id="invoiceDate" name="invoiceDate" value={formData.invoiceDate} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            </div>

            <div>
              <label htmlFor="invoiceValue" className="block mb-2 text-sm font-medium text-gray-900">Invoice Value</label>
              <input type="number" id="invoiceValue" name="invoiceValue" value={formData.invoiceValue} onChange={handleChange} min="0" step="0.01" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            </div>
             <div>
               <label htmlFor="eWayBill" className="block mb-2 text-sm font-medium text-gray-900">E-Way Bill</label>
               <input type="text" id="eWayBill" name="eWayBill" value={formData.eWayBill} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
             </div>


            <div>
              <label htmlFor="lrCharge" className="block mb-2 text-sm font-medium text-gray-900">LR Charge</label>
              <input type="number" id="lrCharge" name="lrCharge" value={formData.lrCharge} onChange={handleChange} min="0" step="0.01" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            </div>
            <div>
              <label htmlFor="frightCharge" className="block mb-2 text-sm font-medium text-gray-900">Freight Charge</label>
              <input type="number" id="frightCharge" name="frightCharge" value={formData.frightCharge} onChange={handleChange} min="0" step="0.01" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            </div>


             <div>
               <label htmlFor="fuelSurcharge" className="block mb-2 text-sm font-medium text-gray-900">Fuel Surcharge</label>
               <input type="number" id="fuelSurcharge" name="fuelSurcharge" value={formData.fuelSurcharge} onChange={handleChange} min="0" step="0.01" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
             </div>
             <div>
               <label htmlFor="ieCharge" className="block mb-2 text-sm font-medium text-gray-900">IE Charge</label>
               <input type="number" id="ieCharge" name="ieCharge" value={formData.ieCharge} onChange={handleChange} min="0" step="0.01" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
             </div>

             <div>
               <label htmlFor="doorDeliveryCharge" className="block mb-2 text-sm font-medium text-gray-900">Door Delivery Charge</label>
               <input type="number" id="doorDeliveryCharge" name="doorDeliveryCharge" value={formData.doorDeliveryCharge} onChange={handleChange} min="0" step="0.01" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
             </div>
            <div>
              <label htmlFor="hamali" className="block mb-2 text-sm font-medium text-gray-900">Hamali</label>
              <input type="number" id="hamali" name="hamali" value={formData.hamali} onChange={handleChange} min="0" step="0.01" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            </div>

             <div>
               <label htmlFor="termsDelivery" className="block mb-2 text-sm font-medium text-gray-900">Terms of Delivery</label>
                <input type="text" id="termsDelivery" name="termsDelivery" value={formData.termsDelivery} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
             </div>

          </div>
        </form>

        <div className="flex items-center p-4 border-t border-gray-200 rounded-b sticky bottom-0 bg-gray-50 z-10">
          <button
            type="submit"
            form="editOrderForm"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Update Order
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


export default DeliveryOrdersTable;