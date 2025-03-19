import Link from "next/link";
import React from "react";

export default function HomeNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white flex items-center px-2 pr-5 z-50">
      <div className="flex items-center gap-4 w-full">
        {/* Menu  add logo */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/">
            <div className="p-4 flex items-center gap-1 cursor-pointer">
              <p className="text-xl font-semibold tracking-tight">1212121</p>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
