"use client";

import Link from "next/link";
import { Home, Compass, Heart, User, LogOut, Clapperboard } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function SimpleNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("guest_mode");
    router.push("/login");
  };

  return (
    <div className="sticky top-0 z-50 bg-brand-bg/95 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo and Navigation */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/home" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-2 rounded-xl">
                <Clapperboard size={20} className="text-black" />
              </div>
              <span className="font-bold text-lg hidden sm:block">
                AI Movies
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1 bg-brand-surface/60 backdrop-blur-xl p-1 rounded-full border border-white/5">
              <Link
                href="/home"
                className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  pathname === "/home"
                    ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-black shadow-lg"
                    : "text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Home size={16} /> Home
              </Link>
              <Link
                href="/discover"
                className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  pathname === "/discover"
                    ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-black shadow-lg"
                    : "text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Compass size={16} /> Discover
              </Link>
              <Link
                href="/favorites"
                className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  pathname === "/favorites"
                    ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-black shadow-lg"
                    : "text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Heart size={16} /> Favorites
              </Link>
            </div>
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white text-sm font-semibold flex items-center gap-2 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-full text-red-400 text-sm font-semibold flex items-center gap-2 hover:bg-red-500/20 transition-all duration-300 hover:scale-105"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full text-black text-sm font-bold shadow-lg hover:shadow-brand-primary/20 transition-all duration-300 hover:scale-105"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
