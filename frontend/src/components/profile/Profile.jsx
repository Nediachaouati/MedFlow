import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Divider,
  Grid,
  CircularProgress,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:3000/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  if (!user)
    return (
      <Typography sx={{ p: 3, textAlign: "center" }}>
        Impossible de charger les informations utilisateur.
      </Typography>
    );

  return (
    <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 700,
          borderRadius: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, mr: 2 }}>
            <AccountCircleIcon sx={{ fontSize: 50 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {user.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {user.role}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* User Info */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{user.email}</Typography>
          </Grid>
          {user.phoneNumber && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Téléphone
              </Typography>
              <Typography variant="body1">{user.phoneNumber}</Typography>
            </Grid>
          )}
          {user.address && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Adresse
              </Typography>
              <Typography variant="body1">{user.address}</Typography>
            </Grid>
          )}
          {user.speciality && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Spécialité
              </Typography>
              <Typography variant="body1">{user.speciality}</Typography>
            </Grid>
          )}
          {user.birthDate && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Date de naissance
              </Typography>
              <Typography variant="body1">{user.birthDate}</Typography>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
          © 2025 Mon Application. Tous droits réservés.
        </Typography>
      </Paper>
    </Box>
  );
}
