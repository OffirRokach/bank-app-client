/**
 * ProtectedRoute component that checks for authentication
 * and redirects to login if not authenticated
 */
import { Navigate, Outlet } from "react-router-dom";
import { isTokenValid } from "../../helpers/tokenValidator";

const ProtectedRoute = () => {
  const token = localStorage.getItem("authToken");
  const isAuthenticated = isTokenValid(token);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
