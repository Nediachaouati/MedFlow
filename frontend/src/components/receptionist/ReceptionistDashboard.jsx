// src/pages/ReceptionistDashboard.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const token = localStorage.getItem("token");

  // Fetch appointments for selected date
  const fetchAppointments = async (date) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3000/appointments?date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Erreur chargement RDV :", err);
      setAlert({ open: true, message: "Erreur chargement rendez-vous", severity: "error" });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(filterDate);
  }, [filterDate]);

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await axios.put(
        `http://localhost:3000/appointments/${appointmentId}/complete`,
        {}, // backend handles bill creation
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({ open: true, message: "Rendez-vous terminé et facture générée", severity: "success" });
      fetchAppointments(filterDate); // refresh table
    } catch (err) {
      console.error("Erreur terminer RDV :", err);
      setAlert({ open: true, message: "Erreur lors de la finalisation", severity: "error" });
    }
  };

  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  return (
    <Box sx={{ p: 8 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard Réceptionniste
      </Typography>

      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          label="Filtrer par date"
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={() => fetchAppointments(filterDate)}>
          Rafraîchir
        </Button>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Patient</TableCell>
            <TableCell>Médecin</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Créneau</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Aucun rendez-vous pour cette date
              </TableCell>
            </TableRow>
          ) : (
            appointments.map((appt) => (
              <TableRow key={appt.id}>
                <TableCell>{appt.patient?.name || "N/A"}</TableCell>
                <TableCell>{appt.medecin?.name || "N/A"}</TableCell>
                <TableCell>{appt.date}</TableCell>
                <TableCell>
                  {appt.timeSlot?.startTime?.slice(0,5)} - {appt.timeSlot?.endTime?.slice(0,5)}
                </TableCell>
                <TableCell>{appt.status}</TableCell>
                <TableCell>
                  {appt.status !== "TERMINÉ" && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleCompleteAppointment(appt.id)}
                    >
                      Terminer
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
