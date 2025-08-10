import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createTransactionAPI } from "../services/TransactionService";
import { useAuth } from "../hooks/useAuth";
import { useAccountStore } from "../store/accountStore";
import { ConnectionStatus } from "../components/ConnectionStatus";

const TransferPage = () => {
  const navigate = useNavigate();

  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Protected route handles authentication check

  const { logout } = useAuth();
  const { currentAccount, getAccountById, getDefaultAccount } =
    useAccountStore();

  // Handle page refresh - ensure we have account data
  useEffect(() => {
    const loadAccountData = async () => {
      if (!currentAccount) {
        // Try to load the default account
        const account = await getDefaultAccount();
        if (!account) {
          // If we still don't have an account, redirect to login
          navigate("/login");
        }
      }
    };

    loadAccountData();
  }, [currentAccount, getDefaultAccount, navigate]);

  // If no account is available after the effect runs, render nothing while redirecting
  if (!currentAccount) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!toAccountNumber) {
      toast.error("Please enter a destination account number");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (Number(amount) > currentAccount?.balance) {
      toast.error("Insufficient funds");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createTransactionAPI(
        currentAccount.id,
        toAccountNumber,
        Number(amount),
        description
      );

      if (result.success) {
        toast.success("Transfer completed successfully");

        setToAccountNumber("");
        setAmount("");
        setDescription("");

        await getAccountById(currentAccount.id);

        // Navigate to dashboard to see updated balance
        navigate("/dashboard");
      } else {
        toast.error(result.message || "Failed to complete transfer");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to complete transfer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 flex flex-col">
      {/* Header with back button and connection status */}
      <div className="p-4 flex justify-between items-center">
        <Link
          to="/dashboard"
          className="text-white/80 hover:text-white flex items-center gap-2 w-fit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Dashboard
        </Link>

        {/* Connection Status */}
        <ConnectionStatus />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Transfer Money
                </h1>
                <p className="text-white/70">Send money to another account</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* From Account */}
                  <div>
                    <label
                      htmlFor="fromAccountNumber"
                      className="block text-white/80 mb-1"
                    >
                      From Account
                    </label>
                    <div className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-md px-3 py-3 text-white">
                      <div className="flex justify-between items-center">
                        <span>Account {currentAccount?.accountNumber}</span>
                        <span className="font-semibold">
                          ${currentAccount?.balance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* To Account */}
                  <div>
                    <label
                      htmlFor="toAccountNumber"
                      className="block text-white/80 mb-1"
                    >
                      To Account Number
                    </label>
                    <input
                      type="text"
                      id="toAccountNumber"
                      value={toAccountNumber}
                      onChange={(e) => setToAccountNumber(e.target.value)}
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-md px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter recipient's account number"
                      required
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-white/80 mb-1"
                    >
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/60">
                        $
                      </span>
                      <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-md pl-8 pr-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-white/80 mb-1"
                    >
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-md px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Add a note about this transfer"
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing Transfer...
                        </>
                      ) : (
                        "Complete Transfer"
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Additional options */}
              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-white/60 hover:text-white/90 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => logout()}
                  className="text-white/60 hover:text-white/90 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="mt-8 text-center text-white/40 text-xs flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Your transfers are secure and encrypted
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferPage;
