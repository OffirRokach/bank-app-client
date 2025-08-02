import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import type { AccountResponse } from "../types";
import { toast } from "react-toastify";
import { useAccountStore } from "../store/accountStore";

const DashboardPage = () => {
  const { firstName, logout } = useAuth();
  const navigate = useNavigate();

  const {
    accounts,
    currentAccount,
    fetchAccounts,
    createAccount,
    setDefaultAccount,
    setCurrentAccount,
    getDefaultAccount,
  } = useAccountStore();

  const [showAccountsDropdown, setShowAccountsDropdown] = useState(false);
  const [showUpdateAccountDropdown, setShowUpdateAccountDropdown] =
    useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // On component mount, fetch accounts and set default account
    const initializeAccounts = async () => {
      setIsInitializing(true);


      try {
        // First fetch all accounts
        await fetchAccounts();

        // Get accounts after fetching to ensure we have the latest state
        const currentAccounts = useAccountStore.getState().accounts;


        // If no current account is set, get the default account
        if (!currentAccount) {

          const defaultAcc = await getDefaultAccount();


          // If still no current account and we have accounts, use the first one
          if (!defaultAcc && currentAccounts.length > 0) {

            setCurrentAccount(currentAccounts[0]);
          }
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAccounts();
  }, [currentAccount, fetchAccounts, getDefaultAccount, setCurrentAccount]);

  const handleSwitchAccount = (selectedAccount: AccountResponse) => {
    setCurrentAccount(selectedAccount);
    toast.success(`Switched to account ${selectedAccount.accountNumber}`);
    setShowAccountsDropdown(false);
  };

  const handleUpdateDefaultAccount = async (
    selectedAccount: AccountResponse
  ) => {
    if (selectedAccount.isDefault) {
      toast.info("This is already your primary account");
      setShowUpdateAccountDropdown(false);
      return;
    }

    await setDefaultAccount(selectedAccount.id);
    setShowUpdateAccountDropdown(false);
  };

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    try {
      await createAccount();
    } finally {
      setIsCreatingAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900">
      {/* Navigation Bar */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="text-white text-xl font-bold">Aurora</div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => navigate("/profile")}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-colors mr-2"
              >
                Profile
              </button>
              <button
                onClick={logout}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Title */}
        <h1 className="text-white text-2xl font-bold mb-6">
          {firstName ? `Welcome, ${firstName}` : "Welcome"}
        </h1>

        {isInitializing ? (
          <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-xl overflow-hidden mb-8 p-6 flex items-center justify-center">
            <div className="text-white text-lg">
              Loading account information...
            </div>
          </div>
        ) : currentAccount ? (
          /* Account Balance Card */
          <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-xl overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-white text-lg font-medium">
                    {currentAccount.isDefault ? "Default Account" : "Account"}{" "}
                    {currentAccount.accountNumber}
                  </h2>
                  <p className="text-white/60 text-sm">Current Balance</p>
                  <p className="text-white text-3xl font-bold">
                    ${currentAccount.balance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-xl overflow-hidden mb-8 p-6 flex items-center justify-center">
            <div className="text-white text-lg">
              No account found. Create a new account below.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Create New Account Button */}
          <button
            onClick={handleCreateAccount}
            disabled={isCreatingAccount}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white py-4 px-6 rounded-xl flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            {isCreatingAccount ? "Creating..." : "Create New Account"}
          </button>
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Transfer Money Button */}
          <button
            onClick={() => navigate("/transfer")}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white py-4 px-6 rounded-xl flex items-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            Transfer Money
          </button>

          {/* See Transactions Button */}
          <button
            onClick={() => navigate("/transactions")}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white py-4 px-6 rounded-xl flex items-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            See Transactions
          </button>
        </div>

        {!isInitializing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Switch Account Button */}
            {accounts.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowAccountsDropdown(!showAccountsDropdown)}
                  className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white py-4 px-6 rounded-xl flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    Switch Account
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showAccountsDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md rounded-xl shadow-lg overflow-hidden z-10">
                    {accounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => handleSwitchAccount(account)}
                        className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors ${
                          currentAccount?.id === account.id ? "bg-white/5" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">
                              Account {account.accountNumber}
                            </p>
                            <p className="text-white/60 text-xs">
                              {account.isDefault
                                ? "Default Account"
                                : "Secondary Account"}
                            </p>
                          </div>
                          {/* <p className="text-white font-medium">
                            ${account.balance.toFixed(2)}
                          </p> */}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Update Default Account Button - Only show if there are multiple accounts */}
            {accounts.length > 1 && (
              <div className="relative">
                <button
                  onClick={() =>
                    setShowUpdateAccountDropdown(!showUpdateAccountDropdown)
                  }
                  className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white py-4 px-6 rounded-xl flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Update Default Account
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showUpdateAccountDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md rounded-xl shadow-lg overflow-hidden z-10">
                    {accounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => handleUpdateDefaultAccount(account)}
                        className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors ${
                          account.isDefault ? "bg-white/5" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">
                              Account {account.accountNumber}
                            </p>
                            <p className="text-white/60 text-xs">
                              {account.isDefault
                                ? "Default Account"
                                : "Set as Default"}
                            </p>
                          </div>
                          {/* <p className="text-white font-medium">
                            ${account.balance.toFixed(2)}
                          </p> */}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
