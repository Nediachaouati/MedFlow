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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
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
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Récupérer la liste des patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setAlert({ open: true, message: "Token manquant. Veuillez vous reconnecter.", severity: "error" });
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:3000/users?role=PATIENT", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPatients(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des patients :", error);
        const msg = error.response?.data?.message || "Erreur lors du chargement des patients.";
        setAlert({ open: true, message: msg, severity: "error" });
      }
    };

    fetchPatients();
  }, [navigate]);

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Ouvrir le formulaire
  const handleAddPatient = () => {
    setOpenForm(true);
  };

  // Enregistrer le patient
  const handleSavePatient = async () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setAlert({ open: true, message: "Tous les champs sont obligatoires.", severity: "warning" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const fullName = `${formData.lastName} ${formData.firstName}`;

      const response = await axios.post(
        "http://localhost:3000/users/add-patient",
        {
          name: fullName,
          email: formData.email,
          password: formData.password,
          phoneNumber: "",
          address: "",
          birthDate: null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Ajouter le patient avec l'ID réel du backend
      setPatients([...patients, response.data]);

      setAlert({ open: true, message: "Patient ajouté avec succès !", severity: "success" });
      setOpenForm(false);
      setFormData({ firstName: "", lastName: "", email: "", password: "" });
    } catch (error) {
      console.error("Erreur lors de l'ajout du patient :", error);
      const msg = error.response?.data?.message || "Erreur lors de l'ajout du patient.";
      setAlert({ open: true, message: msg, severity: "error" });
    }
  };

  // Supprimer un patient
  const handleDeletePatient = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce patient ?")) return;

    try {
      const token = localStorage.getItem("token");

      // BONNE ROUTE
      await axios.delete(`http://localhost:3000/users/patient/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPatients(patients.filter((patient) => patient.id !== id));
      setAlert({ open: true, message: "Patient supprimé avec succès !", severity: "success" });
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      const msg = error.response?.data?.message || "Impossible de supprimer ce patient.";
      setAlert({ open: true, message: msg, severity: "error" });
    }
  };

  // Fermer l'alerte
  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") return;
    setAlert({ ...alert, open: false });
  };

  return (
    <Container sx={{ mt: 4, mb: 4, p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "black", mb: 2, mt: 6 }}>
        Liste des Patients
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddPatient}
          sx={{ mb: 2 }}
        >
          Ajouter Patient
        </Button>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "black", backgroundColor: "#cdd7dfff" }}>Nom</TableCell>
            <TableCell sx={{ color: "black", backgroundColor: "#cdd7dfff" }}>Email</TableCell>
            <TableCell sx={{ color: "black", backgroundColor: "#cdd7dfff" }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} align="center">
                Aucun patient trouvé.
              </TableCell>
            </TableRow>
          ) : (
            patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeletePatient(patient.id)} sx={{ color: "#D32F2F" }}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Formulaire d'ajout */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un Patient</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="lastName"
            label="Nom"
            type="text"
            fullWidth
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="firstName"
            label="Prénom"
            type="text"
            fullWidth
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="password"
            label="Mot de passe"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Annuler</Button>
          <Button onClick={handleSavePatient} variant="contained" color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}