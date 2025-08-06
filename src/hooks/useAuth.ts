import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import type { AccessToken, JwtPayload } from "../types";
import { handleError } from "../helpers/errorHandler";
import { useNavigate } from "react-router-dom";
import { useAccountStore } from "../store/accountStore";
import { connectSocket, disconnectSocket } from "./useSocket";

export const useAuth = () => {
  const navigate = useNavigate();
  const { currentAccount, setCurrentAccount, getDefaultAccount } =
    useAccountStore();

  const [token, setToken] = useState<AccessToken | null>(() => {
    const stored = localStorage.getItem("authToken");
    return stored || null;
  });

  const firstName = useMemo(() => {
    if (token) {
      try {
        return jwtDecode<JwtPayload>(token).firstName;
      } catch (err) {
        return null;
      }
    }
    return null;
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
      connectSocket();
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  const login = async (authToken: AccessToken) => {
    // Set token first
    setToken(authToken);
    localStorage.setItem("authToken", authToken);

    try {
      const defaultAccount = await getDefaultAccount();
      if (!defaultAccount) {
        // Handle case when no default account is found
      }
      setCurrentAccount(defaultAccount);
    } catch (error) {
      handleError(error, {
        customMessage: "Error fetching default account",
        redirectOnAuth: false,
      });
    }
  };

  const logout = () => {
    disconnectSocket();
    setCurrentAccount(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentAccountId"); // Also clear the saved account ID
    navigate("/login");
  };

  return {
    token,
    firstName,
    account: currentAccount,
    login,
    logout,
  };
};
