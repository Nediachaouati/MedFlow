// src/pages/doctor/DoctorCalendar.jsx → VERSION 100% FONCTIONNELLE
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Paper,
  Alert,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function DoctorCalendar() {
  const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  const [date, setDate] = useState(getTodayDateString());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const token = localStorage.getItem("token");

  const normalizeDate = (input) => {
    if (!input) return getTodayDateString();
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
    if (input.includes("/")) {
      const [d, m, y] = input.split("/");
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    return getTodayDateString();
  };

  const fetchSlots = async () => {
    const normalizedDate = normalizeDate(date);
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/availability/doctor/slots/${normalizedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSlots(response.data || []);
    } catch (err) {
      console.error("Erreur agenda :", err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const normalized = normalizeDate(date);
    if (normalized !== date) {
      setDate(normalized);
    } else {
      fetchSlots();
    }
  }, [date]);

  // CETTE PARTIE MANQUAIT → FERME LE MODAL QUAND LA CONSULTATION EST TERMINÉE
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === "consultation-closed") {
        handleCloseModal();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleStartConsultation = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAppointment(null);
    fetchSlots(); // Rafraîchit l'agenda → le créneau passe en "terminé"
  };

  return (
    <>
      {/* TON AGENDA ICI (inchangé) */}
      <Paper elevation={3} sx={{ p: 4, maxWidth: 1300, mx: "auto", borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Mon Agenda Médical
        </Typography>

        <Box sx={{ mb: 4, display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" onClick={() => setDate(getTodayDateString())}>
            Aujourd'hui
          </Button>
        </Box>

        <Typography variant="h5" sx={{ mb: 3, color: "#1565c0" }}>
          {format(new Date(date + "T12:00:00"), "EEEE d MMMM yyyy", { locale: fr })}
        </Typography>

        {loading ? (
          <Alert severity="info">Chargement de l'agenda...</Alert>
        ) : slots.length === 0 ? (
          <Alert severity="warning">Aucun créneau pour cette date</Alert>
        ) : (
          <Grid container spacing={3}>
            {slots.map((slot) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={slot.id}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    textAlign: "center",
                    border: "3px solid",
                    borderColor:
                      slot.status === "occupé"
                        ? slot.appointment?.status === "terminé"
                          ? "#9e9e9e"
                          : "#d32f2f"
                        : "#2e7d32",
                    bgcolor:
                      slot.status === "occupé"
                        ? slot.appointment?.status === "terminé"
                          ? "#f5f5f5"
                          : "#ffebee"
                        : "#e8f5e9",
                    transition: "0.3s",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: 8 },
                  }}
                >
                  <Typography fontWeight="bold" fontSize="1.4rem" color="primary">
                    {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                  </Typography>

                  {slot.status === "occupé" ? (
                    <>
                      <Typography variant="h6" color="error.dark" fontWeight="bold">
                        {slot.patient?.name || "Patient inconnu"}
                      </Typography>

                      {slot.appointment?.status === "terminé" ? (
                        <Chip label="Consulté" color="default" sx={{ mt: 1 }} />
                      ) : (
                        <>
                          <Chip label="En attente" color="error" sx={{ mt: 1 }} />
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            sx={{ mt: 2 }}
                            onClick={() => handleStartConsultation(slot.appointment)}
                          >
                            Commencer consultation
                          </Button>
                        </>
                      )}
                    </>
                  ) : (
                    <Chip label="Libre" color="success" sx={{ mt: 2 }} />
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* MODAL */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="lg" fullWidth>
        <DialogTitle>Consultation en cours</DialogTitle>
        <DialogContent dividers>
          {selectedAppointment ? (
            <iframe
              src={`/doctor/consultation-modal/${selectedAppointment.id}`}
              style={{ width: "100%", height: "80vh", border: "none" }}
              title="Consultation"
            />
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}