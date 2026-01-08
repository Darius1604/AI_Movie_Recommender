import Link from "next/link";
import { Home, Compass, Heart, Clapperboard } from "lucide-react";

export default function Navbar() {
  return (
    <div className="relative w-full h-[55vh] flex flex-col items-center justify-center bg-brand-bg overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-accent/20 via-brand-bg to-brand-bg">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent" />
      </div>

      {/* Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Hero Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-secondary blur-xl opacity-50 rounded-full" />
            <div className="relative bg-gradient-to-br from-brand-primary to-brand-secondary p-3 rounded-2xl shadow-2xl text-black">
              <Clapperboard size={32} />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
          <span className="bg-gradient-to-r from-white via-brand-primary to-brand-secondary bg-clip-text text-transparent">
            AI Movie Recommendations
          </span>
        </h1>

        <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed mb-6">
          Discover your next favorite film with personalized AI-powered
          recommendations tailored to your unique taste.
        </p>

        {/* Decorative Line */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-brand-primary" />
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse delay-150" />
            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse delay-300" />
          </div>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-brand-secondary" />
        </div>
      </div>

      {/* Floating Pill Navigation */}
      <div className="relative z-10 flex items-center gap-1 bg-brand-surface/60 backdrop-blur-xl p-1 rounded-full border border-white/5 shadow-2xl shadow-brand-primary/5">
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary text-black text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 transition-all duration-300 hover:scale-105"
        >
          <Home size={16} /> Home
        </Link>
        <Link
          href="/discover"
          className="px-6 py-2.5 rounded-full text-zinc-400 hover:text-white text-sm font-semibold flex items-center gap-2 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-primary/10"
        >
          <Compass size={16} /> Discover
        </Link>
        <Link
          href="/favorites"
          className="px-6 py-2.5 rounded-full text-zinc-400 hover:text-white text-sm font-semibold flex items-center gap-2 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-secondary/10"
        >
          <Heart size={16} /> Favorites
        </Link>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-bg via-brand-bg/80 to-transparent" />
    </div>
  );
}
