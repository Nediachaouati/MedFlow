import React from "react";
import { ProtectedRoute } from "./ProtectedRoute";

export const ProtectedAdmin = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedAdmin;