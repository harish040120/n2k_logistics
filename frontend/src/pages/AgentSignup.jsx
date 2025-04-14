import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { FaBuilding, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBusinessTime, FaTruck, FaGlobe, FaIdCard } from "react-icons/fa";

const fieldIcons = {
  organizationName: <FaBuilding className="text-gray-500" />,
  contactPerson: <FaUser className="text-gray-500" />,
  email: <FaEnvelope className="text-gray-500" />,
  phone: <FaPhone className="text-gray-500" />,
  address: <FaMapMarkerAlt className="text-gray-500" />,
  businessType: <FaBusinessTime className="text-gray-500" />,
  yearsInBusiness: <FaBusinessTime className="text-gray-500" />,
  fleetSize: <FaTruck className="text-gray-500" />,
  operatingAreas: <FaGlobe className="text-gray-500" />,
  licenseNumber: <FaIdCard className="text-gray-500" />,
};

function AgentSignup() {
  const [formData, setFormData] = useState({
    organizationName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    yearsInBusiness: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = () => {
    if (Object.values(formData).some((value) => !value.trim())) {
      toast.warn("Please fill in all fields!");
      return;
    }

    const newAgent = { id: Date.now(), ...formData, approved: false };
    const existingAgents = JSON.parse(localStorage.getItem("agents")) || [];
    localStorage.setItem("agents", JSON.stringify([...existingAgents, newAgent]));

    toast.success("Sign-up successful! Awaiting admin approval.");
    setFormData({
      organizationName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      yearsInBusiness: "",
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -50 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-xl border border-gray-200 mt-8"
    >
      <h2 className="text-3xl font-bold text-gray-650 text-center mb-6 flex items-center justify-center gap-2">
  <FaTruck className="text-red-600" />
  Become an N2K Logistics Agent
  <FaTruck className="text-red-600" />
</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(formData).map((key) => (
          <motion.div 
            key={key} 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * Object.keys(formData).indexOf(key) }}
            className="relative"
          >
            <label className="block text-sm font-semibold text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
            <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-red-500 overflow-hidden">
              <span className="px-3 text-gray-500">{fieldIcons[key]}</span>
              <input
                name={key}
                value={formData[key]}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 outline-none focus:ring-0"
                placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1')}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSignup}
          className="bg-gradient-to-r from-red-500 to-red-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          Submit
        </motion.button>
      </div>
    </motion.div>
  );
}

export default AgentSignup;
