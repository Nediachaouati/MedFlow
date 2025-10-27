import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  CssBaseline,
  Avatar,
  Grid,
  Paper,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BackgroundImage from "../../assets/clinique.jpg"; // Chemin ajusté

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role || ""); // Supposons que le rôle est retourné par l'API
      if (res.data.role === "ADMIN") {
        navigate("/admin");
      } else if (res.data.role === "MEDECIN") {
        navigate("/doctor/dashboard"); // Redirection vers le dashboard du médecin
      }else {
        navigate("/"); // Redirection par défaut vers /home pour d'autres rôles
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion");
    }
  };

  return (
    <Container disableGutters maxWidth={false}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `url(${BackgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))",
            zIndex: 1,
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            position: "absolute",
            top: "20px",
            left: "20px",
            color: "white",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            cursor: "pointer",
            zIndex: 10,
          }}
          onClick={() => navigate("/")}
        >
          MedFlow
        </Typography>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            borderRadius: 2,
            maxWidth: "900px",
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            zIndex: 2,
          }}
        >
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              height: { xs: "200px", md: "100%" },
              backgroundImage: `url(${BackgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: { xs: "8px 8px 0 0", md: "8px 0 0 8px" },
            }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 3,
              width: { xs: "100%", md: "50%" },
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Connexion à MedFlow
            </Typography>
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: "100%" }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                sx={{ p: 1, py: 1.5, fontSize: "0.9rem", "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mot de passe"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                sx={{ p: 1, py: 1.5, fontSize: "0.9rem", "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                Se connecter
              </Button>
              <Grid container>
                <Grid item>
                  <a href="/register" style={{ color: "#1976d2" }}>
                    Pas de compte ? S'inscrire
                  </a>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}