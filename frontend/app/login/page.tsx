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
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState<string|null>(null);

  const handleSignIn = async () => {
    setMsg(null);
    setLoading(true);
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email, password,
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
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        <CardHeader className="p-6 text-center bg-white/20">
          <TrendingUp className="mx-auto h-12 w-12 text-white" />
          <CardTitle className="mt-2 text-2xl text-white font-semibold">
            Yield Aggregator
          </CardTitle>
          <CardDescription className="mt-1 text-white/80">
            Secure login or sign up to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {msg && (
            <div className="flex items-center text-sm text-red-300">
              <XCircle className="mr-2 h-5 w-5"/> {msg}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="email" className="flex items-center text-white">
              <Mail className="mr-2 h-5 w-5"/> Email
            </Label>
            <Input
              id="email" type="email" value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 bg-white/20 placeholder-white/60 text-white focus:bg-white/30"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="flex items-center text-white">
              <Lock className="mr-2 h-5 w-5"/> Password
            </Label>
            <Input
              id="password" type="password" value={password}
              onChange={e=>setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 bg-white/20 placeholder-white/60 text-white focus:bg-white/30"
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSignIn}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-400 to-teal-400 text-white hover:from-green-500 hover:to-teal-500"
            >
              {loading
                ? <Loader2 className="animate-spin mr-2 h-5 w-5"/> 
                : "Sign In"}
            </Button>
            <Button
              onClick={handleSignUp}
              disabled={loading}
              variant="outline"
              className="flex-1 border-white/50 text-white hover:bg-white/10"
            >
              {loading
                ? "Loading…"
                : "Sign Up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
