// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"; // Ensure this path is correct

export default function Home() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only proceed with redirection once the authentication check is complete
    if (!loading) {
      if (session) {
        router.replace("/connect"); // Use replace to prevent going back to login
      } else {
        router.replace("/login"); // Redirect to login if no session
      }
    }
  }, [session, loading, router]); // Dependencies for useEffect

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Checking authentication…</p>
    </div>
  );
}