import Link from 'next/link';
import { ArrowUpRight, Bell, Compass } from 'lucide-react';
import styles from './DiscoveryContext.module.css';

export default function Filters() {
  return <aside className={styles.panel} aria-label="Job discovery context">
    <section className={styles.card}>
      <span className={styles.icon}><Bell size={18} aria-hidden="true" /></span>
      <h2>Your next opportunity could arrive any minute.</h2>
      <p>Choose the roles and seasons you care about. Let your inbox bring the right ones to you.</p>
      <Link href="/profile">Set up email alerts <ArrowUpRight size={14} aria-hidden="true" /></Link>
    </section>
    <section className={styles.card}>
      <span className={styles.icon}><Compass size={18} aria-hidden="true" /></span>
      <h2>A little intention goes a long way.</h2>
      <ul><li>Search a role, company, or city.</li><li>Narrow by season and posted date.</li><li>Open a role to apply on the employer’s site.</li></ul>
      <p className={styles.note}>Discovery dates show when JobPing found a role. Posted dates come from the source when available.</p>
    </section>
  </aside>;
}
