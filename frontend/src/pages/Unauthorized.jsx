import React from "react";
import Img from "../assets/403.jpg";

export default function Unauthorized() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      padding: 20,
    }}>
      <h2 style={{ color: "#d32f2f", marginBottom: 20 }}>
        Accès refusé
      </h2>
      <h4>Vous n'avez pas les droits pour accéder à cette page</h4>
      <img src={Img} alt="Accès interdit" style={{ maxWidth: "500px", marginTop: 30 }} />
    </div>
  );
}