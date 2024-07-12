import Image from "next/image";
import Realtime from "./components/Realtime";
import { Card } from "@/components/ui/card";
import Performance from "./components/Performance";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main
      className="flex min-h-screen flex-col items-center p-5 sm:p-24 relative overflow-clip scroll-smooth"
      id="home"
    >
      <Navbar />
      <h1 className="text-4xl sm:text-6xl mt-20">Solanametrics</h1>
      <p className="text-lg sm:text-xl text-center mt-2">
        A solana dashboard for all the metrics you need.
      </p>
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
      <Realtime />
      <div className=" w-full z-10">
        <Performance />
      </div>
    </main>
  );
}
