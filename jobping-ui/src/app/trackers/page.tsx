import { ArrowUpRight, Bell, Check, CircleHelp, Plus, Tag } from "lucide-react";
import styles from "./TrackersPage.module.css";

const examples = [
  { title: "Software engineering internships", description: "Early career roles at product-led companies.", tags: ["Internship", "Remote", "2027"], tone: styles.mint },
  { title: "Mission-driven startups", description: "Small teams hiring thoughtful builders.", tags: ["Startup", "Engineering", "New grad"], tone: styles.blue },
  { title: "Design systems roles", description: "Teams shaping the tools people use every day.", tags: ["Design", "Hybrid", "2027"], tone: styles.peach },
];

export default function TrackersPage() {
  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <div className={styles.intro}>
            <div className={styles.kicker}><span className={styles.kickerIcon}><Bell size={14} aria-hidden="true" /></span>Personal watchlists</div>
            <h1 className={styles.title}>A little focus.<br /><span>A better next step.</span></h1>
            <p className={styles.lede}>Keep the roles and companies you care about close. This preview shows how your trackers will live here once connected to your local JobPing workspace.</p>
          </div>
          <div className={styles.notice}>
            <div className={styles.noticeIcon}><CircleHelp size={18} aria-hidden="true" /></div>
            <p>Trackers currently run through the local CLI. The cards below are sample content, so no job data is being claimed or stored by this page.</p>
          </div>
        </header>

        <section aria-labelledby="workspace-heading" className={styles.section}>
          <div className={styles.sectionHead}>
            <div><p className={styles.eyebrow}>Your workspace</p><h2 id="workspace-heading" className={styles.sectionTitle}>Trackers</h2></div>
            <div className={styles.actions}>
              <span className={styles.preview}>Preview · 3 examples</span>
              <button type="button" aria-disabled="true" title="Tracker creation is available through the local CLI" className={styles.disabledButton}><Plus size={17} aria-hidden="true" />New tracker</button>
            </div>
          </div>
          <div className={styles.grid}>
            {examples.map((tracker) => <article key={tracker.title} className={styles.card}>
              <div className={styles.cardTop}><div className={`${styles.cardIcon} ${tracker.tone}`}><Tag size={19} aria-hidden="true" /></div><span className={styles.sample}>Sample</span></div>
              <h3>{tracker.title}</h3><p className={styles.description}>{tracker.description}</p>
              <div className={styles.tags}>{tracker.tags.map((tag, index) => <span key={tag} className={index === 0 ? styles.primaryTag : styles.tag}>{tag}</span>)}</div>
              <div className={styles.cardFooter}><span className={styles.updated}><Check size={14} aria-hidden="true" />Example tracker</span><button type="button" aria-disabled="true" title="Tracker details will be available when connected" className={styles.view}>View <ArrowUpRight size={14} aria-hidden="true" /></button></div>
            </article>)}
          </div>
        </section>

        <footer className={styles.footer}><div><p className={styles.footerTitle}>Ready to make a tracker?</p><p className={styles.footerText}>Use <code>python -m app.cli trackers create</code> to create one locally.</p></div><div className={styles.footerAside}>Read-only checks · Your API key stays in your environment</div></footer>
      </div>
    </div>
  );
}
