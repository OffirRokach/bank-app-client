/**
 * ProtectedRoute component that checks for authentication
 * and redirects to login if not authenticated
 */
import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { isTokenValid } from "../../helpers/tokenValidator";
import { useAccountStore } from "../../store/accountStore";

const ProtectedRoute = () => {
  const token = localStorage.getItem("authToken");
  const isAuthenticated = isTokenValid(token);
  const { setCurrentAccount } = useAccountStore();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("ProtectedRoute: removing auth token and current account");
      localStorage.removeItem("authToken");
      setCurrentAccount(null);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    console.log("ProtectedRoute: not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
