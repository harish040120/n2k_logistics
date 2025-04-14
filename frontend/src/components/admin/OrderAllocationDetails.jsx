import { determineHub } from '../../utils/hubAllocation';
import { determineVehicle } from '../../utils/vehicleAllocation';

export default function OrderAllocationDetails({ weight, quantity, location }) {
  const hub = determineHub(location);
  const vehicle = determineVehicle(weight, quantity);

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Allocation Details</h3>
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-500">Assigned Hub:</span>
          <span className="ml-2 text-sm text-gray-900">{hub}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Vehicle Type:</span>
          <span className="ml-2 text-sm text-gray-900">{vehicle.name}</span>
        </div>
      </div>
    </div>
  );
}