import axios from "axios";
import { handleError } from "../helpers/errorHandler";
import type {
  ApiResponse,
  LoginResponse,
  SignupFormData,
} from "../types/index";

const api = "/api";

export const loginAPI = async (
  email: string,
  password: string
): Promise<ApiResponse<LoginResponse>> => {
  try {
    const apiUrl = `${import.meta.env.VITE_NODEJS_URL}${api}/auth/login`;
    console.log('Login API URL:', apiUrl);
    console.log('Raw VITE_NODEJS_URL:', import.meta.env.VITE_NODEJS_URL);
    
    const axiosResponse = await axios.post<ApiResponse<LoginResponse>>(
      apiUrl,
      {
        email: email,
        password: password,
      }
    );
    return axiosResponse.data;
  } catch (error) {
    return handleError<LoginResponse>(error, {
      customMessage: "Login failed",
      showToast: false,
      redirectOnAuth: false,
    }) as ApiResponse<LoginResponse>;
  }
};

export const signupAPI = async (
  formData: SignupFormData
): Promise<ApiResponse<Omit<SignupFormData, "password">>> => {
  try {
    const axiosResponse = await axios.post<
      ApiResponse<Omit<SignupFormData, "password">>
    >(`${import.meta.env.VITE_NODEJS_URL}${api}/auth/signup`, {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      birthDate: formData.birthDate,
    });
    return axiosResponse.data;
  } catch (error) {
    return handleError<Omit<SignupFormData, "password">>(error, {
      customMessage: "Sign up failed",
      showToast: false,
      redirectOnAuth: false,
    }) as ApiResponse<Omit<SignupFormData, "password">>;
  }
};

/**
 * Verify account with token
 * @param token - Verification token from email
 * @returns API response with success/error message
 */
export const verifyAccountAPI = async (
  token: string
): Promise<ApiResponse<null>> => {
  try {
    const axiosResponse = await axios.get<ApiResponse<null>>(
      `${import.meta.env.VITE_NODEJS_URL}${api}/auth/verify-account?token=${token}`
    );
    return axiosResponse.data;
  } catch (error) {
    return handleError<null>(error, {
      customMessage: "Account verification failed",
      showToast: false,
      redirectOnAuth: false,
    }) as ApiResponse<null>;
  }
};
