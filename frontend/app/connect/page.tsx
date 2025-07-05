// app/connect/page.tsx
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
import { BrowserProvider, Contract, Signer } from "ethers";
import Web3Modal from "web3modal";

const AGG_ADDRESS = process.env.NEXT_PUBLIC_AGG_ADDR!;
const AGG_ABI = ["function depositTo(uint256) external payable"] as const;

export default function ConnectPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [provider, setProvider] = useState<BrowserProvider|null>(null);
  const [signer, setSigner]     = useState<Signer|null>(null);
  const [walletAddress, setWalletAddress] = useState<string|undefined>();
  const [aggContract, setAggContract]     = useState<Contract|null>(null);
  const [connecting, setConnecting]       = useState(false);
  const [error, setError]                 = useState<string|null>(null);
  const [warning, setWarning]             = useState<string|null>(null);
  const [connected, setConnected]         = useState(false);

  // redirect if not logged in
  useEffect(() => {
    if (!authLoading && !session) router.push("/login");
  }, [session, authLoading, router]);

  const connectWallet = async () => {
    setError(null);
    setWarning(null);
    setConnecting(true);

    try {
      const modal = new Web3Modal({ cacheProvider: true });
      const inst  = await modal.connect();
      const prov  = new BrowserProvider(inst, { chainId: 31337, name: "localhost" });
      setProvider(prov);

      const net = await prov.getNetwork();
      if (net.chainId === 31337n) {
        setWarning("ENS unavailable on localhost—functionality still works.");
      }

      const sgnr = await prov.getSigner();
      setSigner(sgnr);

      const addr = await sgnr.getAddress();
      setWalletAddress(addr);

      const c = new Contract(AGG_ADDRESS, AGG_ABI, sgnr);
      setAggContract(c);

      setConnected(true);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Wallet connection failed");
      setConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  if (authLoading || !session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-900 to-purple-800 text-white">
        <Loader2 className="animate-spin mr-2"/> Verifying session…
      </div>
    );
  }

  return (
    <main className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-900 to-purple-800 p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        <CardHeader className="p-6 text-center bg-white/20">
          <Wallet className="mx-auto h-12 w-12 text-white"/>
          <CardTitle className="mt-2 text-2xl text-white font-semibold">
            Connect Your Wallet
          </CardTitle>
          <CardDescription className="mt-1 text-white/80">
            Link your Web3 wallet to proceed
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {!connected ? (
            <>
              {error && (
                <div className="flex items-center text-red-300 text-sm">
                  <XCircle className="mr-2"/> {error}
                </div>
              )}
              {warning && (
                <div className="flex items-center text-yellow-300 text-sm">
                  <Info className="mr-2"/> {warning}
                </div>
              )}
              <Button
                onClick={connectWallet}
                disabled={connecting}
                className="w-full h-12 bg-gradient-to-r from-green-400 to-teal-400 text-white font-medium rounded-lg shadow-lg hover:from-green-500 hover:to-teal-500 transition transform hover:scale-105 flex items-center justify-center"
              >
                {connecting
                  ? <Loader2 className="animate-spin mr-2 h-5 w-5"/> 
                  : <Wallet className="mr-2 h-5 w-5"/>}
                {connecting ? "Connecting…" : "Connect Wallet"}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-16 w-16 text-green-400"/>
              <h3 className="text-xl font-semibold text-white">
                Wallet Connected!
              </h3>
              <p className="text-white/80 break-all font-mono">
                {walletAddress}
              </p>
              {warning && (
                <div className="flex items-center text-yellow-300 text-xs">
                  <Info className="mr-1 h-4 w-4"/> {warning}
                </div>
              )}
            </div>
          )}
        </CardContent>

        {connected && (
          <CardFooter className="p-6 bg-white/20 border-t border-white/20">
            <Button
              onClick={()=>router.push("/search")}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 transition transform hover:scale-105 flex items-center justify-center"
            >
              <Search className="mr-2 h-5 w-5"/> Browse Protocols
            </Button>
          </CardFooter>
        )}
      </Card>
    </main>
  );
}
