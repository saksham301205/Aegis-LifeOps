import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { calculatePriorityScore } from '../utils/priorityCalculator';
import { GitFork, ArrowDown, Lock, Unlock, CheckCircle2, AlertTriangle, FileCheck, Zap, Sparkles } from 'lucide-react';

export default function DependencyGraphView({ obligations, onOpenProofModal }) {
  // Find all items that have prerequisites
  const dependentItems = obligations.filter(ob => ob.prerequisiteId);
  const [pulsingId, setPulsingId] = useState(null);

  const handleUnblockTrigger = (prereq) => {
    setPulsingId(prereq.id);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#10b981', '#14b8a6', '#84cc16']
      });
    } catch (e) {}
    setTimeout(() => {
      onOpenProofModal(prereq);
      setPulsingId(null);
    }, 300);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="toolbar-card vision-zoom-card anim-fade-up anim-float-slow" style={{ background: '#161b26', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}>
        <div className="toolbar-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(20, 184, 166, 0.15)', padding: '0.5rem', borderRadius: '10px', color: '#14b8a6', border: '1px solid rgba(20, 184, 166, 0.3)' }}>
              <GitFork size={24} className="bounce-anim" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>Prerequisite Dependency Chain</h2>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Visual spatial sequence map showing precursor tasks that block downstream renewals or payments
              </div>
            </div>
          </div>
        </div>
      </div>

      {dependentItems.length === 0 ? (
        <div className="empty-state anim-bounce-up anim-float-scale" style={{ background: '#161b26', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '4rem 1.5rem', textAlign: 'center' }}>
          <div className="empty-icon" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⛓️</div>
          <div className="empty-title" style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>No Active Prerequisite Chains</div>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: '440px', margin: '0 auto' }}>
            None of your obligations currently have prerequisite dependencies. Edit any obligation and select a prerequisite to build a dependency chain.
          </p>
        </div>
      ) : (
        <div className="dependency-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {dependentItems.map((downstream, index) => {
            const prereq = obligations.find(ob => ob.id === downstream.prerequisiteId);
            if (!prereq) return null;

            const isPrereqDone = prereq.status === 'Completed';
            const isPulsing = pulsingId === prereq.id;

            return (
              <div
                key={downstream.id}
                className={`dependency-card vision-zoom-card anim-bounce-up shimmer-card ${index % 2 === 0 ? 'anim-float-slow' : 'anim-float-3d'}`}
                style={{
                  animationDelay: `${index * 0.05}s`,
                  background: '#161b26',
                  border: isPrereqDone ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  boxShadow: isPrereqDone ? '0 15px 35px rgba(16, 185, 129, 0.15)' : '0 15px 35px rgba(0,0,0,0.5)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Header Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {isPrereqDone ? (
                      <span className="unverified-proof-badge" style={{ background: 'rgba(16, 185, 129, 0.18)', color: '#6ee7b7', borderColor: 'rgba(16, 185, 129, 0.35)', padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Unlock size={14} />
                        <span>Prerequisite Unlocked</span>
                      </span>
                    ) : (
                      <span className="unverified-proof-badge" style={{ background: 'rgba(239, 68, 68, 0.18)', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.35)', padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={14} />
                        <span>BLOCKED BY PREREQUISITE</span>
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.04em' }}>
                    Dependency Pair
                  </span>
                </div>

                {/* STEP 1: MUST DO FIRST (Prerequisite) */}
                <div
                  style={{
                    background: isPrereqDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                    border: isPrereqDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.1rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isPrereqDone ? '#6ee7b7' : '#f59e0b', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                    1. STEP 1 (MUST HAPPEN FIRST):
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.975rem', color: '#f8fafc' }}>
                    {prereq.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.35rem 0' }}>
                    {prereq.provider || 'Unspecified Biller'} • Due {prereq.dueDate || 'Manual Review'} • <strong style={{ color: '#14b8a6' }}>₹{Number(prereq.amount).toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem' }}>
                    <span className={`status-badge status-${prereq.status.toLowerCase().replace(/\s+/g, '')}`}>
                      {prereq.status}
                    </span>
                    {!isPrereqDone && (
                      <button
                        className="btn-primary unblock-btn-pulse vision-zoom-card"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', background: 'var(--accent-lime)', color: '#000000', fontWeight: 800 }}
                        onClick={() => handleUnblockTrigger(prereq)}
                      >
                        <Zap size={14} />
                        <span>Unblock Task</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Flow Connector Arrow & Animated Laser Pulse Line */}
                <div style={{ padding: '0.85rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', position: 'relative' }}>
                  <div style={{ width: '2px', height: '24px', background: isPrereqDone ? '#10b981' : '#ef4444', position: 'relative', overflow: 'hidden' }}>
                    {/* Animated moving pulse beam */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '12px', background: 'linear-gradient(180deg, transparent, #ffffff, transparent)', animation: 'beamFlow 1s infinite linear' }} />
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: isPrereqDone ? '#10b981' : '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {isPrereqDone ? '✓ PREREQUISITE CLEARED → UNLOCKED' : 'REQUIRES COMPLETION BEFORE NEXT STEP'}
                  </span>
                  <ArrowDown size={18} color={isPrereqDone ? '#10b981' : '#ef4444'} className="bounce-anim" />
                </div>

                {/* STEP 2: DOWNSTREAM BLOCKED OBLIGATION */}
                <div
                  style={{
                    background: '#0d111a',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.1rem',
                    opacity: isPrereqDone ? 1 : 0.75,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                    2. STEP 2 (DOWNSTREAM ACTION):
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.975rem', color: '#f8fafc' }}>
                    {downstream.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.35rem 0' }}>
                    {downstream.provider || 'Unspecified Biller'} • Due {downstream.dueDate || 'Manual Review'} • <strong style={{ color: '#14b8a6' }}>₹{Number(downstream.amount).toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem' }}>
                    <span className={`status-badge status-${downstream.status.toLowerCase().replace(/\s+/g, '')}`}>
                      {downstream.status}
                    </span>
                    {isPrereqDone ? (
                      <button
                        className="btn-primary vision-zoom-card"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', background: '#14b8a6', color: '#ffffff', fontWeight: 800 }}
                        onClick={() => onOpenProofModal(downstream)}
                      >
                        <FileCheck size={14} />
                        <span>Execute Action</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Lock size={12} /> Complete Step 1 First
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
