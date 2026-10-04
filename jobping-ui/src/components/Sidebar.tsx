"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, UserPlus, User, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import AuthModal from "./AuthModal";
import ThemeToggle from "./ThemeToggle";
import AnalyticsNav from "./AnalyticsNav";
import Brand from "./Brand";
import styles from "./Sidebar.module.css";

const navItems = [
  { name: "Live feed", href: "/", icon: Home },
  { name: "Trackers", href: "/trackers", icon: List },
  { name: "Referrals", href: "/referrals", icon: UserPlus },
  { name: "Profile & alerts", href: "/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  const handleSignOut = async () => {
    try { await signOut(auth); }
    catch (error) { console.error("Error signing out:", error); }
  };
  const navigation = navItems.map(({ name, href, icon: Icon }) => <Link key={href} href={href}
    aria-current={(href === "/" ? pathname === href : pathname.startsWith(href)) ? "page" : undefined}
    className={styles.link}><Icon size={17} aria-hidden="true" /><span>{name}</span></Link>);

  return <>
    <div className={styles.mobile}>
      <div className={styles.mobileTop}><Brand /><button onClick={() => user ? handleSignOut() : setIsAuthModalOpen(true)}>{user ? "Sign out" : "Sign in"}</button></div>
      <nav aria-label="Mobile navigation" className={styles.mobileLinks}>{navigation}</nav>
      <AnalyticsNav user={user} />
    </div>
    <aside className={styles.sidebar}>
      <Brand />
      <p className={styles.eyebrow}>Your next chapter</p>
      <nav aria-label="Main navigation" className={styles.nav}>{navigation}</nav>
      <AnalyticsNav user={user} />
      <div className={styles.bottom}>
        <div className={styles.note}><small>Your opportunity workspace</small>Make your next move a little more intentional.</div>
        <div className={styles.account}>
          <ThemeToggle />
          {user ? <>
            <div className={styles.identity}><span className={styles.avatar}>{user.email?.[0] || user.displayName?.[0] || "?"}</span>
              <div><span className={styles.name}>{user.displayName || user.email?.split("@")[0] || "User"}</span><small>Your JobPing account</small></div>
            </div>
            <button onClick={handleSignOut} className={styles.signOut}><LogOut size={14} aria-hidden="true" />Sign out</button>
          </> : <button onClick={() => setIsAuthModalOpen(true)} className={styles.signIn}>Sign in to JobPing</button>}
        </div>
      </div>
    </aside>
    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
  </>;
}
