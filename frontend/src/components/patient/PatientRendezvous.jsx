import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function PatientRendezvous() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const token = localStorage.getItem("token");

  // 1. Charger les médecins
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("http://localhost:3000/users?role=MEDECIN", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Médecins reçus :", res.data);
        setDoctors(res.data);
      } catch (err) {
        console.error("Erreur médecins :", err.response?.data);
        showAlert("Erreur : impossible de charger les médecins.", "error");
      }
    };
    fetchDoctors();
  }, [token]);

  // 2. Charger les créneaux
  useEffect(() => {
    if (!selectedDoctor) {
      setAvailabilities([]);
      return;
    }

    const fetchSlots = async () => {
      try {
        const res = await axios.get(
         `http://localhost:3000/availability/public?medecinId=${selectedDoctor.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Créneaux bruts reçus :", res.data);

        const freeSlots = res.data.filter((slot) => {
          const status = (slot.status || "").toString().trim().toLowerCase();
          return status === "disponible";
        });

        console.log("Créneaux filtrés (disponibles) :", freeSlots);
        setAvailabilities(freeSlots);
      } catch (err) {
        console.error("Erreur créneaux :", err.response?.data);
        showAlert("Erreur lors du chargement des créneaux.", "error");
      }
    };
    fetchSlots();
  }, [selectedDoctor, token]);

  // Sélectionner un médecin
  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
  };

  // Retour
  const handleBack = () => {
    setSelectedDoctor(null);
    setAvailabilities([]);
  };

  // Prendre un créneau
  const handleTakeSlot = (slot) => {
    setSelectedSlot(slot);
    setOpenDialog(true);
  };

  // CONFIRMER LE RDV (FONCTION MANQUANTE !)
  const handleConfirm = async () => {
    try {
      await axios.post(
        "http://localhost:3000/appointments/add",
        {
          medecinId: selectedDoctor.id,
          date: selectedSlot.date,
          time: selectedSlot.startTime,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert("Rendez-vous pris avec succès !", "success");
      setOpenDialog(false);
      setTimeout(() => {
        handleBack();
        setSelectedSlot(null);
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Échec de la réservation.";
      showAlert(msg, "error");
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
        Prendre un Rendez-vous
      </Typography>

      {/* LISTE DES MÉDECINS */}
      {!selectedDoctor ? (
        <Box>
          <Typography variant="h6" gutterBottom color="text.secondary">
            Choisissez un médecin :
          </Typography>
          <Grid container spacing={3}>
            {doctors.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Card
                  elevation={4}
                  sx={{
                    height: "100%",
                    transition: "0.3s",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                  }}
                >
                  <CardActionArea onClick={() => handleSelectDoctor(doc)}>
                    <CardContent sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Dr. {doc.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {doc.specialty || "Médecin généraliste"}
                      </Typography>
                      <Chip label="Disponible" color="success" size="small" sx={{ mt: 1 }} />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {doctors.length === 0 && (
            <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
              Aucun médecin disponible.
            </Typography>
          )}
        </Box>
      ) : (
        /* CRÉNEAUX */
        <Box>
          <Button variant="text" onClick={handleBack} sx={{ mb: 2 }}>
            Retour
          </Button>

          <Typography variant="h5" gutterBottom>
            Créneaux - Dr. {selectedDoctor.name}
          </Typography>

          

          {availabilities.length > 0 ? (
            <TableContainer component={Paper} elevation={2}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Heure</strong></TableCell>
                    <TableCell align="center"><strong>Action</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availabilities.map((slot) => (
                    <TableRow key={slot.id} hover>
                      <TableCell>{formatDate(slot.date)}</TableCell>
                      <TableCell>{slot.startTime} - {slot.endTime}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleTakeSlot(slot)}
                        >
                          Réserver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: "center", mt: 4, p: 3, backgroundColor: "#fff3e0", borderRadius: 1 }}>
              <Typography color="orange" fontStyle="italic">
                Aucun créneau disponible.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Vérifie la console (F12).
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* DIALOGUE CONFIRMATION */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmer le RDV</DialogTitle>
        <DialogContent>
          <Typography>Rendez-vous avec :</Typography>
          <Typography fontWeight="bold" color="primary">
            Dr. {selectedDoctor?.name}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography><strong>Date :</strong> {selectedSlot && formatDate(selectedSlot.date)}</Typography>
            <Typography><strong>Heure :</strong> {selectedSlot?.startTime} - {selectedSlot?.endTime}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleConfirm} variant="contained" color="success">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ALERTES */}
      <Snackbar open={alert.open} autoHideDuration={5000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}