import { create } from "zustand";
import type { AccountResponse } from "../types";
import { toast } from "react-toastify";
import {
  getAccountsAPI,
  createAccountAPI,
  setDefaultAccountAPI,
  getAccountByIdAPI,
} from "../services/accountService";

// Type guard to check if response has data property
function hasData<T>(
  response: any
): response is { success: boolean; data: T; message?: string } {
  return response && response.success && "data" in response;
}

interface AccountState {
  accounts: AccountResponse[];
  currentAccount: AccountResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAccounts: () => Promise<void>;
  getDefaultAccount: () => Promise<AccountResponse | null>;
  setCurrentAccount: (account: AccountResponse | null) => void;
  createAccount: () => Promise<AccountResponse | null>;
  setDefaultAccount: (accountId: string) => Promise<boolean>;
  getAccountById: (accountId: string) => Promise<AccountResponse | null>;
}

// Helper function to save current account ID to local storage
const saveCurrentAccountId = (accountId: string | null) => {
  if (accountId) {
    localStorage.setItem('currentAccountId', accountId);
  } else {
    localStorage.removeItem('currentAccountId');
  }
};

// Helper function to get saved account ID from local storage
const getSavedAccountId = (): string | null => {
  return localStorage.getItem('currentAccountId');
};

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  currentAccount: null,
  isLoading: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });

    try {
      // Use suppressToast to prevent error toast during logout
      const response = await getAccountsAPI(true);

      if (
        hasData<AccountResponse[]>(response) &&
        Array.isArray(response.data)
      ) {
        set({ accounts: response.data });
      } else {
        set({ error: response?.message || "Failed to fetch accounts" });
      }
    } catch (err) {
      set({ error: "An unexpected error occurred" });
    } finally {
      set({ isLoading: false });
    }
  },

  getDefaultAccount: async () => {
    set({ isLoading: true, error: null });

    try {
      // Always use suppressToast to prevent error toast during page load/refresh
      const response = await getAccountsAPI(true);

      if (
        hasData<AccountResponse[]>(response) &&
        Array.isArray(response.data)
      ) {
        const accounts = response.data;
        let selectedAccount = null;
        
        // First, check if we have a saved account ID in local storage
        const savedAccountId = getSavedAccountId();
        
        if (savedAccountId) {
          // Try to find the saved account in the fetched accounts
          selectedAccount = accounts.find(account => account.id === savedAccountId);
        }
        
        // If no saved account was found, fall back to the default account
        if (!selectedAccount) {
          selectedAccount = accounts.find(account => account.isDefault);
        }

        if (selectedAccount) {
          // Update the accounts state with the fetched accounts and selected account
          set({
            accounts: accounts,
            currentAccount: selectedAccount,
            error: null, // Clear any previous errors
          });
          return selectedAccount;
        } else {
          // Set error but don't display toast
          set({ error: "No account found" });
          return null;
        }
      } else {
        // Set error message but don't display toast
        set({ error: response?.message || "Failed to fetch accounts" });
        return null;
      }
    } catch (err) {
      // Set error but don't display toast during page load
      set({ error: "An unexpected error occurred" });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentAccount: (account) => {
    set({ currentAccount: account });
    // Save account ID to local storage when setting current account
    saveCurrentAccountId(account?.id || null);
  },

  createAccount: async () => {
    set({ isLoading: true });

    try {
      const response = await createAccountAPI(true);

      if (hasData<AccountResponse>(response) && response.data) {
        const newAccount: AccountResponse = response.data;
        // Add the new account to the accounts list and set as current
        set((state) => ({
          accounts: [...state.accounts, newAccount],
          currentAccount: newAccount,
        }));
        toast.success("Account created successfully");
        return newAccount;
      } else {
        toast.error(response?.message || "Failed to create account");
        return null;
      }
    } catch (err) {
      toast.error("An unexpected error occurred");

      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  setDefaultAccount: async (accountId) => {
    set({ isLoading: true });

    try {
      const response = await setDefaultAccountAPI(accountId);

      if (hasData<AccountResponse>(response) && response.data) {
        // Update accounts list to reflect the new default account
        const updatedAccounts = get().accounts.map((acc) => ({
          ...acc,
          isDefault: acc.id === accountId,
        }));

        const newDefaultAccount =
          updatedAccounts.find((acc) => acc.id === accountId) || null;

        set({
          accounts: updatedAccounts,
          currentAccount: newDefaultAccount,
        });

        toast.success("Default account updated");
        return true;
      } else {
        toast.error(response?.message || "Failed to update default account");
        return false;
      }
    } catch (err) {
      toast.error("An unexpected error occurred");

      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  getAccountById: async (accountId) => {
    try {
      const response = await getAccountByIdAPI(accountId);

      if (hasData<AccountResponse>(response) && response.data) {
        const account = response.data;

        // Update the account in the accounts list
        set((state) => {
          const updatedAccounts = state.accounts.map((acc) =>
            acc.id === account.id ? account : acc
          );

          return {
            accounts: updatedAccounts,
            currentAccount: account,
          };
        });

        return account;
      } else {
        toast.error(response?.message || "Failed to fetch account");
        return null;
      }
    } catch (err) {
      toast.error("An unexpected error occurred");

      return null;
    }
  },
}));
