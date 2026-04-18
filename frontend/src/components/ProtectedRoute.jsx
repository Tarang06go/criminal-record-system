import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../services/auth";

export default function ProtectedRoute() {
  const token = getToken();

  // ✅ safe check
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}