function TrackingDetails({ status, location, estimatedDelivery }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Tracking Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Current Status</p>
          <p className="text-lg font-medium text-gray-900">{status}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Current Location</p>
          <p className="text-lg font-medium text-gray-900">{location}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Estimated Delivery</p>
          <p className="text-lg font-medium text-gray-900">{estimatedDelivery}</p>
        </div>
      </div>
    </div>
  );
}

export default TrackingDetails;