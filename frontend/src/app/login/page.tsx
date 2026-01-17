"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clapperboard,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

export default function LoginPage() {
  const [view, setView] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      // Cleanup: prevents multiple timers from crashing if alerts change quickly
      return () => clearTimeout(timer);
    }
  }, [success, error]); // This runs whenever success or error changes

  const handleSubmit = async () => {
    if (view === "login" || view === "register") {
      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }
    } else if (view === "forgot") {
      if (!email) {
        setError("Please enter your email address");
        return;
      }
    } else if (view === "reset") {
      if (!resetToken || !newPassword || !confirmPassword) {
        setError("Please fill in all fields");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (view === "login" || view === "register") {
        let response;
        if (view === "login") {
          const formData = new FormData();
          formData.append("username", email);
          formData.append("password", password);
          response = await fetch("http://localhost:8000/auth/login", {
            method: "POST",
            body: formData,
          });
        } else {
          response = await fetch("http://localhost:8000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
        }

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Authentication failed");
        }

        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        sessionStorage.removeItem("guest_mode");
        document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
        window.location.href = "/home";
      } else if (view === "forgot") {
        const response = await fetch(
          `http://localhost:8000/auth/forgot-password?email=${encodeURIComponent(
            email
          )}`,
          { method: "POST" }
        );
        if (!response.ok) throw new Error("Failed to send reset instructions");
        const data = await response.json();
        setSuccess(data.message);

        if (data.reset_token) {
          setResetToken(data.reset_token);
          setTimeout(() => {
            setView("reset");
            setSuccess(
              "Reset token generated! You can now set a new password."
            );
          }, 2000);
        }
      } else if (view === "reset") {
        const response = await fetch(
          `http://localhost:8000/auth/reset-password?token=${encodeURIComponent(
            resetToken
          )}&new_password=${encodeURIComponent(newPassword)}`,
          { method: "POST" }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Failed to reset password");
        }

        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          setSuccess("");
          setView("login");
          setNewPassword("");
          setConfirmPassword("");
          setResetToken("");
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    localStorage.removeItem("token");
    sessionStorage.setItem("guest_mode", "true");
    window.location.href = "/home";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 p-8 shadow-2xl">
          {(view === "forgot" || view === "reset" || view === "register") && (
            <button
              onClick={() => {
                setView("login");
                setError("");
                setSuccess("");
              }}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="text-sm">Back to login</span>
            </button>
          )}

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative bg-gradient-to-br from-sky-400 to-indigo-500 p-3 rounded-2xl shadow-lg shadow-sky-500/20">
              <Clapperboard size={32} className="text-black" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-center mb-2 tracking-tight">
            <span className="bg-gradient-to-r from-white via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              {view === "login" && "Welcome Back"}
              {view === "register" && "Create Account"}
              {view === "forgot" && "Reset Password"}
              {view === "reset" && "Set New Password"}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-zinc-400 text-center mb-8 text-sm">
            {view === "login" && "Sign in to continue your movie journey"}
            {view === "register" && "Join us to discover amazing movies"}
            {view === "forgot" && "Enter your email to receive a reset token"}
            {view === "reset" && "Enter your new password below"}
          </p>

          {/* Alert Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
              >
                <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3"
              >
                <CheckCircle
                  size={20}
                  className="text-emerald-400 flex-shrink-0"
                />
                <p className="text-emerald-400 text-sm font-medium">
                  {success}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            {/* Input Groups */}
            {(view === "login" || view === "register" || view === "forgot") && (
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2 ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-sky-400 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 transition-all"
                  />
                </div>
              </div>
            )}
            {(view === "login" || view === "register") && (
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-sky-400 transition-colors"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 transition-all"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {view === "reset" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2 ml-1">
                    Reset Token
                  </label>
                  <div className="relative group">
                    <Lock
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2 ml-1">
                    New Password
                  </label>
                  <div className="relative group">
                    <Lock
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-sky-400"
                    />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all"
                    />
                    <button
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showNewPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2 ml-1">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <Lock
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-sky-400"
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all"
                    />
                    <button
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-4 pt-2">
              {view === "login" && (
                <div className="flex justify-end -mt-2">
                  <button
                    onClick={() => setView("forgot")}
                    className="text-sm text-sky-400 hover:text-sky-300 font-medium transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-sky-400 to-indigo-500 text-black font-bold rounded-xl shadow-lg shadow-sky-500/10 hover:shadow-sky-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {loading
                  ? "Processing..."
                  : view === "login"
                    ? "Sign In"
                    : "Submit"}
              </button>
            </div>

            {/* Footer / OR Section */}
            {view === "login" && (
              <>
                <div className="text-center">
                  <p className="text-zinc-500 text-sm font-medium">
                    Don't have an account?{" "}
                    <button
                      onClick={() => setView("register")}
                      className="text-sky-400 hover:text-sky-300 font-semibold transition-colors cursor-pointer"
                    >
                      Sign up
                    </button>
                  </p>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-zinc-600 text-xs font-bold tracking-widest uppercase">
                    OR
                  </span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                <button
                  onClick={handleContinueAsGuest}
                  className="w-full py-3.5 bg-white/5 border border-white/10 text-zinc-200 font-semibold rounded-xl hover:bg-white/10 hover:text-white transition-all active:scale-[0.99] cursor-pointer"
                >
                  Continue as Guest
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
