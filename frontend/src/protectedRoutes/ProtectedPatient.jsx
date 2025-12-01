import React from "react";
import { ProtectedRoute } from "./ProtectedRoute";

const ProtectedPatient = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={["PATIENT"]}>
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedPatient;