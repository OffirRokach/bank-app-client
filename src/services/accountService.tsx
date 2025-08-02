import axios from "axios";
import type { AccountResponse, ApiResponse } from "../types";
import { handleError } from "../helpers/errorHandler";

// Get all accounts for the current user
export const getAccountsAPI = async (suppressToast = false) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return {
        success: false,
        message: "Authentication token not found",
      };
    }

    const response = await axios.get<ApiResponse<AccountResponse[]>>(
      `${import.meta.env.VITE_NODEJS_URL}/api/v1/accounts`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    return handleError(error, {
      showToast: !suppressToast,
      customMessage: "Failed to fetch accounts",
    });
  }
};

// Get a specific account by ID
export const getAccountByIdAPI = async (accountId: string) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return {
        success: false,
        message: "Authentication token not found",
      };
    }

    const response = await axios.get<ApiResponse<AccountResponse>>(
      `${import.meta.env.VITE_NODEJS_URL}/api/v1/accounts/${accountId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    return handleError(error, {
      customMessage: "Failed to fetch account details",
    });
  }
};

// Create a new account
export const createAccountAPI = async (suppressToast = false) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return {
        success: false,
        message: "Authentication token not found",
      };
    }

    const response = await axios.post<ApiResponse<AccountResponse>>(
      `${import.meta.env.VITE_NODEJS_URL}/api/v1/accounts`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    return handleError(error, {
      showToast: !suppressToast,
      customMessage: "Failed to create account",
    });
  }
};

// Set an account as default
export const setDefaultAccountAPI = async (
  accountId: string,
  suppressToast = false
) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return {
        success: false,
        message: "Authentication token not found",
      };
    }

    const response = await axios.put<ApiResponse<AccountResponse>>(
      `${import.meta.env.VITE_NODEJS_URL}/api/v1/accounts/${accountId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    return handleError(error, {
      showToast: !suppressToast,
      customMessage: "Failed to update default account",
    });
  }
};
