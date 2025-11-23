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
    localStorage.removeItem("role");
    navigate("/");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    if (!token) return;

    setRole(savedRole);

    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(res.data.name);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: "calc(100% - 240px)",
        ml: "240px",
        backgroundColor: "#4A90E2",
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
          MedFlow
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

          {role && userName && (
            <>
              <Button
                component={Link}
                to="/profile"
                sx={{
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                }}
              >
                {userName}
              </Button>
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
