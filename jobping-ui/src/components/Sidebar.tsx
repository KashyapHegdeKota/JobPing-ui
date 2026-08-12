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
      <div className="flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-md font-sans">
        <div className="flex h-16 items-center px-6 border-b border-zinc-800">
          <Link href="/" className="text-xl font-bold tracking-tighter text-zinc-100 flex items-center gap-2">
            JobPing<span className="text-cyan-400">.</span>
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
                className={`group flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-800/50 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                <Icon className={`h-5 w-5 transition-colors duration-200 ${isActive ? "text-cyan-400" : "text-zinc-500 group-hover:text-cyan-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 p-4">
          {user ? (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3 rounded-lg p-2 bg-zinc-900 border border-zinc-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-950/50 text-cyan-400 font-bold uppercase border border-cyan-900/50">
                  {user.email?.[0] || user.displayName?.[0] || "?"}
                </div>
                <div className="flex-1 truncate">
                  <div className="truncate text-sm font-medium text-zinc-200">
                    {user.displayName || user.email?.split("@")[0] || "User"}
                  </div>
                  <div className="text-xs text-zinc-500 font-mono">
                    Free Tier
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="group flex w-full items-center justify-center space-x-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400 hover:border-red-900/50"
              >
                <LogOut className="h-4 w-4 group-hover:text-red-400 transition-colors" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full rounded-md bg-cyan-400/10 border border-cyan-400/20 px-4 py-2 text-sm font-medium text-cyan-400 transition-all hover:bg-cyan-400/20 hover:border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]"
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
