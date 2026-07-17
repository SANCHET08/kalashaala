import { useState, useEffect } from "react";
import { CheckCircle2, Eye, EyeOff, RefreshCw, Send } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const VERIFICATION_RESEND_SECONDS = 30;
const SAVED_LOGIN_KEY = "kalaRushSavedLogin";

const createVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const formatPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 12);

  if (!digits) return "";

  if (digits.startsWith("91") && digits.length > 10) {
    const nationalNumber = digits.slice(2, 12);
    return `+91 ${nationalNumber.slice(0, 5)} ${nationalNumber.slice(5)}`.trim();
  }

  if (digits.length <= 5) return digits;

  return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`.trim();
};

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    phone: "",
    verificationCode: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [generatedVerificationCode, setGeneratedVerificationCode] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const LoginSkeleton = () => (
    <div className="absolute inset-0 z-10 bg-white/95 px-6 py-8 backdrop-blur-sm">
      <div className="mx-auto max-w-sm animate-pulse">
        <div className="mx-auto mb-6 h-8 w-44 rounded-lg bg-gray-200" />
        <div className="mb-4 rounded-md bg-blue-50 p-4">
          <div className="mb-2 h-3 w-36 rounded bg-blue-100" />
          <div className="h-3 w-56 rounded bg-blue-100" />
        </div>
        <div className="space-y-4">
          <div>
            <div className="mb-2 h-4 w-24 rounded bg-gray-200" />
            <div className="h-10 rounded-md bg-gray-200" />
          </div>
          <div>
            <div className="mb-2 h-4 w-20 rounded bg-gray-200" />
            <div className="h-10 rounded-md bg-gray-200" />
          </div>
          <div>
            <div className="mb-2 h-4 w-28 rounded bg-gray-200" />
            <div className="h-10 rounded-md bg-gray-200" />
          </div>
          <div>
            <div className="mb-2 h-4 w-32 rounded bg-gray-200" />
            <div className="h-10 w-36 rounded-md bg-gray-200" />
          </div>
          <div className="h-10 rounded-md bg-blue-200" />
        </div>
        <div className="mt-6 flex justify-center">
          <div className="h-4 w-52 rounded bg-gray-200" />
        </div>
        <p className="mt-6 text-center text-sm font-medium text-blue-700">
          Checking your credentials...
        </p>
      </div>
    </div>
  );

  // Check for any success message passed from other pages (like signup)
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location]);

  useEffect(() => {
    try {
      const savedLogin = JSON.parse(localStorage.getItem(SAVED_LOGIN_KEY) || "{}");

      if (savedLogin.email || savedLogin.phone) {
        setCredentials(prev => ({
          ...prev,
          email: savedLogin.email || "",
          phone: savedLogin.phone || ""
        }));
        setRememberDevice(true);
      }
    } catch (err) {
      console.error("Error reading saved login details:", err);
      localStorage.removeItem(SAVED_LOGIN_KEY);
    }
  }, []);

  useEffect(() => {
    if (resendSeconds === 0) return;

    const timer = window.setTimeout(() => {
      setResendSeconds(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  // Get CSRF token when component mounts
  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        // Get the CSRF token from the Django server
        const response = await fetch("http://localhost:8000/custom_auth/get-csrf-token/", {
          method: "GET",
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
        } else {
          console.error("Failed to fetch CSRF token");
        }
      } catch (err) {
        console.error("Error fetching CSRF token:", err);
      }
    };

    getCsrfToken();
    
    // Check if user is already logged in
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === "phone") {
      nextValue = formatPhoneNumber(value);
      setVerificationSent(false);
      setGeneratedVerificationCode("");
      setResendSeconds(0);
    }

    if (name === "verificationCode") {
      nextValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setError("");

    setCredentials(prev => ({
      ...prev,
      [name]: nextValue
    }));
  };

  const handleSendVerificationCode = () => {
    const phoneDigits = credentials.phone.replace(/\D/g, "");

    if (phoneDigits.length < 10) {
      setError("Please enter a valid phone number before requesting a code.");
      return;
    }

    const nextCode = createVerificationCode();
    setGeneratedVerificationCode(nextCode);
    setVerificationSent(true);
    setResendSeconds(VERIFICATION_RESEND_SECONDS);
    setError("");
    setSuccess(`Verification code sent to ${credentials.phone}. Demo code: ${nextCode}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const phoneDigits = credentials.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (!verificationSent) {
      setError("Please send a verification code to your phone first.");
      return;
    }

    if (credentials.verificationCode.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (
      generatedVerificationCode &&
      credentials.verificationCode !== generatedVerificationCode
    ) {
      setError("Verification code does not match. Please try again.");
      return;
    }

    setIsSubmitting(true);
  
    try {
      const response = await fetch("http://localhost:8000/custom_auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include", 
        body: JSON.stringify({
          username: credentials.email, // assuming email is used as username
          password: credentials.password,
          phone: credentials.phone,
          verification_code: credentials.verificationCode
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Set authentication state in localStorage
        localStorage.setItem("isAuthenticated", "true");

        if (rememberDevice) {
          localStorage.setItem(SAVED_LOGIN_KEY, JSON.stringify({
            email: credentials.email,
            phone: credentials.phone
          }));
        } else {
          localStorage.removeItem(SAVED_LOGIN_KEY);
        }
        
        // Fetch user data to get name and user type
        try {
          const userResponse = await fetch("http://localhost:8000/custom_auth/user/", {
            method: "GET",
            credentials: "include",
            headers: {
              "X-CSRFToken": csrfToken,
              "Content-Type": "application/json"
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            localStorage.setItem("userName", userData.name || userData.username);
            localStorage.setItem("userType", userData.user_type || "None");
          }
        } catch (userError) {
          console.error("Error fetching user data after login:", userError);
        }
        
        const destination = location.state?.from?.pathname || "/home";
        navigate(destination, { replace: true });
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const phoneDigits = credentials.phone.replace(/\D/g, "");
  const isPhoneReady = phoneDigits.length >= 10;
  const canRequestVerificationCode = isPhoneReady && !isSubmitting && resendSeconds === 0;
  const isVerificationCodeConfirmed =
    Boolean(generatedVerificationCode) &&
    credentials.verificationCode === generatedVerificationCode;
  const isFormReady =
    credentials.email.trim() &&
    credentials.password &&
    isPhoneReady &&
    verificationSent &&
    credentials.verificationCode.length === 6 &&
    !isSubmitting;

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container-custom">
        <div className="relative max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {isSubmitting && <LoginSkeleton />}
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-center mb-6">Log In to KalaRush</h2>
            
            {success && (
              <div className="bg-green-50 text-green-600 px-4 py-3 rounded mb-4 text-sm">
                {success}
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="relative mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-gray-700 text-sm font-medium">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-11 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute bottom-0 right-2 flex h-10 w-8 items-center justify-center text-gray-500 hover:text-blue-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={credentials.phone}
                    onChange={handleChange}
                    className="min-w-0 flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    className={`inline-flex w-28 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                      canRequestVerificationCode
                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!canRequestVerificationCode}
                    aria-label="Send verification code"
                    title="Send verification code"
                  >
                    {resendSeconds > 0 ? (
                      <RefreshCw size={16} />
                    ) : verificationSent ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Send size={16} />
                    )}
                    <span>
                      {resendSeconds > 0 ? `${resendSeconds}s` : verificationSent ? "Resend" : "Send"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="verificationCode" className="block text-gray-700 text-sm font-medium mb-2">
                  Verification Code
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    value={credentials.verificationCode}
                    onChange={handleChange}
                    className="w-36 px-3 py-2 border border-gray-300 rounded-md text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="000000"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                    disabled={isSubmitting || !verificationSent}
                  />
                  {isVerificationCodeConfirmed && (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                      <CheckCircle2 size={17} />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <label className="mb-6 flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <span>Remember email and phone</span>
              </label>
              
              <button
                type="submit"
                className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 ${
                  isFormReady
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-300 text-white cursor-not-allowed"
                }`}
                disabled={!isFormReady}
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/" className="text-blue-600 hover:underline font-medium">
                  Choose signup type
                </Link>
              </p>
            </div>
            
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-300"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12c0,5.523,4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-300"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"
                  />
                </svg>
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
