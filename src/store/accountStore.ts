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

// Helper function to get saved account ID from local storage
const getSavedAccountId = (): string | null => {
  return localStorage.getItem("currentAccountId");
};

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  currentAccount: null,
  isLoading: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await getAccountsAPI(true);

      if (
        hasData<AccountResponse[]>(response) &&
        Array.isArray(response.data)
      ) {
        set({ accounts: response.data });
      } else {
        set({ error: response?.message || "Failed to fetch accounts" });
      }
    } catch (err: unknown) {
      console.error(err);
      set({ error: "An unexpected error occurred" });
    } finally {
      set({ isLoading: false });
    }
  },

  getDefaultAccount: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await getAccountsAPI(true);

      if (
        hasData<AccountResponse[]>(response) &&
        Array.isArray(response.data)
      ) {
        const accounts = response.data;
        let selectedAccount = null;

        const savedAccountId = getSavedAccountId();

        if (savedAccountId) {
          selectedAccount = accounts.find(
            (account) => account.id === savedAccountId
          );
        }
        if (!selectedAccount) {
          selectedAccount = accounts.find((account) => account.isDefault);
        }

        if (selectedAccount) {
          set({
            accounts: accounts,
            currentAccount: selectedAccount,
            error: null,
          });
          return selectedAccount;
        } else {
          set({ error: "No account found" });
          return null;
        }
      } else {
        set({ error: response?.message || "Failed to fetch accounts" });
        set({ error: response?.message || "Failed to fetch accounts" });
        return null;
      }
    } catch (err: unknown) {
      console.error(err);
      // Set error but don't display toast during page load
      set({ error: "An unexpected error occurred" });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentAccount: (account) => {
    set({ currentAccount: account });
    if (account === null) {
      localStorage.removeItem("currentAccountId");
    } else {
      localStorage.setItem("currentAccountId", account.id);
    }
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
    } catch (err: unknown) {
      console.error(err);
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
        console.error(response?.message || "Failed to update default account");
        toast.error(response?.message || "Failed to update default account");
        return false;
      }
    } catch (err: unknown) {
      console.error(err);
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
        console.error(response?.message || "Failed to fetch account");
        toast.error(response?.message || "Failed to fetch account");
        return null;
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("An unexpected error occurred");

      return null;
    }
  },
}));
