import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const initialAssets = [
  {
    id: "FA001",
    category: "Utilities",
    item: "Electricity Bill",
    amount: 15000,
    dueDate: "2024-02-15",
    status: "Pending",
  },
  {
    id: "FA002",
    category: "Internet",
    item: "WiFi Monthly Recharge",
    amount: 2000,
    dueDate: "2024-02-10",
    status: "Paid",
  },
  {
    id: "FA003",
    category: "Rent",
    item: "Warehouse Rent",
    amount: 50000,
    dueDate: "2024-02-01",
    status: "Paid",
  },
];

export default function FixedAssets() {
  const [assets, setAssets] = useState(initialAssets);
  const [newAsset, setNewAsset] = useState({
    id: "",
    category: "",
    item: "",
    amount: "",
    dueDate: "",
    status: "Pending",
  });
  const [showForm, setShowForm] = useState(false);

  // Add or Edit Asset
  const handleAddAsset = () => {
    if (newAsset.id) {
      setAssets((prev) => {
        const existingIndex = prev.findIndex(
          (asset) => asset.id === newAsset.id
        );
        if (existingIndex !== -1) {
          prev[existingIndex] = newAsset;
          return [...prev];
        }
        return [...prev, newAsset];
      });
      setNewAsset({
        id: "",
        category: "",
        item: "",
        amount: "",
        dueDate: "",
        status: "Pending",
      });
      setShowForm(false); // Hide form after saving
    }
  };

  // Delete Asset
  const handleDeleteAsset = (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      setAssets(assets.filter((asset) => asset.id !== id));
    }
  };

  // Clear Form
  const handleClearForm = () => {
    setNewAsset({
      id: "",
      category: "",
      item: "",
      amount: "",
      dueDate: "",
      status: "Pending",
    });
    setShowForm(false);
  };

  // Edit Asset
  const handleEditAsset = (asset) => {
    setNewAsset(asset);
    setShowForm(true);
  };

  // Data for the bar chart (category-wise expenditure)
  const barChartData = Object.values(
    assets.reduce((acc, asset) => {
      if (!acc[asset.category])
        acc[asset.category] = { name: asset.category, amount: 0 };
      acc[asset.category].amount += asset.amount;
      return acc;
    }, {})
  );

  // Data for the pie chart (Paid vs Pending in terms of total amount)
  const paidAmount = assets
    .filter((a) => a.status === "Paid")
    .reduce((sum, a) => sum + a.amount, 0);
  const pendingAmount = assets
    .filter((a) => a.status === "Pending")
    .reduce((sum, a) => sum + a.amount, 0);
  const pieChartData = [
    { name: "Paid", value: paidAmount },
    { name: "Pending", value: pendingAmount },
  ];
  const COLORS = ["#4CAF50", "#FFC107"];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Fixed Assets & Monthly Bills
      </h2>

      {/* Add Asset Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        {showForm ? "Close Form" : "Add or Edit Asset"}
      </button>

      {/* Form to Add/Edit Assets */}
      {showForm && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Add / Edit Asset</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <input
              type="text"
              placeholder="ID"
              value={newAsset.id}
              onChange={(e) => setNewAsset({ ...newAsset, id: e.target.value })}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Category"
              value={newAsset.category}
              onChange={(e) =>
                setNewAsset({ ...newAsset, category: e.target.value })
              }
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Item"
              value={newAsset.item}
              onChange={(e) =>
                setNewAsset({ ...newAsset, item: e.target.value })
              }
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newAsset.amount}
              onChange={(e) =>
                setNewAsset({ ...newAsset, amount: +e.target.value })
              }
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={newAsset.dueDate}
              onChange={(e) =>
                setNewAsset({ ...newAsset, dueDate: e.target.value })
              }
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newAsset.status}
              onChange={(e) =>
                setNewAsset({ ...newAsset, status: e.target.value })
              }
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleAddAsset}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleClearForm}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Graphs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Expenditure Overview Bar Chart */}
        <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Expenditure Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Bar dataKey="amount" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Pie Chart */}
        <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Payment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Assets List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {asset.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {asset.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {asset.item}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ₹{asset.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {asset.dueDate}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                        asset.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex space-x-2">
                    <button
                      onClick={() => handleEditAsset(asset)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
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
