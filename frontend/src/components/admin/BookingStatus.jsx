// src/components/BookingStatus.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import {
  CalendarIcon, TruckIcon, BuildingOfficeIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import config from '@config';

const API_BASE_URL = config.API_BASE_URL;

// Helper function to format date strings
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
        return 'Invalid Date';
    }
};

// Helper function to calculate total amount for an order
const calculateOrderAmount = (order) => {
    const lrCharge = parseFloat(order.lr_charge) || 0;
    const frightCharge = parseFloat(order.fright_charge) || 0;
    const fuelSurcharge = parseFloat(order.fuel_surcharge) || 0;
    const ieCharge = parseFloat(order.ie_charge) || 0;
    const doorDeliveryCharge = parseFloat(order.door_delivery_charge) || 0;
    const hamali = parseFloat(order.hamali) || 0;
    return lrCharge + frightCharge + fuelSurcharge + ieCharge + doorDeliveryCharge + hamali;
};

export default function BookingStatus() {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(() => {
      const date = new Date();
      date.setDate(date.getDate() - 30); // Default to 30 days ago
      return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]); // Default to today
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBooking, setEditingBooking] = useState(null);

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/orders`);
        if (!response.ok) {
          throw new Error(`Failed to fetch bookings: ${response.statusText}`);
        }
        const data = await response.json();
        setAllBookings(data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(err.message);
        setAllBookings([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []); // Fetch only on mount

  // Process fetched data into the categorized structure
  const processedBookings = useMemo(() => {
    const categorized = {
      doorDelivery: { paid: [], toPay: [] },
      officePickup: { paid: [], toPay: [] },
    };

    allBookings.forEach(order => {
      const booking = {
        id: order.id,
        customer: order.to_name || 'N/A', // Assuming customer is the recipient
        amount: calculateOrderAmount(order),
        units: parseInt(order.quantity, 10) || 0,
        date: formatDate(order.created_at),
        location: order.to_district || 'N/A', // Assuming location is recipient district
        // Store original order data for editing if needed
        originalOrder: order
      };

      const isPaid = order.payment_method?.toLowerCase() === 'paid'; // Adjust based on your payment method names
      const isDoorDelivery = order.terms_of_delivery?.toLowerCase() === 'door delivery'; // Adjust based on your terms names

      if (isDoorDelivery) {
        if (isPaid) {
          categorized.doorDelivery.paid.push(booking);
        } else {
          categorized.doorDelivery.toPay.push(booking);
        }
      } else { // Assume Office Pickup otherwise
        if (isPaid) {
          categorized.officePickup.paid.push(booking);
        } else {
          categorized.officePickup.toPay.push(booking);
        }
      }
    });
    return categorized;
  }, [allBookings]);

  const filterBookingsByDateRange = (bookingsList) => {
    if (!Array.isArray(bookingsList)) return [];
    return bookingsList.filter(
      (booking) => booking.date >= startDate && booking.date <= endDate
    );
  };

  const filterBookingsBySearch = (bookingsList) => {
     if (!Array.isArray(bookingsList)) return [];
     if (!searchQuery) return bookingsList;
     return bookingsList.filter(
       (booking) =>
         booking.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
         booking.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
         String(booking.id).includes(searchQuery) // Allow searching by ID
     );
   };

  const calculateTotal = (bookingsList) => {
      if (!Array.isArray(bookingsList)) return 0;
    return bookingsList.reduce((sum, booking) => sum + booking.amount, 0);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEditBooking = (booking) => {
      // Prepare data for the edit form - potentially mapping back from processed data
      setEditingBooking({
          id: booking.id,
          customer: booking.customer,
          amount: booking.amount, // Note: Editing calculated amount might be complex. Consider editing base fields.
          units: booking.units,
          location: booking.location,
          // Add other editable fields from booking.originalOrder if necessary
      });
  };

  const handleSaveBooking = async (updatedBooking) => {
      setError(null);
      if (!updatedBooking || !updatedBooking.id) return;

      // Construct payload for PUT request - map form fields back to API fields
      // WARNING: This assumes you want to update fields like to_name, quantity, to_district directly.
      // Updating calculated amount requires updating underlying charge fields which is more complex.
      // For simplicity here, we update some mapped fields. Adjust as needed.
      const payload = {
         toName: updatedBooking.customer,
         quantity: updatedBooking.units,
         toDistrict: updatedBooking.location,
         // Add other fields from your API that should be updatable
         // e.g., paymentMethod: 'Paid', status: 'Delivered', etc. if you add those to the edit form
      };

      // Remove undefined fields from payload
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      try {
          const response = await fetch(`${API_BASE_URL}/orders/${updatedBooking.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Failed to update booking: ${errorData.error || response.statusText}`);
          }

          // Update local state for immediate feedback
          setAllBookings(prevBookings =>
              prevBookings.map(b =>
                  b.id === updatedBooking.id ? { ...b, ...payload, // Merge updates (carefully, might need recalculation)
                   // Potentially re-calculate amount if base charges were editable & updated
                  } : b
              )
          );
          setEditingBooking(null);

      } catch (err) {
          console.error("Error saving booking:", err);
          setError(`Update failed: ${err.message}`);
          // Optionally revert local state changes or show error prominently
      }
  };

  const handleDeleteBooking = async (id) => {
      setError(null);
      if (!id) return;

      if (window.confirm(`Are you sure you want to delete booking ID ${id}?`)) {
          try {
              const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
                  method: 'DELETE',
              });

              if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(`Failed to delete booking: ${errorData.error || response.statusText}`);
              }

              // Remove from local state
              setAllBookings(prevBookings => prevBookings.filter(b => b.id !== id));

          } catch (err) {
              console.error("Error deleting booking:", err);
              setError(`Deletion failed: ${err.message}`);
          }
      }
  };

  const handleDownloadReport = () => {
      const filteredData = Object.values(processedBookings)
          .flatMap(type => [
              ...filterBookingsByDateRange(type.paid),
              ...filterBookingsByDateRange(type.toPay)
          ])
          .filter(booking => // Apply search filter to downloaded data as well
              booking.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
              booking.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
              String(booking.id).includes(searchQuery)
          );

      if (filteredData.length === 0) {
          alert("No data available for the selected criteria to download.");
          return;
      }

      const csvHeader = "Booking ID,Customer,Amount,Units,Date,Location,Delivery Type,Payment Status\n";
      const csvRows = filteredData.map(booking => {
          // Determine Delivery Type and Payment Status based on original order data if possible
          const original = allBookings.find(o => o.id === booking.id);
          const deliveryType = original?.terms_of_delivery || (processedBookings.doorDelivery.paid.some(b => b.id === booking.id) || processedBookings.doorDelivery.toPay.some(b => b.id === booking.id) ? 'Door Delivery' : 'Office Pickup');
          const paymentStatus = original?.payment_method || (processedBookings.doorDelivery.paid.some(b => b.id === booking.id) || processedBookings.officePickup.paid.some(b => b.id === booking.id) ? 'Paid' : 'To Pay');

          // Escape commas within fields if necessary
          const escape = (str) => `"${String(str).replace(/"/g, '""')}"`;

          return [
              escape(booking.id),
              escape(booking.customer),
              booking.amount, // Amount is numeric
              booking.units, // Units is numeric
              escape(booking.date),
              escape(booking.location),
              escape(deliveryType),
              escape(paymentStatus)
          ].join(",");
      });

      const csvContent = "data:text/csv;charset=utf-8," + csvHeader + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `bookings_report_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };


  // Generate data for the bar chart per day within the date range
  const generateBarChartData = () => {
      const dateMap = {};
      const start = new Date(startDate);
      const end = new Date(endDate);

       // Initialize map with all dates in the range
      let current = new Date(start);
      while (current <= end) {
          const dateStr = current.toISOString().split('T')[0];
          dateMap[dateStr] = {
              date: dateStr,
              doorDeliveryPaid: 0,
              doorDeliveryToPay: 0,
              officePickupPaid: 0,
              officePickupToPay: 0,
          };
          current.setDate(current.getDate() + 1);
      }

       // Accumulate amounts from filtered bookings
       filterBookingsByDateRange(processedBookings.doorDelivery.paid).forEach(b => dateMap[b.date].doorDeliveryPaid += b.amount);
       filterBookingsByDateRange(processedBookings.doorDelivery.toPay).forEach(b => dateMap[b.date].doorDeliveryToPay += b.amount);
       filterBookingsByDateRange(processedBookings.officePickup.paid).forEach(b => dateMap[b.date].officePickupPaid += b.amount);
       filterBookingsByDateRange(processedBookings.officePickup.toPay).forEach(b => dateMap[b.date].officePickupToPay += b.amount);

      return Object.values(dateMap);
  };

  // Generate data for the consolidated pie chart
  const generateConsolidatedData = () => {
    const doorDeliveryPaidTotal = calculateTotal(filterBookingsByDateRange(processedBookings.doorDelivery.paid));
    const doorDeliveryToPayTotal = calculateTotal(filterBookingsByDateRange(processedBookings.doorDelivery.toPay));
    const officePickupPaidTotal = calculateTotal(filterBookingsByDateRange(processedBookings.officePickup.paid));
    const officePickupToPayTotal = calculateTotal(filterBookingsByDateRange(processedBookings.officePickup.toPay));

    return [
      { name: "Door Delivery Paid", value: doorDeliveryPaidTotal, color: "#4CAF50" },
      { name: "Door Delivery To Pay", value: doorDeliveryToPayTotal, color: "#FFC107" },
      { name: "Office Pickup Paid", value: officePickupPaidTotal, color: "#2196F3" },
      { name: "Office Pickup To Pay", value: officePickupToPayTotal, color: "#9C27B0" },
    ].filter(item => item.value > 0); // Only show slices with value > 0
  };

  const barChartData = useMemo(generateBarChartData, [processedBookings, startDate, endDate]);
  const consolidatedData = useMemo(generateConsolidatedData, [processedBookings, startDate, endDate]);
  const totalAmount = useMemo(() => consolidatedData.reduce((sum, item) => sum + item.value, 0), [consolidatedData]);

  const BookingTable = ({ bookings, title, calculateTotal, onEdit, onDelete }) => {
      const filteredAndSearchedBookings = filterBookingsBySearch(bookings);

      return (
          <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">{title} (Total: ₹{calculateTotal(filteredAndSearchedBookings).toLocaleString()})</h3>
              <div className="overflow-x-auto border border-gray-200 rounded-md max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                          <tr>
                              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">ID</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Customer</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Units</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Amount</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Location</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                          {filteredAndSearchedBookings.length === 0 ? (
                              <tr><td colSpan="6" className="text-center py-4 text-gray-500">No bookings match criteria.</td></tr>
                          ) : (
                              filteredAndSearchedBookings.map((booking) => (
                                  <tr key={booking.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{booking.id}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{booking.customer}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{booking.units}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">₹{booking.amount.toLocaleString()}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">{booking.location}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-900 flex space-x-2">
                                          <button onClick={() => onEdit(booking)} className="text-blue-600 hover:text-blue-800" title="Edit">
                                              <PencilIcon className="h-4 w-4" />
                                          </button>
                                          <button onClick={() => onDelete(booking.id)} className="text-red-600 hover:text-red-800" title="Delete">
                                              <TrashIcon className="h-4 w-4" />
                                          </button>
                                      </td>
                                  </tr>
                              ))
                          )}
                          {filteredAndSearchedBookings.length > 0 && (
                               <tr className="bg-gray-100 font-semibold sticky bottom-0">
                                   <td colSpan="3" className="px-4 py-2 text-right text-gray-800">Filtered Total:</td>
                                   <td className="px-4 py-2 text-left text-gray-800">₹{calculateTotal(filteredAndSearchedBookings).toLocaleString()}</td>
                                   <td colSpan="2"></td>
                               </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  };

    const DeliveryTypeSection = ({ title, icon: Icon, data }) => (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-6">
            <div className="flex items-center mb-4">
                <Icon className="h-6 w-6 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <BookingTable
                        bookings={filterBookingsByDateRange(data.paid)}
                        title="Paid Bookings"
                        calculateTotal={calculateTotal}
                        onEdit={handleEditBooking}
                        onDelete={handleDeleteBooking}
                    />
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                     <BookingTable
                        bookings={filterBookingsByDateRange(data.toPay)}
                        title="To-Pay Bookings"
                        calculateTotal={calculateTotal}
                        onEdit={handleEditBooking}
                        onDelete={handleDeleteBooking}
                    />
                </div>
            </div>
        </div>
    );

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-100 min-h-screen">
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                    <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </span>
            </div>
        )}

        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Booking Status</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                    <label htmlFor="startDate" className="text-sm sr-only">Start Date</label>
                    <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    />
                </div>
                 <span className="text-gray-500 text-sm hidden sm:inline">to</span>
                 <div className="flex items-center space-x-1">
                     <label htmlFor="endDate" className="text-sm sr-only">End Date</label>
                    <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    />
                 </div>
            </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="relative flex-grow">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Search by Customer, Location, or Booking ID..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10 pr-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 w-full text-sm"
                />
            </div>
            <button
                onClick={handleDownloadReport}
                disabled={loading}
                className="flex items-center justify-center bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
                Download Report
            </button>
        </div>

        {loading ? (
             <div className="text-center py-10">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                 <p className="text-gray-600">Loading bookings...</p>
            </div>
        ) : !loading && allBookings.length === 0 && !error ? (
             <div className="text-center py-10 bg-white rounded-lg shadow">
                  <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4"/>
                 <p className="text-gray-600 font-semibold">No Booking Data Found</p>
                 <p className="text-sm text-gray-500">Could not retrieve any booking records from the server.</p>
            </div>
        ) : (
          <>
            {/* Charts */}
             <div className="grid md:grid-cols-2 gap-6">
                 <div className="p-4 bg-white rounded-lg shadow">
                     <h3 className="text-lg font-semibold mb-4 text-gray-700">
                         Overall Status (Total: ₹{totalAmount.toLocaleString()})
                     </h3>
                    {consolidatedData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={consolidatedData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                >
                                    {consolidatedData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`₹${value.toLocaleString()}`, name]} />
                                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                         <p className="text-center text-gray-500 py-10">No data for pie chart in selected range.</p>
                    )}
                 </div>
                 <div className="p-4 bg-white rounded-lg shadow">
                     <h3 className="text-lg font-semibold mb-4 text-gray-700">
                         Daily Breakdown
                     </h3>
                      {barChartData.length > 0 ? (
                         <ResponsiveContainer width="100%" height={250}>
                             <BarChart data={barChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                                 <XAxis dataKey="date" tick={{fontSize: 10}}/>
                                 <YAxis tick={{fontSize: 10}} tickFormatter={(value) => `₹${value/1000}k`}/>
                                 <Tooltip formatter={(value, name) => [`₹${value.toLocaleString()}`, name]} labelFormatter={(label) => `Date: ${label}`}/>
                                 <Legend iconType="square" wrapperStyle={{fontSize: '11px', paddingTop: '10px'}}/>
                                 <Bar dataKey="doorDeliveryPaid" stackId="a" fill="#4CAF50" name="DD Paid" radius={[4, 4, 0, 0]}/>
                                 <Bar dataKey="doorDeliveryToPay" stackId="a" fill="#FFC107" name="DD ToPay" radius={[4, 4, 0, 0]}/>
                                 <Bar dataKey="officePickupPaid" stackId="a" fill="#2196F3" name="OP Paid" radius={[4, 4, 0, 0]}/>
                                 <Bar dataKey="officePickupToPay" stackId="a" fill="#9C27B0" name="OP ToPay" radius={[4, 4, 0, 0]}/>
                             </BarChart>
                         </ResponsiveContainer>
                     ) : (
                           <p className="text-center text-gray-500 py-10">No data for bar chart in selected range.</p>
                     )}
                 </div>
             </div>

            {/* Tables */}
             <DeliveryTypeSection
                title="Door Delivery Bookings"
                icon={TruckIcon}
                data={processedBookings.doorDelivery}
             />
             <DeliveryTypeSection
                title="Office Pickup Bookings"
                icon={BuildingOfficeIcon}
                data={processedBookings.officePickup}
            />
          </>
        )}

      {/* Edit Modal */}
       {editingBooking && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Booking (ID: {editingBooking.id})</h2>
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveBooking(editingBooking); }}>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="edit-customer" className="block text-sm font-medium text-gray-700">Customer</label>
                                <input id="edit-customer" type="text" placeholder="Customer Name" value={editingBooking.customer}
                                    onChange={(e) => setEditingBooking({ ...editingBooking, customer: e.target.value })}
                                    className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                                    required
                                />
                            </div>
                            {/* Consider editing base charge fields instead of total amount */}
                            {/* <div>
                                <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-700">Amount</label>
                                <input id="edit-amount" type="number" step="0.01" placeholder="Booking Amount" value={editingBooking.amount}
                                    onChange={(e) => setEditingBooking({ ...editingBooking, amount: +e.target.value })}
                                    className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                                    required
                                />
                             </div> */}
                            <div>
                                <label htmlFor="edit-units" className="block text-sm font-medium text-gray-700">Units</label>
                                <input id="edit-units" type="number" placeholder="Number of Units" value={editingBooking.units}
                                    onChange={(e) => setEditingBooking({ ...editingBooking, units: +e.target.value })}
                                    className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700">Location</label>
                                <input id="edit-location" type="text" placeholder="Location (e.g., District)" value={editingBooking.location}
                                    onChange={(e) => setEditingBooking({ ...editingBooking, location: e.target.value })}
                                    className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                                    required
                                />
                            </div>
                            {/* Add other editable fields here (e.g., status dropdown) */}
                        </div>
                        <div className="mt-5 flex justify-end space-x-3">
                            <button type="button" onClick={() => setEditingBooking(null)}
                                className="px-4 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400">
                                Cancel
                            </button>
                            <button type="submit"
                                className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}