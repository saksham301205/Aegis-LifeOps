import React from 'react';
import { calculatePriorityScore } from '../utils/priorityCalculator';
import { Bell, AlertTriangle, Clock, X, FileCheck, ArrowRight } from 'lucide-react';

export default function RemindersDrawer({ isOpen, onClose, obligations, onOpenProofModal }) {
  if (!isOpen) return null;

  const active = obligations.filter(o => o.status !== 'Completed');

  // Filter urgent (overdue or due in <= 5 days)
  const urgentReminders = active
    .map(ob => ({
      ...ob,
      priority: calculatePriorityScore(ob, obligations)
    }))
    .filter(ob => ob.priority.daysRemaining <= 5)
    .sort((a, b) => a.priority.daysRemaining - b.priority.daysRemaining);

  return (
    <div className="modal-overlay" style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        className="modal-card vision-zoom-card"
        style={{
          height: '100vh',
          maxHeight: '100vh',
          maxWidth: '420px',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          background: '#161b26',
          borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '-20px 0 50px rgba(0,0,0,0.8)',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="modal-header" style={{ background: '#0d111a', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(132, 204, 22, 0.15)', padding: '0.4rem', borderRadius: '8px', border: '1px solid rgba(132, 204, 22, 0.3)' }}>
              <Bell size={20} color="#84cc16" />
            </div>
            <div>
              <h3 className="modal-title" style={{ color: '#ffffff', fontSize: '1.05rem' }}>In-App LifeOps Alerts</h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {urgentReminders.length} urgent alerts require attention
              </div>
            </div>
          </div>
          <button className="btn-ghost" style={{ color: '#94a3b8' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {urgentReminders.length === 0 ? (
            <div className="empty-state" style={{ background: '#0d111a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 'var(--radius-lg)' }}>
              <div className="empty-icon">🟢</div>
              <div className="empty-title" style={{ color: '#f8fafc' }}>All Quiet!</div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No obligations due within the next 5 days.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {urgentReminders.map((ob) => {
                const isOverdue = ob.priority.daysRemaining < 0;
                return (
                  <div
                    key={ob.id}
                    className="vision-zoom-card"
                    style={{
                      background: isOverdue ? 'rgba(239, 68, 68, 0.12)' : '#0d111a',
                      border: isOverdue ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span className={`priority-score-badge priority-${ob.priority.level.toLowerCase()}`}>
                        Score {ob.priority.score} • {ob.priority.level}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isOverdue ? '#ef4444' : '#f59e0b' }}>
                        {isOverdue ? `OVERDUE (${Math.abs(ob.priority.daysRemaining)}d)` : `Due in ${ob.priority.daysRemaining}d`}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem', color: '#f8fafc' }}>{ob.title}</h4>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                      {ob.provider} • Amount: <strong style={{ color: '#14b8a6' }}>₹{Number(ob.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>

                    {ob.consequenceNote && (
                      <div style={{ fontSize: '0.78rem', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '0.35rem 0.65rem', borderRadius: '4px', marginBottom: '0.75rem' }}>
                        ⚠️ Risk: {ob.consequenceNote}
                      </div>
                    )}

                    <button
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.45rem', background: 'var(--accent-lime)', color: '#000000', fontWeight: 800 }}
                      onClick={() => {
                        onClose();
                        onOpenProofModal(ob);
                      }}
                    >
                      <FileCheck size={14} />
                      <span>Act & Attach Self-Reported Proof</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
