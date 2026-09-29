import React, { useState, useEffect, useRef } from 'react';
import { Shield, Zap, Inbox, GitFork, Calendar, CheckCircle2, ArrowRight, ShieldCheck, Lock, Sparkles, AlertTriangle, Layers, ChevronDown, RefreshCw } from 'lucide-react';

export default function LandingPage({ onOpenLogin, onOpenSignup, onDemoExplore }) {
  const [scrollY, setScrollY] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const canvasRef = useRef(null);

  // Detect scroll position & prefers-reduced-motion
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);

    const handleMotionChange = (e) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Ambient Particle Canvas Animation Loop
  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle nodes
    const particleCount = Math.min(Math.floor(window.innerWidth / 22), 60);
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      color: Math.random() > 0.4 ? '#14b8a6' : '#84cc16'
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(20, 184, 166, ${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [reducedMotion]);

  // Convergence calculation (0.0 to 1.0)
  const convergenceProgress = reducedMotion ? 1 : Math.min(scrollY / 450, 1);

  return (
    <div className="landing-page-v2">
      {/* 1. Full-Bleed Ambient Canvas Backdrop */}
      <div className="cinematic-backdrop">
        <img
          src="/media/hero_poster.jpg"
          alt="Aegis LifeOps Ambient Background"
          className="cinematic-poster-fallback"
        />
        {!reducedMotion && <canvas ref={canvasRef} className="cinematic-particle-canvas" />}
        <div className="cinematic-overlay-gradient" />
      </div>

      {/* 2. HERO SCENE: Floating Cards Frame Outer Columns (NO Text Overlap) */}
      <section className="scene-hero-wrapper">
        <div className="hero-floating-container">
          
          {/* Outer Left Column Floating Cards */}
          <div className="hero-left-column">
            {/* Card 1: Electric Bill */}
            <div
              className="floating-notice-card card-electric"
              style={{
                transform: reducedMotion ? 'none' : `
                  translate3d(${(-80 * (1 - convergenceProgress))}px, ${(-40 * (1 - convergenceProgress))}px, 0)
                  rotate(${(-8 * (1 - convergenceProgress))}deg)
                  scale(${0.9 + convergenceProgress * 0.1})
                `,
                opacity: 0.85 + convergenceProgress * 0.15
              }}
            >
              <div className="floating-card-header">
                <span className="floating-category-tag cat-electric">ELECTRICITY</span>
                <span className="floating-due-tag tag-urgent">DUE TOMORROW</span>
              </div>
              <div className="floating-card-title">BESCOM Power Bill</div>
              <div className="floating-card-amount">₹2,450.00</div>
            </div>

            {/* Card 3: RTO PUC Emission Test */}
            <div
              className="floating-notice-card card-vehicle"
              style={{
                marginTop: '1.5rem',
                transform: reducedMotion ? 'none' : `
                  translate3d(${(-60 * (1 - convergenceProgress))}px, ${(40 * (1 - convergenceProgress))}px, 0)
                  rotate(${(6 * (1 - convergenceProgress))}deg)
                  scale(${0.9 + convergenceProgress * 0.1})
                `,
                opacity: 0.85 + convergenceProgress * 0.15
              }}
            >
              <div className="floating-card-header">
                <span className="floating-category-tag cat-vehicle">VEHICLES</span>
                <span className="floating-due-tag tag-inprogress">IN PROGRESS</span>
              </div>
              <div className="floating-card-title">RTO PUC Emission Test</div>
              <div className="floating-card-amount">₹150.00</div>
            </div>
          </div>

          {/* CENTRAL HIGH-LEVEL TYPOGRAPHY (Clear Z-Index, NO Overlap) */}
          <div className="hero-text-center">
            <div className="hero-pill-badge">
              <Sparkles size={14} color="#84cc16" />
              <span>Unified Life Operations Intelligence</span>
            </div>

            <h1 className="hero-cinematic-title">
              Your Life Operations, <br />
              <span className="gradient-text-teal">Mastered in One View.</span>
            </h1>

            <p className="hero-cinematic-subhead">
              Scattered utility bills, document expiries, vehicle taxes, and insurance deadlines converge into one explainable, prioritized command center.
            </p>

            <div className="hero-cta-row">
              <button className="btn-cinematic-primary" onClick={onOpenSignup}>
                <span>Get Started Free</span>
                <ArrowRight size={18} />
              </button>
              <button className="btn-cinematic-secondary" onClick={onDemoExplore}>
                <span>Explore Interactive App</span>
              </button>
            </div>

            <div className="scroll-indicator-box">
              <span style={{ fontSize: '0.725rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8' }}>
                Scroll to Converge Operations
              </span>
              <ChevronDown size={18} className="bounce-anim" color="#14b8a6" />
            </div>
          </div>

          {/* Outer Right Column Floating Cards */}
          <div className="hero-right-column">
            {/* Card 2: Star Health Insurance */}
            <div
              className="floating-notice-card card-insurance"
              style={{
                transform: reducedMotion ? 'none' : `
                  translate3d(${(80 * (1 - convergenceProgress))}px, ${(-50 * (1 - convergenceProgress))}px, 0)
                  rotate(${(10 * (1 - convergenceProgress))}deg)
                  scale(${0.9 + convergenceProgress * 0.1})
                `,
                opacity: 0.85 + convergenceProgress * 0.15
              }}
            >
              <div className="floating-card-header">
                <span className="floating-category-tag cat-insurance">INSURANCE</span>
                <span className="floating-due-tag">DUE IN 5 DAYS</span>
              </div>
              <div className="floating-card-title">Star Health Policy Renewal</div>
              <div className="floating-card-amount">₹14,500.00</div>
            </div>

            {/* Card 4: Passport Renewal */}
            <div
              className="floating-notice-card card-passport"
              style={{
                marginTop: '1.5rem',
                transform: reducedMotion ? 'none' : `
                  translate3d(${(70 * (1 - convergenceProgress))}px, ${(50 * (1 - convergenceProgress))}px, 0)
                  rotate(${(-7 * (1 - convergenceProgress))}deg)
                  scale(${0.9 + convergenceProgress * 0.1})
                `,
                opacity: 0.85 + convergenceProgress * 0.15
              }}
            >
              <div className="floating-card-header">
                <span className="floating-category-tag cat-document">DOCUMENTS</span>
                <span className="floating-due-tag">DUE IN 20 DAYS</span>
              </div>
              <div className="floating-card-title">Passport Sewa Application</div>
              <div className="floating-card-amount">₹1,500.00</div>
            </div>
          </div>
        </div>

        {/* CONVERGED DASHBOARD PREVIEW FRAME WITH APPLE VISION PRO ZOOM-IN */}
        <div
          className="converged-dashboard-frame"
          style={{
            transform: reducedMotion ? 'none' : `
              scale(${0.85 + convergenceProgress * 0.15})
              translateY(${(1 - convergenceProgress) * 50}px)
            `,
            opacity: 0.3 + convergenceProgress * 0.7
          }}
        >
          <div className="frame-header-bar">
            <div className="frame-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="frame-address-bar">
              🛡️ aegis-lifeops.app // priority-command-center
            </div>
            <span className="frame-status-tag">POSTGRES RLS PROTECTED</span>
          </div>

          <div className="frame-body-preview">
            <div className="frame-action-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Zap size={18} color="#84cc16" />
                <span style={{ fontWeight: 800, fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                  PRIORITY ACTION • URGENCY SCORE 95/100
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700 }}>
                Pay BESCOM Monthly Electricity Utility Bill (₹2,450.00)
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                Explainable Rationale: Due tomorrow. Avoids ₹250 late penalty surcharge & power disconnection warning notice after 7 days.
              </p>
            </div>

            {/* Metrics Row */}
            <div className="frame-stats-row">
              <div className="frame-stat-item">
                <div className="stat-num" style={{ color: '#ef4444' }}>2</div>
                <div className="stat-lbl">Urgent (≤3d)</div>
              </div>
              <div className="frame-stat-item">
                <div className="stat-num" style={{ color: '#f59e0b' }}>4</div>
                <div className="stat-lbl">Upcoming (7d)</div>
              </div>
              <div className="frame-stat-item">
                <div className="stat-num" style={{ color: '#14b8a6' }}>₹28,870.00</div>
                <div className="stat-lbl">Total Known Due</div>
              </div>
              <div className="frame-stat-item">
                <div className="stat-num" style={{ color: '#10b981' }}>12</div>
                <div className="stat-lbl">Completed & Verified</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURE STORYTELLING: SMART INBOX */}
      <section className="cinematic-feature-section">
        <div className="feature-container">
          <div className="feature-side-text">
            <div className="feature-badge">
              <Inbox size={14} color="#14b8a6" />
              <span>DETERMINISTIC SMART INBOX</span>
            </div>
            <h2 className="feature-title">
              Paste Any Notice. <br />
              <span className="gradient-text-teal">Instant Structured Draft.</span>
            </h2>
            <p className="feature-desc">
              Paste emails, utility SMS notices, or renewal documents. Aegis deterministic extraction engine parses vendor, amount, due date, category, and penalty risks into an editable draft instantly.
            </p>
            <div className="feature-honesty-note">
              <ShieldCheck size={16} color="#10b981" />
              <span>Transparent & Honest: No hidden LLM API costs or false AI claims. Pure rule-based parsing.</span>
            </div>
          </div>

          <div className="feature-interactive-card vision-zoom-card">
            <div className="card-mock-input">
              <div className="mock-label">PASTED NOTICE TEXT:</div>
              <div className="mock-text-snippet">
                "Bangalore Electricity Supply Co (BESCOM) Consumer #4492-0193. Bill Amount: ₹2,450.00 Due Date: 15/10/2026. Warning: Late fee ₹250 after due date."
              </div>
            </div>
            <div className="card-extraction-arrow">
              <ArrowRight size={20} color="#14b8a6" />
              <span>RULE-BASED PATTERN PARSER</span>
            </div>
            <div className="card-mock-draft">
              <div className="draft-field"><span>Category:</span> <strong>Electricity</strong></div>
              <div className="draft-field"><span>Vendor:</span> <strong>BESCOM</strong></div>
              <div className="draft-field"><span>Amount:</span> <strong>₹2,450.00</strong></div>
              <div className="draft-field"><span>Due Date:</span> <strong>2026-10-15</strong></div>
              <div className="draft-field"><span>Penalty Risk:</span> <strong>₹250 late surcharge</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURE STORYTELLING: DEPENDENCY GRAPH */}
      <section className="cinematic-feature-section alt-bg">
        <div className="feature-container reverse">
          <div className="feature-interactive-card graph-card vision-zoom-card">
            <div className="graph-step step-prereq">
              <div className="step-tag tag-prereq">1. MUST COMPLETE FIRST</div>
              <h4>RTO Pollution Under Control (PUC) Test</h4>
              <div className="step-meta">Due in 2 days • Amount ₹150.00</div>
              <span className="status-badge status-inprogress" style={{ marginTop: '0.5rem' }}>IN PROGRESS</span>
            </div>

            <div className="graph-connector">
              <div className="connector-line" />
              <span className="connector-badge">UNBLOCKS DOWNSTREAM ITEM</span>
            </div>

            <div className="graph-step step-downstream">
              <div className="step-tag tag-blocked">2. DOWNSTREAM DEPENDENCY</div>
              <h4>RTO Annual Vehicle Road Tax Renewal</h4>
              <div className="step-meta">Due in 6 days • Amount ₹2,200.00</div>
              <span className="status-badge status-pending" style={{ marginTop: '0.5rem' }}>BLOCKED BY STEP 1</span>
            </div>
          </div>

          <div className="feature-side-text">
            <div className="feature-badge" style={{ color: '#84cc16' }}>
              <GitFork size={14} color="#84cc16" />
              <span>PREREQUISITE DEPENDENCY GRAPH</span>
            </div>
            <h2 className="feature-title">
              Sequence Matters. <br />
              <span className="gradient-text-lime">Unblock Tasks Correctly.</span>
            </h2>
            <p className="feature-desc">
              Never get trapped trying to renew vehicle road tax without a valid PUC emission certificate. Aegis builds visual dependency graphs with cycle prevention so you execute precursor tasks first.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FEATURE STORYTELLING: OPERATIONS CALENDAR */}
      <section className="cinematic-feature-section">
        <div className="feature-container">
          <div className="feature-side-text">
            <div className="feature-badge" style={{ color: '#3b82f6' }}>
              <Calendar size={14} color="#3b82f6" />
              <span>MULTI-VIEW OPERATIONS CALENDAR</span>
            </div>
            <h2 className="feature-title">
              Month, Week & Agenda. <br />
              <span style={{ color: '#3b82f6' }}>Your Timeline in Harmony.</span>
            </h2>
            <p className="feature-desc">
              Switch between full monthly grid view, 7-day horizontal week schedule, and chronological agenda feed. Color-coded category indicators highlight overdue items at a glance.
            </p>
          </div>

          <div className="feature-interactive-card calendar-preview-card vision-zoom-card">
            <div className="cal-header">
              <span>OCTOBER 2026</span>
              <div className="cal-tabs">
                <span className="cal-tab active">Month</span>
                <span className="cal-tab">Week</span>
                <span className="cal-tab">Agenda</span>
              </div>
            </div>
            <div className="cal-mini-grid">
              <div className="cal-day">1</div>
              <div className="cal-day">2</div>
              <div className="cal-day day-event event-red">15 <span className="event-dot" /></div>
              <div className="cal-day">16</div>
              <div className="cal-day day-event event-teal">20 <span className="event-dot" /></div>
              <div className="cal-day">21</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. GRAND FINALE CTA */}
      <section className="scene-grand-cta">
        <div className="cta-glass-card vision-zoom-card">
          <Shield size={44} color="#14b8a6" style={{ marginBottom: '1rem' }} />
          <h2 className="cta-headline">Take Control of What Matters.</h2>
          <p className="cta-subhead">
            Join Aegis LifeOps today. Zero credit card required. Supabase RLS privacy protection.
          </p>

          <div className="cta-button-group">
            <button className="btn-cinematic-primary" onClick={onOpenSignup}>
              <span>Create Your Account</span>
              <ArrowRight size={18} />
            </button>
            <button className="btn-cinematic-secondary" onClick={onOpenLogin}>
              <span>Sign In to Aegis</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
