import { ProfileDropdown } from "@/components/ProfileDropdown";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { HiMenu } from "react-icons/hi";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Videos", href: "/videos" },
    { name: "Progress", href: "/progress" },
  ];

  return (
    <header className="top-0 z-50 w-full bg-white dark:bg-zinc-900 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo and Desktop Navigation */}
        <div className="flex items-center space-x-8">
          <h1 className="text-xl md:text-2xl font-bold leading-none bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Krunal's Fitness App
          </h1>

          {/* Desktop Navigation - vertically centered with logo */}
          <nav className="hidden md:flex pl-2 items-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-lg mt-2 font-medium transition-colors ${
                  pathname === item.href
                    ? "text-blue-600 dark:text-blue-500"
                    : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Profile Dropdown (desktop only) and Mobile Menu Button */}
        <div className="flex items-center space-x-2">
          <div className="hidden md:block">
            <ProfileDropdown />
          </div>
          <button
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <HiMenu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden px-4 pb-4 pt-2 border-t dark:border-zinc-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Navigation Items */}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block py-2 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "text-blue-600 dark:text-blue-500"
                  : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          {/* Settings and Sign Out */}
          <div className=" dark:border-zinc-700 ">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                router.push("/settings");
              }}
              className="block w-full text-left py-2 text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500"
            >
              Settings
            </button>
            <button
              onClick={async () => {
                setIsMenuOpen(false);
                await signOut(auth);
              }}
              className="block w-full text-left py-2 text-sm font-medium text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500"
            >
              Sign out
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}