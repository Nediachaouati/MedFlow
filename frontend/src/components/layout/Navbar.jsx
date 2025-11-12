import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Navbar({ role }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: "calc(100% - 240px)",
        ml: "240px",
        backgroundColor: "#4A90E2", // Couleur uniforme pour tous les rôles avec Sidebar
        boxShadow: "none",
        height: "64px",
        justifyContent: "center",
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
          component={Link}
          to="/"
          sx={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold",
            "&:hover": { color: "#bbdefb" },
            fontSize: "1.2rem",
          }}
        >
          
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {!role && (
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

          {role && (
            <>
              {role === "ADMIN" && (
                <Button
                  component={Link}
                  to="/admin"
                  sx={{
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                  }}
                >
                  Admin
                </Button>
              )}
              {role === "MEDECIN" && (
                <Button
                  component={Link}
                  to="/doctor"
                  sx={{
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                  }}
                >
                  Médecin
                </Button>
              )}
              {role === "RECEPTIONNISTE" && (
                <Button
                  component={Link}
                   to="/receptionist"
                   sx={{
                    color: "white",
                   "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                    }}
                  >
                   Réceptionniste
                   </Button>
                )}
                {role === "PATIENT" && (
                <Button
                  component={Link}
                   to="/patient"
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
  );
}