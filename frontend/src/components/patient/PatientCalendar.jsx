import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function PatientCalendar({ medecinId, medecinName }) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const token = localStorage.getItem("token");

  const fetchSlots = async () => {
    if (!medecinId || !token) return;

    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/availability/slots", {
        params: { medecinId, date: selectedDate },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSlots(res.data);
    } catch (err) {
      console.error("Erreur chargement créneaux :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedDate, medecinId, token]);

  const handleReserve = (slot) => {
    setSelectedSlot(slot);
    setOpenConfirm(true);
  };

  const confirmReservation = async () => {
    try {
      await axios.post(
        "http://localhost:3000/appointments/add",
        {
          medecinId,
          timeSlotId: selectedSlot.id,
          date: selectedDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlert({ open: true, message: "Rendez-vous réservé avec succès !", severity: "success" });
      setOpenConfirm(false);
      fetchSlots(); 
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la réservation";
      setAlert({ open: true, message: msg, severity: "error" });
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Prendre rendez-vous avec Dr. {medecinName}
      </Typography>

      
      <Box sx={{ mb: 3 }}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: "10px", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </Box>

      <Typography variant="h6" gutterBottom>
        {format(new Date(selectedDate), "EEEE d MMMM yyyy", { locale: fr })}
      </Typography>

      {loading ? (
        <Alert severity="info">Chargement des disponibilités...</Alert>
      ) : slots.length === 0 ? (
        <Alert severity="warning">Aucun créneau disponible ce jour.</Alert>
      ) : (
        <Grid container spacing={2}>
          {slots.map((slot) => (
            <Grid item xs={6} sm={4} md={3} key={slot.id}>
              <Button
                fullWidth
                variant={slot.status === "disponible" ? "outlined" : "contained"}
                color={slot.status === "disponible" ? "success" : "error"}
                disabled={slot.status === "occupé"}
                onClick={() => handleReserve(slot)}
                sx={{ py: 2.5, fontWeight: "bold", textTransform: "none" }}
              >
                {slot.startTime} - {slot.endTime}
                {slot.status === "occupé" && <Chip label="Pris" size="small" color="error" sx={{ ml: 1 }} />}
              </Button>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialogue de confirmation */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirmer le rendez-vous</DialogTitle>
        <DialogContent>
          <Typography fontWeight="bold">Dr. {medecinName}</Typography>
          <Typography>
            {format(new Date(selectedDate), "dd MMMM yyyy", { locale: fr })} de {selectedSlot?.startTime} à {selectedSlot?.endTime}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Annuler</Button>
          <Button onClick={confirmReservation} variant="contained" color="success">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      
      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </Box>
  );
}