import { useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const initialVehicles = [
  {
    id: "V001",
    type: "Delivery Bike",
    number: "TN45A1234",
    kilometers: 15000,
    fuelFilled: 10,
    fuelPrice: 102.5,
    lastService: "2024-01-15",
    lastServiceAmount: 1200,
    lastServiceBill: null,
  },
  {
    id: "V002",
    type: "Mini Van",
    number: "TN45B5678",
    kilometers: 25000,
    fuelFilled: 25,
    fuelPrice: 102.5,
    lastService: "2024-01-20",
    lastServiceAmount: 2500,
    lastServiceBill: null,
  },
];

export default function VehicleAccounts() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    number: "",
    kilometers: "",
    fuelFilled: "",
    fuelPrice: "",
    lastService: "",
    lastServiceAmount: "",
    lastServiceBill: null,
  });
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 5;

  // Pagination
  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const currentVehicles = filteredVehicles.slice(
    indexOfFirstVehicle,
    indexOfLastVehicle
  );
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.type) newErrors.type = "Type is required";
    if (!formData.number) newErrors.number = "Number is required";
    if (formData.kilometers <= 0)
      newErrors.kilometers = "Kilometers must be a positive number";
    if (formData.fuelFilled <= 0)
      newErrors.fuelFilled = "Fuel filled must be a positive number";
    if (formData.fuelPrice <= 0)
      newErrors.fuelPrice = "Fuel price must be a positive number";
    if (!formData.lastService)
      newErrors.lastService = "Last service date is required";
    if (formData.lastServiceAmount <= 0)
      newErrors.lastServiceAmount =
        "Last service amount must be a positive number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateMileage = (kilometers, fuelFilled) => {
    if (!fuelFilled || fuelFilled === 0) return "N/A";
    return (kilometers / fuelFilled).toFixed(2) + " km/L";
  };

  const calculateFuelCost = (fuelFilled, fuelPrice) => {
    return (fuelFilled * fuelPrice).toFixed(2);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      lastServiceBill: e.target.files[0],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingVehicle) {
      setVehicles(
        vehicles.map((vehicle) =>
          vehicle.id === editingVehicle.id
            ? { ...vehicle, ...formData }
            : vehicle
        )
      );
    } else {
      const newVehicle = {
        id: `V${String(vehicles.length + 1).padStart(3, "0")}`,
        ...formData,
      };
      setVehicles([...vehicles, newVehicle]);
    }
    setShowForm(false);
    setEditingVehicle(null);
    setFormData({
      type: "",
      number: "",
      kilometers: "",
      fuelFilled: "",
      fuelPrice: "",
      lastService: "",
      lastServiceAmount: "",
      lastServiceBill: null,
    });
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      setVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
    }
  };

  const handleUpdateFuel = (vehicle) => {
    const newFuel = prompt("Enter new fuel amount in liters:");
    const newPrice = prompt("Enter current fuel price per liter:");
    if (newFuel && newPrice) {
      setVehicles(
        vehicles.map((v) => {
          if (v.id === vehicle.id) {
            return {
              ...v,
              fuelFilled: parseFloat(v.fuelFilled) + parseFloat(newFuel),
              fuelPrice: parseFloat(newPrice),
            };
          }
          return v;
        })
      );
    }
  };

  // Graph data for real-time display
  const getFuelCostData = () => {
    return {
      labels: vehicles.map((vehicle) => vehicle.id),
      datasets: [
        {
          label: "Fuel Cost (₹)",
          data: vehicles.map((vehicle) =>
            parseFloat(calculateFuelCost(vehicle.fuelFilled, vehicle.fuelPrice))
          ),
          backgroundColor: "rgba(75,192,192,0.6)",
        },
      ],
    };
  };

  const getFuelFilledData = () => {
    return {
      labels: vehicles.map((vehicle) => vehicle.id),
      datasets: [
        {
          label: "Fuel Filled (L)",
          data: vehicles.map((vehicle) => vehicle.fuelFilled),
          backgroundColor: "rgba(153, 102, 255, 0.6)",
        },
      ],
    };
  };

  const getMileageData = () => {
    return {
      labels: vehicles.map((vehicle) => vehicle.id),
      datasets: [
        {
          label: "Mileage (km/L)",
          data: vehicles
            .map((vehicle) =>
              calculateMileage(vehicle.kilometers, vehicle.fuelFilled)
            )
            .map((item) => (item === "N/A" ? 0 : parseFloat(item))),
          backgroundColor: "rgba(255,159,64,0.6)",
        },
      ],
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => `₹${context.raw.toFixed(2)}`,
        },
      },
    },
    animation: {
      duration: 1000,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Vehicle Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Vehicle
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Search by type, number, or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
      </div>

      {/* Charts in a single row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Fuel Cost</h3>
          <Bar data={getFuelCostData()} options={options} />
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Fuel Filled (L)</h3>
          <Bar data={getFuelFilledData()} options={options} />
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Mileage (km/L)</h3>
          <Bar data={getMileageData()} options={options} />
        </div>
      </div>

      {/* Table with vehicle data */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Vehicle ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Kilometers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fuel (L)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fuel Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Mileage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Last Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Last Service Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Service Bill
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentVehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {vehicle.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {vehicle.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {vehicle.number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {vehicle.kilometers.toLocaleString()} km
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {vehicle.fuelFilled}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{calculateFuelCost(vehicle.fuelFilled, vehicle.fuelPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {calculateMileage(vehicle.kilometers, vehicle.fuelFilled)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {vehicle.lastService}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{vehicle.lastServiceAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {vehicle.lastServiceBill ? (
                    <a
                      href={URL.createObjectURL(vehicle.lastServiceBill)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Bill
                    </a>
                  ) : (
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setVehicles(
                          vehicles.map((v) =>
                            v.id === vehicle.id
                              ? { ...v, lastServiceBill: file }
                              : v
                          )
                        );
                      }}
                    />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleUpdateFuel(vehicle)}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs hover:bg-green-200"
                    >
                      Add Fuel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 disabled:bg-slate-300"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 disabled:bg-slate-300"
        >
          Next
        </button>
      </div>

      {/* Add/Edit Vehicle Form */}
      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">
            {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-slate-500 focus:ring-slate-500"
                required
              />
              {errors.type && (
                <p className="text-red-500 text-sm">{errors.type}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number
              </label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-slate-500 focus:ring-slate-500"
                required
              />
              {errors.number && (
                <p className="text-red-500 text-sm">{errors.number}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kilometers
              </label>
              <input
                type="number"
                name="kilometers"
                value={formData.kilometers}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-slate-500 focus:ring-slate-500"
                required
              />
              {errors.kilometers && (
                <p className="text-red-500 text-sm">{errors.kilometers}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fuel Filled (L)
              </label>
              <input
                type="number"
                name="fuelFilled"
                value={formData.fuelFilled}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-slate-500 focus:ring-slate-500"
                required
              />
              {errors.fuelFilled && (
                <p className="text-red-500 text-sm">{errors.fuelFilled}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fuel Price (₹/L)
              </label>
              <input
                type="number"
                name="fuelPrice"
                value={formData.fuelPrice}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-slate-500 focus:ring-slate-500"
                required
              />
              {errors.fuelPrice && (
                <p className="text-red-500 text-sm">{errors.fuelPrice}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Service
              </label>
              <input
                type="date"
                name="lastService"
                value={formData.lastService}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-slate-500 focus:ring-slate-500"
                required
              />
              {errors.lastService && (
                <p className="text-red-500 text-sm">{errors.lastService}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Service Amount
              </label>
              <input
                type="number"
                name="lastServiceAmount"
                value={formData.lastServiceAmount}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-slate-500 focus:ring-slate-500"
                required
              />
              {errors.lastServiceAmount && (
                <p className="text-red-500 text-sm">
                  {errors.lastServiceAmount}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Bill
              </label>
              <input
                type="file"
                name="lastServiceBill"
                onChange={handleFileChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-slate-500 focus:ring-slate-500"
              />
            </div>
            <div className="col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingVehicle(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
              >
                {editingVehicle ? "Update" : "Add"} Vehicle
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
