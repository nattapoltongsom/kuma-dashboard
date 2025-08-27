"use client";

import { Menu } from "lucide-react";
import Image from "next/image";

export default function Navbar({ onMenu }: { onMenu: () => void }) {
  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur shadow-sm">
      <div className="pointer-events-none h-1 w-full bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400" />
      <div className="flex h-14 items-center justify-between px-4">
        <button
          className="rounded-lg p-2 hover:bg-gray-100"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={80}
            height={50}
            className="rounded"
          />
          <span className="font-semibold bg-gradient-to-r from-sky-300 via-orange-400 via-pink-400 to-emerald-600 bg-clip-text text-transparent">
            Dashboard
          </span>
        </div>

        <div className="w-5" />
      </div>
    </nav>
  );
}
