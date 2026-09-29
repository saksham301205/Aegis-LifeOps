import React, { useState } from 'react';
import { calculatePriorityScore } from '../utils/priorityCalculator';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, FileCheck, Info, X, MapPin, Sparkles } from 'lucide-react';

const CATEGORY_COLORS = {
  Electricity: '#f59e0b',
  Gas: '#ef4444',
  Water: '#06b6d4',
  Insurance: '#8b5cf6',
  Documents: '#3b82f6',
  Subscriptions: '#ec4899',
  Vehicles: '#10b981',
  Appointments: '#84cc16'
};

export default function CalendarTimelineView({ obligations, onOpenProofModal }) {
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'agenda'
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedObligation, setSelectedObligation] = useState(null);
  const [hoveredItemId, setHoveredItemId] = useState(null);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonthDate(d);
  };

  const handleNextMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonthDate(d);
  };

  const handleToday = () => {
    setCurrentMonthDate(new Date());
  };

  // Build days for month grid view
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayStr = new Date().toISOString().split('T')[0];

  // Group obligations by date (YYYY-MM-DD)
  const obligationsByDate = obligations.reduce((acc, ob) => {
    const key = ob.dueDate || 'UNDATED';
    acc[key] = acc[key] || [];
    acc[key].push(ob);
    return acc;
  }, {});

  // Week view: calculate current week range
  const getWeekDays = () => {
    const curr = new Date(currentMonthDate);
    const first = curr.getDate() - curr.getDay();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const next = new Date(curr.setDate(first + i));
      days.push(next.toISOString().split('T')[0]);
    }
    return days;
  };

  const weekDaysStr = getWeekDays();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#f8fafc' }}>
      
      {/* 1. Operations Calendar Header Toolbar */}
      <div
        className="toolbar-card card-glow-teal anim-fade-up anim-float-slow"
        style={{
          background: '#161b26',
          border: '1px solid rgba(20, 184, 166, 0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(20, 184, 166, 0.15)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Header Title with Glowing Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(20, 184, 166, 0.2)',
                border: '1px solid rgba(20, 184, 166, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(20, 184, 166, 0.3)'
              }}
            >
              <CalendarIcon size={24} color="#14b8a6" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                Operations Calendar
              </h2>
              <div style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '2px' }}>
                Visual schedule of upcoming due dates, recurring bills, and renewal windows
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            {/* View switcher tabs */}
            <div
              style={{
                background: '#0d111a',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '4px',
                display: 'flex',
                gap: '4px'
              }}
            >
              {[
                { id: 'month', label: 'Month Grid' },
                { id: 'week', label: 'Week View' },
                { id: 'agenda', label: 'Agenda Feed' }
              ].map(tab => {
                const isActive = viewMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={isActive ? 'anim-text-glow' : ''}
                    onClick={() => setViewMode(tab.id)}
                    style={{
                      background: isActive ? '#14b8a6' : 'transparent',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      fontWeight: isActive ? 800 : 600,
                      borderRadius: '7px',
                      border: 'none',
                      padding: '0.45rem 0.95rem',
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 0 16px rgba(20, 184, 166, 0.4)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Date Navigator Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={handlePrevMonth}
                title="Previous Month"
                style={{
                  background: '#0d111a',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  borderRadius: '8px',
                  padding: '0.45rem 0.65rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleToday}
                style={{
                  background: '#0d111a',
                  border: '1px solid rgba(132, 204, 22, 0.4)',
                  color: '#84cc16',
                  fontWeight: 800,
                  borderRadius: '8px',
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(132, 204, 22, 0.2)'
                }}
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                title="Next Month"
                style={{
                  background: '#0d111a',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  borderRadius: '8px',
                  padding: '0.45rem 0.65rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Current Month Title Banner & Category Badges Legend */}
        <div style={{ marginTop: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.01em' }}>
            {currentMonthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </h3>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <span
                key={cat}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#cbd5e1',
                  background: '#0d111a',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '4px 9px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW 1: High-Contrast Opaque Month Grid */}
      {viewMode === 'month' && (
        <div
          className="card-glow-teal anim-fade-up-d1"
          style={{
            background: '#161b26',
            border: '1px solid rgba(20, 184, 166, 0.35)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
          }}
        >
          {/* Day Headers Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              background: 'linear-gradient(180deg, #0d111a 0%, #161b26 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              textAlign: 'center',
              fontWeight: 800,
              fontSize: '0.78rem',
              color: '#14b8a6',
              padding: '0.85rem 0',
              letterSpacing: '0.06em'
            }}
          >
            <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
          </div>

          {/* Month Day Cells Grid with Solid Backgrounds & Crisp High Contrast Borders */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#1e293b' }}>
            {/* Blank leading cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`blank-${i}`} style={{ background: '#0d111a', minHeight: '120px', padding: '0.5rem', opacity: 0.5 }} />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayItems = obligationsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dayNum}
                  className={isToday ? 'anim-border-breathe' : ''}
                  style={{
                    animation: 'fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
                    animationDelay: `${(i % 7) * 0.04}s`,
                    background: isToday ? 'rgba(16, 185, 129, 0.18)' : '#161b26',
                    border: isToday ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isToday ? '0 0 20px rgba(16, 185, 129, 0.35)' : 'none',
                    minHeight: '125px',
                    padding: '0.65rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontWeight: isToday ? 800 : 700,
                        fontSize: '0.9rem',
                        color: isToday ? '#6ee7b7' : '#f8fafc',
                        textShadow: isToday ? '0 0 10px rgba(110, 231, 183, 0.5)' : 'none'
                      }}
                    >
                      {dayNum}
                    </span>
                    {dayItems.length > 0 && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          background: isToday ? '#10b981' : 'rgba(20, 184, 166, 0.25)',
                          color: isToday ? '#000000' : '#6ee7b7',
                          border: isToday ? 'none' : '1px solid rgba(20, 184, 166, 0.4)',
                          padding: '1px 7px',
                          borderRadius: '10px'
                        }}
                      >
                        {dayItems.length}
                      </span>
                    )}
                  </div>

                  {/* Obligation items preview in cell */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '6px', overflowY: 'auto', maxHeight: '85px' }}>
                    {dayItems.map(ob => {
                      const color = CATEGORY_COLORS[ob.category] || '#14b8a6';
                      const isOverdue = dateStr < todayStr && ob.status !== 'Completed';
                      const isHovered = hoveredItemId === ob.id;

                      return (
                        <div
                          key={ob.id}
                          onMouseEnter={() => setHoveredItemId(ob.id)}
                          onMouseLeave={() => setHoveredItemId(null)}
                          onClick={() => setSelectedObligation(ob)}
                          title={`${ob.title} - ₹${Number(ob.amount).toFixed(2)}`}
                          style={{
                            animation: 'scalePop 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
                            background: isOverdue ? 'rgba(239, 68, 68, 0.25)' : `${color}35`,
                            borderLeft: `3px solid ${isOverdue ? '#ef4444' : color}`,
                            border: `1px solid ${isOverdue ? 'rgba(239, 68, 68, 0.5)' : `${color}66`}`,
                            padding: '4px 7px',
                            borderRadius: '5px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: isOverdue ? '#fca5a5' : '#ffffff',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                            boxShadow: isHovered ? `0 4px 12px ${color}66` : '0 2px 5px rgba(0,0,0,0.3)',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                        >
                          {ob.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: Week View Cards */}
      {viewMode === 'week' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {weekDaysStr.map((dateStr, index) => {
            const dateObj = new Date(dateStr + 'T00:00:00');
            const formatted = dateObj.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
            const dayItems = obligationsByDate[dateStr] || [];
            const isToday = dateStr === todayStr;

            return (
              <div
                key={dateStr}
                className={`vision-zoom-card card-glow-teal anim-bounce-up shimmer-card ${index % 2 === 0 ? 'anim-float-slow' : 'anim-float-h'} anim-float-d${(index % 4) + 1}`}
                style={{
                  animationDelay: `${index * 0.05}s`,
                  background: isToday ? 'rgba(16, 185, 129, 0.15)' : '#161b26',
                  border: isToday ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.85rem', color: isToday ? '#6ee7b7' : '#f8fafc' }}>
                  {formatted} {isToday && '(TODAY)'}
                </div>

                {dayItems.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    No obligations due
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {dayItems.map(ob => (
                      <div
                        key={ob.id}
                        style={{
                          background: '#0d111a',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.75rem',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedObligation(ob)}
                      >
                        <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#f8fafc' }}>{ob.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '3px' }}>
                          <strong style={{ color: '#14b8a6' }}>₹{Number(ob.amount).toFixed(2)}</strong> • <span className="category-badge">{ob.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: Agenda Feed View */}
      {viewMode === 'agenda' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {Object.entries(obligationsByDate).map(([dateStr, items], index) => {
            const isUndated = dateStr === 'UNDATED';
            let formatted = 'Manual Date Review Required';
            if (!isUndated) {
              const dObj = new Date(dateStr + 'T00:00:00');
              formatted = dObj.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            }

            return (
              <div key={dateStr} className={`card-glow-teal anim-fade-up shimmer-card ${index % 2 === 0 ? 'anim-float-slow' : 'anim-float-h'} anim-float-d${(index % 4) + 1}`} style={{ animationDelay: `${index * 0.05}s`, background: '#161b26', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1rem', color: '#14b8a6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📅 {formatted}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: '#0d111a', padding: '2px 8px', borderRadius: '10px' }}>{items.length} item{items.length > 1 ? 's' : ''}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {items.map((ob, idx) => (
                    <div
                      key={ob.id}
                      className="vision-zoom-card"
                      style={{
                        animation: 'fadeSlideLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
                        animationDelay: `${idx * 0.05}s`,
                        background: '#0d111a',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.85rem',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedObligation(ob)}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>{ob.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                          {ob.provider || 'Unspecified Biller'} • <span className="category-badge">{ob.category}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#14b8a6' }}>₹{Number(ob.amount).toFixed(2)}</span>
                        <span className={`status-badge status-${ob.status.toLowerCase().replace(/\s+/g, '')}`}>
                          {ob.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Obligation Details Spatial Modal */}
      {selectedObligation && (
        <div className="modal-overlay">
          <div className="modal-card vision-zoom-card card-glow-teal anim-scale-pop" style={{ maxWidth: '540px', background: '#161b26', border: '1px solid rgba(20, 184, 166, 0.4)', boxShadow: '0 25px 60px rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
              <div>
                <h3 className="modal-title" style={{ color: '#f8fafc', fontSize: '1.2rem' }}>{selectedObligation.title}</h3>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                  Category: <strong style={{ color: '#ffffff' }}>{selectedObligation.category}</strong>
                </div>
              </div>
              <button className="btn-ghost" style={{ color: '#94a3b8' }} onClick={() => setSelectedObligation(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#0d111a', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Due Date</div>
                  <div style={{ fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>{selectedObligation.dueDate || 'Manual Review Needed'}</div>
                </div>
                <div style={{ background: '#0d111a', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Amount Payable</div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#14b8a6', marginTop: '2px' }}>₹{Number(selectedObligation.amount).toFixed(2)}</div>
                </div>
              </div>

              {selectedObligation.provider && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Biller / Provider</div>
                  <div style={{ fontWeight: 700, color: '#f8fafc' }}>{selectedObligation.provider}</div>
                </div>
              )}

              {selectedObligation.consequenceNote && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.825rem', color: '#fca5a5' }}>
                  ⚠️ Risk: {selectedObligation.consequenceNote}
                </div>
              )}

              {selectedObligation.notes && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Notes</div>
                  <div style={{ fontSize: '0.85rem', background: '#0d111a', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}>{selectedObligation.notes}</div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
                <button className="btn-secondary" style={{ background: '#0d111a', color: '#cbd5e1', borderColor: 'rgba(255, 255, 255, 0.12)' }} onClick={() => setSelectedObligation(null)}>
                  Close
                </button>
                <button
                  className="btn-primary vision-zoom-card"
                  style={{ background: 'var(--accent-lime)', color: '#000000', fontWeight: 800 }}
                  onClick={() => {
                    const target = selectedObligation;
                    setSelectedObligation(null);
                    onOpenProofModal(target);
                  }}
                >
                  <FileCheck size={16} />
                  <span>Attach Proof & Complete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
