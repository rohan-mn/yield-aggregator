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

// Environment variables are accessed here, no change to logic.
const AGG_ADDRESS = process.env.NEXT_PUBLIC_AGG_ADDR!;
const AGG_ABI = ["function depositTo(uint256) external payable"] as const;

export default function ConnectPage() {
  // State and auth logic remain untouched.
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

  // Redirect logic remains untouched.
  useEffect(() => {
    if (!authLoading && !session) router.push("/login");
  }, [session, authLoading, router]);

  // Wallet connection logic remains untouched.
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

  // Loading spinner for session verification, enhanced visually.
  if (authLoading || !session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0A1128] via-[#1B2A41] to-[#3D5A80] text-white font-sans text-lg">
        {/* Modern background gradient, premium font, and larger text for loading state */}
        <Loader2 className="animate-spin mr-3 h-6 w-6 text-[#9ADE7B]" /> {/* Larger, accent-colored spinner */}
        Verifying session...
      </div>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0A1128] via-[#1B2A41] to-[#3D5A80] p-4 font-sans antialiased">
      {/* Background and typography similar to the login page for consistency. */}
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-3xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01]">
        {/* Card styling: Matches the professional, sleek aesthetic from the login page, with enhanced blur, rounded corners, and a subtle hover effect. */}
        <CardHeader className="p-8 text-center bg-white/10 border-b border-white/15">
          {/* Card Header: Increased padding, slightly distinct background for visual separation. */}
          <Wallet className="mx-auto h-16 w-16 text-[#7CB9E8] drop-shadow-lg animate-fade-in" />
          {/* Icon: Larger, uses a cool blue accent, subtle drop shadow, and a fade-in animation. */}
          <CardTitle className="mt-4 text-3xl text-white font-extrabold tracking-tight">
            Connect Your Wallet
          </CardTitle>
          {/* Title: Larger, bolder, tighter tracking for prominence. */}
          <CardDescription className="mt-2 text-white/70 text-lg">
            Seamlessly link your Web3 wallet to access the platform.
          </CardDescription>
          {/* Description: Enhanced text, slightly larger, and more professional wording. */}
        </CardHeader>

        <CardContent className="p-10 space-y-8">
          {/* Card Content: Increased padding and spacing for better visual flow. */}
          {!connected ? (
            <>
              {/* Error and Warning Messages: Improved styling for better visibility and professionalism. */}
              {error && (
                <div className="flex items-center text-sm font-medium text-red-400 bg-red-400/20 p-3 rounded-lg animate-fade-in">
                  <XCircle className="mr-3 h-5 w-5 text-red-300" /> {error}
                </div>
              )}
              {warning && (
                <div className="flex items-center text-sm font-medium text-yellow-300 bg-yellow-300/20 p-3 rounded-lg animate-fade-in">
                  <Info className="mr-3 h-5 w-5 text-yellow-200" /> {warning}
                </div>
              )}
              <Button
                onClick={connectWallet}
                disabled={connecting}
                className="w-full py-3 bg-gradient-to-r from-[#9ADE7B] to-[#7CB9E8] text-[#0A1128] font-bold text-lg rounded-xl shadow-lg hover:from-[#7CB9E8] hover:to-[#9ADE7B] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
              >
                {/* Connect Wallet Button: Prominent, full-width, with a vibrant gradient, clear text, and distinct hover/active states. Uses flex to center icon and text. */}
                {connecting ? (
                  <Loader2 className="animate-spin h-6 w-6 text-[#0A1128]" />
                ) : (
                  <Wallet className="h-6 w-6" />
                )}
                {connecting ? "Connecting Wallet..." : "Connect Your Wallet"}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-6">
              {/* Connected State: Enhanced visual feedback with larger icon and improved text readability. */}
              <CheckCircle className="mx-auto h-20 w-20 text-[#9ADE7B] animate-bounce-in" />
              {/* Larger, accent-colored checkmark with a subtle bounce-in animation for success feedback. */}
              <h3 className="text-2xl font-extrabold text-white">
                Wallet Successfully Connected!
              </h3>
              {/* Larger, bolder success message. */}
              <p className="text-white/80 break-all font-mono bg-white/10 p-3 rounded-lg text-sm md:text-base">
                {/* Address display: Monospaced font for technical feel, with a subtle background and padding for clarity. Responsive font size. */}
                {walletAddress}
              </p>
              {warning && (
                <div className="flex items-center justify-center text-sm font-medium text-yellow-300 bg-yellow-300/20 p-3 rounded-lg animate-fade-in">
                  {/* Warning message when connected: Centered and styled similarly to the error/warning. */}
                  <Info className="mr-3 h-5 w-5 text-yellow-200" /> {warning}
                </div>
              )}
            </div>
          )}
        </CardContent>

        {connected && (
          <CardFooter className="p-8 bg-white/10 border-t border-white/15">
            {/* Card Footer: Increased padding, slightly distinct background for separation. */}
            <Button
              onClick={() => router.push("/search")}
              className="w-full py-3 bg-gradient-to-r from-[#7CB9E8] to-[#3D5A80] text-white font-bold text-lg rounded-xl shadow-lg hover:from-[#3D5A80] hover:to-[#7CB9E8] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
            >
              {/* Browse Protocols Button: Uses a cool blue-to-deep-blue gradient, strong text, and clear hover/active states. */}
              <Search className="h-6 w-6" /> Browse Protocols
            </Button>
          </CardFooter>
        )}
      </Card>
      {/* Custom Tailwind CSS Animations (could be defined in a global CSS file or tailwind.config.js) */}
      {/* @keyframes fade-in {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fade-in 0.3s ease-out forwards;
      }
      @keyframes bounce-in {
        0% { transform: scale(0.5); opacity: 0; }
        70% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(1); }
      }
      .animate-bounce-in {
        animation: bounce-in 0.5s ease-out forwards;
      }
      */}
    </main>
  );
}