import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ role, children, showSidebar = true }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", m: 0, p: 0 }}>
      {showSidebar && <Sidebar role={role} />}

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: showSidebar ? "calc(100% - 240px)" : "100%",
          m: 0,
          p: 0,
        }}
      >
        {showSidebar && <Navbar role={role} />} {/* Rendu conditionnel de Navbar */}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: "#f5f5f5",
            m: 0,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}