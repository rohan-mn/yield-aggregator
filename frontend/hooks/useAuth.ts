// frontend/hooks/useAuth.ts
"use client";

import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseClient } from "@/utils/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) get the current session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2) subscribe to future changes
    const { data: sub } = supabaseClient.auth.onAuthStateChange((_, newSession) => {
      setSession(newSession);
    });

    // clean up
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
