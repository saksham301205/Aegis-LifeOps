import React, { useState, useEffect } from 'react';
import { calculatePriorityScore, getWhatToDoNextPlan } from '../utils/priorityCalculator';
import AnimatedCountUp from './AnimatedCountUp';
import { AlertTriangle, Clock, IndianRupee, CheckCircle2, ArrowRight, Zap, ShieldAlert, FileCheck, Inbox, Plus, Activity, Sparkles, Layers, ShieldCheck, Flame } from 'lucide-react';

export default function DashboardView({
  obligations,
  onNavigateToObligations,
  onOpenProofModal,
  onOpenSmartInbox,
  onOpenAddModal
}) {
  const plan = getWhatToDoNextPlan(obligations);
  const [isConverged, setIsConverged] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsConverged(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Stats calculation
  const activeObligations = obligations.filter(o => o.status !== 'Completed');
  const completedObligations = obligations.filter(o => o.status === 'Completed');

  // Urgent: overdue or due in <= 3 days
  const urgentItems = activeObligations.filter(o => {
    const p = calculatePriorityScore(o, obligations);
    return p.daysRemaining <= 3;
  });

  // Upcoming 7 days
  const upcomingSevenDays = activeObligations.filter(o => {
    const p = calculatePriorityScore(o, obligations);
    return p.daysRemaining >= 0 && p.daysRemaining <= 7;
  });

  // Total known active payments in INR (₹)
  const totalActivePayments = activeObligations.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  // Category breakdown
  const categoryCounts = activeObligations.reduce((acc, o) => {
    acc[o.category] = (acc[o.category] || 0) + 1;
    return acc;
  }, {});

  const totalCount = activeObligations.length || 1;
  const completionPercentage = Math.round((completedObligations.length / (obligations.length || 1)) * 100);

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', position: 'relative' }}>

      {/* 1. Spatial Floating Card Convergence Ambient Scene Header */}
      <div style={{ position: 'relative', width: '100%' }}>

        {/* Spatial Floating Background Preview Cards (Converge into Center Master Action Plan) */}
        {!isConverged && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
            <div style={{ position: 'absolute', top: '-20px', left: '2%', transform: 'rotate(-8deg) scale(0.9)', opacity: 0.6 }} className="floating-notice-card">
              <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 800 }}>⚡ BESCOM ELECTRICITY</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>₹2,450.00 • Due 15/10</div>
            </div>
            <div style={{ position: 'absolute', top: '-15px', right: '2%', transform: 'rotate(6deg) scale(0.9)', opacity: 0.6 }} className="floating-notice-card">
              <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 800 }}>🚘 RTO VEHICLE TAX</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>₹2,200.00 • Due 20/10</div>
            </div>
          </div>
        )}

        {/* Master Action Plan Glass Command Center Module */}
        <div
          className="action-plan-card vision-zoom-card anim-fade-up shimmer-card anim-float-slow"
          style={{
            background: 'linear-gradient(135deg, rgba(22, 27, 38, 0.98) 0%, rgba(13, 17, 26, 0.99) 100%)',
            border: '1px solid rgba(132, 204, 22, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.85rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7), 0 0 35px rgba(132, 204, 22, 0.18)',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 2,
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease'
          }}
        >
          {/* Animated Background Laser Flare */}
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(132, 204, 22, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="orbit-particle" style={{ top: '20%', left: '15%', animationDelay: '0s' }} />
          <div className="orbit-particle" style={{ top: '60%', right: '10%', animationDelay: '2.5s' }} />
          <div className="orbit-particle" style={{ top: '80%', left: '40%', animationDelay: '5s' }} />

          <div className="action-plan-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div className="action-plan-title-box" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ background: 'rgba(132, 204, 22, 0.25)', padding: '0.5rem', borderRadius: '10px', border: '1px solid rgba(132, 204, 22, 0.5)', boxShadow: '0 0 20px rgba(132, 204, 22, 0.4)' }}>
                <Zap size={22} color="#84cc16" className="bounce-anim" />
              </div>
              <span className="anim-text-glow-lime" style={{ fontWeight: 800, fontSize: '0.9rem', color: '#84cc16', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Explainable LifeOps Action Plan
              </span>
            </div>
            <span className="action-plan-badge" style={{ background: 'rgba(132, 204, 22, 0.18)', color: '#84cc16', border: '1px solid rgba(132, 204, 22, 0.4)', fontWeight: 800, fontSize: '0.75rem', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} color="#84cc16" className="anim-wobble" />
              <span>Deterministic Engine Active</span>
            </span>
          </div>

          <div className="action-plan-content" style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '2rem', alignItems: 'center' }}>
            <div className="action-plan-main">
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.65rem', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                {plan.headline}
              </h2>
              <p className="action-plan-reasoning" style={{ fontSize: '0.925rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {plan.reasoning}
              </p>

              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recommended Execution Steps:
                </div>
                <ul className="action-steps-list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {plan.nextSteps.map((step, idx) => (
                    <li key={idx} className="action-step-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.65rem 0.95rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.875rem', color: '#f1f5f9', transition: 'all 0.2s ease' }}>
                      <span className="action-step-num" style={{ background: 'var(--accent-lime)', color: '#000000', fontWeight: 800, width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', flexShrink: 0, boxShadow: '0 0 10px rgba(132, 204, 22, 0.5)' }}>
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Urgency Side Box */}
            <div className="action-plan-side" style={{ background: '#0d111a', padding: '1.4rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                  Calculated Risk Score
                </div>
                {plan.topObligation ? (
                  <div style={{ marginTop: '0.75rem' }}>
                    <div className={`priority-score-badge priority-${plan.level?.toLowerCase()}`} style={{ fontSize: '0.95rem', padding: '0.45rem 0.85rem', display: 'inline-block', borderRadius: 'var(--radius-md)', fontWeight: 800 }}>
                      Score {plan.score}/100 • {plan.level} Priority
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#cbd5e1', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Category:</span> <strong style={{ color: '#ffffff' }}>{plan.topObligation.category}</strong>
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#cbd5e1', marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Amount Due:</span> <strong style={{ color: '#14b8a6' }}>₹{Number(plan.topObligation.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#10b981', fontWeight: 700, marginTop: '0.75rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={20} />
                    <span>No Pending Items</span>
                  </div>
                )}
              </div>

              {plan.topObligation && (
                <button
                  className="btn-primary vision-zoom-card"
                  style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center', background: 'var(--accent-lime)', color: '#000000', fontWeight: 800, padding: '0.7rem' }}
                  onClick={() => onOpenProofModal(plan.topObligation)}
                >
                  <span>Act & Attach Proof</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Operational Metrics Grid with Animated CountUp Numbers & SVG Progress Rings */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', zIndex: 1 }}>
        
        {/* Urgent Metric Card */}
        <div className="stat-card vision-zoom-card anim-fade-up-d1 shimmer-card anim-float" onClick={onNavigateToObligations} style={{ cursor: 'pointer', background: '#161b26', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: 'var(--radius-lg)', padding: '1.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 12px 28px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <AlertTriangle size={24} className="bounce-anim" />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
                <AnimatedCountUp endValue={urgentItems.length} duration={800} />
              </div>
              <div className="stat-label" style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginTop: '3px' }}>Urgent / Due ≤ 3 Days</div>
            </div>
          </div>
          <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
            <svg width="44" height="44" viewBox="0 0 36 36">
              <path stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path stroke="#ef4444" strokeDasharray={`${Math.min((urgentItems.length / (totalCount || 1)) * 100, 100)}, 100`} strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
          </div>
        </div>

        {/* Upcoming Metric Card */}
        <div className="stat-card vision-zoom-card anim-fade-up-d2 shimmer-card anim-float" onClick={onNavigateToObligations} style={{ cursor: 'pointer', background: '#161b26', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: 'var(--radius-lg)', padding: '1.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 12px 28px rgba(0,0,0,0.5)', animationDelay: '-1.5s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <Clock size={24} className="bounce-anim" />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
                <AnimatedCountUp endValue={upcomingSevenDays.length} duration={800} />
              </div>
              <div className="stat-label" style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginTop: '3px' }}>Upcoming Deadlines (7d)</div>
            </div>
          </div>
          <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
            <svg width="44" height="44" viewBox="0 0 36 36">
              <path stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path stroke="#f59e0b" strokeDasharray={`${Math.min((upcomingSevenDays.length / (totalCount || 1)) * 100, 100)}, 100`} strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
          </div>
        </div>

        {/* Total Active Payments Card */}
        <div className="stat-card vision-zoom-card card-glow-teal anim-fade-up-d3 shimmer-card anim-float" onClick={onNavigateToObligations} style={{ cursor: 'pointer', background: '#161b26', border: '1px solid rgba(20, 184, 166, 0.45)', borderRadius: 'var(--radius-lg)', padding: '1.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 12px 28px rgba(0,0,0,0.5)', animationDelay: '-3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#14b8a6', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(20, 184, 166, 0.3)' }}>
              <IndianRupee size={24} className="bounce-anim" />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.55rem', fontWeight: 800, color: '#14b8a6', lineHeight: 1.1 }}>
                <AnimatedCountUp endValue={totalActivePayments} duration={1200} prefix="₹" decimals={2} />
              </div>
              <div className="stat-label" style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, marginTop: '3px' }}>Total Active Due</div>
            </div>
          </div>
          <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
            <svg width="44" height="44" viewBox="0 0 36 36">
              <path stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="anim-ring-draw" stroke="#14b8a6" strokeDasharray="75, 100" strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
          </div>
        </div>

        {/* Completed Metric Card */}
        <div className="stat-card vision-zoom-card card-glow-lime anim-fade-up-d4 shimmer-card anim-float" onClick={onNavigateToObligations} style={{ cursor: 'pointer', background: '#161b26', border: '1px solid rgba(16, 185, 129, 0.45)', borderRadius: 'var(--radius-lg)', padding: '1.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 12px 28px rgba(0,0,0,0.5), 0 0 20px rgba(16, 185, 129, 0.25)', animationDelay: '-4.5s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.4)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }}>
              <CheckCircle2 size={24} className="bounce-anim" />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#6ee7b7', lineHeight: 1.1, textShadow: '0 0 12px rgba(16, 185, 129, 0.4)' }}>
                <AnimatedCountUp endValue={completedObligations.length} duration={800} />
              </div>
              <div className="stat-label" style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, marginTop: '3px' }}>Completed & Verified</div>
            </div>
          </div>
          <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
            <svg width="44" height="44" viewBox="0 0 36 36">
              <path stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="anim-ring-draw" stroke="#10b981" strokeDasharray={`${completionPercentage}, 100`} strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Layout: Urgent Priority Queue & Quick Capture */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', zIndex: 1 }}>
        
        {/* Urgent Table Card */}
        <div className="obligations-table-container vision-zoom-card anim-fade-up-d5 shimmer-card scan-line-effect anim-float-slow" style={{ background: '#161b26', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0d111a' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldAlert size={20} color="#ef4444" />
              <span>Urgent Obligations Priority Queue</span>
            </h3>
            <button className="btn-ghost" onClick={onNavigateToObligations} style={{ fontSize: '0.8rem', color: '#14b8a6', fontWeight: 700 }}>
              View All ({activeObligations.length}) →
            </button>
          </div>

          {urgentItems.length === 0 ? (
            <div className="empty-state anim-float-slow" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
              <div className="empty-icon" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
              <div className="empty-title" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.4rem' }}>No Urgent Obligations</div>
              <p style={{ fontSize: '0.85rem' }}>You have no items due within the next 3 days. Use Smart Inbox to paste incoming notices.</p>
            </div>
          ) : (
            <table className="obligations-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(8, 11, 17, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.95rem 1.25rem' }}>Priority Score</th>
                  <th style={{ padding: '0.95rem 1.25rem' }}>Obligation & Biller</th>
                  <th style={{ padding: '0.95rem 1.25rem' }}>Category</th>
                  <th style={{ padding: '0.95rem 1.25rem' }}>Due Date</th>
                  <th style={{ padding: '0.95rem 1.25rem' }}>Amount</th>
                  <th style={{ padding: '0.95rem 1.25rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {urgentItems.slice(0, 5).map((ob) => {
                  const p = calculatePriorityScore(ob, obligations);
                  return (
                    <tr key={ob.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.2s ease' }} className="table-row-hover">
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <span className={`priority-score-badge priority-${p.level.toLowerCase()}`} title={p.breakdown.join('\n')}>
                          {p.score}/100 ({p.level})
                        </span>
                      </td>
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <div className="ob-title-cell">
                          <span className="ob-title" style={{ color: '#f8fafc', fontWeight: 700, display: 'block', fontSize: '0.9rem' }}>{ob.title}</span>
                          <span className="ob-provider" style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{ob.provider || 'Unspecified Biller'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <span className="category-badge">{ob.category}</span>
                      </td>
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: p.daysRemaining <= 0 ? '#ef4444' : '#cbd5e1', fontSize: '0.85rem' }}>
                          {ob.dueDate || 'Manual Review Required'}
                          {p.daysRemaining < 0 && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginLeft: '4px', fontWeight: 800 }}>(OVERDUE)</span>}
                        </div>
                      </td>
                      <td style={{ padding: '0.95rem 1.25rem', fontWeight: 800, color: '#14b8a6', fontSize: '0.9rem' }}>
                        ₹{Number(ob.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <button
                          className="btn-primary vision-zoom-card"
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', background: 'var(--accent-lime)', color: '#000000', fontWeight: 800 }}
                          onClick={() => onOpenProofModal(ob)}
                        >
                          <FileCheck size={14} />
                          <span>Attach Proof</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Capture Card */}
          <div className="vision-zoom-card anim-fade-up-d6 shimmer-card anim-float-h" style={{ background: '#161b26', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-lg)', padding: '1.35rem', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Inbox size={18} color="#14b8a6" />
              <span>Smart Quick Capture</span>
            </h4>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.5 }}>
              Received a utility notice, RTO SMS, or insurance email? Paste the notice text into Smart Inbox to extract category, amount, and consequence risk into an editable draft.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button className="btn-primary vision-zoom-card ripple-container" onClick={onOpenSmartInbox} style={{ justifyContent: 'center', background: '#14b8a6', color: '#ffffff', fontWeight: 700 }}>
                <Inbox size={16} />
                <span>Paste Notice into Smart Inbox</span>
              </button>
              <button className="btn-secondary ripple-container" onClick={onOpenAddModal} style={{ justifyContent: 'center', background: '#0d111a', color: '#cbd5e1', borderColor: 'rgba(255, 255, 255, 0.12)' }}>
                <Plus size={16} />
                <span>Add Obligation Manually</span>
              </button>
            </div>
          </div>

          {/* Category Breakdown Card */}
          <div className="vision-zoom-card anim-fade-up-d7 anim-float-scale" style={{ background: '#161b26', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-lg)', padding: '1.35rem', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={16} color="#84cc16" />
                <span>Category Breakdown</span>
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{Object.keys(categoryCounts).length} Active</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const percent = Math.round((count / totalCount) * 100);
                return (
                  <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                      <span className="category-badge">{cat}</span>
                      <span style={{ fontWeight: 700, color: '#cbd5e1' }}>{count} item{count > 1 ? 's' : ''} ({percent}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #14b8a6, #84cc16)', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
