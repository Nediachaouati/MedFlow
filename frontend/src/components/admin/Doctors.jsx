import { useState, useEffect } from "react";
import { Typography, Container, Button, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Box } from "@mui/material"; // Explicitement inclus Box
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"; // Icône plus jolie pour ajouter
import axios from "axios";

export default function Doctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "",speciality: "" });
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  // Récupérer la liste des médecins depuis l'API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("token"); // Supposons que le token est stocké ici
        const response = await axios.get("http://localhost:3000/users?role=MEDECIN", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des médecins :", error);
        setAlert({ open: true, message: "Erreur lors du chargement des médecins.", severity: "error" });
      }
    };
    fetchDoctors();
  }, []);

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Ajouter un médecin via l'API
  const handleAddDoctor = async () => {
    setOpenForm(true);
  };

  // Enregistrer le médecin
  const handleSaveDoctor = async () => {
    try {
      const token = localStorage.getItem("token");
      const fullName = `${formData.lastName} ${formData.firstName}`;
      const response = await axios.post(
        "http://localhost:3000/users/add-medecin",
        {
          name: fullName,
          email: formData.email,
          password: formData.password,
          speciality: formData.speciality,
          phoneNumber: "",
          address: "",
          birthDate: null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDoctors([...doctors, { id: Date.now(), name: fullName, email: formData.email }]); // Mise à jour locale temporaire
      setAlert({ open: true, message: "Médecin ajouté avec succès !", severity: "success" });
      setOpenForm(false);
      setFormData({ firstName: "", lastName: "", email: "", password: "" , speciality: ""  });
    } catch (error) {
      console.error("Erreur lors de l'ajout du médecin :", error);
      setAlert({ open: true, message: "Erreur lors de l'ajout du médecin.", severity: "error" });
    }
  };

  // Supprimer un médecin
  const handleDeleteDoctor = async (id) => {
    if (window.confirm("Voulez-vous supprimer ce médecin ?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(doctors.filter((doctor) => doctor.id !== id));
        setAlert({ open: true, message: "Médecin supprimé avec succès !", severity: "success" });
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        setAlert({ open: true, message: "Erreur lors de la suppression du médecin.", severity: "error" });
      }
    }
  };

  // Fermer le toast manuellement
  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert({ ...alert, open: false });
  };

  return (
    <Container sx={{ mt: 4, mb: 4, p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "black", mb: 2, mt: 6 }}> {/* Décalage vers le bas avec mt: 6 */}
        Liste des Médecins
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}> {/* Bouton à droite */}
        <Button
          variant="contained"
          color="success" // Couleur verte
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddDoctor}
          sx={{ mb: 2 }}
        >
          Ajouter Médecin
        </Button>
      </Box>
      <Snackbar
        open={alert.open}
        autoHideDuration={5000} // 5 secondes
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "black", backgroundColor: "#cdd7dfff" }}>Nom</TableCell>
            <TableCell sx={{ color: "black", backgroundColor: "#cdd7dfff" }}>Email</TableCell>
             <TableCell sx={{ color: "black", backgroundColor: "#cdd7dfff" }}>Spécialité</TableCell>
            <TableCell sx={{ color: "black", backgroundColor: "#cdd7dfff" }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor.id}>
              <TableCell>{doctor.name}</TableCell>
              <TableCell>{doctor.email}</TableCell>
              <TableCell>{doctor.speciality}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDeleteDoctor(doctor.id)} sx={{ color: "#D32F2F" }}> {/* Couleur rouge pour la poubelle */}
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>Ajouter un Médecin</DialogTitle>
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
          />
          <TextField
            margin="dense"
            name="firstName"
            label="Prénom"
            type="text"
            fullWidth
            value={formData.firstName}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="password"
            label="Mot de passe"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="speciality"
            label="Spécialité"
            type="speciality"
            fullWidth
            value={formData.speciality}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Annuler</Button>
          <Button onClick={handleSaveDoctor} variant="contained" color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}