"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in OR came from guest mode
    const token = localStorage.getItem("token");
    const isGuest = sessionStorage.getItem("guest_mode");

    if (token || isGuest) {
      // User is logged in or is a guest, go to home
      router.push("/home");
    } else {
      // User is not logged in and not a guest, go to login
      router.push("/login");
    }
  }, [router]);

  // Show loading spinner while checking auth
  return (
    <div className="min-h-screen bg-[#050a12] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#38bdf8]"></div>
    </div>
  );
}
