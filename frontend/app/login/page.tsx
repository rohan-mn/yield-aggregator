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
import { Mail, Lock, TrendingUp } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState<string | null>(null);

   
  

  // login/page.tsx
const handleSignIn = async () => {
  setMsg(null);
  setLoading(true);
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  setLoading(false);

  console.log("Supabase Sign-In Data:", data); // Add this line
  console.log("Supabase Sign-In Error:", error); // Add this line

  if (error) {
    setMsg(error.message);
  } else if (data.session) { // Explicitly check if session exists
    router.replace("/connect");
  } else {
    // This case might occur if there's no error but also no session (e.g., email not confirmed)
    setMsg("Sign-in successful, but no session. Check email for confirmation or try again.");
  }
};

  const handleSignUp = async () => {
    setMsg(null);
    setLoading(true);
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setMsg(error.message);
    } else if (!data.session) {
      setMsg(
        "✅ Check your inbox for a confirmation link, then come back and sign in."
      );
    }
    // if data.session exists (you’ve disabled confirm-email), useAuth will fire and redirect
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-blue-900 to-purple-700">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/20">
        <CardHeader className="p-6 text-center bg-white/10">
          <TrendingUp className="mx-auto h-12 w-12 text-white" />
          <CardTitle className="mt-2 text-2xl text-white">Yield Aggregator</CardTitle>
          <CardDescription className="mt-1 text-white/80">
            Sign in or Sign up to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
          {msg && <div className="text-center text-sm text-red-300">{msg}</div>}

          <div>
            <Label htmlFor="email" className="flex items-center text-white/90">
              <Mail className="mr-2 h-4 w-4" /> Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 w-full bg-white/10 text-white placeholder-white/50 focus:bg-white/20"
            />
          </div>

          <div>
            <Label htmlFor="password" className="flex items-center text-white/90">
              <Lock className="mr-2 h-4 w-4" /> Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1 w-full bg-white/10 text-white placeholder-white/50 focus:bg-white/20"
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSignIn}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            >
              {loading ? "Loading…" : "Sign In"}
            </Button>
            <Button
              onClick={handleSignUp}
              disabled={loading}
              variant="outline"
              className="flex-1 border-white/50 text-white hover:bg-white/10"
            >
              {loading ? "Loading…" : "Sign Up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
