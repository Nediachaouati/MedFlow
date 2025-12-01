import React from "react";
import { ProtectedRoute } from "./ProtectedRoute";

const ProtectedMedecin = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={["MEDECIN"]}>
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedMedecin;