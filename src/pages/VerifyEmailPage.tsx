import { useEffect, useState } from "react";
import { verifyAccountAPI } from "../services/authService";
import { Link } from "react-router-dom";

const VerifyEmailPage = () => {
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const verifyEmail = async () => {
      // Extract token from URL query parameters
      const token = new URLSearchParams(window.location.search).get("token");

      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing");
        return;
      }

      try {
        // Send request to verify account
        const response = await verifyAccountAPI(token);
        
        if (response?.success) {
          setStatus("success");
          setMessage(response.message || "Your email has been verified successfully!");
        } else {
          setStatus("error");
          setMessage(response?.message || "Failed to verify your email. The token may be invalid or expired.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An unexpected error occurred during verification.");
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden">
        {status === "verifying" && (
          <div className="p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mb-4"></div>
            <h2 className="text-2xl font-semibold text-white mb-2">Verifying your email...</h2>
            <p className="text-white/70 text-center">Please wait while we verify your account.</p>
          </div>
        )}

        {status === "success" && (
          <div className="p-8 flex flex-col items-center">
            <div className="bg-green-500/20 p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Email Verified!</h2>
            <p className="text-white/80 text-center mb-6">{message}</p>
            <Link to="/login" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-300 text-center">
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="p-8 flex flex-col items-center">
            <div className="bg-red-500/20 p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Verification Failed</h2>
            <p className="text-red-300 text-center mb-6">{message}</p>
            <Link to="/login" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-300 text-center">
              Back to Login
            </Link>
          </div>
        )}
      </div>
      
      {/* Security note */}
      <div className="mt-8 text-center text-white/40 text-xs flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Your connection to this site is secure
      </div>
    </div>
  );
};

export default VerifyEmailPage;
