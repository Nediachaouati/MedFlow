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
  Chip,
} from "@mui/material";
import axios from "axios";

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const token = localStorage.getItem("token");

  const fetchAppointments = async (date) => {
    try {
      const res = await axios.get(`http://localhost:3000/appointments/with-bills?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data || []);
    } catch (err) {
      setAlert({ open: true, message: "Erreur chargement RDV", severity: "error" });
      setAppointments([]);
    }
  };

  useEffect(() => {
    fetchAppointments(filterDate);
  }, [filterDate]);

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await axios.put(
        `http://localhost:3000/appointments/${appointmentId}/finish-and-bill`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({ open: true, message: "Rendez-vous terminé et facture générée !", severity: "success" });
      fetchAppointments(filterDate);
    } catch (err) {
      setAlert({ open: true, message: "Erreur lors de la finalisation", severity: "error" });
    }
  };

  const handleMarkAsPaid = async (billId) => {
    if (!window.confirm("Confirmer que le patient a payé cette facture ?")) return;

    try {
      await axios.put(
        `http://localhost:3000/bill/${billId}/pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({ open: true, message: "Paiement enregistré avec succès !", severity: "success" });
      fetchAppointments(filterDate);
    } catch (err) {
      setAlert({ open: true, message: "Erreur lors du paiement", severity: "error" });
    }
  };

  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        Dashboard Réceptionniste
      </Typography>

      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          label="Date"
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={() => fetchAppointments(filterDate)}>
          Rafraîchir
        </Button>
      </Box>

      <Snackbar open={alert.open} autoHideDuration={4000} onClose={handleCloseAlert} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Patient</strong></TableCell>
            <TableCell><strong>Médecin</strong></TableCell>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>Heure</strong></TableCell>
            <TableCell><strong>Statut RDV</strong></TableCell>
            <TableCell align="center"><strong>Actions & Paiement</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">Aucun rendez-vous</TableCell>
            </TableRow>
          ) : (
            appointments.map((appt) => {
              const isPending = appt.status !== "terminé" && appt.status !== "annulé";
              const isCompleted = appt.status === "terminé";
              const bill = appt.bill?.[0];

              return (
                <TableRow key={appt.id}>
                  <TableCell>{appt.patient?.name || "N/A"}</TableCell>
                  <TableCell>{appt.medecin?.name || "N/A"}</TableCell>
                  <TableCell>{appt.date}</TableCell>
                  <TableCell>
                    {appt.timeSlot?.startTime?.slice(0, 5)} - {appt.timeSlot?.endTime?.slice(0, 5)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appt.status}
                      color={
                        appt.status === "terminé" ? "success" :
                        appt.status === "annulé" ? "error" : "default"
                      }
                    />
                  </TableCell>

                  {/* actions */}
                  <TableCell align="center">
                    

                    {/*  terminé :gestion facture */}
                    {isCompleted && (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
                        {bill ? (
                          bill.status === "PAID" ? (
                            <Chip label="Payée" color="success" variant="outlined" />
                          ) : (
                            <>
                              <Chip label={`${bill.amount} DT - Non payée`} color="error" />
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => handleMarkAsPaid(bill.id)}
                              >
                                Marquer payée
                              </Button>
                            </>
                          )
                        ) : (
                          <Chip label="Facture en cours..." color="warning" size="small" />
                        )}
                      </Box>
                    )}

                    
                  
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Box>
  );
}