import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

const CONSOLE_MESSAGES = [
  { domain: 'energy', text: 'energy_readings zone=B3 kwh=42.1 (optimal setpoint applied)' },
  { domain: 'occ', text: 'occupancy zone=A2 utilization=91% (overcrowd flag dispatched)' },
  { domain: 'maint', text: 'maintenance asset=HVAC-04 health_score=61 -> scheduled:2wk' },
  { domain: 'sec', text: 'security unauthorized_access zone=C1 badge=none (locked)' },
  { domain: 'occ', text: 'facility_events visitor_sign_in zone=Lobby badge=VIS-8821' },
  { domain: 'energy', text: 'energy_readings zone=B1 kwh=38.7 (tariff peak-shaving active)' },
  { domain: 'intel', text: 'intelligence_engine correlated 2 signals zone=C1 (auto-triaged)' },
  { domain: 'maint', text: 'maintenance asset=PUMP-02 health_score=88 (bearing normal)' },
  { domain: 'occ', text: 'occupancy zone=Parking utilization=37% (ev chargers idle)' },
  { domain: 'sec', text: 'security anomaly_score=0.12 badge=EMP-2291 (normal access)' }
];

const CASE_STUDIES = [
  {
    id: 1,
    tag: 'ENERGY & MAINTENANCE',
    title: 'Chilled Water Plant Thermal Anomaly',
    metric: '-18.4%',
    metricLabel: 'Peak Power Reduction',
    summary: 'Energy Agent detected a 3.4 kW discrepancy in chiller bank B. Correlated with Maintenance Agent vibration data to identify a micro-cavitation valve leak before secondary motor overload.',
    resolution: 'Autonomous setpoint compensation applied in 4 minutes; work order dispatched with 4.2h payback.'
  },
  {
    id: 2,
    tag: 'PREDICTIVE MAINTENANCE',
    title: 'AHU-04 Supply Fan Impending Bearing Seizure',
    metric: '12 Days',
    metricLabel: 'Early Warning Window',
    summary: 'Vibration frequency analysis flagged high-frequency harmonics on AHU-04. Health score degraded from 89 to 58 over 48 hours without tripping legacy static thresholds.',
    resolution: 'Replacement bearing installed during planned weekend cycle, preventing an estimated $14,200 unplanned shutdown.'
  },
  {
    id: 3,
    tag: 'SECURITY & OCCUPANCY',
    title: 'Data Center After-Hours Perimeter Anomaly',
    metric: '11 Sec',
    metricLabel: 'Automated Isolation Latency',
    summary: 'Security Agent captured door-forced contact switch at 02:14:08. Occupancy Agent confirmed zero authenticated badge presence on Floor 2 server wing.',
    resolution: 'Perimeter turnstiles automatically locked, video clip archived, and duty manager alerted within 11 seconds.'
  }
];

export function LandingPage() {
  const navigate = useNavigate();
  const [consoleLines, setConsoleLines] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeFloor, setActiveFloor] = useState('Floor 1');
  const [flippedCards, setFlippedCards] = useState({});
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  // Animated Opening Intro Slide States
  const [introVisible, setIntroVisible] = useState(true);
  const [introSlideOpen, setIntroSlideOpen] = useState(false);
  const [introProgress, setIntroProgress] = useState(15);
  const [introStatus, setIntroStatus] = useState('Syncing 48 Zone Array & IoT Stream Gateways...');
  const [agentsBooted, setAgentsBooted] = useState(['Energy']);

  const playIntroSequence = () => {
    setIntroVisible(true);
    setIntroSlideOpen(false);
    setIntroProgress(15);
    setIntroStatus('Syncing 48 Zone Array & IoT Stream Gateways...');
    setAgentsBooted(['Energy']);

    const t1 = setTimeout(() => {
      setIntroProgress(45);
      setIntroStatus('Spawning 5 Autonomous Domain Specialists...');
      setAgentsBooted(['Energy', 'Maintenance', 'Occupancy']);
    }, 450);

    const t2 = setTimeout(() => {
      setIntroProgress(80);
      setIntroStatus('Calibrating Neural Multi-Agent Consensus Graph...');
      setAgentsBooted(['Energy', 'Maintenance', 'Occupancy', 'Security', 'Cost']);
    }, 950);

    const t3 = setTimeout(() => {
      setIntroProgress(100);
      setIntroStatus('FACILITY AI // ALL SYSTEMS ONLINE');
    }, 1450);

    const t4 = setTimeout(() => {
      setIntroSlideOpen(true);
    }, 1850);

    const t5 = setTimeout(() => {
      setIntroVisible(false);
    }, 2900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  };

  useEffect(() => {
    const cleanup = playIntroSequence();
    return cleanup;
  }, []);

  const skipIntro = () => {
    setIntroProgress(100);
    setIntroStatus('FACILITY AI READY');
    setIntroSlideOpen(true);
    setTimeout(() => setIntroVisible(false), 950);
  };

  const lineIdxRef = useRef(0);
  const pad = (n) => n.toString().padStart(2, '0');

  // Toggle card flip on mobile tap
  const handleCardClick = (cardId) => {
    setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  // Stream console lines
  useEffect(() => {
    const initialLines = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const past = new Date(now.getTime() - (5 - i) * 2200);
      const ts = `${pad(past.getHours())}:${pad(past.getMinutes())}:${pad(past.getSeconds())}`;
      const msg = CONSOLE_MESSAGES[i % CONSOLE_MESSAGES.length];
      initialLines.push({
        id: `init-${i}`,
        time: ts,
        domain: msg.domain,
        text: msg.text
      });
    }
    lineIdxRef.current = 6;
    setConsoleLines(initialLines);

    const interval = setInterval(() => {
      const curr = new Date();
      const ts = `${pad(curr.getHours())}:${pad(curr.getMinutes())}:${pad(curr.getSeconds())}`;
      const msg = CONSOLE_MESSAGES[lineIdxRef.current % CONSOLE_MESSAGES.length];
      const newLine = {
        id: `line-${Date.now()}-${lineIdxRef.current}`,
        time: ts,
        domain: msg.domain,
        text: msg.text
      };
      lineIdxRef.current += 1;

      setConsoleLines(prev => {
        const next = [...prev, newLine];
        return next.length > 10 ? next.slice(next.length - 10) : next;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  // Sticky bottom bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 380) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll reveal
  useEffect(() => {
    const reveals = document.querySelectorAll('.landing-page .reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Intersection Observer for animated counters
  useEffect(() => {
    const counters = document.querySelectorAll('.landing-page [data-count]');
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          const start = performance.now();
          const dur = 1200;

          function step(now) {
            const p = Math.min((now - start) / dur, 1);
            el.textContent = Math.floor(p * target);
            if (p < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = target;
            }
          }
          requestAnimationFrame(step);
          countObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => countObserver.observe(c));
    return () => countObserver.disconnect();
  }, []);

  // Case studies carousel auto-rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % CASE_STUDIES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic Heatmap
  const [heatColors, setHeatColors] = useState(() =>
    Array.from({ length: 48 }, () => `rgba(0, 242, 255, ${0.1 + Math.random() * 0.7})`)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setHeatColors(
        Array.from({ length: 48 }, () => {
          const rand = Math.random();
          // Occasional hotspots (orange/amber)
          if (rand > 0.85) return `rgba(255, 94, 26, ${0.4 + Math.random() * 0.5})`;
          return `rgba(0, 242, 255, ${0.12 + rand * 0.65})`;
        })
      );
    }, 2400);
    return () => clearInterval(interval);
  }, [activeFloor]);

  const filteredLines = selectedFilter === 'all' 
    ? consoleLines 
    : consoleLines.filter(l => l.domain === selectedFilter);

  return (
    <div className="landing-page">
      {/* ANIMATED OPENING INTRO SLIDE - "FACILITY AI" */}
      {introVisible && (
        <div className={`intro-slide-curtain ${introSlideOpen ? 'slide-open' : ''}`}>
          {/* Skip Button */}
          <button
            onClick={skipIntro}
            className="absolute top-6 right-6 z-20 f-mono text-xs text-slate-400 hover:text-[var(--cyan)] border border-slate-700/80 hover:border-[var(--cyan)] px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Skip Intro</span>
            <i className="fas fa-forward text-[10px]"></i>
          </button>

          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl">
            {/* Pulsing Core Icon */}
            <div className="intro-neural-core mb-6 bg-[var(--cyan)]/5">
              <i className="fas fa-brain text-3xl text-[var(--cyan)]"></i>
              <div className="absolute inset-0 rounded-full border border-[var(--orange)]/40 animate-ping opacity-30"></div>
            </div>

            {/* Glowing Brand Title */}
            <div className="f-mono text-xs tracking-[0.3em] text-[var(--orange)] font-bold uppercase mb-2">
              AUTONOMOUS MULTI-AGENT FACILITY NETWORK
            </div>

            <h1 className="f-disp text-5xl md:text-7xl font-bold tracking-tight text-white mb-3 facility-ai-glow">
              FACILITY <span className="text-[var(--cyan)]">AI</span>
            </h1>

            <p className="text-slate-400 text-xs md:text-sm font-mono mb-8 max-w-md">
              Neural Infrastructure · Real-time Autonomous Building Intelligence
            </p>

            {/* 5 Domain Status Indicators */}
            <div className="flex flex-wrap justify-center gap-2 mb-8 f-mono text-[11px]">
              {[
                { name: 'Energy', color: 'var(--energy)' },
                { name: 'Maintenance', color: 'var(--maint)' },
                { name: 'Occupancy', color: 'var(--occ)' },
                { name: 'Security', color: 'var(--sec)' },
                { name: 'Cost', color: 'var(--cost)' }
              ].map((ag) => {
                const isOnline = agentsBooted.includes(ag.name);
                return (
                  <div
                    key={ag.name}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-300 ${
                      isOnline
                        ? 'border-slate-700 bg-slate-900/90 text-white'
                        : 'border-slate-800/40 bg-black/40 text-slate-600 opacity-40'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${isOnline ? 'animate-pulse' : ''}`}
                      style={{ backgroundColor: isOnline ? ag.color : '#475569' }}
                    ></span>
                    <span>{ag.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar Container */}
            <div className="w-full max-w-xs mb-3">
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-[var(--cyan)] via-emerald-400 to-[var(--orange)] intro-progress-bar rounded-full"
                  style={{ width: `${introProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Dynamic Status Text */}
            <div className="f-mono text-[11px] text-[var(--cyan)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)] animate-ping"></span>
              <span>{introStatus}</span>
              <span className="text-slate-500 font-bold ml-1">{introProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* STATUS & TELEMETRY BAR */}
      <header className="border-b border-[var(--border)] bg-[#05080E]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4 overflow-x-auto">
          
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded bg-[var(--cyan)]/10 border border-[var(--cyan)]/30 flex items-center justify-center group-hover:border-[var(--cyan)] transition-colors shadow-sm shadow-[var(--cyan-glow)]">
                <i className="fas fa-diagram-project text-[var(--cyan)] text-xs"></i>
              </div>
              <div className="flex flex-col">
                <span className="f-mono text-xs font-bold tracking-widest text-[var(--text)] group-hover:text-[var(--cyan)] transition-colors">
                  FACILITYOPS<span className="text-[var(--orange)]">.AI</span>
                </span>
                <span className="text-[9px] f-mono text-[var(--text-faint)] leading-none">GRID NETWORK v1.2</span>
              </div>
            </Link>
          </div>

          {/* Active Agent Telemetry Status Indicators */}
          <div className="flex items-center gap-4 f-mono text-[11px] whitespace-nowrap">
            <Link to="/energy" className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-800/40 transition">
              <i className="fas fa-circle pulse-dot text-[8px]" style={{ color: 'var(--energy)' }}></i>
              <span className="text-[var(--text-dim)]">Energy</span>
              <span className="text-[var(--text-faint)]">· 99.8%</span>
            </Link>
            <Link to="/maintenance" className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-800/40 transition">
              <i className="fas fa-circle pulse-dot text-[8px]" style={{ color: 'var(--maint)' }}></i>
              <span className="text-[var(--text-dim)]">Maintenance</span>
              <span className="text-[var(--text-faint)]">· 94.2%</span>
            </Link>
            <Link to="/occupancy" className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-800/40 transition">
              <i className="fas fa-circle pulse-dot text-[8px]" style={{ color: 'var(--occ)' }}></i>
              <span className="text-[var(--text-dim)]">Occupancy</span>
              <span className="text-[var(--text-faint)]">· active</span>
            </Link>
            <Link to="/security" className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-800/40 transition">
              <i className="fas fa-circle pulse-dot text-[8px]" style={{ color: 'var(--sec)' }}></i>
              <span className="text-[var(--text-dim)]">Security</span>
              <span className="text-[var(--text-faint)]">· active</span>
            </Link>
            <Link to="/cost" className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-800/40 transition">
              <i className="fas fa-circle pulse-dot text-[8px]" style={{ color: 'var(--cost)' }}></i>
              <span className="text-[var(--text-dim)]">Cost Engine</span>
              <span className="text-[var(--text-faint)]">· live</span>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="shrink-0 flex items-center gap-2.5">
            <button
              onClick={() => setShowDemoModal(true)}
              className="hidden sm:inline-flex border border-[var(--border)] text-[var(--text-dim)] hover:text-white hover:border-[var(--cyan)] px-3 py-1 rounded text-xs transition"
            >
              Demo Sandbox
            </button>
            <Link
              to="/dashboard"
              className="neon-btn px-4 py-1.5 rounded text-xs flex items-center gap-2 shadow-sm"
            >
              <span>Launch Platform</span>
              <i className="fas fa-arrow-right text-[10px]"></i>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--cyan-dim)]/40 bg-[var(--cyan)]/5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--cyan)] animate-ping"></span>
            <span className="f-mono text-[11px] tracking-widest text-[var(--cyan)] font-semibold uppercase">
              AUTONOMOUS MULTI-AGENT FACILITY NETWORK
            </span>
          </div>

          <h1 className="f-disp text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight mb-6 text-white">
            One shared data layer.<br />
            <span className="bg-gradient-to-r from-[var(--cyan)] via-slate-100 to-[var(--orange)] bg-clip-text text-transparent">
              Five agents
            </span> making sense of it.
          </h1>

          <p className="text-[var(--text-dim)] text-base md:text-lg leading-relaxed mb-8 max-w-xl">
            A commercial facility produces thousands of micro-signals daily — a badge swipe, 
            a sub-harmonic vibration spike, utility rate tariffs. FacilityOps reads every telemetry 
            stream once, then lets five specialized AI agents interpret, correlate, and autonomously resolve issues 
            without disconnected dashboard sprawl.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/dashboard"
              className="neon-btn px-6 py-3.5 rounded-lg text-sm flex items-center gap-2.5 font-semibold"
            >
              <span>Enter Operational Dashboard</span>
              <i className="fas fa-arrow-right text-xs"></i>
            </Link>
            <button
              onClick={() => setShowDemoModal(true)}
              className="neon-orange-btn px-5 py-3.5 rounded-lg text-sm flex items-center gap-2"
            >
              <i className="fas fa-bolt text-xs"></i>
              <span>Simulate Incident</span>
            </button>
            <a
              href="#agents"
              className="text-[var(--text-dim)] hover:text-white transition text-sm flex items-center gap-2 px-2"
            >
              Inspect Specialists <i className="fas fa-chevron-down text-xs"></i>
            </a>
          </div>

          {/* Quick System Badge Bar */}
          <div className="mt-12 pt-8 border-t border-[var(--border)] grid grid-cols-3 gap-4">
            <div>
              <div className="f-mono text-xl font-bold text-white">&lt; 15s</div>
              <div className="text-xs text-[var(--text-faint)] mt-0.5">Incident Isolation</div>
            </div>
            <div>
              <div className="f-mono text-xl font-bold text-[var(--cyan)]">Zero-Trust</div>
              <div className="text-xs text-[var(--text-faint)] mt-0.5">Actuation Layer</div>
            </div>
            <div>
              <div className="f-mono text-xl font-bold text-[var(--orange)]">-18.4%</div>
              <div className="text-xs text-[var(--text-faint)] mt-0.5">Avg. Demand Shaving</div>
            </div>
          </div>
        </div>

        {/* Live Streaming Terminal */}
        <div className="lg:col-span-6 z-10">
          <div className="console rounded-xl overflow-hidden border border-[var(--border-light)] shadow-2xl relative">
            
            {/* Terminal Window Chrome */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[#070B10]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="f-mono text-[11px] text-[var(--text-faint)] ml-2">
                  facility_stream.sock — live telemetry
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="f-mono text-[10px] px-2 py-0.5 rounded bg-[var(--cyan)]/10 text-[var(--cyan)] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)] animate-ping"></span>
                  STREAMING
                </span>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[var(--border)] bg-[#06090E] text-[10px] f-mono overflow-x-auto">
              <span className="text-[var(--text-faint)] mr-1">FILTER:</span>
              {['all', 'energy', 'maint', 'occ', 'sec', 'intel'].map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  className={`px-2 py-0.5 rounded uppercase transition ${
                    selectedFilter === f
                      ? 'bg-[var(--cyan)]/20 text-[var(--cyan)] border border-[var(--cyan)]/40 font-bold'
                      : 'text-[var(--text-dim)] hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Console Log Output */}
            <div className="f-mono text-[11px] leading-relaxed p-4 h-80 overflow-hidden flex flex-col justify-end gap-1.5 bg-[#03060A]">
              {filteredLines.map((line) => (
                <div key={line.id} className="console-line flex items-start gap-2">
                  <span className="text-[var(--text-faint)] shrink-0">[{line.time}]</span>
                  <span
                    className={`font-semibold shrink-0 uppercase text-[9px] px-1.5 py-0.2 rounded ${
                      line.domain === 'energy' ? 'bg-amber-500/20 text-amber-300' :
                      line.domain === 'maint' ? 'bg-orange-500/20 text-orange-300' :
                      line.domain === 'occ' ? 'bg-blue-500/20 text-blue-300' :
                      line.domain === 'sec' ? 'bg-rose-500/20 text-rose-300' :
                      'bg-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    {line.domain}
                  </span>
                  <span className="text-slate-300 break-all">{line.text}</span>
                </div>
              ))}
            </div>

            {/* Terminal Status Footer */}
            <div className="px-4 py-2 bg-[#06090E] border-t border-[var(--border)] flex items-center justify-between text-[10px] f-mono text-[var(--text-faint)]">
              <span>TCP // 10.0.4.12:8000</span>
              <span className="text-[var(--cyan)]">200 OK · 14.8ms response</span>
            </div>
          </div>
        </div>
      </section>

      {/* THE 5 AGENTS - 3D FLIP CARDS SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-[var(--border)]" id="agents">
        <div className="reveal grid lg:grid-cols-12 gap-8 mb-14">
          <div className="lg:col-span-6">
            <div className="f-mono text-[11px] tracking-[0.2em] text-[var(--cyan)] font-semibold mb-3">
              DOMAIN SPECIALIZATION
            </div>
            <h2 className="f-disp text-4xl md:text-5xl font-bold leading-tight text-white">
              Five domains. Five specialists.
            </h2>
          </div>
          <div className="lg:col-span-6 flex items-end">
            <p className="text-[var(--text-dim)] leading-relaxed">
              Hover or tap any specialist card to inspect the underlying machine learning architecture,
              model parameters, input channels, and direct operational console endpoints.
            </p>
          </div>
        </div>

        {/* 3D Flip Card Grid */}
        <div className="reveal grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. Energy Agent */}
          <div 
            className={`card-flip-container ${flippedCards['energy'] ? 'flipped' : ''}`}
            onClick={() => handleCardClick('energy')}
          >
            <div className="card-flip-inner">
              {/* Front */}
              <div className="card-front border-l-4" style={{ borderLeftColor: 'var(--energy)' }}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                      <i className="fas fa-bolt text-lg text-amber-400"></i>
                    </div>
                    <span className="f-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      ACTIVE · 99.8%
                    </span>
                  </div>
                  <h3 className="f-disp text-xl font-bold text-white mb-2">Energy Agent</h3>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed mb-4">
                    Continuous sub-circuit consumption monitoring, anomalous load classification, and dynamic tariff peak-shaving.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-xs f-mono text-[var(--text-faint)]">
                  <span>feeds: energy_readings</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <span>Inspect Specs</span>
                    <i className="fas fa-rotate text-[10px]"></i>
                  </span>
                </div>
              </div>

              {/* Back */}
              <div className="card-back">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="f-mono text-[10px] text-amber-400 font-bold uppercase">Architecture Specs</span>
                    <span className="text-xs text-[var(--text-faint)]">v2.4-prod</span>
                  </div>
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Core Model:</span>
                      <span className="text-slate-200 font-mono">Isolation Forest + Prophet</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Signature Action:</span>
                      <span className="text-amber-300 font-mono">Auto HVAC Setpoint Reset</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Target Impact:</span>
                      <span className="text-emerald-400 font-mono">-18.4% Peak Demand</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/energy"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-center py-2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold text-xs hover:bg-amber-500/30 transition flex items-center justify-center gap-2"
                >
                  <span>Open Energy Console</span>
                  <i className="fas fa-arrow-right text-[10px]"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* 2. Maintenance Agent */}
          <div 
            className={`card-flip-container ${flippedCards['maint'] ? 'flipped' : ''}`}
            onClick={() => handleCardClick('maint')}
          >
            <div className="card-flip-inner">
              {/* Front */}
              <div className="card-front border-l-4" style={{ borderLeftColor: 'var(--maint)' }}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                      <i className="fas fa-gears text-lg text-orange-400"></i>
                    </div>
                    <span className="f-mono text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                      ACTIVE · 94.2%
                    </span>
                  </div>
                  <h3 className="f-disp text-xl font-bold text-white mb-2">Maintenance Agent</h3>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed mb-4">
                    Mechanical degradation forecasting, vibration spectrum analysis, and algorithmic Remaining Useful Life (RUL) estimation.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-xs f-mono text-[var(--text-faint)]">
                  <span>feeds: asset_readings</span>
                  <span className="text-orange-400 flex items-center gap-1">
                    <span>Inspect Specs</span>
                    <i className="fas fa-rotate text-[10px]"></i>
                  </span>
                </div>
              </div>

              {/* Back */}
              <div className="card-back">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="f-mono text-[10px] text-orange-400 font-bold uppercase">Architecture Specs</span>
                    <span className="text-xs text-[var(--text-faint)]">v1.8-prod</span>
                  </div>
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Core Model:</span>
                      <span className="text-slate-200 font-mono">Gradient Boosted RUL Class.</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Signature Action:</span>
                      <span className="text-orange-300 font-mono">12-Day Bearing Degradation Alert</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Target Impact:</span>
                      <span className="text-emerald-400 font-mono">99.9% Uptime Guarantee</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/maintenance"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-center py-2 rounded bg-orange-500/20 border border-orange-500/40 text-orange-300 font-semibold text-xs hover:bg-orange-500/30 transition flex items-center justify-center gap-2"
                >
                  <span>Open PM Console</span>
                  <i className="fas fa-arrow-right text-[10px]"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* 3. Occupancy Agent */}
          <div 
            className={`card-flip-container ${flippedCards['occ'] ? 'flipped' : ''}`}
            onClick={() => handleCardClick('occ')}
          >
            <div className="card-flip-inner">
              {/* Front */}
              <div className="card-front border-l-4" style={{ borderLeftColor: 'var(--occ)' }}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                      <i className="fas fa-people-roof text-lg text-blue-400"></i>
                    </div>
                    <span className="f-mono text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      LIVE · 48 ZONES
                    </span>
                  </div>
                  <h3 className="f-disp text-xl font-bold text-white mb-2">Occupancy Agent</h3>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed mb-4">
                    Spatial density tracking, zone crowding suppression, and intelligent HVAC airflow redistribution according to human headcount.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-xs f-mono text-[var(--text-faint)]">
                  <span>feeds: facility_events, zones</span>
                  <span className="text-blue-400 flex items-center gap-1">
                    <span>Inspect Specs</span>
                    <i className="fas fa-rotate text-[10px]"></i>
                  </span>
                </div>
              </div>

              {/* Back */}
              <div className="card-back">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="f-mono text-[10px] text-blue-400 font-bold uppercase">Architecture Specs</span>
                    <span className="text-xs text-[var(--text-faint)]">v2.1-prod</span>
                  </div>
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Core Model:</span>
                      <span className="text-slate-200 font-mono">DBSCAN Density Clustering</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Signature Action:</span>
                      <span className="text-blue-300 font-mono">Dynamic Fresh-Air Modulation</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Target Impact:</span>
                      <span className="text-emerald-400 font-mono">Zero Zone Overcrowding</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/occupancy"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-center py-2 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 font-semibold text-xs hover:bg-blue-500/30 transition flex items-center justify-center gap-2"
                >
                  <span>Open Occupancy Console</span>
                  <i className="fas fa-arrow-right text-[10px]"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* 4. Security Agent */}
          <div 
            className={`card-flip-container ${flippedCards['sec'] ? 'flipped' : ''}`}
            onClick={() => handleCardClick('sec')}
          >
            <div className="card-flip-inner">
              {/* Front */}
              <div className="card-front border-l-4" style={{ borderLeftColor: 'var(--sec)' }}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                      <i className="fas fa-shield-halved text-lg text-rose-400"></i>
                    </div>
                    <span className="f-mono text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      LIVE · ZERO-TRUST
                    </span>
                  </div>
                  <h3 className="f-disp text-xl font-bold text-white mb-2">Security Agent</h3>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed mb-4">
                    Unauthorized access vector isolation, tailgate badge verification, and automated door lockout dispatch in under 15 seconds.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-xs f-mono text-[var(--text-faint)]">
                  <span>feeds: facility_events, visitors</span>
                  <span className="text-rose-400 flex items-center gap-1">
                    <span>Inspect Specs</span>
                    <i className="fas fa-rotate text-[10px]"></i>
                  </span>
                </div>
              </div>

              {/* Back */}
              <div className="card-back">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="f-mono text-[10px] text-rose-400 font-bold uppercase">Architecture Specs</span>
                    <span className="text-xs text-[var(--text-faint)]">v3.0-prod</span>
                  </div>
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Core Model:</span>
                      <span className="text-slate-200 font-mono">Graph Neural Pattern Anomaly</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Signature Action:</span>
                      <span className="text-rose-300 font-mono">Instant Perimeter Containment</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Target Impact:</span>
                      <span className="text-emerald-400 font-mono">&lt; 15s Breaching Containment</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/security"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-center py-2 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold text-xs hover:bg-rose-500/30 transition flex items-center justify-center gap-2"
                >
                  <span>Open Security Console</span>
                  <i className="fas fa-arrow-right text-[10px]"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* 5. Cost Agent */}
          <div 
            className={`card-flip-container ${flippedCards['cost'] ? 'flipped' : ''}`}
            onClick={() => handleCardClick('cost')}
          >
            <div className="card-flip-inner">
              {/* Front */}
              <div className="card-front border-l-4" style={{ borderLeftColor: 'var(--cost)' }}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <i className="fas fa-coins text-lg text-emerald-400"></i>
                    </div>
                    <span className="f-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      LIVE · ROI ENGINE
                    </span>
                  </div>
                  <h3 className="f-disp text-xl font-bold text-white mb-2">Cost Agent</h3>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed mb-4">
                    Translates mechanical, energy, and zone actions into dollar attribution, utility invoice reconciliation, and automated ROI tracking.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-xs f-mono text-[var(--text-faint)]">
                  <span>feeds: all 4 agent outputs</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span>Inspect Specs</span>
                    <i className="fas fa-rotate text-[10px]"></i>
                  </span>
                </div>
              </div>

              {/* Back */}
              <div className="card-back">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="f-mono text-[10px] text-emerald-400 font-bold uppercase">Architecture Specs</span>
                    <span className="text-xs text-[var(--text-faint)]">v1.2-prod</span>
                  </div>
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Core Model:</span>
                      <span className="text-slate-200 font-mono">Dynamic Tariff Linear Solver</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Signature Action:</span>
                      <span className="text-emerald-300 font-mono">Time-of-Use Bill Arbitration</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Target Impact:</span>
                      <span className="text-emerald-400 font-mono">$124,000 Verified Savings</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/cost"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-center py-2 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-xs hover:bg-emerald-500/30 transition flex items-center justify-center gap-2"
                >
                  <span>Open Cost Console</span>
                  <i className="fas fa-arrow-right text-[10px]"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* 6. Intelligence Engine */}
          <div 
            className={`card-flip-container ${flippedCards['intel'] ? 'flipped' : ''}`}
            onClick={() => handleCardClick('intel')}
          >
            <div className="card-flip-inner">
              {/* Front */}
              <div className="card-front border-l-4 border-[var(--cyan)]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--cyan)]/10 border border-[var(--cyan)]/30 flex items-center justify-center">
                      <i className="fas fa-brain text-lg text-[var(--cyan)]"></i>
                    </div>
                    <span className="f-mono text-[10px] text-[var(--cyan)] bg-[var(--cyan)]/10 px-2 py-0.5 rounded border border-[var(--cyan)]/30">
                      ORCHESTRATOR
                    </span>
                  </div>
                  <h3 className="f-disp text-xl font-bold text-white mb-2">Intelligence Engine</h3>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed mb-4">
                    Resolves conflicting commands across agents, correlates multi-domain indicators, and produces single holistic building actions.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-xs f-mono text-[var(--text-faint)]">
                  <span>feeds: cross-agent graph</span>
                  <span className="text-[var(--cyan)] flex items-center gap-1">
                    <span>Inspect Specs</span>
                    <i className="fas fa-rotate text-[10px]"></i>
                  </span>
                </div>
              </div>

              {/* Back */}
              <div className="card-back">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="f-mono text-[10px] text-[var(--cyan)] font-bold uppercase">Architecture Specs</span>
                    <span className="text-xs text-[var(--text-faint)]">v1.2-core</span>
                  </div>
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Core Model:</span>
                      <span className="text-slate-200 font-mono">Consensus Arbitration Graph</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Signature Action:</span>
                      <span className="text-[var(--cyan)] font-mono">Cross-Domain Conflict Solver</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-faint)]">Target Impact:</span>
                      <span className="text-emerald-400 font-mono">Zero Conflicting BMS Commands</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/intelligence"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-center py-2 rounded bg-[var(--cyan)]/20 border border-[var(--cyan)]/40 text-[var(--cyan)] font-semibold text-xs hover:bg-[var(--cyan)]/30 transition flex items-center justify-center gap-2"
                >
                  <span>Open Intelligence Engine</span>
                  <i className="fas fa-arrow-right text-[10px]"></i>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* INCIDENT RESOLUTION STORIES (INTERACTIVE CAROUSEL) */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-[var(--border)]">
        <div className="reveal mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="f-mono text-[11px] tracking-[0.2em] text-[var(--orange)] font-semibold mb-2">
              REAL-WORLD RESOLUTIONS
            </div>
            <h2 className="f-disp text-4xl font-bold text-white">
              Multi-Agent Incident Autopsy
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSlide((activeSlide - 1 + CASE_STUDIES.length) % CASE_STUDIES.length)}
              className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-slate-300 hover:text-white hover:border-[var(--cyan)] flex items-center justify-center transition"
              aria-label="Previous story"
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <button
              onClick={() => setActiveSlide((activeSlide + 1) % CASE_STUDIES.length)}
              className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-slate-300 hover:text-white hover:border-[var(--cyan)] flex items-center justify-center transition"
              aria-label="Next story"
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>

        {/* Carousel Slide Card */}
        <div className="reveal card rounded-2xl p-8 md:p-10 border border-[var(--border-light)] bg-gradient-to-br from-[#090E17] via-[#0D1420] to-[#080D14] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--cyan)]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid md:grid-cols-12 gap-8 items-center relative z-10">
            <div className="md:col-span-8">
              <div className="f-mono text-[11px] text-[var(--cyan)] font-bold mb-3 tracking-wider">
                CASE STUDY #{activeSlide + 1} // {CASE_STUDIES[activeSlide].tag}
              </div>
              <h3 className="f-disp text-2xl md:text-3xl font-bold text-white mb-4">
                {CASE_STUDIES[activeSlide].title}
              </h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                {CASE_STUDIES[activeSlide].summary}
              </p>
              <div className="p-4 rounded-xl bg-[#04070B] border border-slate-800 text-xs text-emerald-400 f-mono flex items-start gap-3">
                <i className="fas fa-shield-check text-base mt-0.5 shrink-0 text-emerald-400"></i>
                <div>
                  <span className="font-bold text-white uppercase block mb-1">AUTONOMOUS MITIGATION:</span>
                  {CASE_STUDIES[activeSlide].resolution}
                </div>
              </div>
            </div>

            <div className="md:col-span-4 border-l border-slate-800 md:pl-8 text-center md:text-left flex flex-col justify-center">
              <div className="f-disp text-5xl md:text-6xl font-bold text-[var(--orange)] mb-2">
                {CASE_STUDIES[activeSlide].metric}
              </div>
              <div className="f-mono text-xs text-[var(--text-faint)] uppercase tracking-wider mb-6">
                {CASE_STUDIES[activeSlide].metricLabel}
              </div>
              <Link
                to="/reports"
                className="inline-flex items-center justify-center md:justify-start gap-2 text-xs text-[var(--cyan)] hover:underline font-semibold"
              >
                <span>Read Incident Post-Mortem</span>
                <i className="fas fa-arrow-right text-[10px]"></i>
              </Link>
            </div>
          </div>

          {/* Slide Indicator Dots */}
          <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-slate-800/80">
            {CASE_STUDIES.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setActiveSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  activeSlide === i ? 'w-8 bg-[var(--cyan)]' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE & DATA FLOW */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-[var(--border)]" id="architecture">
        <div className="reveal mb-12">
          <div className="f-mono text-[11px] tracking-[0.2em] text-[var(--cyan)] font-semibold mb-3">
            SYSTEM TOPOLOGY
          </div>
          <h2 className="f-disp text-4xl font-bold leading-tight mb-4 text-white">
            Built on tools chosen for performance, not the trend.
          </h2>
        </div>

        {/* Pipeline Diagram */}
        <div className="reveal flex flex-wrap items-center gap-3 mb-14 text-xs font-medium">
          <div className="flow-node rounded-lg px-4 py-3 flex items-center gap-2">
            <i className="fas fa-satellite-dish text-cyan-400"></i>
            <span>BACnet / MQTT / Webhooks</span>
          </div>
          <i className="fas fa-chevron-right flow-arrow text-xs"></i>
          <div className="flow-node rounded-lg px-4 py-3 flex items-center gap-2">
            <i className="fas fa-database text-amber-400"></i>
            <span>Shared Relational Layer</span>
          </div>
          <i className="fas fa-chevron-right flow-arrow text-xs"></i>
          <div className="flow-node rounded-lg px-4 py-3 flex items-center gap-2">
            <i className="fas fa-microchip text-orange-400"></i>
            <span>5 Autonomous Agents</span>
          </div>
          <i className="fas fa-chevron-right flow-arrow text-xs"></i>
          <div className="flow-node rounded-lg px-4 py-3 flex items-center gap-2">
            <i className="fas fa-brain text-purple-400"></i>
            <span>Consensus Engine</span>
          </div>
          <i className="fas fa-chevron-right flow-arrow text-xs"></i>
          <div className="flow-node rounded-lg px-4 py-3 flex items-center gap-2">
            <i className="fas fa-bolt text-emerald-400"></i>
            <span>Automated BMS Actuation</span>
          </div>
        </div>

        {/* Tech Stack Grid */}
        <div className="reveal grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="chip rounded-xl p-5">
            <div className="f-mono text-sm font-bold text-[var(--cyan)] mb-1 flex items-center justify-between">
              <span>FastAPI</span>
              <i className="fas fa-bolt text-xs opacity-60"></i>
            </div>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed">
              Async request pipelines with strict Pydantic telemetry validation — essential when streaming thousands of structured sensor alerts every minute.
            </p>
          </div>
          <div className="chip rounded-xl p-5">
            <div className="f-mono text-sm font-bold text-[var(--cyan)] mb-1 flex items-center justify-between">
              <span>PostgreSQL</span>
              <i className="fas fa-database text-xs opacity-60"></i>
            </div>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed">
              Assets, telemetry partitions, and geographic zones are inherently relational. Relational integrity guarantees reliable cross-agent analytics.
            </p>
          </div>
          <div className="chip rounded-xl p-5">
            <div className="f-mono text-sm font-bold text-[var(--cyan)] mb-1 flex items-center justify-between">
              <span>Redis Pub/Sub</span>
              <i className="fas fa-server text-xs opacity-60"></i>
            </div>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed">
              Sub-millisecond pub/sub message broker scheduling periodic agent re-evaluations and real-time frontend alert dispatch.
            </p>
          </div>
          <div className="chip rounded-xl p-5">
            <div className="f-mono text-sm font-bold text-[var(--cyan)] mb-1 flex items-center justify-between">
              <span>scikit-learn + LightGBM</span>
              <i className="fas fa-chart-line text-xs opacity-60"></i>
            </div>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed">
              Transparent, explainable machine learning. Every anomaly detection includes the contributing features and confidence intervals for audits.
            </p>
          </div>
          <div className="chip rounded-xl p-5">
            <div className="f-mono text-sm font-bold text-[var(--cyan)] mb-1 flex items-center justify-between">
              <span>React 19 + Tailwind</span>
              <i className="fab fa-react text-xs opacity-60"></i>
            </div>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed">
              Unified UI design system shared across all 5 operational agent domains with dark-mode optimized high-density visualizations.
            </p>
          </div>
          <div className="chip rounded-xl p-5">
            <div className="f-mono text-sm font-bold text-[var(--cyan)] mb-1 flex items-center justify-between">
              <span>Docker Compose</span>
              <i className="fab fa-docker text-xs opacity-60"></i>
            </div>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed">
              Single-command reproducible orchestration: FastAPI backend, Postgres container, Redis broker, and Vite SPA deploy identically everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* PROTOTYPE METRICS */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-[var(--border)]">
        <div className="reveal mb-12">
          <div className="f-mono text-[11px] tracking-[0.2em] text-[var(--cyan)] font-semibold mb-3">
            VERIFIED BENCHMARKS
          </div>
          <h2 className="f-disp text-4xl font-bold leading-tight mb-3 text-white">
            Measured against real &amp; simulated facility datasets.
          </h2>
          <p className="text-[var(--text-dim)] max-w-2xl text-sm leading-relaxed">
            Realized performance metrics extracted from multi-zone HVAC testbeds and replayed electrical telemetry runs.
          </p>
        </div>
        
        <div className="reveal grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="border-l-2 border-[var(--border)] pl-5">
            <div className="f-disp text-5xl md:text-6xl font-bold text-white" data-count="120">0</div>
            <div className="f-mono text-[11px] text-[var(--text-faint)] mt-2 uppercase font-medium">
              events / replay session
            </div>
          </div>
          <div className="border-l-2 border-[var(--cyan)] pl-5">
            <div className="f-disp text-5xl md:text-6xl font-bold text-[var(--cyan)]" data-count="15">0</div>
            <div className="f-mono text-[11px] text-[var(--text-faint)] mt-2 uppercase font-medium">
              sec avg. alert latency
            </div>
          </div>
          <div className="border-l-2 border-[var(--orange)] pl-5">
            <div className="f-disp text-5xl md:text-6xl font-bold text-[var(--orange)]" data-count="5">0</div>
            <div className="f-mono text-[11px] text-[var(--text-faint)] mt-2 uppercase font-medium">
              autonomous agents
            </div>
          </div>
          <div className="border-l-2 border-emerald-500 pl-5">
            <div className="f-disp text-5xl md:text-6xl font-bold text-emerald-400" data-count="3">0</div>
            <div className="f-mono text-[11px] text-[var(--text-faint)] mt-2 uppercase font-medium">
              of 5 milestones live
            </div>
          </div>
        </div>
      </section>

      {/* LIVE OCCUPANCY SPATIAL PREVIEW */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-[var(--border)]" id="preview">
        <div className="reveal mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="f-mono text-[11px] tracking-[0.2em] text-[var(--cyan)] font-semibold mb-3">
              LIVE SPATIAL PREVIEW
            </div>
            <h2 className="f-disp text-4xl font-bold text-white">
              Occupancy Heatmap — Real-time Spatial Array
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-[var(--border)] p-0.5 bg-[#060A10] text-xs f-mono">
              {['Floor 1', 'Floor 2', 'Data Center'].map((floor) => (
                <button
                  key={floor}
                  onClick={() => setActiveFloor(floor)}
                  className={`px-3 py-1 rounded transition ${
                    activeFloor === floor
                      ? 'bg-[var(--cyan)] text-black font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {floor}
                </button>
              ))}
            </div>
            <Link
              to="/occupancy/heatmap"
              className="text-xs text-[var(--cyan)] hover:underline flex items-center gap-1.5 font-semibold"
            >
              <span>Full Screen Map</span>
              <i className="fas fa-arrow-right text-[10px]"></i>
            </Link>
          </div>
        </div>

        <div className="reveal card rounded-xl overflow-hidden shadow-2xl border border-[var(--border-light)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[#070C14]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--sec)]/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--energy)]/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--cost)]/80"></span>
              <span className="f-mono text-[11px] text-[var(--text-faint)] ml-2">
                facilityops.local/spatial/{activeFloor.toLowerCase().replace(' ', '-')}
              </span>
            </div>
            <div className="text-[11px] f-mono text-[var(--cyan)] flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[var(--cyan)] animate-ping"></span>
              <span>48 Sensor Array Active</span>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-[#04080F]">
            <div className="flex justify-between items-center mb-4">
              <div className="f-mono text-xs text-[var(--text-dim)]">
                {activeFloor} · 48 Micro-Zones (Hourly Utilization Telemetry)
              </div>
              <div className="flex items-center gap-4 text-xs f-mono text-[var(--text-faint)]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/20"></span> Idle</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-400"></span> Nominal</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span> High Density</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
              {heatColors.map((bg, idx) => (
                <div
                  key={idx}
                  className="heat-cell h-8 rounded cursor-pointer border border-white/5"
                  style={{ backgroundColor: bg }}
                  title={`Zone ${(idx % 12) + 1} - Hour ${Math.floor(idx / 12) + 8}:00`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-[var(--border)] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--cyan)]/5 to-transparent pointer-events-none"></div>

        <h2 className="reveal f-disp text-4xl md:text-5xl font-bold mb-4 text-white">
          Eliminate dashboard sprawl. Let agents operate your facility.
        </h2>
        <p className="reveal text-[var(--text-dim)] mb-8 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
          Milestone 3 of 5 — Occupancy &amp; Security Intelligence is live in dev. Connect your sub-circuits and IoT nodes today.
        </p>
        <div className="reveal flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/dashboard"
            className="neon-btn px-8 py-3.5 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <span>Launch Operational Dashboard</span>
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
          <button
            onClick={() => setShowDemoModal(true)}
            className="neon-orange-btn px-6 py-3.5 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <i className="fas fa-calendar-check text-xs"></i>
            <span>Request Demo Sandbox</span>
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[var(--border)] px-6 py-3.5 rounded-lg hover:border-[var(--cyan)] hover:text-white transition text-sm flex items-center gap-2"
          >
            <i className="fab fa-github"></i>
            <span>View GitHub Repository</span>
          </a>
        </div>
      </section>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className={`sticky-bottom-bar px-6 py-3 ${showStickyBar ? 'is-visible' : ''}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--cyan)] animate-ping"></div>
            <div>
              <span className="text-xs font-bold text-white block leading-none">
                FacilityOps Multi-Agent Engine v1.2
              </span>
              <span className="text-[10px] text-[var(--text-faint)] f-mono">
                5 Agents Synchronized · Continuous Event Ingestion Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDemoModal(true)}
              className="hidden md:inline-flex text-xs text-slate-300 hover:text-white border border-slate-700 px-3 py-1.5 rounded transition"
            >
              Simulate Incident
            </button>
            <Link
              to="/dashboard"
              className="neon-btn px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 shadow-lg"
            >
              <span>Launch Dashboard</span>
              <i className="fas fa-arrow-right text-[10px]"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* INTERACTIVE DEMO / INCIDENT SIMULATOR MODAL */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card rounded-2xl max-w-lg w-full p-6 border border-cyan-500/40 shadow-2xl relative">
            <button
              onClick={() => { setShowDemoModal(false); setDemoSubmitted(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <i className="fas fa-times"></i>
            </button>

            {!demoSubmitted ? (
              <div>
                <div className="flex items-center gap-2 text-[var(--cyan)] f-mono text-xs font-bold mb-2">
                  <i className="fas fa-bolt"></i>
                  <span>FACILITY INCIDENT SANDBOX</span>
                </div>
                <h3 className="f-disp text-2xl font-bold text-white mb-2">
                  Simulate Live Multi-Agent Resolution
                </h3>
                <p className="text-xs text-[var(--text-dim)] mb-5">
                  Select a test facility scenario to trigger live multi-agent correlation and autonomous setpoint adjustment.
                </p>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setDemoSubmitted(true)}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-700 hover:border-amber-500/60 bg-[#060A10] hover:bg-[#0A1018] transition flex items-start gap-3"
                  >
                    <i className="fas fa-temperature-arrow-up text-amber-400 text-base mt-0.5"></i>
                    <div>
                      <span className="text-xs font-bold text-white block">HVAC Thermal Discrepancy (Zone B2)</span>
                      <span className="text-[11px] text-[var(--text-faint)]">Triggers Energy &amp; Maintenance correlation</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setDemoSubmitted(true)}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-700 hover:border-rose-500/60 bg-[#060A10] hover:bg-[#0A1018] transition flex items-start gap-3"
                  >
                    <i className="fas fa-user-shield text-rose-400 text-base mt-0.5"></i>
                    <div>
                      <span className="text-xs font-bold text-white block">Unregistered Badge Breach at 02:00</span>
                      <span className="text-[11px] text-[var(--text-faint)]">Triggers Security Agent automated lockdown</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setDemoSubmitted(true)}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-700 hover:border-blue-500/60 bg-[#060A10] hover:bg-[#0A1018] transition flex items-start gap-3"
                  >
                    <i className="fas fa-users text-blue-400 text-base mt-0.5"></i>
                    <div>
                      <span className="text-xs font-bold text-white block">Auditorium 150-Person Overcrowding</span>
                      <span className="text-[11px] text-[var(--text-faint)]">Triggers Occupancy airflow boost</span>
                    </div>
                  </button>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDemoModal(false)}
                    className="text-xs text-slate-400 hover:text-white px-3 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/40">
                  <i className="fas fa-check text-xl"></i>
                </div>
                <h3 className="f-disp text-xl font-bold text-white mb-2">Scenario Dispatched to Engine!</h3>
                <p className="text-xs text-[var(--text-dim)] mb-6">
                  Synthetic anomaly injected into the live telemetry layer. Open the operational dashboard to view the real-time agent triage.
                </p>
                <Link
                  to="/dashboard"
                  onClick={() => setShowDemoModal(false)}
                  className="neon-btn px-6 py-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-2"
                >
                  <span>Open Live Dashboard</span>
                  <i className="fas fa-arrow-right text-[10px]"></i>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)] py-12 bg-[#04060A]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <span className="f-mono text-xs font-bold tracking-wider text-white">
              FACILITYOPS<span className="text-[var(--orange)]">.AI</span>
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="f-mono text-[11px] text-[var(--text-faint)]">
              Multi-Agent Autonomous Facility Network · Milestone 3 of 5
            </span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 text-sm">
            <Link to="/reports" className="hover:text-white transition text-xs">
              Documentation
            </Link>
            <Link to="/dashboard" className="hover:text-white transition text-xs">
              Operations Console
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
              aria-label="GitHub"
            >
              <i className="fab fa-github"></i>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
              aria-label="LinkedIn"
            >
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
