import Link from "next/link";

export default function Navbar() {
  return (
    <div className="relative w-full h-[55vh] flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Background with overlay */}
      <div
        className="absolute inset-0 opacity-40 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-image.jpg')" }} // Place your projector image in public/hero-image.jpg
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />

      {/* Hero Content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          AI Movie Recommendations
        </h1>
        <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto font-light">
          Discover your next favorite film with personalized AI-powered
          recommendations tailored to your unique taste.
        </p>
      </div>

      {/* Floating Pill Navigation */}
      <div className="relative z-10 mt-10 flex items-center gap-1 bg-zinc-900/80 backdrop-blur-md p-1 rounded-full border border-zinc-800">
        <Link
          href="/"
          className="px-6 py-2 rounded-full bg-white text-black text-xs font-semibold flex items-center gap-2"
        >
          <span>🏠</span> Home
        </Link>
        <Link
          href="/discover"
          className="px-6 py-2 rounded-full text-white text-xs font-semibold flex items-center gap-2 hover:bg-zinc-800 transition"
        >
          <span>🧭</span> Discover
        </Link>
        <Link
          href="/favorites"
          className="px-6 py-2 rounded-full text-white text-xs font-semibold flex items-center gap-2 hover:bg-zinc-800 transition"
        >
          <span>❤️</span> Favorites
        </Link>
      </div>
    </div>
  );
}
