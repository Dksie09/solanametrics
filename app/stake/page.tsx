"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { Data } from "../components/Data";
import Navbar from "./navbar";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleScroll = () => {
    if (inputRef.current) {
      const address = inputRef.current.value.trim();
      if (address) {
        setWalletAddress(address);
        window.scrollTo({
          top: inputRef.current.offsetTop - 20, // Adjust the offset as needed
          behavior: "smooth",
        });
      } else {
        setWalletAddress(null);
      }
    }
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center p-5 sm:p-24 relative overflow-clip scroll-smooth"
      id="home"
    >
      <Navbar />
      <h1 className="text-4xl sm:text-6xl mt-20 text-center font-bold">
        Staking <br />
        Reward Statements
      </h1>
      <p className="text-lg sm:text-xl text-center mt-5 opacity-40">
        Get the full history of staking rewards for all your stake accounts.
      </p>
      <div className="flex w-full max-w-sm items-center gap-1.5 h-auto mt-20">
        <input
          ref={inputRef}
          id="walletAddress"
          placeholder="Enter your wallet address"
          className="py-4 focus:bg-black focus:outline-none px-8 w-80 bg-black border-purple-400 rounded-full border border-input"
        />
        <Button
          variant="outline"
          className="rounded-full border-purple-400"
          size="icon"
          onClick={handleScroll}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <img
        src="/solana-ring.webp"
        alt="Solana"
        className="absolute -top-0 -left-2/3 -z-10"
      />
      <img
        src="/solana-ring.webp"
        alt="Solana"
        className="absolute -top-10 -right-2/3 -z-10"
      />
      {walletAddress && (
        <div className="mt-20">
          <Data address={walletAddress} />
        </div>
      )}
    </main>
  );
}
