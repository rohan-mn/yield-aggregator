// frontend/app/connect/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, CheckCircle, XCircle, Loader2, Search, Info } from "lucide-react";

// Dynamic import for Web3Modal to ensure it's client-side only
let Web3Modal: any;
if (typeof window !== "undefined") {
  Web3Modal = require("web3modal").default;
}

// Import ethers v6 components
import { BrowserProvider, Contract, Signer } from "ethers";

// --- Placeholder for your contract details ---
const AGG_ADDRESS = "0xYourAggregatorContractAddressHere";
const AGG_ABI = [
  // ... your actual ABI fragments here ...
  "function depositTo(uint256) external payable",
];
// --- End Placeholder ---

export default function ConnectPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [aggContract, setAggContract] = useState<Contract | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // **Allow null** in these two so clear-by-null works
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionWarning, setConnectionWarning] = useState<string | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/login");
    }
  }, [session, authLoading, router]);

  const connectWallet = async () => {
    setConnectionError(null);
    setConnectionWarning(null);
    setIsConnecting(true);

    try {
      if (!Web3Modal) {
        throw new Error(
          "Web3Modal not loaded. Make sure this is running client-side."
        );
      }

      const modal = new Web3Modal({ cacheProvider: true });
      const inst = await modal.connect();

      // Disable ENS on localhost
      const prov = new BrowserProvider(inst, {
        chainId: 31337,
        name: "localhost",
        ensAddress: undefined,
      });
      setProvider(prov);

      const network = await prov.getNetwork();
      if (network.chainId === 31337n) {
        setConnectionWarning(
          "ENS is not supported on localhost. You can still proceed."
        );
      }

      const sgnr = await prov.getSigner();
      setSigner(sgnr);

      const addr = await sgnr.getAddress();
      setWalletAddress(addr);

      const contract = new Contract(AGG_ADDRESS, AGG_ABI, sgnr);
      setAggContract(contract);

      setIsConnected(true);
    } catch (err: any) {
      console.error("Wallet connect failed:", err);
      setConnectionError(err.message || "Failed to connect wallet");
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  if (authLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-blue-900 to-purple-700 text-white">
        <Loader2 className="animate-spin mr-2 h-6 w-6" />
        <p>Verifying session…</p>
      </div>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-blue-900 to-purple-700 p-4">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">
        <CardHeader className="p-6 text-center bg-white/10 border-b border-white/20">
          <Wallet className="mx-auto h-12 w-12 text-white" />
          <CardTitle className="mt-2 text-2xl text-white font-semibold">
            Connect Your Wallet
          </CardTitle>
          <CardDescription className="mt-1 text-white/80">
            Link your Web3 wallet to proceed.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {!isConnected ? (
            <>
              {connectionError && (
                <div className="text-center text-sm text-red-300 flex items-center justify-center">
                  <XCircle className="h-4 w-4 mr-2" /> {connectionError}
                </div>
              )}
              {connectionWarning && (
                <div className="text-center text-sm text-yellow-300 flex items-center justify-center">
                  <Info className="h-4 w-4 mr-2" /> {connectionWarning}
                </div>
              )}
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 transition transform hover:scale-105 flex items-center justify-center"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="animate-spin mr-3 h-5 w-5" /> Connecting…
                  </>
                ) : (
                  <>
                    <Wallet className="mr-3 h-5 w-5" /> Connect Wallet
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
              <h3 className="text-xl font-semibold text-white">
                Wallet Connected!
              </h3>
              <p className="text-white/80 break-all">
                Address:{" "}
                <span className="font-mono text-blue-300">
                  {walletAddress}
                </span>
              </p>
              {connectionWarning && (
                <div className="text-xs text-yellow-300 flex items-center justify-center">
                  <Info className="h-3 w-3 mr-1" /> {connectionWarning}
                </div>
              )}
            </div>
          )}
        </CardContent>

        {isConnected && (
          <CardFooter className="p-6 bg-white/10 border-t border-white/20 flex justify-center">
            <Button
              onClick={() => router.push("/search")}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-teal-500 text-white text-lg font-medium rounded-lg shadow-lg hover:from-green-600 hover:to-teal-600 transition transform hover:scale-105 flex items-center justify-center"
            >
              <Search className="mr-3 h-5 w-5" /> Go to Search Page
            </Button>
          </CardFooter>
        )}
      </Card>
    </main>
  );
}
