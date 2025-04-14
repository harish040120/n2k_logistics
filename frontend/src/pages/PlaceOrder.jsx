import { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from '/assets/logo.png';
import config from '@config';

// From Component
const FromComponent = ({ formData, handleChange }) => (
  <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-800">From</h3>
    <div>
      <label htmlFor="fromName" className="block text-sm font-medium text-gray-700">
        Name (Individual/Company)
      </label>
      <input
        type="text"
        id="fromName"
        name="fromName"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        value={formData.fromName}
        onChange={handleChange}
      />
    </div>
    <div>
      <label htmlFor="fromAddress" className="block text-sm font-medium text-gray-700">
        Address
      </label>
      <textarea
        id="fromAddress"
        name="fromAddress"
        rows="2"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        value={formData.fromAddress}
        onChange={handleChange}
      />
    </div>
    <div>
      <label htmlFor="fromDistrict" className="block text-sm font-medium text-gray-700">
        District
      </label>
      <textarea
        id="fromDistrict"
        name="fromDistrict"
        rows="1"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        value={formData.fromDistrict}
        onChange={handleChange}
      />
    </div>
    <div>
      <label htmlFor="fromPhone" className="block text-sm font-medium text-gray-700">
        Phone Number
      </label>
      <input
        type="tel"
        id="fromPhone"
        name="fromPhone"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        value={formData.fromPhone}
        onChange={handleChange}
      />
    </div>
  </div>
);

// To Component
const ToComponent = ({ formData, handleChange }) => (
  <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-800">To</h3>
    <div>
      <label htmlFor="toName" className="block text-sm font-medium text-gray-700">
        Name (Individual/Company)
      </label>
      <input
        type="text"
        id="toName"
        name="toName"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        value={formData.toName}
        onChange={handleChange}
      />
    </div>
    <div>
      <label htmlFor="toAddress" className="block text-sm font-medium text-gray-700">
        Address
      </label>
      <textarea
        id="toAddress"
        name="toAddress"
        rows="2"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        value={formData.toAddress}
        onChange={handleChange}
      />
    </div>
    <div>
      <label htmlFor="toDistrict" className="block text-sm font-medium text-gray-700">
        District
      </label>
      <textarea
        id="toDistrict"
        name="toDistrict"
        rows="1"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        value={formData.toDistrict}
        onChange={handleChange}
      />
    </div>
    <div>
      <label htmlFor="toPhone" className="block text-sm font-medium text-gray-700">
        Phone Number
      </label>
      <input
        type="tel"
        id="toPhone"
        name="toPhone"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        value={formData.toPhone}
        onChange={handleChange}
      />
    </div>
  </div>
);

// Total Charges Component
const TotalChargesComponent = ({ formData, handleChange }) => {
  // Calculate charges based on percentages
  const frightCharge = (Number(formData.totalCharges) * 0.33).toFixed(2);
  const lrCharge = (Number(formData.totalCharges) * 0.13).toFixed(2);
  const fuelSurcharge = (Number(formData.totalCharges) * 0.23).toFixed(2);
  
  const totalCharges = (
    Number(formData.totalCharges) +
    Number(lrCharge) +
    Number(formData.doorDeliveryCharge) +
    Number(formData.hamali) +
    Number(fuelSurcharge) +
    Number(frightCharge) +
    Number(formData.ieCharge)
  ).toFixed(2);

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800">Charges</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="totalCharges" className="block text-sm font-medium text-gray-700">
            Total Charges
          </label>
          <input
            type="number"
            id="totalCharges"
            name="totalCharges"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.totalCharges}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="lrCharge" className="block text-sm font-medium text-gray-700">
            LR Charge (13%)
          </label>
          <input
            type="text"
            id="lrCharge"
            name="lrCharge"
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100"
            value={lrCharge}
          />
        </div>
        <div>
          <label htmlFor="doorDeliveryCharge" className="block text-sm font-medium text-gray-700">
            Door Delivery Charge
          </label>
          <input
            type="number"
            id="doorDeliveryCharge"
            name="doorDeliveryCharge"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.doorDeliveryCharge}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="frightCharge" className="block text-sm font-medium text-gray-700">
            Fright Charge (33%)
          </label>
          <input
            type="text"
            id="frightCharge"
            name="frightCharge"
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100"
            value={frightCharge}
          />
        </div>
        <div>
          <label htmlFor="hamali" className="block text-sm font-medium text-gray-700">
            Hamali
          </label>
          <input
            type="number"
            id="hamali"
            name="hamali"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.hamali}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="fuelSurcharge" className="block text-sm font-medium text-gray-700">
            Fuel SurCharge (23%)
          </label>
          <input
            type="text"
            id="fuelSurcharge"
            name="fuelSurcharge"
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100"
            value={fuelSurcharge}
          />
        </div>
        <div>
          <label htmlFor="ieCharge" className="block text-sm font-medium text-gray-700">
            IE Charge
          </label>
          <input
            type="number"
            id="ieCharge"
            name="ieCharge"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.ieCharge}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="totalCharges" className="block text-sm font-medium text-gray-700">
            Total Charges
          </label>
          <input
            type="text"
            id="totalCharges"
            name="totalCharges"
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100"
            value={totalCharges}
          />
        </div>
      </div>
    </div>
  );
};

// E-Way Bill Component
const EWayBillComponent = ({ formData, handleChange }) => {
  const handleEWayBillChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Allow only numbers
    if (value.length <= 12) {
      handleChange({ target: { name: "eWayBill", value } });
    }
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <label htmlFor="eWayBill" className="block text-sm font-medium text-gray-700">
        E-Way Bill (12-digit number)
      </label>
      <input
        type="text"
        id="eWayBill"
        name="eWayBill"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        value={formData.eWayBill}
        onChange={handleEWayBillChange}
        maxLength={12}
      />
    </div>
  );
};

export default function PlaceOrderForm({ onClose }) {
  const API_BASE_URL = config.API_BASE_URL; 
  
  const [routes, setRoutes] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [termsDelivery, settermsDelivery] = useState([]);
  const [vehicleAllocation, setVehicleAllocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [lrNumber, setLrNumber] = useState("");
  
  const [formData, setFormData] = useState({
    fromName: "",
    fromAddress: "",
    fromDistrict: "",
    fromPhone: "",
    toName: "",
    toAddress: "",
    toDistrict: "",
    toPhone: "",
    quantity: "",
    weight: "",
    paymentMethod: "",
    termsDelivery: "",
    route: "",
    itemType: "",
    invoiceNumber: "",
    invoiceDate: "",
    invoiceValue: "",
    lrCharge: "",
    doorDeliveryCharge: "",
    hamali: "",
    frightCharge: "",
    fuelSurcharge: "",
    ieCharge: "",
    eWayBill: "",
    totalCharges: "",
  });

  const [showAllocation, setShowAllocation] = useState(false);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const routesResponse = await fetch(`${API_BASE_URL}/routes`);
        const routesData = await routesResponse.json();
        setRoutes(routesData);
        
        const paymentMethodsResponse = await fetch(`${API_BASE_URL}/payment-methods`);
        const paymentMethodsData = await paymentMethodsResponse.json();
        setPaymentMethods(paymentMethodsData);

        const termsDeliveryResponse = await fetch(`${API_BASE_URL}/terms-of-delivery`);
        const termsDeliveryData = await termsDeliveryResponse.json();
        settermsDelivery(termsDeliveryData);
        
        const itemTypesResponse = await fetch(`${API_BASE_URL}/item-types`);
        const itemTypesData = await itemTypesResponse.json();
        setItemTypes(itemTypesData);
        
        if (routesData.length > 0 && paymentMethodsData.length > 0 && itemTypesData.length > 0) {
          setFormData(prev => ({
            ...prev,
            route: routesData[0].name,
            paymentMethod: paymentMethodsData[0].name,
            termsDelivery: termsDeliveryData[0].name,
            itemType: itemTypesData[0].name
          }));
        }
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Failed to load initial data. Please try again later.");
      }
    };

    fetchDropdownData();
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchVehicleAllocation = async () => {
      if (formData.weight && formData.quantity) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/vehicle-allocation?weight=${formData.weight}&quantity=${formData.quantity}`
          );
          const data = await response.json();
          setVehicleAllocation(data);
          setShowAllocation(true);
        } catch (err) {
          console.error("Error fetching vehicle allocation:", err);
        }
      } else {
        setShowAllocation(false);
      }
    };

    fetchVehicleAllocation();
  }, [formData.weight, formData.quantity, API_BASE_URL]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Calculate charges based on percentages
    const frightCharge = (Number(formData.totalCharges) * 0.33).toFixed(2);
    const lrCharge = (Number(formData.totalCharges) * 0.13).toFixed(2);
    const fuelSurcharge = (Number(formData.totalCharges) * 0.23).toFixed(2);

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromName: formData.fromName,
          fromAddress: formData.fromAddress,
          fromDistrict: formData.fromDistrict,
          fromPhone: formData.fromPhone,
          toName: formData.toName,
          toAddress: formData.toAddress,
          toDistrict: formData.toDistrict,
          toPhone: formData.toPhone,
          quantity: Number(formData.quantity),
          weight: Number(formData.weight),
          itemType: formData.itemType,
          invoiceNumber: formData.invoiceNumber,
          invoiceDate: formData.invoiceDate,
          invoiceValue: Number(formData.invoiceValue),
          lrCharge: Number(lrCharge),
          fuelSurcharge: Number(fuelSurcharge),
          frightCharge: Number(frightCharge),
          doorDeliveryCharge: Number(formData.doorDeliveryCharge),
          hamali: Number(formData.hamali),
          ieCharge: Number(formData.ieCharge),
          route: formData.route,
          paymentMethod: formData.paymentMethod,
          termsDelivery: formData.termsDelivery,
          eWayBill: formData.eWayBill,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }
      
      console.log("Order placed:", data);
      setLrNumber(data.lr_number); // Store the LR number from response
      setOrderPlaced(true);
    } catch (err) {
      console.error("Error submitting order:", err);
      setError(err.message || 'An error occurred while placing the order');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    const receiptContent = document.getElementById("receipt-template");
    receiptContent.style.display = "block";

    html2canvas(receiptContent).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Calculate position for the first receipt (top of the page)
      const firstReceiptY = 10;
      
      // Calculate position for the second receipt (below the first with some margin)
      
      // Add first receipt
      pdf.addImage(imgData, "PNG", 10, firstReceiptY, imgWidth, imgHeight);
      
      // Add second receipt
      
      pdf.save(`N2K_Logistics_Receipt_${lrNumber}.pdf`);
      receiptContent.style.display = "none";
    });
  };

  const handlePrintReceipt = () => {
    const receiptContent = document.getElementById("receipt-template");
    receiptContent.style.display = "block";

    html2canvas(receiptContent).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const windowContent = `<!DOCTYPE html>
        <html>
          <head>
            <title>Print Receipt</title>
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .receipt-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 210mm;
              }
              .receipt-duplicate {
                width: 190mm;
                margin-bottom: 20mm;
                page-break-after: always;
              }
              .receipt-duplicate:last-child {
                page-break-after: auto;
                margin-bottom: 0;
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="receipt-duplicate">
                <img src="${imgData}" style="width:100%;" />
              </div>
              <div class="receipt-duplicate">
                <img src="${imgData}" style="width:100%;" />
              </div>
            </div>
          </body>
        </html>`;
      const printWindow = window.open("", "", "width=800,height=1123");
      printWindow.document.write(windowContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();

      receiptContent.style.display = "none";
    });
  };

  const isEWayBillValid = formData.eWayBill.length === 12;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        {orderPlaced ? (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Placed Successfully!</h2>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Download Receipt
              </button>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
              >
                Print Receipt
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Book</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FromComponent formData={formData} handleChange={handleChange} />
                <ToComponent formData={formData} handleChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="itemType" className="block text-sm font-medium text-gray-700">
                    Item Type
                  </label>
                  <select
                    id="itemType"
                    name="itemType"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.itemType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Item Type</option>
                    {itemTypes.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="route" className="block text-sm font-medium text-gray-700">
                    Route
                  </label>
                  <select
                    id="route"
                    name="route"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.route}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Route</option>
                    {routes.map((route) => (
                      <option key={route.id} value={route.name}>
                        {route.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    min="0.1"
                    step="0.1"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <EWayBillComponent formData={formData} handleChange={handleChange} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    id="invoiceNumber"
                    name="invoiceNumber"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    id="invoiceDate"
                    name="invoiceDate"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.invoiceDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="invoiceValue" className="block text-sm font-medium text-gray-700">
                    Invoice Value
                  </label>
                  <input
                    type="number"
                    id="invoiceValue"
                    name="invoiceValue"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.invoiceValue}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Payment Method</option>
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.name}>
                      {method.name === "Cash on Delivery" ? "To Pay" : method.name === "Online Payment" ? "Paid" : method.name}
                    </option>
                  ))}
                </select>
                
              </div>
              <div>
                <label htmlFor="termsDelivery" className="block text-sm font-medium text-gray-700">
                  Terms of Delivery
                </label>
                <select
                  id="termsDelivery"
                  name="termsDelivery"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.termsDelivery}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select term</option>
                  {termsDelivery.map((method) => (
                    <option key={method.id} value={method.name}>
                      {method.name === "" ? "Door Delivery" : method.name === "" ? "Office Delivery" : method.name}
                    </option>
                  ))}
                </select>
                
              </div>

              <TotalChargesComponent formData={formData} handleChange={handleChange} />

              {showAllocation && vehicleAllocation && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-2">Vehicle Allocation</h3>
                  <p>Vehicle: {vehicleAllocation.vehicle.name}</p>
                  <p>Max Weight: {vehicleAllocation.vehicle.max_weight} kg</p>
                  <p>Max Quantity: {vehicleAllocation.vehicle.max_quantity} items</p>
                  {vehicleAllocation.message && (
                    <p className="text-red-600 mt-2">{vehicleAllocation.message}</p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  disabled={loading || !isEWayBillValid}
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* N2K Logistics Receipt Template */}
        <div
          id="receipt-template"
          style={{
            display: "none",
            padding: "20px",
            fontFamily: "Arial, sans-serif",
            backgroundColor: "#fff",
            width: "190mm",
            minHeight: "140mm",
            margin: "auto",
          }}
        >
          {/* Logo and Header Section */}
          <div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "stretch", // Makes all children equal height
  marginBottom: "20px",
  gap: "15px",
  height: "100px" // Fixed height matching logo
}}>
  {/* Logo Box - Fixed Size */}
  <div style={{
    border: "1px solid #e0e0e0",
    borderRadius: "5px",
    padding: "10px",
    width: "100px",
    height: "100%", // Takes full parent height
    backgroundColor: "#f8f9fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}>
    <img 
      src={logo} 
      alt="N2K Logistics Logo" 
      style={{ 
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "contain"
      }}
    />
  </div>

  {/* Company Details Box - Flexible Width */}
  <div style={{
    flex: 1,
    border: "1px solid #e0e0e0",
    borderRadius: "5px",
    padding: "15px",
    height: "100%", // Matches logo height
    backgroundColor: "#f8f9fa",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  }}>
    <div style={{ 
      fontSize: "18px", 
      fontWeight: "bold", 
      color: "#2c3e50",
      textTransform: "uppercase",
      letterSpacing: "1px",
      marginBottom: "4px",
      textAlign: "center"
    }}>
      N2K LOGISTICS
    </div>
    
    <div style={{ 
      fontSize: "10px", 
      color: "#555",
      lineHeight: "1.4",
      textAlign: "center"
    }}>
      <div>H.O : S.F. No. 1/54/2, Lagampalayam, Gobichettipalayam Road</div>
      <div>Kuttagam Post, Nambiyur (Tk), Erode - 638 462. TN.</div>
      <div>GSTIN : 33AAXFN5545Q12A</div>
      <div>📍 99650 29529 | n2klogistics2024@gmail.com</div>
    </div>
  </div>

  {/* LR Details Box - Fixed Width */}
  <div style={{
    border: "2px solid #e74c3c",
    borderRadius: "5px",
    padding: "0 15px",
    width: "180px",
    height: "100%", // Matches logo height
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  }}>
    <div style={{
      fontSize: "16px",
      fontWeight: "bold",
      color: "#e74c3c",
      marginBottom: "5px"
    }}>
      LR No: {lrNumber}
    </div>
    <div style={{
      fontSize: "15px",
      fontWeight: "600",
      color: "#333"
    }}>
      Date: {new Date().toLocaleDateString('en-IN')}
    </div>
  </div>
</div>

          {/* Order Details */}
          <div style={{ 
            border: "1px solid #e0e0e0", 
            padding: "15px", 
            marginBottom: "20px",
            borderRadius: "5px",
            backgroundColor: "#f8f9fa",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>

            {/* From and To Sections */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              marginBottom: "15px",
              gap: "20px"
            }}>
              <div style={{ 
                width: "48%",
                backgroundColor: "#f1f8fe",
                padding: "10px",
                borderRadius: "5px",
                borderLeft: "3px solid #3498db"
              }}>
                <div style={{ 
                  fontWeight: "bold", 
                  borderBottom: "1px solid #3498db", 
                  marginBottom: "5px",
                  color: "#2980b9"
                }}>
                  From:
                </div>
                <div><strong>Name:</strong> {formData.fromName}</div>
                <div><strong>Address:</strong> {formData.fromAddress}</div>
                <div><strong>District:</strong> {formData.fromDistrict}</div>
                <div><strong>Phone:</strong> {formData.fromPhone}</div>
              </div>
              <div style={{ 
                width: "48%",
                backgroundColor: "#f1f8fe",
                padding: "10px",
                borderRadius: "5px",
                borderLeft: "3px solid #3498db"
              }}>
                <div style={{ 
                  fontWeight: "bold", 
                  borderBottom: "1px solid #3498db", 
                  marginBottom: "5px",
                  color: "#2980b9"
                }}>
                  To:
                </div>
                <div><strong>Name:</strong> {formData.toName}</div>
                <div><strong>Address:</strong> {formData.toAddress}</div>
                <div><strong>District:</strong> {formData.toDistrict}</div>
                <div><strong>Phone:</strong> {formData.toPhone}</div>
              </div>
            </div>

            {/* Order Information */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(2, 1fr)", 
              gap: "10px",
              marginBottom: "15px",
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "5px"
            }}>
              <div>
                <strong style={{ color: "#16a085" }}>Payment:</strong> {formData.paymentMethod}
              </div>
              <div>
                <strong style={{ color: "#16a085" }}>Terms of Delivery:</strong> {formData.termsDelivery}
              </div>
              <div>
                <strong style={{ color: "#16a085" }}>No.of Items:</strong> {formData.quantity}
              </div>
              <div>
                <strong style={{ color: "#16a085" }}>Item Type:</strong> {formData.itemType}
              </div>
              <div>
                <strong style={{ color: "#16a085" }}>Weight:</strong> {formData.weight} kg
              </div>
            </div>

            {/* Invoice Details */}
            <div style={{ 
              borderTop: "1px solid #e0e0e0", 
              borderBottom: "1px solid #e0e0e0",
              padding: "10px 0",
              marginBottom: "15px"
            }}>
              <div style={{ 
                fontWeight: "bold", 
                marginBottom: "5px",
                color: "#8e44ad"
              }}>
                Invoice Details:
              </div>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                backgroundColor: "#f5eef8",
                padding: "8px",
                borderRadius: "5px"
              }}>
                <div><strong>Number:</strong> {formData.invoiceNumber}</div>
                <div><strong>Date:</strong> {formData.invoiceDate}</div>
                <div><strong>Value:</strong> ₹{formData.invoiceValue}</div>
                <div><strong style={{ color: "#16a085" }}>E-Way Bill:</strong> {formData.eWayBill}</div>
              </div>
            </div>

            {/* Charges */}
            <div style={{ 
              marginBottom: "15px",
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "5px"
            }}>
              <div style={{ 
                fontWeight: "bold", 
                marginBottom: "5px",
                color: "#d35400"
              }}>
                Charges:
              </div>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(3, 1fr)", 
                gap: "10px"
              }}>
                <div><strong style={{ color: "#e67e22" }}>LR Charge:</strong> ₹{(Number(formData.totalCharges) * 0.13).toFixed(2)}</div>
                <div><strong style={{ color: "#e67e22" }}>Door Delivery:</strong> ₹{formData.doorDeliveryCharge}</div>
                <div><strong style={{ color: "#e67e22" }}>Fright Charge:</strong> ₹{(Number(formData.totalCharges) * 0.33).toFixed(2)}</div>
                <div><strong style={{ color: "#e67e22" }}>Hamali:</strong> ₹{formData.hamali}</div>
                <div><strong style={{ color: "#e67e22" }}>Fuel Charge:</strong> ₹{(Number(formData.totalCharges) * 0.23).toFixed(2)}</div>
                <div><strong style={{ color: "#e67e22" }}>IE Charge:</strong> ₹{formData.ieCharge}</div>
              </div>
            </div>

            {/* Total */}
            <div style={{ 
              textAlign: "right", 
              fontWeight: "bold", 
              fontSize: "16px",
              borderTop: "1px solid #e0e0e0",
              paddingTop: "5px",
              color: "#c0392b",
              marginBottom: "30px"
            }}>
              <strong>TOTAL CHARGES:</strong> ₹{
                Number(formData.totalCharges) +
                Number(formData.lrCharge) +
                Number(formData.doorDeliveryCharge) +
                Number(formData.hamali) +
                Number(formData.fuelSurcharge) +
                Number(formData.frightCharge) +
                Number(formData.ieCharge)
              }
            </div>
            {/* Footer */}
            <div style={{ 
              marginTop: "20px",
              textAlign: "center",
              fontSize: "12px",
              color: "#7f8c8d",
              borderTop: "1px solid #e0e0e0",
              paddingTop: "10px"
            }}>
              <div style={{ marginBottom: "5px" }}>Goods received by Good condition with all documents</div>
              <div style={{ fontWeight: "bold", color: "#3498db" }}>I/We here by agree to be to pay all charges octroi & Taxes as applicable</div>
            </div>
            {/* Signature and Seal Section */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "40px",
              paddingTop: "15px"
            }}>
              <div style={{
                textAlign: "center",
                width: "45%"
              }}>
                <div style={{
                  height: "50px",
                  borderBottom: "1px solid #7f8c8d",
                  marginBottom: "5px"
                }}></div>
                <div style={{ fontSize: "12px" }}>Customer Signature with seal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}