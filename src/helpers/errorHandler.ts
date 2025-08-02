import axios from "axios";
import { toast } from "react-toastify";

/**
 * Simple error handler for API errors
 * @param error Any error object
 * @param options Configuration options
 * @returns Formatted error object compatible with API response format
 */
export const handleError = <T = any>(
  error: any,
  options: {
    showToast?: boolean;
    customMessage?: string;
    redirectOnAuth?: boolean;
    defaultData?: T;
  } = {}
): { success: false; message: string; data: T | null; error?: any } => {
  const {
    showToast = true,
    customMessage,
    redirectOnAuth = true,
    defaultData = null,
  } = options;
  let message = customMessage || "An unexpected error occurred";

  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const response = error.response;

    // Handle authentication errors
    if (response?.status === 401 && redirectOnAuth) {
      if (showToast) toast.warning("Unauthorized. Please log in again.");
      localStorage.removeItem("authToken");
      window.location.href = "/login";
      return {
        success: false,
        message: "Unauthorized. Please log in again.",
        data: defaultData as T | null,
      };
    }

    // Extract error message from response
    if (response?.data) {
      if (typeof response.data === "string") {
        message = response.data;
      } else if (response.data.message) {
        message = response.data.message;
      } else if (Array.isArray(response.data.errors)) {
        message = response.data.errors
          .map((e: any) => e.description)
          .join(", ");
      } else if (typeof response.data.errors === "object") {
        message = Object.values(response.data.errors).flat().join(", ");
      }
    } else if (!response) {
      message = "Network error or no response from server";
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  // Show toast notification if requested
  if (showToast) {
    toast.error(message);
  }

  // Log error for debugging


  return {
    success: false,
    message,
    data: defaultData as T | null,
    error: process.env.NODE_ENV !== "production" ? error : undefined,
  };
};

/**
 * Show success toast message
 * @param message Success message to display
 */
export const showSuccess = (message: string) => {
  toast.success(message);
};
