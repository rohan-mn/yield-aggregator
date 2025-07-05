"use client";

import { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { BrowserProvider, Contract, parseEther } from "ethers";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Activity,
  Zap,
} from "lucide-react";

// ——————————————
// Contracts
// ——————————————
const AGG_ADDRESS =
  "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0".toLowerCase();
const AGG_ABI = ["function depositHighest() external payable"] as const;

// ——————————————
// Types & Labels
// ——————————————
type ApyResponse = { A: number; B: number };
type HistoryPoint = { time: number; a: number; b: number };

const LABEL_A = "Aave-V3";
const LABEL_B = "Binance Staked ETH";

export default function Home() {
  // ——————————————
  // State
  // ——————————————
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [agg, setAgg] = useState<Contract | null>(null);
  const [apy, setApy] = useState<ApyResponse>({ A: 0, B: 0 });
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // ——————————————
  // Connect wallet
  // ——————————————
  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const modal = new Web3Modal({ cacheProvider: true });
      const instance = await modal.connect();
      const prov = new BrowserProvider(instance);
      setProvider(prov);

      const signer = await prov.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      const contract = new Contract(AGG_ADDRESS, AGG_ABI, signer);
      setAgg(contract);
    } catch (err) {
      console.error("Wallet connect failed", err);
    } finally {
      setIsConnecting(false);
    }
  };

  // ——————————————
  // Load APYs from your backend, which now returns:
  // { "Aave-V3": 0.047, "Binance Staked ETH": 242.725 }
  // We map those into { A, B } for the UI.
  // ——————————————
  const loadApy = async () => {
    try {
      // fetch a generic record
      const res = await axios.get<Record<string, number>>("/api/apy");
      const data = res.data;
      // pull out by exact labels, fallback to 0
      const a = data[LABEL_A] ?? 0;
      const b = data[LABEL_B] ?? 0;
      setApy({ A: a, B: b });

      // update history
      setHistory((prev) => [
        ...prev.slice(-20),
        { time: Date.now(), a, b },
      ]);
    } catch (err) {
      console.error("Failed to load APYs", err);
    }
  };

  useEffect(() => {
    loadApy();
    const iv = setInterval(loadApy, 5_000);
    return () => clearInterval(iv);
  }, []);

  // ——————————————
  // Deposit to highest yield
  // ——————————————
  const deposit = async () => {
    if (!agg) return;
    setIsDepositing(true);
    try {
      const tx = await agg.depositHighest({ value: parseEther("0.01") });
      await tx.wait();
      alert("✅ Deposited 0.01 ETH to best yield!");
    } catch (err) {
      console.error("Deposit failed", err);
      alert("Deposit failed—see console");
    } finally {
      setIsDepositing(false);
    }
  };

  // ——————————————
  // Determine best-yield
  // ——————————————
  const bestIsA = (apy.A ?? 0) >= (apy.B ?? 0);
  const bestLabel = bestIsA ? LABEL_A : LABEL_B;
  const bestApy = bestIsA ? apy.A : apy.B;

  // ——————————————
  // Render
  // ——————————————
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 sm:px-8 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DeFi Yield Aggregator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Automatically deposit to the highest-yielding protocol
          </p>
        </div>

        {!provider ? (
          // Connect UI
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
                  <Wallet className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
                <CardDescription>
                  Connect your Web3 wallet to start earning optimal yields
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full h-12 text-lg"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Connecting…
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-5 w-5" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Dashboard UI
          <div className="space-y-6 bg-card p-6 rounded-xl shadow-md">
            {/* Wallet Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                      <Wallet className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Wallet Connected</p>
                      <p className="text-sm text-muted-foreground">
                        {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* APY Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    {LABEL_A}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {(apy.A ?? 0).toFixed(2)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current APY
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    {LABEL_B}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {(apy.B ?? 0).toFixed(2)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current APY
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-yellow-200 dark:border-yellow-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    Best Yield
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {(bestApy ?? 0).toFixed(2)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bestLabel}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Deposit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Smart Deposit
                </CardTitle>
                <CardDescription>
                  Auto-deposit to {bestLabel} ({(bestApy ?? 0).toFixed(2)}%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Deposit Amount: 0.01 ETH</p>
                    <p className="text-sm text-muted-foreground">
                      Funds go to the highest-yielding protocol
                    </p>
                  </div>
                  <Button
                    onClick={deposit}
                    disabled={isDepositing}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {isDepositing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Deposit to Best Yield
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* APY History Chart */}
            <Card>
              <CardHeader>
                <CardTitle>APY History</CardTitle>
                <CardDescription>
                  {LABEL_A} vs {LABEL_B} over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasMounted && history.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history}>
                        <defs>
                          <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor="#3b82f6"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3b82f6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor="#8b5cf6"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#8b5cf6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="time"
                          tickFormatter={(t: number) =>
                            new Date(t).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          }
                          className="text-xs"
                        />
                        <YAxis
                          tickFormatter={(v: number) => `${v}%`}
                          className="text-xs"
                        />
                        <Tooltip
                          labelFormatter={(t: number) =>
                            new Date(t).toLocaleString()
                          }
                          formatter={(value: number) => `${value.toFixed(2)}%`}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="a"
                          name={LABEL_A}
                          stroke="#3b82f6"
                          fill="url(#colorA)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="b"
                          name={LABEL_B}
                          stroke="#8b5cf6"
                          fill="url(#colorB)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Loading APY data…</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                APY data refreshes every 30 seconds. Your funds are
                automatically allocated to the highest-yielding protocol.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
