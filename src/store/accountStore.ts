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
        // Find the default account in the list
        const defaultAccount = response.data.find(
          (account) => account.isDefault
        );

        if (defaultAccount) {
          // Update the accounts state with the fetched accounts
          set({
            accounts: response.data,
            currentAccount: defaultAccount,
            error: null, // Clear any previous errors
          });
          return defaultAccount;
        } else {
          // Set error but don't display toast
          set({ error: "No default account found" });
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
