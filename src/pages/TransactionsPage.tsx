import { useNavigate, Link } from "react-router-dom";
import { useTransactions } from "../hooks/useTransactions";
import { useState, useEffect } from "react";
import type { TransactionResponse } from "../types";
import { useAccountStore } from "../store/accountStore";

const TransactionsPage = () => {
  const navigate = useNavigate();
  // Get account from the store
  const { currentAccount, getDefaultAccount } = useAccountStore();
  
  // Handle page refresh - ensure we have account data
  useEffect(() => {
    const loadAccountData = async () => {
      if (!currentAccount) {
        try {
          // Try to load the default account silently without showing error toasts
          await getDefaultAccount();
        } catch (error) {
          // Silently handle any errors during initial account loading
          console.error("Error loading account data:", error);
        }
      }
    };
    
    loadAccountData();
  }, [currentAccount, getDefaultAccount]);
  
  // Get transactions using the account from the store
  const { transactions, isLoading, fetchTransactions } = useTransactions();
  
  // Fetch transactions when account changes
  useEffect(() => {
    // Only fetch transactions if we have a valid account ID
    if (currentAccount?.id) {
      fetchTransactions();
    }
  }, [currentAccount?.id, fetchTransactions]);

  const [transactionFilter, setTransactionFilter] = useState<
    "all" | "received" | "sent"
  >("all");

  // Define getTransactionType before using it in filteredTransactions
  const getTransactionType = (
    transaction: TransactionResponse
  ): "received" | "sent" | "unknown" => {
    if (!currentAccount) return "unknown";

    // Safety check for transaction properties
    if (
      !transaction ||
      !transaction.fromAccountId ||
      !transaction.toAccountId
    ) {

      return "unknown";
    }

    // If money is going out from this account
    if (transaction.fromAccountId === currentAccount.id) {
      return "sent"; // Money going out
    }
    // If money is coming into this account
    else if (transaction.toAccountId === currentAccount.id) {
      return "received"; // Money coming in
    }
    // Any other case (should be rare)
    else {
      return "unknown";
    }
  };

  // Filtered transactions based on the selected filter
  const filteredTransactions = transactions
    ? transactions.filter((transaction) => {
        if (transactionFilter === "all") {

          return true;
        }

        const type = getTransactionType(transaction);

        if (transactionFilter === "received" && type === "received") {

          return true;
        }

        if (transactionFilter === "sent" && type === "sent") {

          return true;
        }

        return false;
      })
    : [];

  // getTransactionDescription function removed as it's no longer needed

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getName = (transaction: TransactionResponse): string => {
    if (!currentAccount || !transaction) return "Unknown";

    const type = getTransactionType(transaction);

    try {
      if (type === "received") {
        // For deposits, show the sender's name
        const firstName = transaction.fromAccount?.user?.firstName || "";

        const lastName = transaction.fromAccount?.user?.lastName || "";

        return firstName && lastName
          ? `${firstName} ${lastName}`
          : "Unknown Sender";
      } else if (type === "sent") {
        // For withdrawals, show the recipient's name
        const firstName = transaction.toAccount?.user?.firstName || "";
        const lastName = transaction.toAccount?.user?.lastName || "";
        return firstName && lastName
          ? `${firstName} ${lastName}`
          : "Unknown Recipient";
      } else {
        return "Transfer";
      }
    } catch (error) {

      return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 flex flex-col">
      {/* Header with back button */}
      <div className="p-4">
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 py-4 max-w-7xl mx-auto w-full">
        <h1 className="text-white text-3xl font-bold mb-6 text-center">
          Transaction History
        </h1>

        {/* Account Selector */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-white text-lg font-medium mb-1">
                {`Account ${currentAccount?.accountNumber}`}
              </h2>
              <p className="text-white/70 text-sm">
                Balance: ${currentAccount?.balance?.toFixed(2)}
              </p>
            </div>
            <div className="relative"></div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex justify-between items-center">
              <h2 className="text-white text-lg font-medium">
                Recent Transactions
              </h2>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {

                    setTransactionFilter("all");
                  }}
                  className={`px-3 py-1 rounded-md text-sm ${
                    transactionFilter === "all"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => {

                    setTransactionFilter("received");
                  }}
                  className={`px-3 py-1 rounded-md text-sm ${
                    transactionFilter === "received"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  Received
                </button>
                <button
                  type="button"
                  onClick={() => {

                    setTransactionFilter("sent");
                  }}
                  className={`px-3 py-1 rounded-md text-sm ${
                    transactionFilter === "sent"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  Sent
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-pulse flex justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-white/60"
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
              </div>
              <p className="mt-2 text-white/60">Loading transactions...</p>
            </div>
          ) : !filteredTransactions || filteredTransactions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-white/60">
                No transactions found for this account.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      {/* Name/Description */}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                      {/* Amount */}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {Array.isArray(filteredTransactions) &&
                    filteredTransactions.map((transaction) => {
                      const type = getTransactionType(transaction);
                      const colorClass =
                        type === "sent" ? "text-red-500" : "text-green-500";

                      return (
                        <tr key={transaction.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 text-sm text-white">
                            <div className="font-medium">
                              {getName(transaction)}
                            </div>
                            {transaction.description && (
                              <div className="text-white/60 text-xs mt-1">
                                {transaction.description}
                              </div>
                            )}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${colorClass}`}
                          >
                            <div className="font-medium">
                              {type === "sent" ? "-" : "+"} $
                              {typeof transaction.amount === "number"
                                ? transaction.amount.toFixed(2)
                                : parseFloat(
                                    String(transaction.amount)
                                  ).toFixed(2)}
                            </div>
                            <div className="text-white/60 text-xs mt-1">
                              {formatDate(transaction.createdAt)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/transfer")}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 px-6 rounded-md flex items-center transition-all duration-300 shadow-lg"
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
            New Transfer
          </button>
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
          Your transactions are secure and encrypted
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
