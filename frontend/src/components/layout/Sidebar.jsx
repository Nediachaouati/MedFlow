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

// ICÔNES SVG
const DashboardIcon = () => (
  <svg width="24" height="24" fill="white">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);

const DoctorIcon = () => (
  <svg width="24" height="24" fill="white">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
  </svg>
);

const ReceptionistIcon = () => (
  <svg width="24" height="24" fill="white">
    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h14v14z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" fill="white">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
  </svg>
);

const ProfileIcon = () => (
  <svg width="24" height="24" fill="white">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </svg>
);

// AJOUT DE L'ICÔNE PATIENTS
const PatientsIcon = () => (
  <svg width="24" height="24" fill="white">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.93 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

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
            <>
            <ListItem button component={Link} to="/patient/dashboard">
           <ListItemIcon sx={{ color: "white" }}>
                  <DashboardIcon/>
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>

               <ListItem button component={Link} to="/patient/rendezvous">
           <ListItemIcon sx={{ color: "white" }}>
                  <DashboardIcon/>
                </ListItemIcon>
                <ListItemText primary="Rendez-vous" />
              </ListItem>
           </>
          )}

           {role === "RECEPTIONNISTE" && (
            <>
              <ListItem button component={Link} to="/receptionist/dashboard">
                <ListItemIcon sx={{ color: "white" }}>
                  <DashboardIcon/>
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem button component={Link} to="/receptionist/patients">
                <ListItemIcon sx={{ color: "white" }}>
                  <PatientsIcon />
                </ListItemIcon>
                <ListItemText primary="Patients" />
              </ListItem>
            </>
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