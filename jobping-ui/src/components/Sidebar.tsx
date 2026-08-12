"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, UserPlus, User, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import AuthModal from "./AuthModal";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Trackers", href: "/trackers", icon: List },
  { name: "Referrals", href: "/referrals", icon: UserPlus },
  { name: "Profile", href: "/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white font-mono">
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-gray-900 tracking-tighter">
            JobPing<span className="text-red-500">.</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-gray-900" : "text-gray-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          {user ? (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold uppercase">
                  {user.email?.[0] || user.displayName?.[0] || "?"}
                </div>
                <div className="flex-1 truncate">
                  <div className="truncate text-sm font-medium text-gray-900">
                    {user.displayName || user.email?.split("@")[0] || "User"}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="inline-block rounded bg-gray-100 px-1 py-0.5 mt-0.5 border border-gray-200">Free plan</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center justify-center space-x-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-gray-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
