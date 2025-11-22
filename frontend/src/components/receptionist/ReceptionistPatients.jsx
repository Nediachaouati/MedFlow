import { useState, useEffect } from "react";
import {
  Typography,
  Container,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import axios from "axios";

export default function ReceptionistPatients() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  // États RDV
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [openRdvDialog, setOpenRdvDialog] = useState(false);
  const [rdvData, setRdvData] = useState({ medecinId: "", date: "", timeSlotId: "" });
  const [availableSlots, setAvailableSlots] = useState([]);

  // CHARGER PATIENTS
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const res = await axios.get("http://localhost:3000/users?role=PATIENT", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data);
      } catch (err) {
        setAlert({ open: true, message: "Erreur chargement patients", severity: "error" });
      }
    };
    fetchPatients();
  }, [navigate]);

  // CHARGER MÉDECINS
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/users?role=MEDECIN", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(res.data);
      } catch (err) {
        console.error("Erreur médecins", err);
      }
    };
    fetchDoctors();
  }, []);

  // CHARGER CRÉNEAUX DISPONIBLES (ROUTE CORRIGÉE POUR RÉCEPTIONNISTE)
  useEffect(() => {
    if (!openRdvDialog || !rdvData.medecinId || !rdvData.date) {
      setAvailableSlots([]);
      return;
    }

    const loadSlots = async () => {
      try {
        const token = localStorage.getItem("token");

        // ROUTE QUI MARCHE POUR RÉCEPTIONNISTE (évite le 403)
        const res = await axios.get(
          `http://localhost:3000/appointments/available-slots?medecinId=${rdvData.medecinId}&date=${rdvData.date}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const freeSlots = res.data || [];
        console.log("Créneaux chargés :", freeSlots);
        setAvailableSlots(freeSlots);
      } catch (err) {
        console.error("Erreur créneaux :", err.response?.status);
        setAvailableSlots([]);
        // Si la route n'existe pas encore, on fallback sur l'ancienne (au cas où)
        if (err.response?.status === 404) {
          try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
              `http://localhost:3000/availability/slots?medecinId=${rdvData.medecinId}&date=${rdvData.date}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setAvailableSlots(res.data.filter(s => s.status === "disponible"));
          } catch (fallbackErr) {
            setAvailableSlots([]);
          }
        }
      }
    };

    loadSlots();
  }, [rdvData.medecinId, rdvData.date, openRdvDialog]);

  // OUVRIR DIALOGUE RDV
  const handleOpenRdv = (patient) => {
    setSelectedPatient(patient);
    setRdvData({ medecinId: "", date: "", timeSlotId: "" });
    setAvailableSlots([]);
    setOpenRdvDialog(true);
  };

  // PRENDRE LE RDV → CORRIGÉ (URL + BODY)
  const handleBookRdv = async () => {
    if (!rdvData.medecinId || !rdvData.date || !rdvData.timeSlotId) {
      setAlert({ open: true, message: "Tous les champs sont requis", severity: "warning" });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/appointments/add", // URL CORRECTE
        {
          patientId: selectedPatient.id,        // AJOUTE ÇA
          medecinId: Number(rdvData.medecinId),
          timeSlotId: Number(rdvData.timeSlotId),
          date: rdvData.date,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlert({ open: true, message: `RDV pris avec succès pour ${selectedPatient.name} !`, severity: "success" });
      setOpenRdvDialog(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Impossible de prendre le RDV";
      setAlert({ open: true, message: msg, severity: "error" });
    }
  };

  // AJOUT / SUPPRESSION PATIENT
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleAddPatient = () => setOpenForm(true);

  const handleSavePatient = async () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setAlert({ open: true, message: "Tous les champs obligatoires", severity: "warning" });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const fullName = `${formData.lastName} ${formData.firstName}`;
      const res = await axios.post(
        "http://localhost:3000/users/add-patient",
        { name: fullName, email: formData.email, password: formData.password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPatients([...patients, res.data]);
      setAlert({ open: true, message: "Patient ajouté !", severity: "success" });
      setOpenForm(false);
      setFormData({ firstName: "", lastName: "", email: "", password: "" });
    } catch (err) {
      setAlert({ open: true, message: "Erreur ajout patient", severity: "error" });
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm("Supprimer ce patient ?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/users/patient/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(patients.filter(p => p.id !== id));
      setAlert({ open: true, message: "Patient supprimé", severity: "success" });
    } catch (err) {
      setAlert({ open: true, message: "Erreur suppression", severity: "error" });
    }
  };

  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  return (
    <Container sx={{ mt: 4, mb: 4, p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4, mt: 6 }}>
        Liste des Patients
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button variant="contained" color="success" startIcon={<AddCircleOutlineIcon />} onClick={handleAddPatient}>
          Ajouter Patient
        </Button>
      </Box>

      <Snackbar open={alert.open} autoHideDuration={5000} onClose={handleCloseAlert} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={handleCloseAlert} severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ backgroundColor: "#e3f2fd", fontWeight: "bold" }}>Nom</TableCell>
            <TableCell sx={{ backgroundColor: "#e3f2fd", fontWeight: "bold" }}>Email</TableCell>
            <TableCell sx={{ backgroundColor: "#e3f2fd", fontWeight: "bold" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {patients.length === 0 ? (
            <TableRow><TableCell colSpan={3} align="center">Aucun patient</TableCell></TableRow>
          ) : (
            patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeletePatient(patient.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenRdv(patient)} color="primary">
                    <EditCalendarIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* DIALOG AJOUT PATIENT */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un Patient</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="lastName" label="Nom" fullWidth value={formData.lastName} onChange={handleChange} />
          <TextField margin="dense" name="firstName" label="Prénom" fullWidth value={formData.firstName} onChange={handleChange} />
          <TextField margin="dense" name="email" label="Email" type="email" fullWidth value={formData.email} onChange={handleChange} />
          <TextField margin="dense" name="password" label="Mot de passe" type="password" fullWidth value={formData.password} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Annuler</Button>
          <Button onClick={handleSavePatient} variant="contained" color="primary">Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG PRENDRE RDV */}
      <Dialog open={openRdvDialog} onClose={() => setOpenRdvDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Prendre RDV pour : <strong>{selectedPatient?.name}</strong></DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Médecin</InputLabel>
            <Select
              value={rdvData.medecinId}
              onChange={(e) => setRdvData({ ...rdvData, medecinId: e.target.value, timeSlotId: "" })}
            >
              {doctors.map((doc) => (
                <MenuItem key={doc.id} value={doc.id}>Dr. {doc.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={rdvData.date}
            onChange={(e) => setRdvData({ ...rdvData, date: e.target.value, timeSlotId: "" })}
            inputProps={{ min: new Date().toISOString().split("T")[0] }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Créneau disponible</InputLabel>
            <Select
              value={rdvData.timeSlotId}
              onChange={(e) => setRdvData({ ...rdvData, timeSlotId: e.target.value })}
              disabled={!rdvData.medecinId || !rdvData.date}
            >
              {availableSlots.length === 0 ? (
                rdvData.medecinId && rdvData.date ? (
                  <MenuItem disabled>Chargement...</MenuItem>
                ) : (
                  <MenuItem disabled>Choisissez médecin et date</MenuItem>
                )
              ) : (
                availableSlots.map((slot) => (
                  <MenuItem key={slot.id} value={slot.id}>
                    {slot.startTime?.slice(0,5) || "??:??"} - {slot.endTime?.slice(0,5) || "??:??"}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRdvDialog(false)}>Annuler</Button>
          <Button
            onClick={handleBookRdv}
            variant="contained"
            color="primary"
            disabled={!rdvData.timeSlotId}
          >
            Confirmer RDV
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}