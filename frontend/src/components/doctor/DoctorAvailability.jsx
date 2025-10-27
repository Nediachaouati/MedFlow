import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit"; // Icône de modification
import axios from "axios";

export default function DoctorAvailability() {
  const [day, setDay] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("disponible"); // Statut par défaut
  const [availabilities, setAvailabilities] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [editOpen, setEditOpen] = useState(false); // Contrôle la modale d'édition
  const [selectedAvailability, setSelectedAvailability] = useState(null); // Disponibilité à modifier

  // Récupérer les disponibilités existantes
  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/availability", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailabilities(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des disponibilités :", error);
        setAlert({ open: true, message: "Erreur lors du chargement des disponibilités.", severity: "error" });
      }
    };
    fetchAvailabilities();
  }, []);

  const handleAddAvailability = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3000/availability/add",
        { day, date, startTime, endTime, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailabilities([...availabilities, response.data]);
      setAlert({ open: true, message: "Disponibilité ajoutée avec succès !", severity: "success" });
      setDay("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setStatus("disponible");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la disponibilité :", error.response ? error.response.data : error.message);
      setAlert({ open: true, message: "Erreur lors de l'ajout de la disponibilité.", severity: "error" });
    }
  };

  const handleDeleteAvailability = async (id) => {
    if (window.confirm("Voulez-vous supprimer cette disponibilité ?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3000/availability/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailabilities(availabilities.filter((avail) => avail.id !== id));
        setAlert({ open: true, message: "Disponibilité supprimée avec succès !", severity: "success" });
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        setAlert({ open: true, message: "Erreur lors de la suppression de la disponibilité.", severity: "error" });
      }
    }
  };

  const handleEditAvailability = (availability) => {
    setSelectedAvailability(availability);
    setDay(availability.day);
    setDate(availability.date);
    setStartTime(availability.startTime);
    setEndTime(availability.endTime);
    setStatus(availability.status);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Données envoyées au PUT :", { day, date, startTime, endTime, status }); // Log des données envoyées
      const response = await axios.put(
        `http://localhost:3000/availability/${selectedAvailability.id}`,
        { day, date, startTime, endTime, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Réponse du PUT :", response.data); // Log de la réponse
      const refreshResponse = await axios.get("http://localhost:3000/availability", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Données rechargées :", refreshResponse.data); // Log des données rechargées
      setAvailabilities(refreshResponse.data);
      setAlert({ open: true, message: "Disponibilité modifiée avec succès !", severity: "success" });
      setEditOpen(false);
      setSelectedAvailability(null);
      setDay("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setStatus("disponible");
    } catch (error) {
      console.error("Erreur lors de la modification :", error.response ? error.response.data : error.message);
      setAlert({ open: true, message: "Erreur lors de la modification de la disponibilité.", severity: "error" });
    }
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedAvailability(null);
    setDay("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setStatus("disponible");
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: "white",
          maxWidth: 800,
          mx: "auto",
          width: "100%",
        }}
      >
        <Typography variant="h5" sx={{ mb: 3 }}>
          Configurer vos Horaires de Disponibilité
        </Typography>
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth>
                <InputLabel>Jour</InputLabel>
                <Select value={day} onChange={(e) => setDay(e.target.value)} label="Jour">
                  <MenuItem value="Lundi">Lundi</MenuItem>
                  <MenuItem value="Mardi">Mardi</MenuItem>
                  <MenuItem value="Mercredi">Mercredi</MenuItem>
                  <MenuItem value="Jeudi">Jeudi</MenuItem>
                  <MenuItem value="Vendredi">Vendredi</MenuItem>
                  <MenuItem value="Samedi">Samedi</MenuItem>
                  <MenuItem value="Dimanche">Dimanche</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                label="Heure de début"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                label="Heure de fin"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Statut">
                  <MenuItem value="disponible">Disponible</MenuItem>
                  <MenuItem value="occupé">Occupé</MenuItem>
                  <MenuItem value="annulé">Annulé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Button variant="contained" color="primary" onClick={handleAddAvailability} sx={{ mt: 2 }}>
            Ajouter
          </Button>
        </Box>
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Vos Disponibilités
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Jour</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Heure de début</TableCell>
              <TableCell>Heure de fin</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availabilities.map((avail) => (
              <TableRow key={avail.id}>
                <TableCell>{avail.day}</TableCell>
                <TableCell>{avail.date}</TableCell>
                <TableCell>{avail.startTime}</TableCell>
                <TableCell>{avail.endTime}</TableCell>
                <TableCell>{avail.status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditAvailability(avail)} sx={{ color: "#1976d2", mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteAvailability(avail.id)} sx={{ color: "#D32F2F" }}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Snackbar open={alert.open} autoHideDuration={5000} onClose={handleCloseAlert}>
          <Alert severity={alert.severity}>{alert.message}</Alert>
        </Snackbar>

        {/* Modale d'édition */}
        <Dialog open={editOpen} onClose={handleCloseEdit}>
          <DialogTitle>Modifier la Disponibilité</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Jour</InputLabel>
                  <Select value={day} onChange={(e) => setDay(e.target.value)} label="Jour">
                    <MenuItem value="Lundi">Lundi</MenuItem>
                    <MenuItem value="Mardi">Mardi</MenuItem>
                    <MenuItem value="Mercredi">Mercredi</MenuItem>
                    <MenuItem value="Jeudi">Jeudi</MenuItem>
                    <MenuItem value="Vendredi">Vendredi</MenuItem>
                    <MenuItem value="Samedi">Samedi</MenuItem>
                    <MenuItem value="Dimanche">Dimanche</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Heure de début"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Heure de fin"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Statut">
                    <MenuItem value="disponible">Disponible</MenuItem>
                    <MenuItem value="occupé">Occupé</MenuItem>
                    <MenuItem value="annulé">Annulé</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEdit} color="secondary">
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} variant="contained" color="primary">
              Sauvegarder
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}