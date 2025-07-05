// app/login/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error("Login failed: " + error.message);
  }

  // on success, go to connect-wallet
  redirect("/connect");
}

export async function signup(formData: FormData) {
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    throw new Error("Sign-up failed: " + error.message);
  }

  // after signup, you may need email confirmation; redirect to a “check your email” page
  redirect("/login?checkEmail=1");
}
