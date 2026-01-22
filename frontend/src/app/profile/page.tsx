"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SimpleNavbar from "@/Components/SimpleNavbar";
import {
  User,
  Heart,
  Calendar,
  Mail,
  Lock,
  Trash2,
  LogOut,
  Search,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchUserData();
  }, [router]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      // Fetch favorites count
      const favResponse = await fetch(
        "http://localhost:8000/movies/favorites",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (favResponse.ok) {
        const data = await favResponse.json();
        setFavoritesCount(data.favorites?.length || 0);
      }

      // Decode JWT to get email (simple decode, not verification)
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserEmail(payload.sub || "");
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    alert("Password change functionality coming soon!");
    setShowPasswordModal(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = async () => {
    alert("Account deletion functionality coming soon!");
    setShowDeleteModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("guest_mode");
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-bg text-white">
        <SimpleNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-bg text-white pb-20">
      <SimpleNavbar />

      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-12 pb-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
            <User size={40} className="text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-zinc-400">{userEmail}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-brand-surface border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Heart size={24} className="text-red-500" />
              <h3 className="text-lg font-semibold">Favorites</h3>
            </div>
            <p className="text-3xl font-bold text-brand-primary">
              {favoritesCount}
            </p>
            <p className="text-sm text-zinc-400 mt-1">movies saved</p>
          </div>

          <div className="bg-brand-surface border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={24} className="text-brand-primary" />
              <h3 className="text-lg font-semibold">Member Since</h3>
            </div>
            <p className="text-xl font-semibold">2026</p>
            <p className="text-sm text-zinc-400 mt-1">
              enjoying AI recommendations
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>

          <button
            onClick={() => router.push("/favorites")}
            className="w-full bg-brand-surface border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Heart size={20} className="text-brand-primary" />
              <span className="font-semibold">View My Favorites</span>
            </div>
            <span className="text-zinc-400 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>

          <button
            onClick={() => router.push("/discover")}
            className="w-full bg-brand-surface border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Search size={24} className="text-brand-primary" />
              <span className="font-semibold">Discover Movies</span>
            </div>
            <span className="text-zinc-400 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>

        {/* Account Settings */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Account Settings</h2>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full bg-brand-surface border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-zinc-400" />
              <span className="font-semibold">Change Password</span>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-brand-surface border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <LogOut size={20} className="text-zinc-400" />
              <span className="font-semibold">Logout</span>
            </div>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between hover:bg-red-500/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <Trash2 size={20} className="text-red-400" />
              <span className="font-semibold text-red-400">Delete Account</span>
            </div>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-brand-surface border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-primary transition-all"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-primary transition-all"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="flex-1 py-3 bg-zinc-800 rounded-xl font-semibold hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 py-3 bg-linear-to-r from-brand-primary to-brand-secondary text-black rounded-xl font-bold hover:scale-105 transition-transform"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-brand-surface border border-red-500/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-red-400">
              Delete Account
            </h3>
            <p className="text-zinc-300 mb-6">
              Are you sure you want to delete your account? This action can not
              be undone and all your favorites will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-zinc-800 rounded-xl font-semibold hover:bg-zinc-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
