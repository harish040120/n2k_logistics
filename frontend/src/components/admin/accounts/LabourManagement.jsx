import { useState } from "react";
import { PlusIcon, PencilIcon } from "@heroicons/react/24/outline";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const initialLabourers = [
  {
    id: "L001",
    name: "John Doe",
    role: "Driver",
    dailyWage: 800,
    daysWorked: 24,
    overtime: 10,
    overtimeRate: 100,
  },
  {
    id: "L002",
    name: "Jane Smith",
    role: "Loading Staff",
    dailyWage: 600,
    daysWorked: 26,
    overtime: 15,
    overtimeRate: 75,
  },
  {
    id: "L003",
    name: "Mike Johnson",
    role: "Warehouse Staff",
    dailyWage: 700,
    daysWorked: 22,
    overtime: 8,
    overtimeRate: 90,
  },
];

export default function LabourManagement() {
  const [labourers, setLabourers] = useState(initialLabourers);
  const [showForm, setShowForm] = useState(false);
  const [editingLabourer, setEditingLabourer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    dailyWage: "",
    daysWorked: "",
    overtime: "",
    overtimeRate: "",
    customRole: "",
  });

  const calculateTotalWages = (labourer) =>
    labourer.dailyWage * labourer.daysWorked +
    labourer.overtime * labourer.overtimeRate;

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const role =
      formData.role === "Other" ? formData.customRole : formData.role;
    if (editingLabourer) {
      setLabourers(
        labourers.map((l) =>
          l.id === editingLabourer.id ? { ...l, ...formData, role } : l
        )
      );
    } else {
      setLabourers([
        ...labourers,
        {
          id: `L${String(labourers.length + 1).padStart(3, "0")}`,
          ...formData,
          role,
        },
      ]);
    }
    setShowForm(false);
    setEditingLabourer(null);
    setFormData({
      name: "",
      role: "",
      dailyWage: "",
      daysWorked: "",
      overtime: "",
      overtimeRate: "",
      customRole: "",
    });
  };

  const handleEdit = (labourer) => {
    setEditingLabourer(labourer);
    setFormData(labourer);
    setShowForm(true);
  };

  const handleUpdateWork = (labourer) => {
    const newDays = prompt("Enter additional days worked:");
    const newOvertime = prompt("Enter additional overtime hours:");
    if (newDays || newOvertime) {
      setLabourers(
        labourers.map((l) =>
          l.id === labourer.id
            ? {
                ...l,
                daysWorked: newDays
                  ? parseInt(l.daysWorked) + parseInt(newDays)
                  : l.daysWorked,
                overtime: newOvertime
                  ? parseInt(l.overtime) + parseInt(newOvertime)
                  : l.overtime,
              }
            : l
        )
      );
    }
  };

  // **Chart Data Preparation**
  const roleWiseData = labourers.reduce((acc, labourer) => {
    const existing = acc.find((item) => item.role === labourer.role);
    if (existing) {
      existing.totalWages += calculateTotalWages(labourer);
    } else {
      acc.push({
        role: labourer.role,
        totalWages: calculateTotalWages(labourer),
      });
    }
    return acc;
  }, []);

  // Colors for the pie chart
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Labour Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Labour
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">
            {editingLabourer ? "Edit Labour Details" : "Add New Labour"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {[
              "name",
              "dailyWage",
              "daysWorked",
              "overtime",
              "overtimeRate",
            ].map((field, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-slate-500 focus:ring-slate-500"
                  required
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-slate-500 focus:ring-slate-500"
                required
              >
                <option value="Driver">Driver</option>
                <option value="Loading Staff">Loading Staff</option>
                <option value="Warehouse Staff">Warehouse Staff</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {formData.role === "Other" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Custom Role
                </label>
                <input
                  type="text"
                  name="customRole"
                  value={formData.customRole}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-slate-500 focus:ring-slate-500"
                  required
                />
              </div>
            )}
            <div className="col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingLabourer(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
              >
                {editingLabourer ? "Update" : "Add"} Labour
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Wage Distribution by Role Pie Chart */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">
          Wage Distribution by Role
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={roleWiseData}
              dataKey="totalWages"
              nameKey="role"
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              label
            >
              {roleWiseData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 p-4">Labourers List</h3>
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Daily Wage</th>
              <th className="px-4 py-2 text-left">Days Worked</th>
              <th className="px-4 py-2 text-left">Overtime</th>
              <th className="px-4 py-2 text-left">Total Wages</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {labourers.map((labourer) => (
              <tr key={labourer.id} className="border-t">
                <td className="px-4 py-2">{labourer.id}</td>
                <td className="px-4 py-2">{labourer.name}</td>
                <td className="px-4 py-2">{labourer.role}</td>
                <td className="px-4 py-2">{labourer.dailyWage}</td>
                <td className="px-4 py-2">{labourer.daysWorked}</td>
                <td className="px-4 py-2">{labourer.overtime}</td>
                <td className="px-4 py-2">{calculateTotalWages(labourer)}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleEdit(labourer)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <PencilIcon className="h-5 w-5 inline" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleUpdateWork(labourer)}
                    className="text-green-500 hover:text-green-700 ml-4"
                  >
                    Update Work
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
