import axios from "axios";
import type { TransactionResponse } from "../types";
import type { ApiResponse } from "../types";
import { handleError } from "../helpers/errorHandler";

const api = "/api/v1";

/**
 * Fetch transactions for a specific account
 * @param accountId The account ID to fetch transactions for
 * @returns Array of transactions or null if an error occurred
 */
export const getTransactionsByAccountAPI = async (
  accountId: string
): Promise<ApiResponse<TransactionResponse[] | null>> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return {
        success: false,
        message: "Authentication token not found",
      };
    }

    const response = await axios.get(
      `${import.meta.env.VITE_NODEJS_URL}${api}/transactions?accountId=${accountId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.data;
    return {
      success: true,
      message: "", // Empty message to avoid showing success toast
      data: data.data.transactions,
    };
  } catch (error) {
    return handleError<TransactionResponse[] | null>(error, {
      customMessage: "Failed to fetch transactions",
      defaultData: null,
    }) as ApiResponse<TransactionResponse[] | null>;
  }
};

/**
 * Create a new transaction (transfer money)
 * @param fromAccountId Source account ID
 * @param toAccountNumber Destination account number
 * @param amount Amount to transfer
 * @param description Optional description for the transaction
 * @returns True if successful, false otherwise
 */
export const createTransactionAPI = async (
  fromAccountId: string,
  toAccountNumber: string,
  amount: number,
  description?: string
): Promise<ApiResponse<TransactionResponse>> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return {
        success: false,
        message: "Authentication token not found",
      };
    }

    const response = await axios.post(
      `${import.meta.env.VITE_NODEJS_URL}${api}/transactions`,
      {
        accountId: fromAccountId,
        recipientAccountNumber: toAccountNumber,
        amount,
        description,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    return handleError<TransactionResponse>(error, {
      customMessage: "Failed to create transaction",
      defaultData: undefined,
    }) as ApiResponse<TransactionResponse>;
  }
};
