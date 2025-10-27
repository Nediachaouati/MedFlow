import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";

export default function Sidebar({ role }) {
  return (
    <Drawer
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          backgroundColor: "#4A90E2",
          color: "white",
          display: "flex",
          flexDirection: "column",
          borderRight: "none",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ p: 2, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
        <Typography
          variant="h6"
          component={Link}
          to="/" // Forcer le lien vers la page d'accueil
          sx={{
            color: "white",
            fontWeight: "bold",
            textDecoration: "none",
            "&:hover": { color: "#bbdefb" },
          }}
        >
          MedFlow
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <List>
          {role === "ADMIN" && (
            <>
              <ListItem button component={Link} to="/admin/dashboard">
                <ListItemIcon sx={{ color: "white" }}>
                  <svg width="24" height="24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem button component={Link} to="/admin/doctors">
                <ListItemIcon sx={{ color: "white" }}>
                  <svg width="24" height="24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </ListItemIcon>
                <ListItemText primary="Médecins" />
              </ListItem>
              <ListItem button component={Link} to="/admin/receptionists">
                <ListItemIcon sx={{ color: "white" }}>
                  <svg width="24" height="24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </ListItemIcon>
                <ListItemText primary="Réceptionnistes" />
              </ListItem>
              <ListItem button component={Link} to="/admin/appointments">
                <ListItemIcon sx={{ color: "white" }}>
                  <svg width="24" height="24" fill="white">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-4-4h-4v-2h4v2zm0-4h-4v-2h4v2zm-4-6h4v2h-4z"/>
                  </svg>
                </ListItemIcon>
                <ListItemText primary="Rendez-vous" />
              </ListItem>
            </>
          )}
          
          {role === "PATIENT" && (
            <ListItem button component={Link} to="/profile">
              <ListItemIcon sx={{ color: "white" }}>
                <svg width="24" height="24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </ListItemIcon>
              <ListItemText primary="Mon Profil" />
            </ListItem>
          )}

          {role === "MEDECIN" && (
            <>
              <ListItem button component={Link} to="/doctor/dashboard">
                <ListItemIcon sx={{ color: "white" }}>
                  <svg width="24" height="24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem button component={Link} to="/doctor/availability">
                <ListItemIcon sx={{ color: "white" }}>
                  <svg width="24" height="24" fill="white">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-4-4h-4v-2h4v2zm0-4h-4v-2h4v2zm-4-6h4v2h-4z"/>
                  </svg>
                </ListItemIcon>
                <ListItemText primary="Disponibilité" />
              </ListItem>
            </>
          )}
        

        </List>
      </Box>
    </Drawer>
  );
}