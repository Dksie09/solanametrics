import Realtime from "./components/Realtime";
import Performance from "./components/Performance";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <main
      className="flex min-h-screen flex-col items-center p-5 sm:p-24 relative overflow-clip scroll-smooth"
      id="home"
    >
      <div className="absolute top-0 w-full">
        <div className="mx-auto max-w-[90%] h-5 bg-gradient-to-r from-transparent via-purple-700 to-transparent">
          <p className="text-center text-sm text-white">
            Beta version: Using rate-limited RPC. Data updates every 3 minutes.
            Performance may vary.
          </p>
        </div>
      </div>
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
