import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ConsultationIframe() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [diagnostic, setDiagnostic] = useState("");
  const [medicaments, setMedicaments] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/appointments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointment(res.data);
      } catch (err) {
        setAlert({ type: "error", message: "Impossible de charger le RDV" });
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id, token]);

  const generatePDF = () => {
    if (!appointment) return;
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("fr-FR");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("ORDONNANCE MÉDICALE", 105, 25, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Docteur : Dr. ${appointment.medecin?.name || "Inconnu"}`, 20, 50);
    doc.text(`Patient : ${appointment.patient?.name || "Inconnu"}`, 20, 60);
    doc.text(`Date : ${today}`, 20, 70);

    doc.setFont("helvetica", "bold");
    doc.text("Diagnostic :", 20, 90);
    doc.setFont("helvetica", "normal");
    const diagText = diagnostic || "Aucun diagnostic précisé";
    doc.text(doc.splitTextToSize(diagText, 170), 20, 100);

    if (medicaments.trim()) {
      doc.setFont("helvetica", "bold");
      doc.text("Ordonnance :", 20, 140);
      const lines = medicaments.split("\n").filter(Boolean);
      let y = 150;
      lines.forEach(line => {
        doc.setFont("helvetica", "normal");
        doc.text("• " + line, 30, y);
        y += 8;
      });
    }

    doc.save(`ordonnance_${(appointment.patient?.name || "patient").replace(/\s+/g, "_")}_${today}.pdf`);
  };

  const handleSave = async () => {
    if (!diagnostic.trim() && !medicaments.trim()) {
      setAlert({ type: "warning", message: "Veuillez remplir au moins un champ" });
      return;
    }

    setSaving(true);
    setAlert(null);

    try {
      await axios.put(
        `http://localhost:3000/appointments/${id}/complete`,
        { diagnostic: diagnostic.trim(), medicaments: medicaments.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      generatePDF();
      setAlert({ type: "success", message: "Consultation terminée ! PDF généré." });

      setTimeout(() => {
        window.parent.postMessage("consultation-closed", "*");
      }, 2000);
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Erreur lors de la sauvegarde",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box minHeight="100vh" bgcolor="#f5f5f5" display="flex" alignItems="center" justifyContent="center" p={2}>
      <Box maxWidth="md" width="100%">
        <Paper elevation={20} sx={{ p: 6, borderRadius: 5 }}>
          <Typography variant="h4" fontWeight="bold" color="primary" align="center" gutterBottom>
            Consultation Médicale
          </Typography>

          <Typography variant="h6" color="text.secondary" align="center" gutterBottom>
            {appointment?.patient?.name} •{" "}
            {appointment?.date
              ? new Date(appointment.date + "T12:00:00").toLocaleDateString("fr-FR")
              : "Date inconnue"
            } à {appointment?.timeSlot?.startTime?.slice(0, 5) || "??:??"}
          </Typography>

          {alert && <Alert severity={alert.type} sx={{ mt: 3 }}>{alert.message}</Alert>}

          <TextField
            label="Diagnostic"
            multiline
            rows={6}
            fullWidth
            value={diagnostic}
            onChange={(e) => setDiagnostic(e.target.value)}
            variant="outlined"
            sx={{ mt: 4 }}
          />

          <TextField
            label="Ordonnance (un médicament par ligne)"
            multiline
            rows={10}
            fullWidth
            placeholder="Doliprane 1000mg\n1 comprimé toutes les 6h pendant 3 jours"
            value={medicaments}
            onChange={(e) => setMedicaments(e.target.value)}
            variant="outlined"
            sx={{ mt: 3 }}
          />

          <Box mt={6} display="flex" justifyContent="center" gap={3}>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleSave}
              disabled={saving}
              sx={{ px: 8, py: 2 }}
            >
              {saving ? "Sauvegarde..." : "Terminer & Générer PDF"}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => window.parent.postMessage("consultation-closed", "*")}
            >
              Fermer
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}