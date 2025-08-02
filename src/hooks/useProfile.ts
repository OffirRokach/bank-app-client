import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  getUserProfileAPI,
  updateUserProfileAPI,
} from "../services/profileService";
import type { UserProfile, UserUpdatableFields } from "../types";
import { handleError } from "../helpers/errorHandler";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "../types";

export const useProfile = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Extract user ID from token
  const userId = token ? jwtDecode<JwtPayload>(token).userId : null;

  const fetchProfile = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getUserProfileAPI(userId);

      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.message || "Failed to fetch profile");
        handleError(null, {
          customMessage:
            response.message || "Failed to load profile information",
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch profile");
      handleError(err, { customMessage: "Failed to load profile information" });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateProfile = async (
    data: UserUpdatableFields
  ): Promise<{ success: boolean; message?: string }> => {
    if (!userId) return { success: false, message: "User ID not found" };

    setIsLoading(true);
    setError(null);

    try {
      const response = await updateUserProfileAPI(userId, data);
      if (response.success) {
        // If we have updated data, update the profile
        if (response.data) {
          setProfile((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              ...response.data,
            };
          });
        } else {
          // If password was updated, we need to refresh the profile
          await fetchProfile();
        }

        return {
          success: true,
          message: response.message || "Profile updated successfully",
        };
      } else {
        setError(response.message || "Failed to update profile");
        return {
          success: false,
          message: response.message || "Failed to update profile",
        };
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to update profile";
      setError(errorMessage);
      handleError(err, { customMessage: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId, fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refreshProfile: fetchProfile,
  };
};

export default useProfile;
