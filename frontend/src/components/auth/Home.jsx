import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import {
  Box,
  Typography,
  Button,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout"; 
import BackgroundImage from "../../assets/Home.jpg";

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUser(role ? { role } : null); 
  }, []); 

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null); 
    navigate("/"); 
  };

  return (
    <>
      {/* --- Navbar --- */}
      <AppBar
        position="fixed"
        sx={{
          width: "100%",
          ml: 0,
          backgroundColor: "rgba(21, 6, 160, 0.7)", 
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          height: "64px",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: "64px",
            px: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontWeight: "bold",
              fontSize: "1.2rem",
            }}
          >
            MedFlow
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {!user?.role && (
              <>
                <Button
                  component={Link}
                  to="/login"
                  sx={{
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                  }}
                >
                  Se connecter
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  sx={{
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                  }}
                >
                  S'inscrire
                </Button>
              </>
            )}
            {user?.role && (
              <>
                {user.role === "ADMIN" && (
                  <Button
                    component={Link}
                    to="/admin/dashboard"
                    sx={{
                      color: "white",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                    }}
                  >
                    Admin
                  </Button>
                )}
                {user.role === "MEDECIN" && (
                  <Button
                    component={Link}
                    to="/doctor/dashboard"
                    sx={{
                      color: "white",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                    }}
                  >
                    Médecin
                  </Button>
                )}

                {user.role === "RECEPTIONNISTE" && (
                  <Button
                    component={Link}
                    to="/receptionist/dashboard"
                    sx={{
                      color: "white",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                    }}
                  >
                    Réceptionniste
                  </Button>
                )}

                {user.role === "PATIENT" && (
                  <Button
                    component={Link}
                    to="/patient/dashboard"
                    sx={{
                      color: "white",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                    }}
                  >
                    Patient
                  </Button>
                )}
                <IconButton
                  color="inherit"
                  onClick={handleLogout}
                  sx={{ "&:hover": { color: "#f44336" }, p: 0.5 }}
                >
                  <LogoutIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      
      <CssBaseline />
      <Box
        sx={{
          width: "100vw",
          height: "100vh", 
          backgroundImage: `url(${BackgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed", 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          margin: 0,
          padding: 0,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))",
            zIndex: 1,
          },
        }}
      >
        {/* --- Bloc de texte --- */}
        <Box
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            maxWidth: "500px",
            width: "90%",
            boxShadow: 4,
            position: "relative",
            zIndex: 2,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "rgba(21, 6, 160, 0.7)",
              mb: 2,
              fontSize: "2.5rem",
            }}
          >
            Bienvenue sur MedFlow
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#374151",
              mb: 3,
              fontSize: "1rem",
              lineHeight: 1.6,
            }}
          >
            Une plateforme complète pour la gestion des patients, rendez-vous et
            facturation médicale.
          </Typography>
          {!user?.role && (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/login")}
                sx={{ borderRadius: 1, px: 2.5, py: 1, fontSize: "0.9rem" }}
              >
                Se connecter
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate("/register")}
                sx={{ borderRadius: 1, px: 2.5, py: 1, fontSize: "0.9rem" }}
              >
                S'inscrire
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}