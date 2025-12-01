import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Home from "./components/auth/Home";
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
import Profile from "./components/profile/Profile";

import ProtectedAdmin from "./protectedRoutes/ProtectedAdmin";
import ProtectedPatient from "./protectedRoutes/ProtectedPatient";
import ProtectedReceptionniste from "./protectedRoutes/ProtectedReceptionniste";
import ProtectedMedecin from "./protectedRoutes/ProtectedMedecin";
import Unauthorized from "./pages/Unauthorized"


function AppContent() {
  const [role, setRole] = useState(null);
  const location = useLocation();

 
useEffect(() => {
  try {
    const userData = localStorage.getItem("userData");
    
    if (userData && userData !== "undefined" && userData !== "null") {
      const user = JSON.parse(userData);
      if (user && user.role) {
        setRole(user.role);
      } else {
        setRole(null);
      }
    } else {
      setRole(null);
    }
  } catch (err) {
    console.error("Erreur lecture userData", err);
    localStorage.removeItem("userData"); // Nettoie le storage 
    setRole(null);
  }
}, [location]);
  

  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* home */}
      <Route
        path="/"
        element={
          <Layout role={role} showSidebar={false}>
            <Home />
          </Layout>
        }
      />

      {/* route ADMIN  */}
      <Route
        path="/admin/*"
        element={
          <ProtectedAdmin>
            <Layout role={role} showSidebar={true}>
              <Routes>
                <Route index element={<Doctors />} />
                <Route path="doctors" element={<Doctors />} />
                <Route path="receptionists" element={<Receptionists />} />
              </Routes>
            </Layout>
          </ProtectedAdmin>
        }
      />

      {/* route MÉDECIN  */}
      <Route
        path="/doctor/*"
        element={
          <ProtectedMedecin>
            <Layout role={role} showSidebar={true}>
              <Routes>
                <Route index element={<DoctorAvailability />} />
                <Route path="availability" element={<DoctorAvailability />} />
                <Route path="calendar" element={<DoctorCalendar />} />
                <Route path="consultation-modal/:id" element={<ConsultationModal />} />
              </Routes>
            </Layout>
          </ProtectedMedecin>
        }
      />

      {/* route RÉCEPTIONNISTE  */}
      <Route
        path="/receptionist/*"
        element={
          <ProtectedReceptionniste>
            <Layout role={role} showSidebar={true}>
              <Routes>
                <Route index element={<ReceptionistDashboard />} />
                <Route path="dashboard" element={<ReceptionistDashboard />} />
                <Route path="patients" element={<ReceptionistPatients />} />
              </Routes>
            </Layout>
          </ProtectedReceptionniste>
        }
      />

      {/* route PATIENT  */}
      <Route
        path="/patient/*"
        element={
          <ProtectedPatient>
            <Layout role={role} showSidebar={true}>
              <Routes>
                <Route index element={<PatientDashboard />} />
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="rendezvous" element={<PatientRendezvous />} />
                <Route path="calendar/:medecinId/:medecinName" element={<PatientCalendar />} />
                <Route path="appointments" element={<MyAppointments />} />
              </Routes>
            </Layout>
          </ProtectedPatient>
        }
      />

      {/* PROFIL  */}
      <Route
        path="/profile"
        element={
          <Layout role={role} showSidebar={true}>
            <Profile />
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