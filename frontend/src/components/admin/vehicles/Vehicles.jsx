import { useState } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const routeColors = {
  'Route A': 'bg-red-200',
  'Route B': 'bg-blue-200',
  'Route C': 'bg-green-200',
  'Route D': 'bg-yellow-200',
  'Route E': 'bg-purple-200',
  'Route F': 'bg-pink-200',
  'Route G': 'bg-indigo-200',
};

const borderColors = {
  'Route A': 'border-red-800',
  'Route B': 'border-blue-800',
  'Route C': 'border-green-800',
  'Route D': 'border-yellow-800',
  'Route E': 'border-purple-800',
  'Route F': 'border-pink-800',
  'Route G': 'border-indigo-800',
};

// Static driver info: mapping driver names to their default phone numbers.
const driverInfo = {
  'John Doe': '1234567890',
  'Alice Johnson': '9876543210',
  'Mike Smith': '4567891230',
  'Sara Connor': '5556667777',
  'David Lee': '8889990000',
};

const driverOptions = Object.keys(driverInfo);

const initialVehicles = [
  {
    vehicle_id: 1,
    vehicle_number: 'ABC123',
    max_capacity_kg: 1000,
    route: 'Route A',
    driverName: 'John Doe',
    driverPhone: driverInfo['John Doe'],
    active: true,
  },
  {
    vehicle_id: 2,
    vehicle_number: 'XYZ789',
    max_capacity_kg: 1500,
    route: 'Route B',
    driverName: 'Alice Johnson',
    driverPhone: driverInfo['Alice Johnson'],
    active: false,
  },
  {
    vehicle_id: 3,
    vehicle_number: 'LMN456',
    max_capacity_kg: 1200,
    route: 'Route C',
    driverName: 'Mike Smith',
    driverPhone: driverInfo['Mike Smith'],
    active: true,
  },
  {
    vehicle_id: 4,
    vehicle_number: 'QRS234',
    max_capacity_kg: 1300,
    route: 'Route D',
    driverName: 'Sara Connor',
    driverPhone: driverInfo['Sara Connor'],
    active: true,
  },
  {
    vehicle_id: 5,
    vehicle_number: 'TUV567',
    max_capacity_kg: 1400,
    route: 'Route E',
    driverName: 'David Lee',
    driverPhone: driverInfo['David Lee'],
    active: false,
  },
  {
    vehicle_id: 6,
    vehicle_number: 'GHI890',
    max_capacity_kg: 1100,
    route: 'Route F',
    driverName: 'Mike Smith',
    driverPhone: driverInfo['Mike Smith'],
    active: true,
  },
  {
    vehicle_id: 7,
    vehicle_number: 'JKL012',
    max_capacity_kg: 1600,
    route: 'Route G',
    driverName: 'Alice Johnson',
    driverPhone: driverInfo['Alice Johnson'],
    active: true,
  },
];

function VehicleCard({ vehicle, updateVehicle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempDriver, setTempDriver] = useState(vehicle.driverName);
  const [tempDriverPhone, setTempDriverPhone] = useState(vehicle.driverPhone);

  const handleDriverChange = (e) => {
    const newDriver = e.target.value;
    setTempDriver(newDriver);
    setTempDriverPhone(driverInfo[newDriver] || '');
  };

  const saveChanges = () => {
    updateVehicle(vehicle.vehicle_id, 'driverName', tempDriver);
    updateVehicle(vehicle.vehicle_id, 'driverPhone', tempDriverPhone);
    setIsEditing(false);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`w-40 h-32 md:w-56 md:h-40 rounded-lg border-4 ${borderColors[vehicle.route]} overflow-hidden shadow-lg`}
    >
      <div className={`w-full h-full rounded-lg ${routeColors[vehicle.route]} p-3 flex flex-col justify-between`}>
        <div>
          <h3 className="font-bold text-sm">{vehicle.vehicle_number}</h3>
          <p className="text-xs">Route: {vehicle.route}</p>
          <p className="text-xs">Cap: {vehicle.max_capacity_kg} kg</p>
        </div>
        {isEditing ? (
          <div className="space-y-1">
            <div className="text-xs">
              <select
                value={tempDriver}
                onChange={handleDriverChange}
                className="w-full text-xs border rounded px-1 py-0.5"
              >
                {driverOptions.map((driver) => (
                  <option key={driver} value={driver}>
                    {driver}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs">
              <input
                type="text"
                value={tempDriverPhone}
                onChange={(e) => setTempDriverPhone(e.target.value)}
                className="w-full text-xs border rounded px-1 py-0.5"
              />
            </div>
            <div className="flex justify-end space-x-1">
              <button onClick={saveChanges} className="text-green-600">
                <CheckIcon className="h-4 w-4" />
              </button>
              <button onClick={() => setIsEditing(false)} className="text-red-600">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs">
            <p>Driver: {vehicle.driverName}</p>
            <p>Phone: {vehicle.driverPhone}</p>
            <p>Status: {vehicle.active ? 'Active' : 'Inactive'}</p>
            <button onClick={() => setIsEditing(true)} className="mt-1 text-blue-600 hover:text-blue-800">
              <PencilIcon className="h-4 w-4 inline" /> Edit
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState(initialVehicles);

  const updateVehicle = (vehicleId, field, value) => {
    setVehicles((prevVehicles) =>
      prevVehicles.map((v) =>
        v.vehicle_id === vehicleId ? { ...v, [field]: value } : v
      )
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Vehicles</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.vehicle_id} vehicle={vehicle} updateVehicle={updateVehicle} />
        ))}
      </div>
    </div>
  );
}