// src/components/patient/MyAppointments.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Alert,
  Button,
  Divider,
  CircularProgress,
  Chip,
} from "@mui/material";
import { ReceiptLong } from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from "jspdf";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:3000/appointments/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = res.data.sort(
        (a, b) =>
          new Date(`${b.date}T${b.timeSlot.startTime}`) -
          new Date(`${a.date}T${a.timeSlot.startTime}`)
      );
      setAppointments(sorted);
    } catch (err) {
      console.error("Erreur chargement RDV :", err);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) return;

    try {
      await axios.put(
        `http://localhost:3000/appointments/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Rendez-vous annulé avec succès !");
      fetchAppointments();
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'annulation";
      alert(msg);
    }
  };

  const downloadOrdonnance = (apt) => {
    const doc = new jsPDF();
    const consultDate = format(new Date(apt.date), "dd/MM/yyyy");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ORDONNANCE MÉDICALE", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Docteur : Dr. ${apt.medecin.name}`, 20, 40);
    doc.text(`Patient : ${apt.patient.name}`, 20, 50);
    doc.text(`Date de consultation : ${consultDate}`, 20, 60);

    if (apt.diagnostic) {
      doc.setFont("helvetica", "bold");
      doc.text("Diagnostic :", 20, 80);
      doc.setFont("helvetica", "normal");
      doc.text(doc.splitTextToSize(apt.diagnostic, 170), 20, 90);
    }

    if (apt.medicaments) {
      let y = apt.diagnostic ? 120 : 100;
      doc.setFont("helvetica", "bold");
      doc.text("Ordonnance :", 20, y);
      y += 10;
      apt.medicaments.split("\n").filter(Boolean).forEach((line) => {
        doc.setFont("helvetica", "normal");
        doc.text("• " + line.trim(), 30, y);
        y += 8;
      });
    }

    doc.save(
      `ordonnance_${apt.patient.name.replace(/\s+/g, "_")}_${consultDate}.pdf`
    );
  };

const downloadBill = async (apt) => {
  try {
    // Get the bill using the appointment id
    const res = await axios.get(
      `http://localhost:3000/bill/appointment/${apt.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const bill = res.data;

    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("FACTURE MÉDICALE", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Use frontend appointment data to show names
    doc.text(`Patient : ${apt.patient.name}`, 20, 40);
    doc.text(`Docteur : Dr. ${apt.medecin.name}`, 20, 50);
    doc.text(`Date de consultation : ${format(new Date(apt.date), "dd/MM/yyyy")}`, 20, 60);

    doc.text(`Bill ID : ${bill.id}`, 20, 70);
    doc.text(`Montant total : ${bill.amount} DT`, 20, 80);
    doc.text(`Status : ${bill.status}`, 20, 90);

    doc.save(`facture_${apt.patient.name.replace(/\s+/g, "_")}_${format(new Date(apt.date), "ddMMyyyy")}.pdf`);
  } catch (err) {
    console.error("Erreur téléchargement facture :", err);
    alert("Erreur téléchargement facture");
  }
};


  useEffect(() => {
    fetchAppointments();
  }, []);

  const now = new Date();
  const todayDateOnly = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const parseDateTime = (dateStr, timeStr) => {
    const [y, m, d] = dateStr.split("-");
    const [h, min] = timeStr.split(":");
    return new Date(y, m - 1, d, h, min);
  };

  const upcoming = appointments.filter((apt) => {
    const aptDate = parseDateTime(apt.date, apt.timeSlot.startTime);
    return apt.status !== "annulé" && apt.status !== "terminé" && aptDate >= todayDateOnly;
  });

  const completed = appointments.filter((apt) => apt.status === "terminé");
  const cancelledOrPast = appointments.filter(
    (apt) =>
      apt.status === "annulé" ||
      (apt.status !== "terminé" &&
        parseDateTime(apt.date, apt.timeSlot.startTime) < todayDateOnly)
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Paper
      elevation={6}
      sx={{ p: 5, maxWidth: 1100, mx: "auto", borderRadius: 4, mt: 4 }}
    >
      <Typography
        variant="h4"
        gutterBottom
        fontWeight="bold"
        color="primary"
        textAlign="center"
      >
        Mes Rendez-vous
      </Typography>

      {/* À VENIR */}
      <Typography
        variant="h5"
        sx={{ mb: 3, color: "#2e7d32", fontWeight: "bold" }}
      >
        À venir ({upcoming.length})
      </Typography>

      {upcoming.length === 0 ? (
        <Alert severity="info">Aucun rendez-vous à venir</Alert>
      ) : (
        upcoming.map((apt) => {
          const aptDate = parseDateTime(apt.date, apt.timeSlot.startTime);
          const isToday = aptDate.toDateString() === now.toDateString();
          const hoursUntil = (aptDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          const canCancel = hoursUntil >= 24;

          return (
            <Paper
              key={apt.id}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                bgcolor: "#f9fff9",
                border: "2px solid #81c784",
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Dr. {apt.medecin.name}
                  </Typography>
                  <Typography>
                    {format(aptDate, "EEEE d MMMM yyyy", { locale: fr })} à{" "}
                    {apt.timeSlot.startTime.slice(0, 5)}
                    {isToday && (
                      <Chip label="AUJOURD'HUI" color="primary" size="small" sx={{ ml: 1 }} />
                    )}
                  </Typography>
                  <Chip label="Confirmé" color="success" size="small" />
                </Box>

                {canCancel ? (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => cancelAppointment(apt.id)}
                  >
                    Annuler
                  </Button>
                ) : (
                  <Typography color="error" fontWeight="bold">
                    Annulation impossible (moins de 24h)
                  </Typography>
                )}
              </Box>
            </Paper>
          );
        })
      )}

      <Divider sx={{ my: 5 }} />

      {/* HISTORIQUE */}
      <Typography
        variant="h5"
        sx={{ mb: 3, color: "#1976d2", fontWeight: "bold" }}
      >
        Historique ({completed.length + cancelledOrPast.length})
      </Typography>

      {completed.length + cancelledOrPast.length === 0 ? (
        <Alert severity="info">Aucun rendez-vous dans l'historique</Alert>
      ) : (
        <>
          {/* Terminés avec ordonnance */}
          {completed.map((apt) => {
            const aptDate = parseDateTime(apt.date, apt.timeSlot.startTime);

            return (
              <Paper
                key={apt.id}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: "#e3f2fd",
                  border: "2px solid #2196f3",
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Dr. {apt.medecin.name}
                    </Typography>
                    <Typography>
                      {format(aptDate, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </Typography>
                    <Chip label="Terminé" color="success" sx={{ mt: 1 }} />
                    {apt.diagnostic && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Diagnostic : {apt.diagnostic.substring(0, 80)}...
                      </Typography>
                    )}
                  </Box>
              
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => downloadOrdonnance(apt)}
                    >
                      Télécharger Ordonnance
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<ReceiptLong />}
                      sx={{ ml: 2 }}
                      onClick={() => downloadBill(apt)}
                    >
                      Facture
                    </Button>
                  </Box>
                
              </Paper>
            );
          })}

          {/* Annulés ou passés sans consultation */}
          {cancelledOrPast.map((apt) => {
            const aptDate = parseDateTime(apt.date, apt.timeSlot.startTime);

            return (
              <Paper
                key={apt.id}
                sx={{ p: 3, mb: 2, bgcolor: "#ffebee", opacity: 0.8, borderRadius: 3 }}
              >
                <Typography variant="h6">Dr. {apt.medecin.name}</Typography>
                <Typography>
                  {format(aptDate, "EEEE d MMMM yyyy", { locale: fr })} à{" "}
                  {apt.timeSlot.startTime.slice(0, 5)}
                </Typography>
                <Chip
                  label={apt.status === "annulé" ? "Annulé" : "Passé sans consultation"}
                  color="error"
                />
              </Paper>
            );
          })}
        </>
      )}
    </Paper>
  );
}
