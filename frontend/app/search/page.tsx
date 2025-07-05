// app/search/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import debounce from "lodash.debounce";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  CheckCircle,
  Loader2,
  XCircle,
  TrendingUp,
} from "lucide-react";

type Protocol = { name: string; apy: number };

// dedupe & keep first occurrence
function dedupeProtocols(arr: Protocol[]): Protocol[] {
  return arr.filter((p, idx) => arr.findIndex(x => x.name === p.name) === idx);
}

export default function SearchPage() {
  const [all, setAll] = useState<Protocol[]>([]);
  const [shown, setShown] = useState<Protocol[]>([]);
  const [sel, setSel] = useState<Protocol[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const router = useRouter();

  // Fetch top-5 on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<Protocol[]>("/api/protocols");
        const unique = dedupeProtocols(data).slice(0, 5);
        setAll(unique);
        setShown(unique);
      } catch (e) {
        console.error(e);
        setError("Failed to load top protocols");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Debounced search
  const doSearch = useCallback(debounce(async (q: string) => {
    if (!q) return setShown(all);
    setLoading(true);
    try {
      const { data } = await axios.get<Protocol[]>(
        `/api/protocols?search=${encodeURIComponent(q)}`
      );
      setShown(dedupeProtocols(data));
    } catch (e) {
      console.error(e);
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  }, 300), [all]);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    doSearch(e.target.value);
  };

  const toggle = (p: Protocol) => {
    setSel(s => {
      const exists = s.find(x => x.name === p.name);
      if (exists) return s.filter(x => x.name !== p.name);
      // max 3 selections
      return [...s, p].slice(-3);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-900 to-purple-800 text-white">
        <Loader2 className="animate-spin mr-2" /> Loading…
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-900 to-purple-800 text-red-400">
        <XCircle className="mr-2" /> {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white mb-8"
        >
          <TrendingUp className="inline-block h-10 w-10 mb-2" />
          <h1 className="text-4xl font-extrabold">Choose Protocols</h1>
          <p className="mt-2 text-lg">
            Search or pick from the top 5 to compare yields.
          </p>
        </motion.div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
          <Input
            placeholder="Search protocols…"
            className="pl-12 bg-white/20 placeholder-white/60 text-white focus:bg-white/30"
            value={query}
            onChange={onSearch}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shown.length > 0 ? (
            shown.map((p, i) => {
              const active = sel.some(x => x.name === p.name);
              return (
                <motion.div
                  key={`${p.name}-${i}`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggle(p)}
                  className={`cursor-pointer bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 transition ${
                    active
                      ? "border-2 border-green-400 bg-white/20"
                      : "hover:bg-white/20"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-white">
                      {p.name}
                    </h2>
                    {active && (
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    )}
                  </div>
                  <p className="text-white/80">
                    Current APY:{" "}
                    <span className="font-bold text-white">
                      {p.apy.toFixed(2)}%
                    </span>
                  </p>
                </motion.div>
              );
            })
          ) : (
            <p className="text-center text-white/80 col-span-full">
              No protocols found.
            </p>
          )}
        </div>

        {sel.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-white"
          >
            <h3 className="font-medium mb-2">Selected ({sel.length}/3):</h3>
            <ul className="list-disc list-inside space-y-1">
              {sel.map(p => (
                <li key={p.name}>
                  {p.name} — {p.apy.toFixed(2)}%
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <div className="mt-8 text-center">
          <Button
            onClick={() => {
              const list = sel.map(x => encodeURIComponent(x.name)).join(",");
              router.push(`/compare?list=${list}`);
            }}
            disabled={sel.length < 2}
            className="bg-gradient-to-r from-green-400 to-teal-400 text-white px-8 py-4 text-lg rounded-full shadow-xl hover:from-green-500 hover:to-teal-500 transition disabled:opacity-50"
          >
            Compare & Deposit
          </Button>
        </div>
      </div>
    </div>
  );
}
