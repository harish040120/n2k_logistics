import { useState } from 'react';
import TrackingDetails from '../components/tracking/TrackingDetails';
import TrackingHistory from '../components/tracking/TrackingHistory';

function TrackingPortal() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();
    // Simulate tracking result
    setTrackingResult({
      status: 'In Transit',
      location: 'Distribution Center, New York',
      estimatedDelivery: '2024-02-07',
      updates: [
        {
          date: '2024-02-05 14:30',
          status: 'Package departed from distribution center',
          location: 'New York, NY',
        },
        {
          date: '2024-02-05 09:15',
          status: 'Package arrived at distribution center',
          location: 'New York, NY',
        },
        {
          date: '2024-02-04 18:45',
          status: 'Package picked up',
          location: 'Boston, MA',
        },
      ],
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Track Your Package</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label
              htmlFor="tracking-number"
              className="block text-sm font-medium text-gray-700"
            >
              Enter Tracking Number
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="tracking-number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your tracking number"
              />
              <button
                type="submit"
                className="ml-3 inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-800 transition-all duration-300 transform hover:scale-105"
              >
                Track
              </button>
            </div>
          </div>
        </form>
      </div>

      {trackingResult && (
        <div className="bg-white p-6 rounded-lg shadow">
          <TrackingDetails
            status={trackingResult.status}
            location={trackingResult.location}
            estimatedDelivery={trackingResult.estimatedDelivery}
          />
          <TrackingHistory updates={trackingResult.updates} />
        </div>
      )}
    </div>
  );
}

export default TrackingPortal;