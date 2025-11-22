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
import ReceptionistDashboard from "./components/receptionist/ReceptionistDashboard";
import ReceptionistPatients from "./components/receptionist/ReceptionistPatients";
import PatientDashboard from "./components/patient/PatientDashboard";
import { useState, useEffect } from "react";
import PatientRendezvous from "./components/patient/PatientRendezvous";
import DoctorCalendar from "./components/doctor/DoctorCalendar";
import PatientCalendar from "./components/patient/PatientCalendar";
import MyAppointments from "./components/patient/MyAppointments";
import ConsultationModal from "./components/doctor/ConsultationModal";


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
              <Route path="calendar" element={<DoctorCalendar />} />
          <Route path="consultation-modal/:id" element={<ConsultationModal />} />
            </Routes>
          </Layout>
        }
      />

      <Route
        path="/receptionist/*"
        element={
          <Layout role={role} showSidebar={true}>
            <Routes>
              <Route index element={<ReceptionistDashboard />} /> {/* Page par défaut */}
              <Route path="dashboard" element={<ReceptionistDashboard />} />
              <Route path="patients" element={<ReceptionistPatients />} />
            </Routes>
          </Layout>
        }
      />

      <Route
        path="/patient/*"
        element={
          <Layout role={role} showSidebar={true}>
            <Routes>
              <Route index element={<PatientDashboard />} /> 
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="rendezvous" element={<PatientRendezvous/>} />
              <Route path="calendar/:medecinId/:medecinName" element={<PatientCalendar />} />
              <Route path="appointments" element={<MyAppointments />} />
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