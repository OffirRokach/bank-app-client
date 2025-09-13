/**
 * ProtectedRoute component that checks for authentication
 * and redirects to login if not authenticated
 */
import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { isTokenValid } from "../../helpers/tokenValidator";
import { useAccountStore } from "../../store/accountStore";
import { useSocket } from "../../hooks/useSocket";

const ProtectedRoute = () => {
  const token = localStorage.getItem("authToken");
  const isAuthenticated = isTokenValid(token);
  const { setCurrentAccount } = useAccountStore();
  const { connect } = useSocket();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("ProtectedRoute: removing auth token and current account");
      localStorage.removeItem("authToken");
      setCurrentAccount(null);
    } else {
      // Initialize socket connection when authenticated
      console.log("ProtectedRoute: initializing socket connection");
      connect();
    }
  }, [isAuthenticated, connect]);

  if (!isAuthenticated) {
    console.log("ProtectedRoute: not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
