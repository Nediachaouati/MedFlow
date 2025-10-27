import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Home from "./components/auth/Home";
import AdminDashboard from "./components/admin/AdminDashboard";
import Doctors from "./components/admin/Doctors";
import Receptionists from "./components/admin/Receptionists";
import Layout from "./components/layout/Layout";
import DoctorDashboard from "./components/doctor/DoctorDashboard";
import DoctorAvailability from "./components/doctor/DoctorAvailability";
import { useState, useEffect } from "react";

function AppContent() {
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, [location]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <Layout role={role} showSidebar={false}>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/admin/*"
        element={
          <Layout role={role} showSidebar={true}>
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="receptionists" element={<Receptionists />} />
            </Routes>
          </Layout>
        }
      />
      <Route
        path="/doctor/*"
        element={
          <Layout role={role} showSidebar={true}>
            <Routes>
              <Route index element={<DoctorDashboard />} />
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="availability" element={<DoctorAvailability />} />
            </Routes>
          </Layout>
        }
      />
      <Route
        path="/profile"
        element={
          <Layout role={role} showSidebar={true}>
            <div>Page Profil</div>
          </Layout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;