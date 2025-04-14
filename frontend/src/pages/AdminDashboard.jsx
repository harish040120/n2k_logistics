import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import DeliveryOrdersTable from "../components/admin/DeliveryOrdersTable";
import DeliveryStatusChart from "../components/charts/DeliveryStatusChart";
import RoutePerformanceChart from "../components/charts/RoutePerformanceChart";
import DeliveryPointsManager from "../components/admin/DeliveryPointsManager";
import AgentsSection from "../components/admin/AgentsSection";
import AccountsSection from "../components/admin/AccountsSection";
import BookingStatus from "../components/admin/BookingStatus";
import { FaClipboardList, FaUserShield, FaRoute, FaBoxes, FaUsers, FaMapMarkerAlt } from "react-icons/fa";
import config from '@config';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axiosInstance.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceOrderClick = () => {
    navigate("/place-order");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Main Content */}
      <main className="flex-1 p-4 pb-16"> {/* Added bottom padding for floating menu */}
        {activeTab === "overview" && (
          <div>
            <button
              onClick={handlePlaceOrderClick}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-4"
            >
              Place Order
            </button>
            <div className="grid gap-4 sm:grid-cols-2">
              <DeliveryStatusChart />
            </div>
            <DeliveryOrdersTable orders={orders} />
          </div>
        )}

        {activeTab === "order-monitoring" && (
          <div>
            <button
              onClick={handlePlaceOrderClick}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-4"
            >
              Place Order
            </button>
            <BookingStatus />
            <DeliveryOrdersTable orders={orders} />
          </div>
        )}
        {activeTab === "accounts" && <AccountsSection />}
        {activeTab === "delivery-points" && <DeliveryPointsManager />}
        {activeTab === "routes" && <RoutePerformanceChart />}
        {activeTab === "agents" && <AgentsSection />}
      </main>

      {/* Floating Bottom Navigation Menu */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-300 flex justify-around py-2">
        <button onClick={() => setActiveTab("overview")} className={`flex flex-col items-center text-gray-700 ${activeTab === "overview" ? "text-red-600" : ""}`}>
          <FaClipboardList size={24} />
          <span className="text-xs">Overview</span>
        </button>
        <button onClick={() => setActiveTab("order-monitoring")} className={`flex flex-col items-center text-gray-700 ${activeTab === "order-monitoring" ? "text-red-600" : ""}`}>
          <FaBoxes size={24} />
          <span className="text-xs">Orders</span>
        </button>
        <button onClick={() => setActiveTab("routes")} className={`flex flex-col items-center text-gray-700 ${activeTab === "routes" ? "text-red-600" : ""}`}>
          <FaRoute size={24} />
          <span className="text-xs">Routes</span>
        </button>
        <button onClick={() => setActiveTab("agents")} className={`flex flex-col items-center text-gray-700 ${activeTab === "agents" ? "text-red-600" : ""}`}>
          <FaUserShield size={24} />
          <span className="text-xs">Agents</span>
        </button>
        <button onClick={() => setActiveTab("accounts")} className={`flex flex-col items-center text-gray-700 ${activeTab === "accounts" ? "text-red-600" : ""}`}>
          <FaUsers size={24} />
          <span className="text-xs">Accounts</span>
        </button>
        <button onClick={() => setActiveTab("delivery-points")} className={`flex flex-col items-center text-gray-700 ${activeTab === "delivery-points" ? "text-red-600" : ""}`}>
          <FaMapMarkerAlt size={24} />
          <span className="text-xs">Delivery</span>
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;