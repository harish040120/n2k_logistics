import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Navbar2 from './components/Navbar2';
import AdminDashboard from './pages/AdminDashboard';
import TrackingPortal from './pages/TrackingPortal';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import DriverLogin from './pages/DriverLogin';
import AgentSignup from './pages/AgentSignup';
import DriverPortal from './pages/DriverPortal';
import PlaceOrder from './pages/PlaceOrder';

export default function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isDriverAuthenticated, setIsDriverAuthenticated] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Navbar2 />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/admin-login"
              element={<AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />}
            />
            <Route
              path="/driver-login"
              element={<DriverLogin onLogin={() => setIsDriverAuthenticated(true)} />}
            />

            <Route path="/" element={<Home />} />

            <Route
              path="/admin"
              element={
                isAdminAuthenticated ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/admin-login" replace />
                )
              }
            />

            <Route path="/track" element={<TrackingPortal />} />
            <Route path="/agent-signup" element={<AgentSignup />} />
            <Route path="/place-order" element={<PlaceOrder />} />

            <Route
              path="/driver"
              element={
                isDriverAuthenticated ? (
                  <DriverPortal />
                ) : (
                  <Navigate to="/driver-login" replace />
                )
              }
            />
            
            {/* Optional: Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}