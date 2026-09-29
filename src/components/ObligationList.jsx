import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { calculatePriorityScore } from '../utils/priorityCalculator';
import { canCompleteObligation } from '../utils/storage';
import {
  Search,
  Filter,
  Plus,
  FileCheck,
  Edit,
  Trash2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Inbox,
  HelpCircle,
  Sparkles,
  LayoutGrid,
  List,
  Calendar,
  IndianRupee,
  Lock,
  Unlock,
  CheckCircle2,
  X,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function ObligationList({
  obligations,
  onOpenAddModal,
  onOpenEditModal,
  onOpenProofModal,
  onOpenSmartInbox,
  onDeleteObligation,
  onUpdateStatus
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState('All');
  const [sortBy, setSortBy] = useState('priority');
  const [displayMode, setDisplayMode] = useState('grid'); // 'grid' | 'table'
  const [selectedDetailOb, setSelectedDetailOb] = useState(null);
  const [expandedScoreId, setExpandedScoreId] = useState(null);

  // Filter logic
  const filtered = obligations.filter(ob => {
    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = ob.title?.toLowerCase().includes(q);
      const matchProvider = ob.provider?.toLowerCase().includes(q);
      const matchNotes = ob.notes?.toLowerCase().includes(q);
      if (!matchTitle && !matchProvider && !matchNotes) return false;
    }

    // Category
    if (selectedCategory !== 'All' && ob.category !== selectedCategory) return false;

    // Status
    if (selectedStatus !== 'All' && ob.status !== selectedStatus) return false;

    const p = calculatePriorityScore(ob, obligations);

    // Priority
    if (selectedPriority !== 'All' && p.level !== selectedPriority) return false;

    // Timeframe
    if (selectedTimeframe === 'overdue' && p.daysRemaining >= 0) return false;
    if (selectedTimeframe === '7days' && (p.daysRemaining < 0 || p.daysRemaining > 7)) return false;
    if (selectedTimeframe === '30days' && (p.daysRemaining < 0 || p.daysRemaining > 30)) return false;

    return true;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    const scoreA = calculatePriorityScore(a, obligations).score;
    const scoreB = calculatePriorityScore(b, obligations).score;

    if (sortBy === 'priority') {
      return scoreB - scoreA;
    } else if (sortBy === 'date') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sortBy === 'amount') {
      return Number(b.amount || 0) - Number(a.amount || 0);
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const categoryList = ['All', 'Electricity', 'Gas', 'Water', 'Insurance', 'Documents', 'Subscriptions', 'Vehicles', 'Appointments'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      
      {/* 1. Header & Controls Toolbar */}
      <div className="toolbar-card card-glow-teal anim-fade-up anim-float-slow" style={{ background: '#161b26', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)' }}>
        <div className="toolbar-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Header Title & Items Count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(20, 184, 166, 0.2)', padding: '0.5rem', borderRadius: '10px', color: '#14b8a6', border: '1px solid rgba(20, 184, 166, 0.4)', boxShadow: '0 0 15px rgba(20, 184, 166, 0.3)' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>Obligations Directory</h2>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'rgba(20, 184, 166, 0.2)', color: '#14b8a6', border: '1px solid rgba(20, 184, 166, 0.4)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                  {sorted.length} item{sorted.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Command center for all active bills, document renewals, vehicle taxes, and insurance deadlines
              </div>
            </div>
          </div>

          {/* Action Buttons & View Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* View Mode Toggle */}
            <div style={{ background: '#0d111a', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '3px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '2px' }}>
              <button
                className="btn-tab"
                style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, background: displayMode === 'grid' ? '#14b8a6' : 'transparent', color: displayMode === 'grid' ? '#ffffff' : '#94a3b8', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setDisplayMode('grid')}
              >
                <LayoutGrid size={15} />
                <span>3D Floating Grid</span>
              </button>
              <button
                className="btn-tab"
                style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, background: displayMode === 'table' ? '#14b8a6' : 'transparent', color: displayMode === 'table' ? '#ffffff' : '#94a3b8', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setDisplayMode('table')}
              >
                <List size={15} />
                <span>Linear Table</span>
              </button>
            </div>

            <button className="btn-secondary vision-zoom-card" onClick={onOpenSmartInbox} style={{ background: '#0d111a', color: '#14b8a6', borderColor: 'rgba(20, 184, 166, 0.4)', fontWeight: 700 }}>
              <Inbox size={16} />
              <span>Smart Inbox</span>
            </button>
            <button className="btn-primary vision-zoom-card" onClick={onOpenAddModal} style={{ background: 'var(--accent-lime)', color: '#000000', fontWeight: 800 }}>
              <Plus size={16} />
              <span>Add Obligation</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="toolbar-row" style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} className="search-icon" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#14b8a6' }} />
            <input
              type="text"
              className="search-input"
              style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)', paddingLeft: '2.5rem', width: '100%', borderRadius: 'var(--radius-md)' }}
              placeholder="Search by title, biller, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categoryList.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>

          <select
            className="filter-select"
            style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In progress">In progress</option>
            <option value="Awaiting proof">Awaiting proof</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            className="filter-select"
            style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            className="filter-select"
            style={{ background: '#0d111a', color: '#14b8a6', borderColor: 'rgba(20, 184, 166, 0.4)', fontWeight: 800 }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="priority">Sort by Score (High → Low)</option>
            <option value="date">Sort by Due Date (Earliest)</option>
            <option value="amount">Sort by Amount (Highest)</option>
            <option value="title">Sort by Title (A → Z)</option>
          </select>
        </div>
      </div>

      {/* 2. Main Display View: 3D Floating Grid OR Table View */}
      {sorted.length === 0 ? (
        <div className="empty-state card-glow-teal anim-float-scale" style={{ background: '#161b26', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '4rem 1.5rem', textAlign: 'center' }}>
          <div className="empty-icon" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
          <div className="empty-title" style={{ color: '#f8fafc', fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem' }}>No Matching Obligations Found</div>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
            Try broadening your search query or reset category and status filters.
          </p>
          <button
            className="btn-secondary vision-zoom-card"
            style={{ background: '#0d111a', color: '#14b8a6', borderColor: 'rgba(20, 184, 166, 0.4)', fontWeight: 700 }}
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSelectedStatus('All');
              setSelectedPriority('All');
              setSelectedTimeframe('All');
            }}
          >
            Reset All Filters
          </button>
        </div>
      ) : displayMode === 'grid' ? (
        /* 3D Floating Spatial Cards Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {sorted.map((ob, idx) => {
            const p = calculatePriorityScore(ob, obligations);
            const isOverdue = p.daysRemaining < 0 && ob.status !== 'Completed';

            const floatClassMap = ['anim-float-slow', 'anim-float-h', 'anim-float-scale', 'anim-float-3d'];
            const floatClass = floatClassMap[idx % 4];
            const floatDelayClass = `anim-float-d${(idx % 4) + 1}`;

            return (
              <div
                key={ob.id}
                className={`vision-zoom-card card-glow-teal float-card anim-bounce-up shimmer-card ${floatClass} ${floatDelayClass}`}
                style={{
                  background: 'linear-gradient(135deg, rgba(22, 27, 38, 0.95) 0%, rgba(13, 17, 26, 0.98) 100%)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  animationDelay: `${(idx % 8) * 0.08}s`,
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedDetailOb(ob)}
              >
                <div>
                  {/* Top Badge Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <span className="category-badge" style={{ background: 'rgba(20, 184, 166, 0.18)', color: '#14b8a6', border: '1px solid rgba(20, 184, 166, 0.3)', fontWeight: 800, fontSize: '0.75rem' }}>
                      {ob.category}
                    </span>
                    <span className={`priority-score-badge priority-${p.level.toLowerCase()}`} title={p.breakdown.join('\n')}>
                      Score {p.score} • {p.level}
                    </span>
                  </div>

                  {/* Title & Biller */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.2rem', lineHeight: 1.3 }}>
                    {ob.title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                    {ob.provider || 'Unspecified Biller'}
                  </div>

                  {/* Penalty / Risk Note */}
                  {ob.consequenceNote && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.45rem 0.65rem', fontSize: '0.78rem', color: '#fca5a5', marginBottom: '0.75rem' }}>
                      ⚠️ {ob.consequenceNote}
                    </div>
                  )}
                </div>

                {/* Card Footer: Amount, Date & Quick Action */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Amount Due</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14b8a6' }}>
                      ₹{Number(ob.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.725rem', color: isOverdue ? '#ef4444' : '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      {isOverdue ? `OVERDUE (${Math.abs(p.daysRemaining)}d)` : `Due: ${ob.dueDate || 'Manual'}`}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <span className={`status-badge status-${ob.status.toLowerCase().replace(/\s+/g, '')}`}>
                        {ob.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Linear Table View */
        <div className="obligations-table-container card-glow-teal scan-line-effect shimmer-card anim-float-slow" style={{ background: '#161b26', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table className="obligations-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0d111a', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.04em' }}>
                <th style={{ padding: '0.95rem 1rem' }}>Priority & Rationale</th>
                <th style={{ padding: '0.95rem 1rem' }}>Obligation & Biller</th>
                <th style={{ padding: '0.95rem 1rem' }}>Category</th>
                <th style={{ padding: '0.95rem 1rem' }}>Due Date</th>
                <th style={{ padding: '0.95rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.95rem 1rem' }}>Status</th>
                <th style={{ padding: '0.95rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((ob) => {
                const p = calculatePriorityScore(ob, obligations);
                const isExpanded = expandedScoreId === ob.id;

                return (
                  <React.Fragment key={ob.id}>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }} className="table-row-hover">
                      <td style={{ padding: '0.95rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className={`priority-score-badge priority-${p.level.toLowerCase()}`}>
                            Score {p.score} • {p.level}
                          </span>
                          <button
                            className="btn-ghost"
                            style={{ padding: '2px', color: '#94a3b8' }}
                            onClick={() => setExpandedScoreId(isExpanded ? null : ob.id)}
                            title="Expand calculation rationale"
                          >
                            <HelpCircle size={15} />
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '0.95rem 1rem' }}>
                        <div className="ob-title-cell">
                          <span className="ob-title" style={{ color: '#f8fafc', fontWeight: 700 }}>{ob.title}</span>
                          <span className="ob-provider" style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{ob.provider || 'Unspecified Biller'}</span>
                        </div>
                      </td>

                      <td style={{ padding: '0.95rem 1rem' }}>
                        <span className="category-badge">{ob.category}</span>
                      </td>

                      <td style={{ padding: '0.95rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: p.daysRemaining <= 0 && ob.status !== 'Completed' ? '#ef4444' : '#cbd5e1', fontSize: '0.85rem' }}>
                          {ob.dueDate || 'Manual Date Review'}
                        </div>
                      </td>

                      <td style={{ padding: '0.95rem 1rem', fontWeight: 800, color: '#14b8a6', fontSize: '0.9rem' }}>
                        ₹{Number(ob.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td style={{ padding: '0.95rem 1rem' }}>
                        <span className={`status-badge status-${ob.status.toLowerCase().replace(/\s+/g, '')}`}>
                          {ob.status}
                        </span>
                      </td>

                      <td style={{ padding: '0.95rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            className="btn-primary vision-zoom-card"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: 'var(--accent-lime)', color: '#000000', fontWeight: 800 }}
                            onClick={() => onOpenProofModal(ob)}
                          >
                            <FileCheck size={14} />
                            <span>Proof</span>
                          </button>
                          <button
                            className="btn-ghost"
                            style={{ padding: '0.35rem', color: '#94a3b8' }}
                            onClick={() => onOpenEditModal(ob)}
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            className="btn-ghost"
                            style={{ padding: '0.35rem', color: '#ef4444' }}
                            onClick={() => {
                              if (window.confirm(`Delete "${ob.title}" permanently?`)) {
                                onDeleteObligation(ob.id);
                              }
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr style={{ background: '#0d111a' }}>
                        <td colSpan={7} style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <div style={{ background: '#161b26', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#14b8a6', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                              📊 Score Rationale for "{ob.title}":
                            </div>
                            <ul style={{ fontSize: '0.825rem', color: '#cbd5e1', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {p.breakdown.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Interactive Detail Spatial Zoom Popup Modal */}
      {selectedDetailOb && (
        <div className="modal-overlay" style={{ animation: 'fadeSlideUp 0.3s ease both' }}>
          <div className="modal-card vision-zoom-card card-glow-lime anim-scale-pop" style={{ maxWidth: '560px', background: '#161b26', border: '1px solid rgba(132, 204, 22, 0.4)', boxShadow: '0 25px 60px rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ background: 'rgba(132, 204, 22, 0.2)', padding: '0.5rem', borderRadius: '10px', color: '#84cc16', border: '1px solid rgba(132, 204, 22, 0.4)' }}>
                  <Zap size={22} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ color: '#f8fafc', fontSize: '1.2rem' }}>{selectedDetailOb.title}</h3>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Category: <strong style={{ color: '#ffffff' }}>{selectedDetailOb.category}</strong>
                  </div>
                </div>
              </div>
              <button className="btn-ghost" style={{ color: '#94a3b8' }} onClick={() => setSelectedDetailOb(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#0d111a', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Due Date</div>
                  <div style={{ fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>{selectedDetailOb.dueDate || 'Manual Review Needed'}</div>
                </div>
                <div style={{ background: '#0d111a', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Amount Payable</div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#14b8a6', marginTop: '2px' }}>₹{Number(selectedDetailOb.amount).toFixed(2)}</div>
                </div>
              </div>

              {selectedDetailOb.provider && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Biller / Provider</div>
                  <div style={{ fontWeight: 700, color: '#f8fafc' }}>{selectedDetailOb.provider}</div>
                </div>
              )}

              {selectedDetailOb.consequenceNote && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.825rem', color: '#fca5a5' }}>
                  ⚠️ Risk Penalty: {selectedDetailOb.consequenceNote}
                </div>
              )}

              {selectedDetailOb.notes && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Notes</div>
                  <div style={{ fontSize: '0.85rem', background: '#0d111a', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}>{selectedDetailOb.notes}</div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
                <button className="btn-secondary" style={{ background: '#0d111a', color: '#cbd5e1', borderColor: 'rgba(255, 255, 255, 0.12)' }} onClick={() => setSelectedDetailOb(null)}>
                  Close
                </button>
                <button
                  className="btn-primary vision-zoom-card"
                  style={{ background: 'var(--accent-lime)', color: '#000000', fontWeight: 800 }}
                  onClick={() => {
                    const target = selectedDetailOb;
                    setSelectedDetailOb(null);
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
