import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "./FeedOverview.module.css";

export default function FeedOverview({ total, loaded, loading }: { total: number | null | undefined; loaded: number; loading: boolean }) {
  return <section className={styles.banner} aria-label="Opportunity overview">
    <div><p className={styles.eyebrow}>Your next chapter is out there</p><h2>Fresh starts. Worth a closer look.</h2><Link href="/profile">Make room for the right ping <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
    <div className={styles.metric}><strong>{total != null ? total.toLocaleString() : loading ? "—" : loaded.toLocaleString()}</strong><span>{total != null ? "roles in the feed" : "roles loaded"}</span></div>
  </section>;
}
