// src/components/DeliveryStatusChart.jsx

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CalendarIcon, ArrowDownTrayIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import config from '@config';

function DeliveryStatusChart() {
  const [allOrders, setAllOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reportData, setReportData] = useState([]);
  const [routesData, setRoutesData] = useState({});
  const [referenceData, setReferenceData] = useState({
    routes: [],
    paymentMethods: [],
    itemTypes: [],
    statuses: []
  });
  const [reportType, setReportType] = useState('date-wise');
  const API_BASE_URL = config.API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [ordersRes, routesRes, paymentMethodsRes, itemTypesRes, statusesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/orders`),
          fetch(`${API_BASE_URL}/routes`),
          fetch(`${API_BASE_URL}/payment-methods`),
          fetch(`${API_BASE_URL}/item-types`),
          fetch(`${API_BASE_URL}/order-status`)
        ]);

        if (!ordersRes.ok) throw new Error(`Failed to fetch orders: ${ordersRes.statusText}`);
        if (!routesRes.ok) throw new Error(`Failed to fetch routes: ${routesRes.statusText}`);
        if (!paymentMethodsRes.ok) throw new Error(`Failed to fetch payment methods: ${paymentMethodsRes.statusText}`);
        if (!itemTypesRes.ok) throw new Error(`Failed to fetch item types: ${itemTypesRes.statusText}`);
        if (!statusesRes.ok) throw new Error(`Failed to fetch statuses: ${statusesRes.statusText}`);

        const [orders, routes, paymentMethods, itemTypes, statuses] = await Promise.all([
          ordersRes.json(),
          routesRes.json(),
          paymentMethodsRes.json(),
          itemTypesRes.json(),
          statusesRes.json()
        ]);

        setAllOrders(orders);
        setReferenceData({ routes, paymentMethods, itemTypes, statuses });

        const processedChartData = processOrdersForChart(orders, statuses);
        setChartData(processedChartData);

        if (processedChartData.length > 0) {
          const lastDate = processedChartData[processedChartData.length - 1].date;
          setSelectedDate(lastDate);
          processReportData(lastDate, orders);
        } else {
           setSelectedDate('');
           setReportData([]);
           setRoutesData({});
        }

      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError(`Failed to load data: ${err.message}. Please check API connection and try again.`);
        setChartData([]);
        setAllOrders([]);
        setReportData([]);
        setRoutesData({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL]); // Rerun if base URL changes (though unlikely)

  const processOrdersForChart = (orders, statuses) => {
    const dateMap = new Map();
    const statusNameMap = new Map(statuses.map(s => [s.id, s.name]));

    orders.forEach(order => {
      const dateStr = order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : null;
      if (!dateStr) return;

      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, {
          date: dateStr,
          completed: 0,
          pending: 0,
          inTransit: 0,
          cancelled: 0
        });
      }

      const statusCounter = dateMap.get(dateStr);
      // Use status name directly from the order object if available, otherwise lookup
      const statusName = order.status || statusNameMap.get(order.status_id) || 'Pending';

      switch (statusName) {
        case 'Delivered':
          statusCounter.completed += 1;
          break;
        case 'Pending':
        case 'Processing': // Group Processing with Pending for chart simplicity
          statusCounter.pending += 1;
          break;
        case 'In Transit':
          statusCounter.inTransit += 1;
          break;
        case 'Cancelled':
          statusCounter.cancelled += 1;
          break;
        default:
          statusCounter.pending += 1; // Default case if status is unexpected
      }
    });

    return Array.from(dateMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const processReportData = (date, orders) => {
    const filteredOrders = orders.filter(order => {
      const orderDate = order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : null;
      return orderDate === date;
    });

    const processedReport = filteredOrders.map((order, index) => {
      const lrCharge = parseFloat(order.lr_charge) || 0;
      const frightCharge = parseFloat(order.fright_charge) || 0;
      const fuelSurcharge = parseFloat(order.fuel_surcharge) || 0;
      const ieCharge = parseFloat(order.ie_charge) || 0;
      const doorDeliveryCharge = parseFloat(order.door_delivery_charge) || 0;
      const hamali = parseFloat(order.hamali) || 0;
      const totalAmount = lrCharge + frightCharge + fuelSurcharge + ieCharge + doorDeliveryCharge + hamali;

      return {
        sno: index + 1,
        date: order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : '',
        lrNo: order.lr_number || 'N/A', // Use LR Number directly from backend
        fromName: order.from_name || 'N/A',
        fromDistrict: order.from_district || 'N/A',
        toName: order.to_name || 'N/A',
        toDistrict: order.to_district || 'N/A',
        paymentMethod: order.payment_method || 'N/A', // Use name from backend
        quantity: parseInt(order.quantity) || 0,
        weight: parseFloat(order.weight) || 0,
        itemType: order.item_type || 'N/A', // Use name from backend
        amount: totalAmount.toFixed(2),
        status: order.status || 'N/A', // Use name from backend
        routeId: order.route_id, // Keep ID for grouping if needed
        routeName: order.route || 'N/A', // Use name from backend
        remarks: order.remarks || '', // Assuming remarks might exist? Add if needed.
        // Use calculated totalAmount instead of receivedAmount for route-wise report
        // If received_amount is a separate field, add it to the backend query and here
      };
    });

    setReportData(processedReport);

    const routesGroup = {};
    processedReport.forEach(item => {
        const routeIdentifier = item.routeId || item.routeName; // Use ID preferably, fallback to name
        if (!routesGroup[routeIdentifier]) {
        routesGroup[routeIdentifier] = {
          name: item.routeName,
          items: []
        };
      }
      routesGroup[routeIdentifier].items.push(item);
    });
    setRoutesData(routesGroup);
  };

  const handleDateChange = (date) => {
    if (!chartData.some(item => item.date === date)) return;
    setError(null); // Clear previous errors
    setSelectedDate(date);
    setShowCalendar(false);
    processReportData(date, allOrders); // Process using the already fetched orders
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prevMonth => {
        const newMonth = new Date(prevMonth);
        newMonth.setMonth(newMonth.getMonth() + direction);
        return newMonth;
    });
  };

  const generateCalendarDays = () => {
    if (!chartData || chartData.length === 0) return [];

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    const availableDates = new Set(chartData.map(item => item.date));

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const hasData = availableDates.has(dateStr);
      days.push({
        date: dateStr,
        day: i,
        hasData
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ["January", "February", "March", "April", "May", "June",
                     "July", "August", "September", "October", "November", "December"];


  const handleDownloadPDFReport = () => {
    if (reportData.length === 0) {
      setError('No data available for the selected date to generate PDF report');
      return;
    }
    setError(null);
    try {
      if (reportType === 'date-wise') {
        generateDateWisePDF();
      } else {
        generateRouteWisePDF();
      }
    } catch (error) {
      console.error('Error generating PDF report:', error);
      setError('Failed to generate PDF report. Please try again.');
    }
  };

  const generateDateWisePDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFontSize(16);
    doc.text(`Delivery Report - ${selectedDate}`, doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

    const tableData = reportData.map(item => [
      item.sno,
      item.date,
      item.lrNo,
      item.fromName,
      item.fromDistrict,
      item.toName,
      item.toDistrict,
      item.paymentMethod,
      item.quantity,
      item.itemType,
      `₹${item.amount}`,
      item.status
    ]);

    autoTable(doc, {
      startY: 25,
      head: [
        [
          'S.No', 'Date', 'LR No', 'From', 'District', 'To', 'District', 'Payment', 'Qty', 'Item Type', 'Amount', 'Status'
        ]
      ],
      body: tableData,
      margin: { left: 10, right: 10 },
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 15 },
        5: { cellWidth: 'auto' },
        6: { cellWidth: 15 },
        7: { cellWidth: 15 },
        8: { cellWidth: 8, halign: 'center' },
        9: { cellWidth: 18 },
        10: { cellWidth: 15, halign: 'right' },
        11: { cellWidth: 15 }
      },
      didDrawPage: function (data) {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`, // Correct page number
          data.settings.margin.left,
          doc.internal.pageSize.height - 6
        );
      }
    });

    const totals = {
      quantity: reportData.reduce((sum, item) => sum + item.quantity, 0),
      amount: reportData.reduce((sum, item) => sum + parseFloat(item.amount), 0).toFixed(2)
    };

    const finalY = doc.lastAutoTable.finalY || 25;
    if (finalY < doc.internal.pageSize.height - 20) {
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setDrawColor(100, 100, 100);
        doc.line(10, finalY + 2, doc.internal.pageSize.getWidth() - 10, finalY + 2);
        doc.text('TOTALS:', 15, finalY + 6);
        // Align totals under respective columns - adjust x positions as needed based on columnStyles
        const qtyColumnX = 10 + 8 + 15 + 18 + 25 + 15 + 25 + 15 + 15; // Approximate start X of Qty
        const amountColumnX = qtyColumnX + 8 + 18; // Approximate start X of Amount

        doc.text(`${totals.quantity}`, qtyColumnX - 15, finalY + 6, { align: 'center' });
        doc.text(`₹${totals.amount}`, amountColumnX + 5, finalY + 6, { align: 'right' });
        doc.setFont(undefined, 'normal');
    } else {
         console.warn("Totals might overlap footer due to large table.");
         // Optionally add totals on a new page if finalY is too close to the bottom
    }


    doc.save(`delivery_report_${selectedDate.replace(/-/g, '')}.pdf`);
  };

  const generateRouteWisePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let isFirstPage = true;

    Object.entries(routesData).forEach(([routeId, routeInfo]) => {
      if (!isFirstPage) {
        doc.addPage();
      }
      isFirstPage = false;

      doc.setFontSize(16);
      doc.text(`Route Report: ${routeInfo.name}`, doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Date: ${selectedDate}`, doc.internal.pageSize.getWidth() / 2, 16, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, doc.internal.pageSize.getWidth() / 2, 21, { align: 'center' });

      const tableData = routeInfo.items.map(item => [
        item.sno,
        item.lrNo,
        item.fromName,
        // item.fromDistrict, // Omit some fields for portrait view if needed
        item.toName,
        // item.toDistrict,
        item.quantity,
        item.itemType,
        `₹${item.amount}`, // Using total amount here
        item.status,
        item.remarks
      ]);

      autoTable(doc, {
        startY: 30,
        head: [
          [
            'S.No', 'LR No', 'From', 'To', 'Qty', 'Type', 'Amount', 'Status', 'Remarks'
          ]
        ],
        body: tableData,
        margin: { left: 10, right: 10 },
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 18, halign: 'center' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 8, halign: 'center' },
          5: { cellWidth: 18 },
          6: { cellWidth: 15, halign: 'right' },
          7: { cellWidth: 15 },
          8: { cellWidth: 'auto' }
        },
        didDrawPage: function (data) {
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            `Page ${data.pageNumber}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 6
          );
        }
      });

      const totals = {
        quantity: routeInfo.items.reduce((sum, item) => sum + item.quantity, 0),
        amount: routeInfo.items.reduce((sum, item) => sum + parseFloat(item.amount), 0).toFixed(2) // Summing total amount
      };

      const finalY = doc.lastAutoTable.finalY || 30;
       if (finalY < doc.internal.pageSize.height - 20) {
            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.setDrawColor(100, 100, 100);
            doc.line(10, finalY + 2, doc.internal.pageSize.getWidth() - 10, finalY + 2);
            doc.text('ROUTE TOTALS:', 15, finalY + 6);
            // Align totals under respective columns - adjust x positions as needed
            const qtyColumnX = 10 + 8 + 18 + 25 + 25; // Approx start X of Qty
            const amountColumnX = qtyColumnX + 8 + 18; // Approx start X of Amount

            doc.text(`${totals.quantity}`, qtyColumnX - 15, finalY + 6, { align: 'center' });
            doc.text(`₹${totals.amount}`, amountColumnX + 5, finalY + 6, { align: 'right' });
            doc.setFont(undefined, 'normal');
       } else {
            console.warn("Route totals might overlap footer.");
       }
    });

    doc.save(`route_wise_report_${selectedDate.replace(/-/g, '')}.pdf`);
  };

  const handleDownloadExcelReport = () => {
    if (reportData.length === 0) {
      setError('No data available for the selected date to generate Excel report');
      return;
    }
    setError(null);
    try {
      if (reportType === 'date-wise') {
        generateDateWiseExcel();
      } else {
        generateRouteWiseExcel();
      }
    } catch (error) {
      console.error('Error generating Excel report:', error);
      setError('Failed to generate Excel report. Please try again.');
    }
  };

  const generateDateWiseExcel = () => {
    const header = [
      'S.No', 'Date', 'LR No', 'From', 'From District', 'To', 'To District', 'Payment Method', 'Quantity', 'Item Type', 'Total Amount', 'Status'
    ];
    const dataToExport = reportData.map(item => [
      item.sno,
      item.date,
      item.lrNo,
      item.fromName,
      item.fromDistrict,
      item.toName,
      item.toDistrict,
      item.paymentMethod,
      item.quantity,
      item.itemType,
      parseFloat(item.amount), // Export amount as number for potential sum in Excel
      item.status
    ]);

    const totals = {
      quantity: reportData.reduce((sum, item) => sum + item.quantity, 0),
      amount: reportData.reduce((sum, item) => sum + parseFloat(item.amount), 0)
    };

    const totalsRow = [
      'TOTALS', '', '', '', '', '', '', '', totals.quantity, '', totals.amount, ''
    ];

    const worksheetData = [header, ...dataToExport, totalsRow];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Format amount column as currency (optional)
    // This requires careful column index calculation
    const amountColIndex = header.indexOf('Total Amount');
    if (amountColIndex > -1) {
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = range.s.r + 1; R <= range.e.r; ++R) { // Start from row 1 (0-indexed) to skip header
            const cell_address = XLSX.utils.encode_cell({ r: R, c: amountColIndex });
            if (worksheet[cell_address]) {
                 worksheet[cell_address].t = 'n'; // Ensure type is number
                 worksheet[cell_address].z = '₹#,##0.00'; // Currency format
            }
        }
        // Format total amount cell
        const totalAmountCellAddress = XLSX.utils.encode_cell({r: range.e.r, c: amountColIndex});
        if (worksheet[totalAmountCellAddress]) {
             worksheet[totalAmountCellAddress].t = 'n';
             worksheet[totalAmountCellAddress].z = '₹#,##0.00';
        }
    }


    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Delivery Report');
    XLSX.writeFile(workbook, `delivery_report_${selectedDate.replace(/-/g, '')}.xlsx`);
  };

  const sanitizeSheetName = (name) => {
      // Replace invalid characters and limit length to 31
    return name.replace(/[\\*?:/\[\]]/g, '_').substring(0, 31);
  };

  const generateRouteWiseExcel = () => {
    const workbook = XLSX.utils.book_new();

    Object.entries(routesData).forEach(([routeId, routeInfo]) => {
       const header = [
         'S.No', 'LR No', 'From', 'From District', 'To', 'To District', 'Quantity', 'Item Type', 'Total Amount', 'Status', 'Remarks'
       ];
      const dataToExport = routeInfo.items.map(item => [
        item.sno,
        item.lrNo,
        item.fromName,
        item.fromDistrict,
        item.toName,
        item.toDistrict,
        item.quantity,
        item.itemType,
        parseFloat(item.amount), // Use total amount, export as number
        item.status,
        item.remarks
      ]);

      const totals = {
        quantity: routeInfo.items.reduce((sum, item) => sum + item.quantity, 0),
        amount: routeInfo.items.reduce((sum, item) => sum + parseFloat(item.amount), 0) // Summing total amount
      };

      const totalsRow = [
        'TOTALS', '', '', '', '', '', totals.quantity, '', totals.amount, '', ''
      ];

      const worksheetData = [header, ...dataToExport, totalsRow];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Optional: Format amount column
      const amountColIndex = header.indexOf('Total Amount');
        if (amountColIndex > -1) {
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            for (let R = range.s.r + 1; R <= range.e.r; ++R) {
                const cell_address = XLSX.utils.encode_cell({ r: R, c: amountColIndex });
                if (worksheet[cell_address]) {
                    worksheet[cell_address].t = 'n';
                    worksheet[cell_address].z = '₹#,##0.00';
                }
            }
            // Format total amount cell
            const totalAmountCellAddress = XLSX.utils.encode_cell({r: range.e.r, c: amountColIndex});
             if (worksheet[totalAmountCellAddress]) {
                 worksheet[totalAmountCellAddress].t = 'n';
                 worksheet[totalAmountCellAddress].z = '₹#,##0.00';
            }
        }

      const safeSheetName = sanitizeSheetName(routeInfo.name);
      XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
    });

    XLSX.writeFile(workbook, `route_wise_report_${selectedDate.replace(/-/g, '')}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-700">Loading delivery data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8 text-red-600 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="font-semibold text-lg mb-2">Error Loading Data</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
          >
            Retry Page Load
          </button>
        </div>
      </div>
    );
  }

  if (!loading && chartData.length === 0 && !error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m-9 4h12M3 10h18M4 6h16M4 14h16M4 18h16" />
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-700">No delivery data available</p>
          <p className="text-sm text-gray-500 mt-1">There are no order records to display the chart or reports.</p>
          <p className="text-xs text-gray-400 mt-3">(Ensure the backend API is running and has data)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4 flex-wrap">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 whitespace-nowrap">Daily Delivery Status</h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 flex-wrap">
          <div className="flex space-x-2">
            <button
              onClick={() => setReportType('date-wise')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 ${
                reportType === 'date-wise'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Date-wise Report
            </button>
            <button
              onClick={() => setReportType('route-wise')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 ${
                reportType === 'route-wise'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Route-wise Report
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400"
            >
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span>{selectedDate || 'Select Date'}</span>
            </button>

            {showCalendar && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-20 w-64 p-2">
                <div className="flex justify-between items-center mb-2 px-1">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-300"
                    aria-label="Previous month"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <span className="font-medium text-sm text-gray-700">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-300"
                    aria-label="Next month"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-1">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((dayInfo, index) => {
                    if (!dayInfo) {
                      return <div key={`empty-${index}`} className="h-8"></div>;
                    }

                    const isSelected = dayInfo.date === selectedDate;
                    const isToday = dayInfo.date === new Date().toISOString().split('T')[0];

                    return (
                      <button
                        key={dayInfo.date}
                        onClick={() => handleDateChange(dayInfo.date)}
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-blue-400 focus:ring-offset-1
                          ${isSelected ? 'bg-blue-600 text-white font-bold' : ''}
                          ${!isSelected && isToday ? 'border-2 border-blue-400' : 'border border-transparent'}
                          ${!isSelected && dayInfo.hasData ? 'font-medium text-blue-700 bg-blue-50 hover:bg-blue-100' : ''}
                          ${!isSelected && !dayInfo.hasData ? 'text-gray-400' : ''}
                          ${!dayInfo.hasData ? 'cursor-not-allowed' : 'hover:bg-blue-100'}
                        `}
                        disabled={!dayInfo.hasData}
                        aria-label={`Select date ${dayInfo.date}`}
                      >
                        {dayInfo.day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleDownloadPDFReport}
              disabled={!selectedDate || reportData.length === 0}
              className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-400 ${
                !selectedDate || reportData.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-sm'
              }`}
              aria-label="Download PDF Report"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
              <span className="whitespace-nowrap">PDF</span>
            </button>

            <button
              onClick={handleDownloadExcelReport}
              disabled={!selectedDate || reportData.length === 0}
              className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-400 ${
                !selectedDate || reportData.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
              }`}
               aria-label="Download Excel Report"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
              <span className="whitespace-nowrap">Excel</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-gray-50 p-2 rounded">
         <BarChart
            width={Math.max(600, chartData.length * 80)} // Adjusted width factor
            height={300}
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
            <XAxis dataKey="date" tick={{fontSize: 10}} />
            <YAxis allowDecimals={false} tick={{fontSize: 10}}/>
            <Tooltip
              contentStyle={{fontSize: '12px', padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc'}}
              labelFormatter={(date) => `Date: ${date}`}
              formatter={(value, name) => [`${value} orders`, name]}
              />
            <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}/>
            <Bar dataKey="completed" fill="#4CAF50" name="Completed" radius={[4, 4, 0, 0]}/>
            <Bar dataKey="pending" fill="#FFA726" name="Pending/Processing" radius={[4, 4, 0, 0]}/>
            <Bar dataKey="inTransit" fill="#2196F3" name="In Transit" radius={[4, 4, 0, 0]}/>
            <Bar dataKey="cancelled" fill="#F44336" name="Cancelled" radius={[4, 4, 0, 0]}/>
          </BarChart>
      </div>

       {selectedDate && (
        <div className="mt-6 pt-4 border-t border-gray-200">
           <div className="flex justify-between items-center mb-3">
             <h3 className="text-base sm:text-lg font-medium text-gray-700">
              {reportType === 'date-wise'
                ? `Delivery Details for ${selectedDate}`
                : `Route-wise Details for ${selectedDate}`}
            </h3>
             {reportData.length > 0 && (
                <div className="text-sm text-gray-500">
                    {reportData.length} {reportData.length === 1 ? 'record' : 'records'} found
                </div>
             )}
           </div>

           {reportData.length === 0 && (
             <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-md">
                No delivery records found for {selectedDate}.
             </div>
           )}
           {/* Note: The actual table rendering for the selected date report is not included
               in the original code or this revision. You would typically add another
               component here to display 'reportData' or 'routesData' in a table format. */}
         </div>
       )}
    </div>
  );
}

export default DeliveryStatusChart;