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
  CartesianGrid
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card";
import { Loader2, XCircle, Wallet, TrendingUp } from "lucide-react";
import { BrowserProvider, Contract, parseEther } from "ethers";
import Web3Modal from "web3modal";

const AGG_ADDR = process.env.NEXT_PUBLIC_AGG_ADDR!;
const AGG_ABI = [
  "function depositTo(uint256) external payable"
] as const;

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

  // connect wallet + aggregator contract
  useEffect(() => {
    (async () => {
      try {
        const modal = new Web3Modal();
        const inst = await modal.connect();
        const prov = new BrowserProvider(inst);
        const signer = await prov.getSigner();
        setContract(new Contract(AGG_ADDR, AGG_ABI, signer));
      } catch (e) {
        console.error(e);
        setMsg("❌ Wallet connection failed");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // fetch current APYs
  const fetchApys = async () => {
    try {
      const results = await Promise.all(
        names.map(name =>
          axios
            .get<{ name: string; apy: number }[]>(
              `/api/protocols?search=${encodeURIComponent(name)}`
            )
            .then(r => {
              // pick exact name if present else first
              const hit =
                r.data.find(p => p.name === name) || r.data[0] || { name, apy: 0 };
              return { name, apy: hit.apy };
            })
        )
      );
      setSeries(results);
    } catch (e) {
      console.error("Failed to fetch APYs", e);
    }
  };

  // initial + interval
  useEffect(() => {
    fetchApys();
    const iv = setInterval(fetchApys, 30_000);
    return () => clearInterval(iv);
  }, []);

  // deposit handler
  const depositTo = async (idx: number) => {
    if (!contract) return;
    setDepositing(true);
    setMsg(null);
    try {
      const tx = await contract.depositTo(idx, {
        value: parseEther("0.01")
      });
      await tx.wait();
      setMsg(`✅ Deposited to ${names[idx]}`);
    } catch (e: any) {
      console.error(e);
      setMsg(`❌ ${e.reason || e.message}`);
    } finally {
      setDepositing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-900 to-purple-800 text-white">
        <Loader2 className="animate-spin mr-2" />
        Connecting wallet…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center bg-white/20 p-6">
            <TrendingUp className="mx-auto h-12 w-12 text-white" />
            <CardTitle className="mt-2 text-3xl text-white">
              Protocol APY Comparison
            </CardTitle>
            <CardDescription className="text-white/80">
              Choose and deposit to any of your selected protocols
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {msg && (
              <div className="p-3 bg-white/20 rounded-lg text-white">
                {msg}
              </div>
            )}

            {/* === Vertical Bar Chart === */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={series}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis
                    dataKey="name"
                    stroke="#fff"
                    tick={{ fill: "#fff", fontSize: 14 }}
                  />
                  <YAxis
                    stroke="#fff"
                    tickFormatter={v => `${v.toFixed(1)}%`}
                    tick={{ fill: "#fff", fontSize: 14 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.7)",
                      border: "none",
                      borderRadius: "8px"
                    }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar
                    dataKey="apy"
                    fill="url(#gradient)"
                    isAnimationActive={false}
                  />
                  {/* define a nice gradient */}
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {series.map((p, i) => (
                <Button
                  key={`${p.name}-${i}`}
                  onClick={() => depositTo(i)}
                  disabled={depositing}
                  className="bg-gradient-to-r from-green-400 to-teal-400 text-white hover:from-green-500 hover:to-teal-500"
                >
                  {depositing ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <Wallet className="mr-2" />
                  )}
                  Deposit 0.01 ETH → {p.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
