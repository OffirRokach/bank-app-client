import { useState, useEffect, useCallback } from "react";
import { getTransactionsByAccountAPI } from "../services/TransactionService";
import type { TransactionResponse } from "../types";
import { handleError } from "../helpers/errorHandler";
import { useAccountStore } from "../store/accountStore";

// This hook handles fetching and managing transactions for an account

export const useTransactions = (accountId?: string) => {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the current account from the store as a fallback
  const { currentAccount } = useAccountStore();

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get accountId from props or from the store
      let effectiveAccountId = accountId || currentAccount?.id;

      if (effectiveAccountId) {
        // Fetch transactions for a specific account
        const response = await getTransactionsByAccountAPI(effectiveAccountId);



        if (response.success && response.data) {
          // The API returns transactions nested inside the data object
          // Handle both possible structures for backward compatibility
          let transactionsData: TransactionResponse[] = [];

          // Check if response.data has a transactions property (new API structure)
          if (
            response.data &&
            typeof response.data === "object" &&
            "transactions" in response.data
          ) {
            // New structure: data contains a transactions array

            // Safely access the transactions array
            const transactions = response.data.transactions;
            if (Array.isArray(transactions)) {
              transactionsData = transactions;
            }
          } else if (Array.isArray(response.data)) {
            // Old structure: data itself is the array

            transactionsData = response.data;
          }


          setTransactions(transactionsData);
        } else {

          setTransactions([]);
          if (response.message) {
            handleError(null, { customMessage: response.message });
          }
        }
      } else {
        // During page refresh, we don't want to show an error while the account is being loaded
        const isInitialPageLoad = document.readyState !== "complete";
        const authToken = localStorage.getItem("authToken");
        
        if (!isInitialPageLoad) {
          if (!authToken) {
            // No auth token means user is not logged in, redirect to login

            window.location.href = "/login";
          } else {
            // Auth token exists but no account ID - this is a server logic error

            handleError(null, { 
              customMessage: "Server error: Unable to retrieve account information",
              redirectOnAuth: false
            });
          }
        }
        
        setTransactions([]);
      }
    } catch (err) {
      setError("An error occurred while fetching transactions");
      handleError(err, { customMessage: "Error loading transactions" });
    } finally {
      setIsLoading(false);
    }
  }, [accountId, currentAccount?.id]);

  // Fetch transactions when the component mounts or accountId changes
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
  };
};
