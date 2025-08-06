import { useAuth } from "../hooks/useAuth";
import { loginAPI } from "../services/authService";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { isTokenValid } from "../helpers/tokenValidator";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (isTokenValid(token)) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Log the API URL from environment variables
    console.log('API URL from env:', import.meta.env.VITE_NODEJS_URL);

    setIsSubmitting(true);

    try {
      const response = await loginAPI(formData.email, formData.password);

      // If response is undefined, show a network error message
      if (!response) {
        toast.error("Network error or no response from server");
        return;
      }

      if (response.success) {
        // Get the token and account from the response
        const authToken = response.data?.authToken;

        if (authToken) {
          // Perform login with both token and default account from response
          await login(authToken);

          // Navigation happens after login completes
          navigate("/dashboard");
        } else {
          // Handle missing token or account
          let errorMessage = "Login failed: ";
          if (!authToken) errorMessage += "Authentication token not received.";

          toast.error(errorMessage);
        }
      } else {
        // Handle API error response
        toast.error(
          response.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      // Handle unexpected errors
      toast.error("An unexpected error occurred. Please try again later.");

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 flex flex-col">
      {/* Header with back button */}
      <div className="p-4">
        <a
          href="/"
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
          Back to Home
        </a>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome Back
                </h1>
                <p className="text-white/70">Sign in to access your account</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Email field */}
                  <div>
                    <label htmlFor="email" className="block text-white/80 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full bg-white/5 backdrop-blur-sm border ${
                        errors.email ? "border-red-400" : "border-white/10"
                      } rounded-md px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password field */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-white/80 mb-1"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full bg-white/5 backdrop-blur-sm border ${
                        errors.password ? "border-red-400" : "border-white/10"
                      } rounded-md px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                      placeholder="Enter your password"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Forgot password link */}
                  <div className="flex justify-end">
                    <a
                      href="/forgot-password"
                      className="text-sm text-purple-300 hover:text-purple-200"
                    >
                      {/* Forgot your password? */}
                    </a>
                  </div>

                  {/* Submit button */}
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
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Sign up link */}
              <div className="mt-6 text-center text-white/60 text-sm">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="text-purple-300 hover:text-purple-200 underline"
                >
                  Sign up here
                </a>
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
            Your connection to this site is secure
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
