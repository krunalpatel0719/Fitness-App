// src/components/Navbar.jsx

import { ProfileDropdown } from "@/components/ProfileDropdown";
import Link from "next/link";

export function Navbar() {
  return (
    <header className=" top-0 z-50 w-full ">
      <div className=" flex h-14 items-center justify-between mt-4 pl-6 pr-12">

        <Link href="/dashboard" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-center  bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
               Krunal's Fitness App
            </h1>
        </Link>
       
        <div className="flex items-center space-x-4 ">
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}