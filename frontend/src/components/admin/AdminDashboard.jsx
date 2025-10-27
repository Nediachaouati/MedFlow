import { Typography, Container } from "@mui/material";

export default function AdminDashboard() {
  return (
    <Container sx={{ mt: 4, mb: 4, p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1e40af" }}>
        Dashboard Admin
      </Typography>
      {/* Ajoutez ici vos widgets ou données spécifiques */}
    </Container>
  );
}