import { useState, useEffect } from 'react';
import axios from 'axios';
// Fix the import below to point to the actual file location:
import StatusBadge from '../admin/StatusBadge.jsx'; // Adjust path as necessary
import config from '@config';

function DriverDeliveryList({ onUpdateDelivery }) {
  const [activeDeliveries, setActiveDeliveries] = useState([]);

  useEffect(() => {
    fetchDeliveries();
  }, []);
  const API_BASE_URL = config.API_BASE_URL; 
  const fetchDeliveries = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/deliveries`);

      setActiveDeliveries(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">Today&apos;s Deliveries</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeDeliveries.map((delivery) => (
                <tr key={delivery.delivery_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {delivery.booking_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <StatusBadge status={delivery.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => onUpdateDelivery(delivery)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DriverDeliveryList;