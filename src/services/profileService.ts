import axios from "axios";
import type { ApiResponse, UserProfile, UserUpdatableFields } from "../types";
import { handleError } from "../helpers/errorHandler";

const api = "/api/v1";

export const getUserProfileAPI = async (
  userId: string
): Promise<ApiResponse<UserProfile>> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return {
        success: false,
        message: "Authentication token not found",
      };
    }

    const response = await axios.get(`${import.meta.env.VITE_NODEJS_URL}${api}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return handleError<UserProfile>(error, {
      customMessage: "Error fetching user profile",
    }) as ApiResponse<UserProfile>;
  }
};

export const updateUserProfileAPI = async (
  userId: string,
  profileData: UserUpdatableFields
): Promise<ApiResponse<UserProfile>> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return {
        success: false,
        message: "Authentication token not found",
      };
    }

    const response = await axios.put(
      `${import.meta.env.VITE_NODEJS_URL}${api}/users/${userId}`,
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return handleError<UserProfile>(error, {
      customMessage: "Error updating user profile",
    }) as ApiResponse<UserProfile>;
  }
};
