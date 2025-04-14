import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ArrowDownTrayIcon, CalendarIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import axios from "axios";

function RoutePerformanceChart() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [routeBookingsData, setRouteBookingsData] = useState([]);
  const [selectedDayData, setSelectedDayData] = useState([]);
  const [routeStats, setRouteStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch calendar data whenever the month/year changes
  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        setLoading(true);
        // Format the month range for the API request
        const monthStr = String(selectedMonth + 1).padStart(2, "0");
        const startDate = `${selectedYear}-${monthStr}-01`;
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const endDate = `${selectedYear}-${monthStr}-${String(daysInMonth).padStart(2, "0")}`;

        const response = await axios.get('/api/route-performance', {
          params: { startDate, endDate }
        });

        // Ensure the response data is an array - this is the key fix
        const dataArray = Array.isArray(response.data) ? response.data : [];
        setRouteBookingsData(dataArray);
        
        // Set the selected day's data if available
        const dayData = dataArray.find(day => day.date === selectedDate);
        if (dayData && dayData.routes) {
          setSelectedDayData(dayData.routes);
        } else if (dataArray.length > 0 && dataArray[0].routes) {
          // Default to the first day if selected date not found
          setSelectedDate(dataArray[0].date);
          setSelectedDayData(dataArray[0].routes);
        } else {
          setSelectedDayData([]);
        }
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load route performance data. Please try again later.");
        setLoading(false);
        console.error("Error fetching route data:", err);
      }
    };

    fetchRouteData();
    
    // Also fetch route stats for the overview section
    const fetchRouteStats = async () => {
      try {
        setStatsLoading(true);
        const response = await axios.get('/api/routes/stats');
        // Ensure the response data is an array
        const statsArray = Array.isArray(response.data) ? response.data : [];
        setRouteStats(statsArray);
        setStatsLoading(false);
      } catch (err) {
        console.error("Error fetching route stats:", err);
        setStatsLoading(false);
      }
    };
    
    fetchRouteStats();
  }, [selectedMonth, selectedYear]);

  // Update selected day data when date changes
  useEffect(() => {
    if (!Array.isArray(routeBookingsData)) {
      setSelectedDayData([]);
      return;
    }
    
    const dayData = routeBookingsData.find(day => day.date === selectedDate);
    if (dayData && dayData.routes) {
      setSelectedDayData(dayData.routes);
    } else {
      setSelectedDayData([]);
    }
  }, [selectedDate, routeBookingsData]);

  // Function to handle downloading the route-wise booking report for the selected date
  const handleDownloadReport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Route,Deliveries,Efficiency (%)\n" +
      selectedDayData
        .map(
          (route) => `${route.route},${route.deliveries},${route.efficiency}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `route_performance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // Format date using native JavaScript
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
  };

  // Handle month and year change
  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  // Function to get color based on efficiency
  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return "bg-green-100 text-green-800";
    if (efficiency >= 75) return "bg-blue-100 text-blue-800";
    if (efficiency >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const renderRouteStatistics = () => {
    if (statsLoading) return <div className="text-gray-500">Loading statistics...</div>;
    
    if (routeStats.length === 0) return <div className="text-gray-500">No route statistics available</div>;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {routeStats.slice(0, 3).map(route => (
          <div key={route.id} className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium text-lg mb-2">{route.name}</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Efficiency:</span>
                <span className={`px-2 py-1 rounded-md text-sm font-medium ${getEfficiencyColor(route.efficiency)}`}>
                  {route.efficiency}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders:</span>
                <span>{route.totalOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivered:</span>
                <span>{route.deliveredOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">In Transit:</span>
                <span>{route.inTransitOrders}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading && routeBookingsData.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading route performance data...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 border border-red-300 rounded-md">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Route Efficiency</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500"
            />
          </div>
          <button
            onClick={handleDownloadReport}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            disabled={selectedDayData.length === 0}
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download Report
          </button>
        </div>
      </div>

      {/* Route Stats Overview */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-gray-500" />
          Top Performing Routes
        </h3>
        {renderRouteStatistics()}
      </div>

      {/* Month and Year Selector */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Select Month and Year</h3>
        <div className="flex space-x-4">
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(selectedYear, i).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500"
          >
            {Array.from({ length: 10 }, (_, i) => {
              const currentYear = new Date().getFullYear();
              return (
                <option key={i} value={currentYear - 5 + i}>
                  {currentYear - 5 + i}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Calendar View */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Calendar View</h3>
        {Array.isArray(routeBookingsData) && routeBookingsData.length > 0 ? (
          <div className="grid grid-cols-7 gap-2">
            {routeBookingsData.map((day) => (
              <div
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`p-4 border rounded-lg cursor-pointer ${
                  selectedDate === day.date
                    ? "bg-blue-100 border-blue-500"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <p className="text-sm font-medium">{formatDate(day.date)}</p>
                <p className="text-xs text-gray-600">
                  {day.routes ? day.routes.length : 0} routes
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-md text-center">
            No data available for the selected month.
          </div>
        )}
      </div>

      {/* Route-Wise Data for Selected Date */}
      {selectedDayData.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <LineChart width={600} height={300} data={selectedDayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="route" />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="efficiency"
              stroke="#2196F3"
              name="Efficiency %"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="deliveries"
              stroke="#F44336"
              name="Total Deliveries"
            />
          </LineChart>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-md text-center">
          No route data available for the selected date.
        </div>
      )}

      {/* Table View for Route-Wise Data */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">
          Route-Wise Bookings for {formatDate(selectedDate)}
        </h3>
        <div className="overflow-x-auto">
          {selectedDayData.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Deliveries
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Efficiency (%)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedDayData.map((route) => (
                  <tr key={route.route}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {route.route}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {route.deliveries}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-md text-sm font-medium ${getEfficiencyColor(route.efficiency)}`}>
                        {route.efficiency}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 bg-gray-50 rounded-md text-center">
              No route data available for the selected date.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoutePerformanceChart;