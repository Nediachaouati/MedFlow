import { useState, useEffect } from "react";
import { Typography, Container, Button, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Box } from "@mui/material"; // Ajout de Box explicitement
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"; 
import axios from "axios";

export default function Receptionists() {
  const navigate = useNavigate();
  const [receptionists, setReceptionists] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  // Récupérer la liste des réceptionnistes 
  useEffect(() => {
    const fetchReceptionists = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const response = await axios.get("http://localhost:3000/users?role=RECEPTIONNISTE", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReceptionists(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des réceptionnistes :", error);
        setAlert({ open: true, message: "Erreur lors du chargement des réceptionnistes.", severity: "error" });
      }
    };
    fetchReceptionists();
  }, []);

  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Ajouter un réceptionniste 
  const handleAddReceptionist = async () => {
    setOpenForm(true);
  };

  // Enregistrer le réceptionniste
  const handleSaveReceptionist = async () => {
    try {
      const token = localStorage.getItem("token");
      const fullName = `${formData.lastName} ${formData.firstName}`;
      const response = await axios.post(
        "http://localhost:3000/users/add-receptionniste",
        {
          name: fullName,
          email: formData.email,
          password: formData.password,
          phoneNumber: "", 
          address: "",   
          birthDate: null 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReceptionists([...receptionists, { id: Date.now(), name: fullName, email: formData.email }]); 
      setAlert({ open: true, message: "Réceptionniste ajouté avec succès !", severity: "success" });
      setOpenForm(false);
      setFormData({ firstName: "", lastName: "", email: "", password: "" });
    } catch (error) {
      console.error("Erreur lors de l'ajout du réceptionniste :", error);
      setAlert({ open: true, message: "Erreur lors de l'ajout du réceptionniste.", severity: "error" });
    }
  };

  // Supprimer un réceptionniste
  const handleDeleteReceptionist = async (id) => {
    if (window.confirm("Voulez-vous supprimer ce réceptionniste ?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3000/users/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReceptionists(receptionists.filter((receptionist) => receptionist.id !== id));
        setAlert({ open: true, message: "Réceptionniste supprimé avec succès !", severity: "success" });
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        setAlert({ open: true, message: "Erreur lors de la suppression du réceptionniste.", severity: "error" });
      }
    }
  };

  // Fermer l'alerte 
  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert({ ...alert, open: false });
  };

  return (
    <Container sx={{ mt: 4, mb: 4, p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "black", mb: 2, mt: 6 }}> 
        Liste des Réceptionnistes
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}> 
        <Button
          variant="contained"
          color="success" 
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddReceptionist}
          sx={{ mb: 2 }}
        >
          Ajouter Réceptionniste
        </Button>
      </Box>
      <Snackbar
        open={alert.open}
        autoHideDuration={5000} 
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
            <TableCell sx={{ color: "black", backgroundColor: "#cdd7dfff" }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {receptionists.map((receptionist) => (
            <TableRow key={receptionist.id}>
              <TableCell>{receptionist.name}</TableCell>
              <TableCell>{receptionist.email}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDeleteReceptionist(receptionist.id)} sx={{ color: "#D32F2F" }}> {/* Couleur rouge pour la poubelle */}
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>Ajouter un Réceptionniste</DialogTitle>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Annuler</Button>
          <Button onClick={handleSaveReceptionist} variant="contained" color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}