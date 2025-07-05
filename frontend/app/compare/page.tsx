// app/compare/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, XCircle, Wallet, TrendingUp, CheckCircle, Info } from "lucide-react";
import { BrowserProvider, Contract, parseEther } from "ethers";
import Web3Modal from "web3modal";
import { motion } from "framer-motion";

const AGG_ADDR = process.env.NEXT_PUBLIC_AGG_ADDR!;
const AGG_ABI = ["function depositTo(uint256) external payable"] as const;

type ProtocolAPY = { name: string; apy: number };

export default function ComparePage() {
  const params = useSearchParams();
  const raw = params.get("list") || "";
  const names = raw.split(",").map(decodeURIComponent);

  const [series, setSeries] = useState<ProtocolAPY[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Connect wallet + contract - NO LOGIC CHANGES
  useEffect(() => {
    (async () => {
      try {
        const modal = new Web3Modal({ cacheProvider: true });
        const inst = await modal.connect();
        const prov = new BrowserProvider(inst, { chainId: 31337, name: "localhost" });
        const signer = await prov.getSigner();
        setContract(new Contract(AGG_ADDR, AGG_ABI, signer));
      } catch (e) {
        console.error(e);
        setMsg("❌ Wallet connection failed. Please ensure a Web3 wallet is installed and connected.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch current APYs - NO LOGIC CHANGES
  const fetchApys = async () => {
    try {
      const results = await Promise.all(
        names.map(name =>
          axios
            .get<{ name: string; apy: number }[]>(
              `/api/protocols?search=${encodeURIComponent(name)}`
            )
            .then(r => {
              const hit =
                r.data.find(p => p.name === name) || r.data[0] || { name, apy: 0 };
              return { name, apy: hit.apy };
            })
        )
      );
      setSeries(results);
    } catch (e) {
      console.error("Failed to fetch APYs", e);
      setMsg("⚠️ Failed to fetch APY data. Data might be outdated.");
    }
  };

  // Initial fetch + interval - NO LOGIC CHANGES
  useEffect(() => {
    fetchApys();
    const iv = setInterval(fetchApys, 30_000);
    return () => clearInterval(iv);
  }, []);

  // Deposit handler - NO LOGIC CHANGES
  const depositTo = async (idx: number) => {
    if (!contract) {
      setMsg("❌ Wallet not connected. Please connect your wallet first.");
      return;
    }
    setDepositing(true);
    setMsg(null);
    try {
      const tx = await contract.depositTo(idx, {
        value: parseEther("0.01"),
      });
      await tx.wait();
      setMsg(`✅ Successfully deposited to ${names[idx]}!`);
    } catch (e: any) {
      console.error(e);
      setMsg(`❌ Deposit failed: ${e.reason || e.message || "Unknown error."}`);
    } finally {
      setDepositing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0A1128] via-[#1B2A41] to-[#3D5A80] text-white font-sans text-lg">
        <Loader2 className="animate-spin mr-3 h-8 w-8 text-[#9ADE7B]" />
        Connecting to Web3 wallet...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1128] via-[#1B2A41] to-[#3D5A80] p-8 font-sans antialiased">
      <div className="max-w-6xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center text-white mb-12"
        >
          <TrendingUp className="inline-block h-16 w-16 mb-4 text-[#9ADE7B] drop-shadow-lg animate-fade-in-up" />
          <h1 className="text-5xl font-extrabold tracking-tighter leading-tight">
            Protocol APY Comparison
          </h1>
          <p className="mt-4 text-xl text-white/80 max-w-2xl mx-auto">
            Visually compare yields from your selected protocols and deposit to optimize your strategy.
          </p>
        </motion.div>

        <Card className="bg-white/5 backdrop-blur-xl shadow-3xl rounded-3xl overflow-hidden border border-white/10 transform transition-all duration-300 hover:scale-[1.005]">
          <CardHeader className="text-center bg-white/10 p-8 border-b border-white/15">
            <CardTitle className="text-3xl text-white font-extrabold tracking-tight">
              Yield Insights
            </CardTitle>
            <CardDescription className="text-white/70 text-lg mt-2">
              Deep dive into APY differences to make informed decisions.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-10 space-y-10">
            {msg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-lg flex items-center text-lg font-medium ${
                  msg.startsWith("✅") ? "bg-green-600/30 text-green-300" : "bg-red-600/30 text-red-300"
                }`}
              >
                {msg.startsWith("✅") ? <CheckCircle className="mr-3 h-6 w-6" /> : <XCircle className="mr-3 h-6 w-6" />}
                {msg}
              </motion.div>
            )}

            <div className="h-80 w-full bg-white/5 rounded-xl p-4 shadow-inner border border-white/10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={series}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="4 4" stroke="#4A4A4A" strokeOpacity={0.7} />
                  <XAxis
                    dataKey="name"
                    stroke="#E0E0E0"
                    tick={{ fill: "#E0E0E0", fontSize: 16, fontWeight: "bold" }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis
                    stroke="#E0E0E0"
                    tickFormatter={v => `${v.toFixed(1)}%`}
                    tick={{ fill: "#E0E0E0", fontSize: 16, fontWeight: "bold" }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 17, 40, 0.9)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "12px",
                      padding: "15px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
                    }}
                    itemStyle={{ color: "#9ADE7B", fontWeight: "bold", fontSize: 16 }}
                    labelStyle={{ color: "#7CB9E8", fontSize: 18, fontWeight: "extrabold", marginBottom: "8px" }}
                    formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name]}
                  />
                  <defs>
                    <linearGradient id="apyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9ADE7B" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#7CB9E8" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  {/* Corrected: Changed "easeOut" to "ease-out" */}
                  <Bar
                    dataKey="apy"
                    fill="url(#apyGradient)"
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {series.map((p, i) => (
                <motion.div
                  key={`${p.name}-${i}`}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
                >
                  <Button
                    onClick={() => depositTo(i)}
                    disabled={depositing}
                    className="w-full py-4 bg-gradient-to-r from-[#7CB9E8] to-[#3D5A80] text-white font-bold text-lg rounded-xl shadow-lg hover:from-[#3D5A80] hover:to-[#7CB9E8] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 ease-in-out flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {depositing ? (
                      <Loader2 className="animate-spin h-6 w-6 text-white" />
                    ) : (
                      <Wallet className="h-6 w-6 text-white" />
                    )}
                    {depositing ? `Depositing to ${p.name}...` : `Deposit 0.01 ETH → ${p.name}`}
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}