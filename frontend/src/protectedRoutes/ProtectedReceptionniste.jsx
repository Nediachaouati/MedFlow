import React from "react";
import { ProtectedRoute } from "./ProtectedRoute";

const ProtectedReceptionniste = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={["RECEPTIONNISTE"]}>
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedReceptionniste;