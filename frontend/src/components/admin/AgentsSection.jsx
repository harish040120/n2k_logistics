import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import { FaCheckCircle, FaEye, FaUserShield, FaTruck } from "react-icons/fa";

function AgentsSection() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewedAgent, setViewedAgent] = useState(null);

  useEffect(() => {
    const storedAgents = JSON.parse(localStorage.getItem("agents")) || [];
    setAgents(storedAgents);
  }, []);

  const handleApprove = (agent) => {
    setSelectedAgent(agent);
    setUsername("");
    setPassword("");
    setIsModalOpen(true);
  };

  const handleSubmitApproval = () => {
    if (!username || !password) {
      toast.warn("Enter both username and password.");
      return;
    }

    const updatedAgents = agents.map((agent) =>
      agent.id === selectedAgent.id ? { ...agent, approved: true, username, password } : agent
    );

    localStorage.setItem("agents", JSON.stringify(updatedAgents));
    setAgents(updatedAgents);

    const emailParams = {
      to_email: selectedAgent.email,
      agent_name: selectedAgent.contactPerson,
      username,
      password,
    };

    emailjs
      .send("service_6yg6v1f", "template_pc1plh9", emailParams, "N7q40mibYxQ8mFtOj")
      .then(() => toast.success(`Agent ${selectedAgent.contactPerson} approved and email sent!`))
      .catch(() => toast.error("Failed to send email."));

    setIsModalOpen(false);
  };

  const handleViewCredentials = (agent) => {
    setViewedAgent(agent);
    setIsViewModalOpen(true);
  };

  return (
    <motion.div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-xl border border-gray-200 mt-8">
      <h2 className="text-3xl font-bold text-gray-650 text-center mb-6 flex items-center justify-center gap-2">
        <FaTruck className="text-red-600" />
        N2K Logistics Agents
        <FaTruck className="text-red-600" />
      </h2>
      {agents.length === 0 ? (
        <p className="text-gray-500 text-center">No pending agents.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-3">Name</th>
              <th className="border p-3">Email</th>
              <th className="border p-3">Phone</th>
              <th className="border p-3">Actions</th>
              <th className="border p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent, index) => (
              <motion.tr 
                key={agent.id} 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border hover:bg-gray-100"
              >
                <td className="p-3">{agent.contactPerson}</td>
                <td className="p-3">{agent.email}</td>
                <td className="p-3">{agent.phone}</td>
                <td className="p-3 flex space-x-2">
                  {agent.approved ? (
                    <button 
                      onClick={() => handleViewCredentials(agent)} 
                      className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
                    >
                      <FaEye /> <span>View</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApprove(agent)} 
                      className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
                    >
                      <FaUserShield /> <span>Approve</span>
                    </button>
                  )}
                </td>
                <td className="p-3 text-center">
                  {agent.approved && <FaCheckCircle className="text-green-500 text-2xl mx-auto" />}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-lg shadow-lg w-96"
          >
            <h3 className="text-lg font-bold mb-4">Set Login Credentials</h3>
            <input type="text" placeholder="Username" className="border p-2 w-full mb-2" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" className="border p-2 w-full mb-2" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
              <button onClick={handleSubmitApproval} className="px-4 py-2 bg-red-600 text-white rounded">Approve</button>
            </div>
          </motion.div>
        </div>
      )}

      {isViewModalOpen && viewedAgent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-lg shadow-lg w-96"
          >
            <h3 className="text-lg font-bold mb-4">Agent Credentials</h3>
            <p><strong>Username:</strong> {viewedAgent.username}</p>
            <p><strong>Password:</strong> {viewedAgent.password}</p>
            <button onClick={() => setIsViewModalOpen(false)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">Close</button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default AgentsSection;
