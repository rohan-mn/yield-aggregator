// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/utils/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, TrendingUp, Loader2, XCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSignIn = async () => {
    setMsg(null);
    setLoading(true);
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setMsg(error.message);
    } else if (data.session) {
      router.replace("/connect");
    } else {
      setMsg("✅ Check email to confirm then sign in.");
    }
  };

  const handleSignUp = async () => {
    setMsg(null);
    setLoading(true);
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setMsg(error.message);
    } else {
      setMsg("✅ Confirmation sent. Please check your inbox.");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0A1128] via-[#1B2A41] to-[#3D5A80] p-4 font-sans antialiased">
      {/* Overall layout: deep blues/grays for background, using a subtle gradient. */}
      {/* Using 'font-sans' and 'antialiased' for premium typography. */}
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-3xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01]">
        {/* Card Styling: Softer background with increased blur, rounded corners, more subtle border, and a stronger shadow. Added a subtle hover effect for interactivity. */}
        <CardHeader className="p-8 text-center bg-white/10 border-b border-white/15">
          {/* Card Header: More padding, slightly lighter background for distinction. */}
          <TrendingUp className="mx-auto h-16 w-16 text-[#9ADE7B] drop-shadow-lg animate-pulse" />
          {/* Icon: Larger, vibrant green accent color, subtle drop shadow, and a gentle pulse animation for a modern, engaging feel. */}
          <CardTitle className="mt-4 text-3xl text-white font-extrabold tracking-tight">
            Yield Aggregator 🚀
          </CardTitle>
          {/* Title: Larger, bolder, tighter tracking, with an emoji for a touch of modern appeal without being unprofessional. */}
          <CardDescription className="mt-2 text-white/70 text-lg">
            Securely access your financial insights.
          </CardDescription>
          {/* Description: Slightly larger font size, rephrased for a more professional tone. */}
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          {/* Card Content: Increased padding and spacing for better visual breathing room. */}
          {msg && (
            <div className="flex items-center text-sm font-medium text-red-400 bg-red-400/20 p-3 rounded-lg animate-fade-in">
              {/* Message Bar: Clearer error/success styling with a subtle background, rounded corners, and a fade-in animation. */}
              <XCircle className="mr-3 h-5 w-5 text-red-300" /> {msg}
            </div>
          )}

          <div className="space-y-2">
            {/* Input Group Spacing: Adjusted for better readability. */}
            <Label htmlFor="email" className="flex items-center text-white text-md font-semibold mb-1">
              <Mail className="mr-3 h-5 w-5 text-white/80" /> Email Address
            </Label>
            {/* Label Styling: Slightly larger font, bolder, and more descriptive text. */}
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="mt-1 w-full p-3 bg-white/15 placeholder-white/50 text-white border border-white/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9ADE7B] focus:border-transparent transition duration-200"
            />
            {/* Input Styling: Increased padding, softer background, more distinct border, rounded corners, and a clear focus ring with the accent color. */}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center text-white text-md font-semibold mb-1">
              <Lock className="mr-3 h-5 w-5 text-white/80" /> Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="mt-1 w-full p-3 bg-white/15 placeholder-white/50 text-white border border-white/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9ADE7B] focus:border-transparent transition duration-200"
            />
          </div>

          <div className="flex flex-col gap-4 pt-4">
            {/* Buttons Layout: Changed to flex-col for better stacking on smaller screens, added more top padding. */}
            <Button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#9ADE7B] to-[#7CB9E8] text-[#0A1128] font-bold text-lg rounded-xl shadow-lg hover:from-[#7CB9E8] hover:to-[#9ADE7B] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-in-out"
            >
              {/* Sign In Button: Full width, increased padding, vibrant gradient with a light text color for contrast. Stronger hover effects (gradient shift, slight scale) and active state. */}
              {loading ? (
                <Loader2 className="animate-spin mr-3 h-6 w-6 text-[#0A1128]" />
              ) : (
                "Sign In"
              )}
            </Button>
            <Button
              onClick={handleSignUp}
              disabled={loading}
              variant="outline"
              className="w-full py-3 border-2 border-white/40 text-white/90 font-medium text-lg rounded-xl hover:bg-white/15 hover:border-white/60 active:scale-[0.98] transition-all duration-300 ease-in-out"
            >
              {/* Sign Up Button: Full width, increased padding, more prominent outline border with a subtle hover background and border color change. Active state for consistency. */}
              {loading ? "Loading…" : "Create Account"}
              {/* Changed "Sign Up" to "Create Account" for a slightly more professional feel. */}
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Custom Tailwind CSS Animations (could be defined in a global CSS file or tailwind.config.js)
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      */}
    </main>
  );
}