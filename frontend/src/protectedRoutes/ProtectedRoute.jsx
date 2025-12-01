import React from "react";
import { Navigate } from "react-router-dom";

// Récupère les données user 
const getUser = () => {
  const data = localStorage.getItem("userData");
  return data ? JSON.parse(data) : null;
};

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};