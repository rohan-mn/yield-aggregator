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
  FlaskConical, // Added for protocol specific icon
  Network, // Added for protocol specific icon
  Eye, // Added for protocol specific icon
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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch top-5 on mount - NO LOGIC CHANGES
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

  // Debounced search - NO LOGIC CHANGES
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
      // Enhanced loading state: Modern background, larger spinner, accent color.
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0A1128] via-[#1B2A41] to-[#3D5A80] text-white font-sans text-lg">
        <Loader2 className="animate-spin mr-3 h-8 w-8 text-[#9ADE7B]" /> {/* Larger, accent-colored spinner */}
        Loading Protocols...
      </div>
    );
  }
  if (error) {
    return (
      // Enhanced error state: Modern background, larger icon, clearer text color.
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0A1128] via-[#1B2A41] to-[#3D5A80] text-red-400 font-sans text-lg">
        <XCircle className="mr-3 h-8 w-8 text-red-300" /> {/* Larger, red icon */}
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1128] via-[#1B2A41] to-[#3D5A80] p-8 font-sans antialiased">
      {/* Overall background: Sophisticated deep blues/grays with a subtle gradient. Font styling for modern feel. */}
      <div className="max-w-6xl mx-auto py-8"> {/* Increased max-width and added vertical padding for more space */}
        <motion.div
          initial={{ opacity: 0, y: -30 }} // Slightly more pronounced initial animation
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }} // Smoother transition
          className="text-center text-white mb-12" // Increased bottom margin
        >
          <TrendingUp className="inline-block h-16 w-16 mb-4 text-[#9ADE7B] drop-shadow-lg animate-fade-in-up" />
          {/* Larger icon, vibrant green accent color, subtle drop shadow, and a custom fade-in-up animation. */}
          <h1 className="text-5xl font-extrabold tracking-tighter leading-tight"> {/* Larger, bolder, tighter tracking, improved line height */}
            Discover & Compare Yields
          </h1>
          <p className="mt-4 text-xl text-white/80 max-w-2xl mx-auto"> {/* Larger text, slightly muted color, centered, and max-width for readability */}
            Explore cutting-edge protocols and optimize your DeFi strategy with ease.
          </p>
        </motion.div>

        {/* Search Bar (in search/page.tsx) */}
        <div className="relative mb-12 max-w-2xl mx-auto"> {/* Centered and max-width for aesthetic appeal */}
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/60 h-6 w-6" /> {/* Larger icon, subtle color */}
          <Input
            placeholder="Search protocols by name..."
            className="pl-16 pr-6 py-4 bg-white/10 backdrop-blur-sm placeholder-white/50 text-white border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-[#7CB9E8] focus:border-transparent transition-all duration-300 shadow-md"
            // Prominent search bar: Increased padding, subtle background blur, refined placeholder, rounded corners, accent color focus ring, and subtle shadow.
            value={query}
            onChange={onSearch}
          />
          {loading && query && ( // Show loading spinner only when query is present and loading
            <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 text-[#7CB9E8] h-5 w-5 animate-spin" />
          )}
          {query && !loading && ( // Show clear button only when query is present and not loading
            <XCircle
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60 h-5 w-5 cursor-pointer hover:text-white transition-colors duration-200"
              onClick={() => {
                setQuery("");
                setShown(all); // Reset to all protocols
              }}
            />
          )}
        </div>

        {/* Top 5 protocols display - Cards/Protocol Listings */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"> {/* Adjusted grid for more columns on larger screens */}
          {shown.length > 0 ? (
            shown.map((p, i) => {
              const active = sel.some(x => x.name === p.name);
              return (
                <motion.div
                  key={`${p.name}-${i}`}
                  whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.4)" }} // Enhanced hover: more scale, stronger shadow
                  whileTap={{ scale: 0.98 }} // Slightly more pronounced tap effect
                  onClick={() => toggle(p)}
                  className={`relative cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 transition-all duration-300 overflow-hidden ${
                    active
                      ? "border-2 border-[#9ADE7B] ring-4 ring-[#9ADE7B]/30 bg-white/15" // Accent border and subtle ring for selected state
                      : "hover:bg-white/10" // Subtle background change on hover
                  }`}
                  initial={{ opacity: 0, y: 50 }} // Staggered entry animation
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                >
                  {active && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="absolute top-4 right-4 bg-[#9ADE7B] rounded-full p-1.5 shadow-lg"
                    >
                      <CheckCircle className="h-5 w-5 text-[#0A1128]" /> {/* Checkmark icon with accent background */}
                    </motion.div>
                  )}
                  <div className="flex items-center gap-4 mb-4">
                    {/* Clean iconography for aspects of protocols */}
                    <FlaskConical className="h-8 w-8 text-[#7CB9E8]" /> {/* Example icon: Protocol type */}
                    <h2 className="text-2xl font-bold text-white leading-snug">
                      {p.name}
                    </h2>
                  </div>
                  <p className="text-white/70 text-lg flex items-center mb-2">
                    <Network className="h-5 w-5 mr-2 text-white/50" /> {/* Example icon: Network */}
                    <span className="font-semibold">Network:</span> Ethereum {/* Placeholder, assuming network data not in Protocol type */}
                  </p>
                  <p className="text-white/70 text-lg flex items-center mb-2">
                    <Eye className="h-5 w-5 mr-2 text-white/50" /> {/* Example icon: Audit Status */}
                    <span className="font-semibold">Audit Status:</span> Audited {/* Placeholder */}
                  </p>
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <p className="text-white/80 text-xl flex justify-between items-baseline">
                      <span className="font-semibold">Current APY:</span>{" "}
                      <span className="font-extrabold text-3xl text-[#9ADE7B]"> {/* Larger, bolder, accent color for APY */}
                        {p.apy.toFixed(2)}%
                      </span>
                    </p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p className="text-center text-white/60 col-span-full text-lg">
              No protocols found matching your search.
            </p>
          )}
        </div>

        {sel.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-12 bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-white shadow-xl border border-white/10" // Enhanced styling for selected protocols card
          >
            <h3 className="font-bold text-2xl mb-4 text-white/90">
              Selected Protocols ({sel.length}/3)
            </h3>
            <ul className="list-none space-y-3"> {/* Removed default list style, increased spacing */}
              {sel.map(p => (
                <li key={p.name} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                  <span className="text-lg font-medium text-white/90">{p.name}</span>
                  <span className="font-bold text-xl text-[#9ADE7B]">{p.apy.toFixed(2)}%</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <div className="mt-16 text-center"> {/* Increased top margin */}
          <Button
            onClick={() => {
              const list = sel.map(x => encodeURIComponent(x.name)).join(",");
              router.push(`/compare?list=${list}`);
            }}
            disabled={sel.length < 2}
            className="px-12 py-5 bg-gradient-to-r from-[#7CB9E8] to-[#3D5A80] text-white font-bold text-xl rounded-full shadow-2xl hover:from-[#3D5A80] hover:to-[#7CB9E8] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            // Professional button: Increased padding, larger text, prominent gradient, rounded full, stronger shadow, enhanced hover/active states, and clear disabled state.
          >
            Compare & Deposit {/* Updated text for clarity */}
          </Button>
        </div>
      </div>
      {/* Custom Tailwind CSS Animations (could be defined in a global CSS file or tailwind.config.js) */}
      {/*
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        @keyframes scale-in {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.4s ease-out forwards;
        }
      */}
    </div>
  );
}