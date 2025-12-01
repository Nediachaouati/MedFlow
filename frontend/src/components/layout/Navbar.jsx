
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import axios from "axios";

export default function Navbar() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData"); 
    localStorage.removeItem("role");
    window.location.replace("/login"); 
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setRole("");
      setUserName("");
      return;
    }

    
    try {
      const userData = localStorage.getItem("userData");
      if (userData && userData !== "undefined") {
        const user = JSON.parse(userData);
        setRole(user.role || "");
      }
    } catch (err) {
      console.error("Erreur parsing userData", err);
    }

    
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(res.data.name || "Utilisateur");
      } catch (err) {
        console.error("Erreur récupération profil :", err);
        
        if (err.response?.status === 401) {
          handleLogout();
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: "100%", md: "calc(100% - 240px)" },
        ml: { md: "240px" },
        backgroundColor: "#4A90E2",
        boxShadow: "none",
        height: "64px",
        justifyContent: "center",
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", minHeight: "64px", px: 2 }}>
        
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "1.4rem",
          }}
        >
          
        </Typography>

        
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {!role ? (
            <>
              <Button
                component={Link}
                to="/login"
                sx={{
                  color: "white",
                  fontWeight: "500",
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
                  fontWeight: "500",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                }}
              >
                S'inscrire
              </Button>
            </>
          ) : (
            <>
              <Button
                component={Link}
                to="/profile"
                sx={{
                  color: "white",
                  fontWeight: "600",
                  textTransform: "none",
                  fontSize: "1.1rem",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                }}
              >
                {userName || "Chargement..."}
              </Button>
              <IconButton
                onClick={handleLogout}
                sx={{
                  color: "white",
                  "&:hover": { color: "#f44336", bgcolor: "rgba(255,0,0,0.1)" },
                  borderRadius: 2,
                }}
              >
                <LogoutIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}