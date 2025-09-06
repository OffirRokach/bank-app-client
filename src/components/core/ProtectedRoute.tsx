/**
 * ProtectedRoute component that checks for authentication
 * and redirects to login if not authenticated
 */
import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { isTokenValid } from "../../helpers/tokenValidator";

const ProtectedRoute = () => {
  const token = localStorage.getItem("authToken");
  const isAuthenticated = isTokenValid(token);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem("authToken");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
