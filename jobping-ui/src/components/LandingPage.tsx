"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import AuthModal from "./AuthModal";
import "./landing.css";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const closeMenu = () => setMenuOpen(false);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  const openAuth = (mode: "signin" | "signup") => { setAuthMode(mode); setAuthOpen(true); closeMenu(); };
  return <div className="jp-landing">

  <a className="skip-link" href="#main">Skip to content</a>
  <svg style={{position:"absolute",width:0,height:0,overflow:"hidden"}} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <symbol id="brand-mark" viewBox="0 0 32 32"><rect width="32" height="32" rx="10" fill="#B9F6DD"/><g fill="none" stroke="#101D35" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 11V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><rect x="6" y="11" width="20" height="15" rx="3"/><path d="M6 16q10 6 20 0"/></g><rect x="14.5" y="17" width="3" height="4" rx="1" fill="#101D35"/></symbol>
    <symbol id="briefcase" viewBox="0 0 24 24"><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><rect x="2.5" y="7" width="19" height="14" rx="3"/><path d="M3 12q9 6 18 0"/><rect x="10.5" y="12.5" width="3" height="4" rx="1"/></symbol>
    <symbol id="bell" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></symbol>
    <symbol id="mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/></symbol>
    <symbol id="settings" viewBox="0 0 24 24"><path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/></symbol>
    <symbol id="check" viewBox="0 0 24 24"><path d="m5 12 4 4 10-10"/></symbol>
  </svg>
  <header>
    <div className="container header">
      <Link className="brand" href="/" aria-label="JobPing home"><svg aria-hidden="true"><use href="#brand-mark"/></svg>jobping</Link>
      <nav className="nav" aria-label="Main navigation"><a href="#how-it-works" onClick={closeMenu}>How it works</a><Link href="/jobs" onClick={closeMenu}>Live opportunities</Link><Link href="/profile" onClick={closeMenu}>Daily recap</Link></nav>
      <div className="actions"><button className="btn quiet" type="button" onClick={() => openAuth("signin")}> Log in</button><button className="btn" type="button" onClick={() => openAuth("signup")}> Get started <span aria-hidden="true">→</span></button></div>
      <button className="mobile-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-nav"><svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
    </div>
    <nav className={`mobile-nav ${menuOpen ? "open" : ""}`} id="mobile-nav" aria-label="Mobile navigation"><a href="#how-it-works" onClick={closeMenu}>How it works</a><Link href="/jobs" onClick={closeMenu}>Live opportunities</Link><Link href="/profile" onClick={closeMenu}>Daily recap</Link><button className="btn" type="button" onClick={() => openAuth("signup")}> Get started →</button></nav>
  </header>
  <main id="main">
    <section className="hero" aria-labelledby="hero-title"><div className="container hero-grid">
      <div><span className="eyebrow"><span className="dot" aria-hidden="true"></span>Built for tech’s next generation</span>
        <h1 id="hero-title">Get pinged.<br />Get ahead.</h1>
        <p className="hero-copy">Your first tech role shouldn’t be a race against refresh.<br />Discover new grad jobs and internships as they drop,<br />with instant email alerts and a daily recap.</p>
        <div className="hero-actions"><button className="btn" type="button" onClick={() => openAuth("signup")}> Find my next opportunity <span aria-hidden="true">→</span></button><Link className="btn secondary" href="/jobs" onClick={closeMenu}>Explore the live feed</Link></div>
        <div className="benefits"><span className="benefit"><svg className="icon" aria-hidden="true"><use href="#check"/></svg>Instant email alerts</span><span className="benefit"><svg className="icon" aria-hidden="true"><use href="#check"/></svg>New grad + internships</span></div>
      </div>
      <div className="hero-art">
        <svg className="briefcase" xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360" role="img" aria-labelledby="case-title case-desc">
          <title id="case-title">Your next chapter, ready to go</title><desc id="case-desc">A mint briefcase gently bounces with a small notification badge.</desc>
          <circle cx="180" cy="180" r="144" fill="#EAF8F1"/><circle cx="180" cy="180" r="124" fill="none" stroke="#D3EBDF" strokeWidth="1" strokeDasharray="4 8"/>
          <ellipse className="shadow" cx="180" cy="302" rx="94" ry="12" fill="#101D35" opacity=".16"/>
          <g className="case"><path d="M139 111V94a13 13 0 0 1 13-13h56a13 13 0 0 1 13 13v17" fill="none" stroke="#101D35" strokeWidth="14" strokeLinejoin="round"/><path d="M148 111V98a7 7 0 0 1 7-7h50a7 7 0 0 1 7 7v13" fill="none" stroke="#B9F6DD" strokeWidth="5"/><rect x="62" y="119" width="236" height="155" rx="25" fill="#101D35"/><rect x="54" y="110" width="236" height="155" rx="25" fill="#B9F6DD" stroke="#101D35" strokeWidth="5"/><path d="M55 148c0 24 48 43 117 43s117-19 117-43" fill="none" stroke="#101D35" strokeWidth="5"/><path d="M84 212v24M260 212v24" stroke="#71C5A0" strokeWidth="4" strokeLinecap="round"/><rect x="156" y="174" width="32" height="35" rx="9" fill="#101D35"/><rect x="166" y="181" width="12" height="18" rx="4" fill="#FFFFFF"/><path d="M77 134h22" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity=".8"/></g>
          <g className="ping"><circle cx="278" cy="105" r="36" fill="#FFFFFF" stroke="#101D35" strokeWidth="4"/><path d="M269 95v-6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6" fill="none" stroke="#12694C" strokeWidth="3.5"/><rect x="259" y="95" width="38" height="28" rx="5" fill="#B9F6DD" stroke="#12694C" strokeWidth="3.5"/><path d="M260 104q18 10 36 0" fill="none" stroke="#12694C" strokeWidth="3"/><rect x="275" y="105" width="6" height="7" rx="2" fill="#12694C"/><circle cx="307" cy="80" r="9" fill="#6554C0" stroke="#FFFFFF" strokeWidth="3"/></g>
          <path d="M41 85h12M47 79v12M305 226h12M311 220v12" stroke="#12694C" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <div className="notification"><svg className="icon" aria-hidden="true"><use href="#bell"/></svg><div><strong>Your next chapter just dropped.</strong><span>Illustrative alert · Software Engineer, New Grad</span></div></div>
        <p className="art-note">Your next chapter starts with a ping.</p>
      </div>
    </div></section>
    <section className="value-strip" aria-label="Why JobPing"><div className="container values"><div className="value"><svg className="icon" aria-hidden="true"><use href="#briefcase"/></svg>New roles. No refresh.</div><div className="value"><svg className="icon" aria-hidden="true"><use href="#bell"/></svg>A ping when it’s a match.</div><div className="value"><svg className="icon" aria-hidden="true"><use href="#mail"/></svg>One recap. Once a day.</div></div></section>
    <section className="container how" id="how-it-works" aria-labelledby="how-title"><div className="section-heading"><h2 id="how-title">Less searching. More starting.</h2><span className="section-kicker">YOUR HEAD START, IN THREE STEPS</span></div>
      <div className="steps"><article className="step"><div className="step-top"><span>01</span><svg className="icon" aria-hidden="true"><use href="#settings"/></svg></div><h3>Pick your path.</h3><p>Choose internships or new grad roles and the hiring seasons you want to hear about.</p></article><article className="step"><div className="step-top"><span>02</span><svg className="icon" aria-hidden="true"><use href="#bell"/></svg></div><h3>Let the pings come to you.</h3><p>Opt in to alerts for newly discovered or reposted matching opportunities.</p></article><article className="step"><div className="step-top"><span>03</span><svg className="icon" aria-hidden="true"><use href="#mail"/></svg></div><h3>Catch up, once a day.</h3><p>Your 8 PM recap brings matching opportunities together in your timezone.</p></article></div>
    </section>
  </main>
  <footer className="footer"><div className="container footer-inner"><Link className="brand" href="/" aria-label="JobPing home"><svg aria-hidden="true"><use href="#brand-mark"/></svg>jobping</Link><p>Your next chapter starts with a ping.</p><div className="footer-links"><Link href="/jobs">Browse jobs</Link><Link href="/profile">Email preferences</Link></div></div></footer>
<AuthModal key={authMode} isOpen={authOpen} onClose={closeAuth} initialMode={authMode} />
  </div>;
}

