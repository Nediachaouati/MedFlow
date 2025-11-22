import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export default function PatientRendezvous() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:3000/users?role=MEDECIN", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDoctors(res.data))
      .catch(() => showAlert("Erreur chargement médecins", "error"));
  }, [token]);

  useEffect(() => {
    if (!selectedDoctor) {
      setSlots([]);
      return;
    }
    setLoading(true);
    axios
      .get("http://localhost:3000/availability/slots", {
        params: { medecinId: selectedDoctor.id, date: selectedDate },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSlots(res.data))
      .catch(() => showAlert("Aucun créneau disponible ce jour", "info"))
      .finally(() => setLoading(false));
  }, [selectedDoctor, selectedDate, token]);

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setSlots([]);
  };

  const handleBack = () => {
    setSelectedDoctor(null);
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
  };

  const handleReserve = (slot) => {
    setSelectedSlot(slot);
    setOpenDialog(true);
  };

  const handleConfirm = async () => {
    try {
      await axios.post(
        "http://localhost:3000/appointments/add",
        {
          medecinId: selectedDoctor.id,
          timeSlotId: selectedSlot.id,
          date: selectedDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert("Rendez-vous réservé avec succès !", "success");
      setOpenDialog(false);
      setSlots((prev) =>
        prev.map((s) => (s.id === selectedSlot.id ? { ...s, status: "occupé" } : s))
      );
    } catch (err) {
      showAlert(err.response?.data?.message || "Erreur réservation", "error");
    }
  };

  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4, p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
        Prendre un Rendez-vous
      </Typography>

      {!selectedDoctor ? (
        <Box>
          <Typography variant="h6" gutterBottom>Choisissez votre médecin :</Typography>
          <Grid container spacing={3}>
            {doctors.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Card elevation={6} sx={{ "&:hover": { transform: "scale(1.03)", transition: "0.3s" } }}>
                  <CardActionArea onClick={() => handleSelectDoctor(doc)}>
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h6" fontWeight="bold">Dr. {doc.name}</Typography>
                      <Typography color="text.secondary">{doc.speciality || "Généraliste"}</Typography>
                      <Chip label="Voir les disponibilités" color="primary" size="small" sx={{ mt: 1 }} />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Box>
          <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
            Retour aux médecins
          </Button>

          <Typography variant="h5" gutterBottom>
            Dr. {selectedDoctor.name} — {selectedDoctor.speciality}
          </Typography>

          <FormControl sx={{ minWidth: 250, mb: 3 }}>
            <InputLabel>Date</InputLabel>
            <Select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
              {[...Array(30)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() + i);
                const dateStr = format(d, "yyyy-MM-dd");
                const label = format(d, "EEEE d MMMM", { locale: fr });
                return <MenuItem key={dateStr} value={dateStr}>{label}</MenuItem>;
              })}
            </Select>
          </FormControl>

          {loading ? (
            <Alert severity="info">Chargement...</Alert>
          ) : slots.length === 0 ? (
            <Alert severity="warning">
              Aucun créneau disponible le {format(parseISO(selectedDate), "d MMMM yyyy", { locale: fr })}
            </Alert>
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
                    sx={{ py: 2.5, fontWeight: "bold" }}
                  >
                    {slot.startTime} - {slot.endTime}
                    {slot.status === "occupé" && <Chip label="Pris" size="small" color="error" sx={{ ml: 1 }} />}
                  </Button>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmer le rendez-vous</DialogTitle>
        <DialogContent>
          <Typography fontWeight="bold" color="primary">Dr. {selectedDoctor?.name}</Typography>
          <Typography>
            {format(parseISO(selectedDate), "EEEE d MMMM yyyy", { locale: fr })} de {selectedSlot?.startTime} à {selectedSlot?.endTime}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleConfirm} variant="contained" color="success">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={alert.open} autoHideDuration={5000} onClose={() => setAlert({ ...alert, open: false })}>
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </Box>
  );
}