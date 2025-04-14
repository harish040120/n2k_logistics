import { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
      <label htmlFor="fromPhoneNumber" className="block text-sm font-medium text-gray-700">
        Phone Number
      </label>
      <input
        type="tel"
        id="fromPhoneNumber"
        name="fromPhoneNumber"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        value={formData.fromPhoneNumber}
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
      <label htmlFor="toPhoneNumber" className="block text-sm font-medium text-gray-700">
        Phone Number
      </label>
      <input
        type="tel"
        id="toPhoneNumber"
        name="toPhoneNumber"
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        value={formData.toPhoneNumber}
        onChange={handleChange}
      />
    </div>
  </div>
);

// Total Charges Component
const TotalChargesComponent = ({ formData, handleChange }) => {
  const totalCharges =
    Number(formData.lrCharge) +
    Number(formData.doorDeliveryCharge) +
    Number(formData.hamali) +
    Number(formData.otherCharges || 0);

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800">Charges</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="lrCharge" className="block text-sm font-medium text-gray-700">
            LR Charge
          </label>
          <input
            type="number"
            id="lrCharge"
            name="lrCharge"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.lrCharge}
            onChange={handleChange}
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
          <label htmlFor="otherCharges" className="block text-sm font-medium text-gray-700">
            Other Charges
          </label>
          <input
            type="number"
            id="otherCharges"
            name="otherCharges"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.otherCharges || ""}
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
  const API_BASE_URL = config.API_BASE_URL; // Use environment variable
  const [routes, setRoutes] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [vehicleAllocation, setVehicleAllocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  const [formData, setFormData] = useState({
    fromName: "",
    fromAddress: "",
    fromPhoneNumber: "",
    toName: "",
    toAddress: "",
    toPhoneNumber: "",
    quantity: "",
    weight: "",
    paymentMethod: "",
    route: "",
    itemType: "",
    invoiceNumber: "",
    invoiceDate: "",
    invoiceValue: "",
    lrCharge: "",
    doorDeliveryCharge: "",
    hamali: "",
    otherCharges: "",
    eWayBill: "",
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
        
        const itemTypesResponse = await fetch(`${API_BASE_URL}/item-types`);
        const itemTypesData = await itemTypesResponse.json();
        setItemTypes(itemTypesData);
        
        if (routesData.length > 0 && paymentMethodsData.length > 0 && itemTypesData.length > 0) {
          setFormData(prev => ({
            ...prev,
            route: routesData[0].name,
            paymentMethod: paymentMethodsData[0].name,
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

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromName: formData.fromName,
          fromAddress: formData.fromAddress,
          fromPhoneNumber: formData.fromPhoneNumber,
          toName: formData.toName,
          toAddress: formData.toAddress,
          toPhoneNumber: formData.toPhoneNumber,
          quantity: Number(formData.quantity),
          weight: Number(formData.weight),
          itemType: formData.itemType,
          invoiceNumber: formData.invoiceNumber,
          invoiceDate: formData.invoiceDate,
          invoiceValue: Number(formData.invoiceValue),
          lrCharge: Number(formData.lrCharge),
          doorDeliveryCharge: Number(formData.doorDeliveryCharge),
          hamali: Number(formData.hamali),
          otherCharges: Number(formData.otherCharges || 0),
          route: formData.route,
          paymentMethod: formData.paymentMethod,
          eWayBill: formData.eWayBill,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }
      
      console.log("Order placed:", data);
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
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save("receipt.pdf");

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
          </head>
          <body>
            <img src="${imgData}" style="width:100%;" />
          </body>
        </html>`;
      const printWindow = window.open("", "", "width=800,height=600");
      printWindow.document.write(windowContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();

      receiptContent.style.display = "none";
    });
  };

  const isEWayBillValid = formData.eWayBill.length === 12;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {orderPlaced ? (
              <div className="flex flex-col">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Placed Successfully!</h2>
                <div className="flex justify-end space-x-3 mt-4">
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
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Book Order</h2>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
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

                  <TotalChargesComponent formData={formData} handleChange={handleChange} />
                  <EWayBillComponent formData={formData} handleChange={handleChange} />

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
                          {method.name === "Online Payment" ? "Paid" : method.name === "Cash on Delivery" ? "To Pay" : method.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                </form>
              </>
            )}
          </div>

          {!orderPlaced && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                disabled={loading || !isEWayBillValid}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Receipt Template */}
          <div
            id="receipt-template"
            style={{
              display: "none",
              padding: "20px",
              fontFamily: "Arial, sans-serif",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "8px",
              width: "210mm",
              minHeight: "297mm",
              margin: "auto",
            }}
          >
            <h1 style={{ textAlign: "center", fontSize: "24px", marginBottom: "20px" }}>
              Order Receipt
            </h1>
            <div style={{ marginBottom: "10px" }}>
              <strong>From Name:</strong> {formData.fromName}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>From Address:</strong> {formData.fromAddress}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>From Phone Number:</strong> {formData.fromPhoneNumber}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>To Name:</strong> {formData.toName}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>To Address:</strong> {formData.toAddress}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>To Phone Number:</strong> {formData.toPhoneNumber}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Quantity:</strong> {formData.quantity}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Weight:</strong> {formData.weight} kg
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Item Type:</strong> {formData.itemType}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Invoice Number:</strong> {formData.invoiceNumber}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Invoice Date:</strong> {formData.invoiceDate}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Invoice Value:</strong> {formData.invoiceValue}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>LR Charge:</strong> {formData.lrCharge}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Door Delivery Charge:</strong> {formData.doorDeliveryCharge}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Hamali:</strong> {formData.hamali}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Other Charges:</strong> {formData.otherCharges || 0}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Total Charges:</strong>{" "}
              {Number(formData.lrCharge) +
                Number(formData.doorDeliveryCharge) +
                Number(formData.hamali) +
                Number(formData.otherCharges || 0)}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Route:</strong> {formData.route}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Payment Method:</strong> {formData.paymentMethod}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>E-Way Bill:</strong> {formData.eWayBill}
            </div>
            {showAllocation && vehicleAllocation && (
              <div style={{ marginBottom: "10px" }}>
                <strong>Vehicle Allocation:</strong> {vehicleAllocation.vehicle.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}