import { useState, useRef, useEffect } from "react";
import type { SignupFormData } from "../types";
import { signupAPI } from "../services/authService";
import { Calendar } from "../components/ui/calendar";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const SignupPage = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    birthDate: "",
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof SignupFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SignupFormData, string>> = {};
    let isValid = true;

    // Required fields validation
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key as keyof SignupFormData] = `${
          key.charAt(0).toUpperCase() + key.slice(1)
        } is required`;
        isValid = false;
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation (at least 8 chars, 1 lowercase, 1 uppercase, 1 number, 1 special char, no whitespace)
    if (
      formData.password &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[^\s]{8,}$/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Password must be at least 8 characters and include lowercase, uppercase, number and special character and no whitespace";
      isValid = false;
    }

    // Phone validation
    if (
      formData.phoneNumber &&
      !/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber =
        "Please enter a valid phone number. format: +123456789";
      isValid = false;
    }

    // Birth date validation
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      if (isNaN(birthDate.getTime())) {
        newErrors.birthDate = "Please enter a valid date";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await signupAPI(formData);

      if (response?.success) {
        setSubmitResult({
          success: true,
          message:
            "Account created successfully! Please check your email to verify your account.",
        });
        // Reset form after successful submission
        setFormData({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          phoneNumber: "",
          birthDate: "",
        });
      } else {
        setSubmitResult({
          success: false,
          message:
            response?.message || "Failed to create account. Please try again.",
        });
      }
    } catch (error: unknown) {
      console.error(error);
      setSubmitResult({
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 flex flex-col">
      {/* Header with back button */}
      <div className="p-4">
        <Link
          to="/"
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
        </Link>
      </div>

      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-8 bg-white/5 backdrop-blur-md rounded-xl overflow-hidden shadow-xl border border-white/10">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Create Your Account
              </h1>
              <p className="text-white/70">
                Join Aurora Banking for secure and reliable financial services
              </p>
            </div>

            {submitResult && (
              <div
                className={`mb-6 p-4 rounded-md text-center ${
                  submitResult.success
                    ? "bg-green-500/20 text-green-100"
                    : "bg-red-500/20 text-red-100"
                }`}
              >
                {submitResult.message}
              </div>
            )}

            <div className="space-y-6 max-w-md mx-auto">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-white/80 mb-1 text-left pl-1"
                >
                  First Name
                </label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-md px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your first name"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400 text-left pl-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-white/80 mb-1 text-left pl-1"
                >
                  Last Name
                </label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-md px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your last name"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400 text-left pl-1">
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="birthDate"
                  className="block text-white/80 mb-1 text-left pl-1"
                >
                  Birth Date
                </label>
                <div className="relative flex justify-center" ref={calendarRef}>
                  <input
                    type="text"
                    id="birthDate"
                    name="birthDate"
                    readOnly
                    value={
                      formData.birthDate
                        ? format(new Date(formData.birthDate), "PP")
                        : ""
                    }
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-md px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                    placeholder="Select your birth date"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {isCalendarOpen && (
                    <div className="absolute z-10 mt-1 left-1/2 transform -translate-x-1/2 bg-slate-800 border border-white/10 rounded-md shadow-lg">
                      <Calendar
                        mode="single"
                        selected={
                          formData.birthDate
                            ? new Date(formData.birthDate)
                            : undefined
                        }
                        onSelect={(date) => {
                          setFormData({
                            ...formData,
                            birthDate: date ? date.toISOString() : "",
                          });
                          setIsCalendarOpen(false);
                        }}
                        className="rounded-md border-white/10 bg-slate-800 text-white"
                        captionLayout="dropdown"
                        disabled={(date) => date > new Date()}
                        classNames={{
                          caption:
                            "flex justify-center py-2 mb-4 relative items-center text-white",
                          caption_label: "hidden",
                          nav: "space-x-1 flex items-center",
                          nav_button:
                            "h-7 w-7 bg-slate-700 p-0 hover:bg-slate-600 text-white",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1 text-white",
                          head_row: "flex",
                          head_cell:
                            "text-white rounded-md w-9 font-normal text-[0.8rem]",
                          row: "flex w-full mt-2",
                          cell: "text-center text-sm relative p-0 text-white [&:has([aria-selected])]:bg-slate-700 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-white hover:bg-slate-700 rounded-md",
                          day_selected:
                            "bg-purple-600 text-white hover:bg-purple-700 hover:text-white focus:bg-purple-600 focus:text-white",
                          day_today: "bg-slate-600 text-white",
                          day_outside: "text-slate-500 opacity-50",
                          day_disabled: "text-slate-500 opacity-50",
                          day_range_middle:
                            "aria-selected:bg-slate-700 aria-selected:text-white",
                          day_hidden: "invisible",
                          caption_dropdowns:
                            "flex gap-1 justify-center items-center text-white bg-slate-800",
                          dropdown:
                            "bg-slate-700 text-white border border-slate-600 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-purple-600",
                          dropdown_month: "text-white bg-slate-700",
                          dropdown_year: "text-white bg-slate-700",
                          dropdown_icon: "text-white ml-2",
                        }}
                      />
                    </div>
                  )}
                </div>
                {errors.birthDate && (
                  <p className="mt-1 text-sm text-red-400 text-left pl-1">
                    {errors.birthDate}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-white/80 mb-1 text-left pl-1"
                >
                  Phone Number
                </label>
                <div className="flex justify-center">
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-md px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-400 text-left pl-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-white/80 mb-1 text-left pl-1"
                >
                  Email
                </label>
                <div className="flex justify-center">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-md px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400 text-left pl-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-white/80 mb-1 text-left pl-1"
                >
                  Password
                </label>
                <div className="flex justify-center">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-md px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Create a secure password"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400 text-left pl-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="pt-4">
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
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>

              <div className="text-center text-white/60 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-purple-300 hover:text-purple-200 underline"
                >
                  Log in here
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
