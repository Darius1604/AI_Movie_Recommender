"use client";
import { useState } from "react";
import {
  Clapperboard,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const formData = new FormData();
        formData.append("username", email);
        formData.append("password", password);

        const response = await fetch("http://localhost:8000/auth/login", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          let errorMessage = "Login failed";
          try {
            const data = await response.json();
            // Handle different error response formats
            if (typeof data.detail === "string") {
              errorMessage = data.detail;
            } else if (Array.isArray(data.detail)) {
              // FastAPI validation errors (array format)
              const firstError = data.detail[0];
              if (firstError.msg) {
                errorMessage = firstError.msg.replace(
                  /^value is not a valid email address: /,
                  "Invalid email address: "
                );
              }
            } else if (data.detail && typeof data.detail === "object") {
              // If detail is an object, try to extract message
              errorMessage =
                data.detail.message ||
                data.detail.msg ||
                JSON.stringify(data.detail);
            } else if (data.message) {
              errorMessage = data.message;
            }
          } catch (e) {
            // If JSON parsing fails, use default message
            errorMessage = `Login failed (${response.status})`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        window.location.href = "/home";
      } else {
        // Register
        const response = await fetch("http://localhost:8000/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          let errorMessage = "Registration failed";
          try {
            const data = await response.json();
            // Handle different error response formats
            if (typeof data.detail === "string") {
              errorMessage = data.detail;
            } else if (Array.isArray(data.detail)) {
              // FastAPI validation errors (array format)
              const firstError = data.detail[0];
              if (firstError.msg) {
                errorMessage = firstError.msg.replace(
                  /^value is not a valid email address: /,
                  "Invalid email address: "
                );
              }
            } else if (data.detail && typeof data.detail === "object") {
              // If detail is an object, try to extract message
              errorMessage =
                data.detail.message ||
                data.detail.msg ||
                JSON.stringify(data.detail);
            } else if (data.message) {
              errorMessage = data.message;
            }
          } catch (e) {
            // If JSON parsing fails, use default message
            errorMessage = `Registration failed (${response.status})`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        window.location.href = "/home";
      }
    } catch (err) {
      // Properly handle different error types
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "string") {
        setError(err);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050a12] via-[#0f172a] to-[#050a12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      {/* Glowing Orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#38bdf8]/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#818cf8]/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#38bdf8] to-[#818cf8] blur-xl opacity-50 rounded-full" />
              <div className="relative bg-gradient-to-br from-[#38bdf8] to-[#818cf8] p-3 rounded-2xl shadow-2xl">
                <Clapperboard size={32} className="text-black" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-white via-[#38bdf8] to-[#818cf8] bg-clip-text text-transparent">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-zinc-400 text-center mb-8 text-sm">
            {isLogin
              ? "Sign in to continue your movie journey"
              : "Join us to discover amazing movies"}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-red-400 flex-shrink-0 mt-0.5"
              />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-[#38bdf8] hover:text-[#818cf8] transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#38bdf8] to-[#818cf8] text-black font-bold rounded-xl shadow-lg hover:shadow-[#38bdf8]/20 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-[#38bdf8] hover:text-[#818cf8] font-semibold transition-colors cursor-pointer"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-zinc-500 text-xs">OR</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Continue as Guest */}
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem("guest_mode", "true");
              window.location.href = "/home";
            }}
            className="mt-6 w-full py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
