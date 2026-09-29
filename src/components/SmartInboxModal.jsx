import React, { useState, useEffect } from 'react';
import { extractFromNotice } from '../utils/ruleExtractor';
import { wouldCreateDependencyCycle } from '../utils/storage';
import { Inbox, CheckCircle2, X, Sparkles, Edit3, AlertCircle, Zap, Layers, ArrowDown } from 'lucide-react';

const SAMPLE_NOTICES = [
  {
    label: 'BESCOM Electric Bill Sample',
    text: `Bangalore Electricity Supply Company Limited (BESCOM)
Consumer ID: 4492-0193
Bill Month: September 2026
Total Amount Payable: ₹2,450.00
Due Date: 15/10/2026
WARNING: Late payment penalty of ₹250 applies after due date. Service disconnection notice will be issued after 7 days.`
  },
  {
    label: 'RTO Vehicle Renewal Sample',
    text: `STATE REGIONAL TRANSPORT OFFICE (RTO) RENEWAL NOTICE
Vehicle Plate: KA-01-MJ-8842
Annual Road Tax Renewal Fee: ₹2,200.00
Expiration Date: 2026-10-20
NOTICE: Valid RTO Pollution Under Control (PUC) Certificate is mandatory before tax renewal. Sample penalty: ₹5,000 late surcharge & registration hold.`
  },
  {
    label: 'Undated Notice Sample (Manual Date Test)',
    text: `Star Health Insurance Renewal Notice
Policy Number: SH-99201-B
Premium Amount Due: ₹14,500.00
Please pay premium promptly to avoid policy lapse and loss of accumulated No-Claim Bonus.`
  }
];

export default function SmartInboxModal({ isOpen, onClose, onSaveDraft, obligations = [] }) {
  const [inputText, setInputText] = useState('');
  const [draft, setDraft] = useState(null);
  const [showDraftForm, setShowDraftForm] = useState(false);
  const [cycleError, setCycleError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [fragments, setFragments] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setInputText('');
      setDraft(null);
      setShowDraftForm(false);
      setCycleError('');
      setIsScanning(false);
      setFragments([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerExtractionSequence = (text) => {
    setIsScanning(true);
    setFragments([]);

    const extracted = extractFromNotice(text);

    // Simulate multi-stage laser scan & field fragment morph sequence
    setTimeout(() => {
      const generatedFragments = [];
      if (extracted.amount) generatedFragments.push({ type: 'amount', label: `₹${extracted.amount}`, icon: '💰' });
      if (extracted.dueDate) generatedFragments.push({ type: 'date', label: `Due: ${extracted.dueDate}`, icon: '📅' });
      if (extracted.provider) generatedFragments.push({ type: 'provider', label: extracted.provider, icon: '⚡' });
      if (extracted.consequenceSeverity) generatedFragments.push({ type: 'severity', label: `Risk: ${extracted.consequenceSeverity.toUpperCase()}`, icon: '⚠️' });
      
      setFragments(generatedFragments);
    }, 400);

    setTimeout(() => {
      setDraft(extracted);
      setShowDraftForm(true);
      setIsScanning(false);
    }, 1100);
  };

  const handleExtract = () => {
    if (!inputText.trim()) return;
    triggerExtractionSequence(inputText);
  };

  const handleSampleClick = (sampleText) => {
    setInputText(sampleText);
    triggerExtractionSequence(sampleText);
  };

  const handleFieldChange = (field, value) => {
    setDraft(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'prerequisiteId') {
        if (value && wouldCreateDependencyCycle('NEW_TEMP', value, obligations)) {
          setCycleError('Selection error: Choosing this prerequisite creates a circular dependency loop!');
        } else {
          setCycleError('');
        }
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.title) {
      alert('Please enter a Title for this obligation.');
      return;
    }
    if (!draft.dueDate) {
      alert('Manual review required: Please select a valid Due Date before saving.');
      return;
    }
    if (cycleError) {
      alert(cycleError);
      return;
    }
    onSaveDraft(draft);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ animation: 'fadeSlideUp 0.3s ease both' }}>
      <div className="modal-card vision-zoom-card anim-scale-pop scan-line-effect" style={{ maxWidth: '680px', background: '#161b26', border: '1px solid rgba(20, 184, 166, 0.35)', boxShadow: '0 25px 60px rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}>
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(20, 184, 166, 0.18)', padding: '0.55rem', borderRadius: '10px', color: '#14b8a6', border: '1px solid rgba(20, 184, 166, 0.4)', boxShadow: '0 0 15px rgba(20, 184, 166, 0.3)' }}>
              <Inbox size={22} />
            </div>
            <div>
              <h3 className="modal-title" style={{ color: '#f8fafc', fontSize: '1.15rem' }}>Smart Notice Inbox (India Region)</h3>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Rule-Based Extractor & Editable Draft Pipeline
              </div>
            </div>
          </div>
          <button className="btn-ghost" style={{ color: '#94a3b8' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ marginTop: '1rem' }}>
          {/* Honest Rule-Based Disclosure Banner */}
          <div className="honesty-banner" style={{ background: '#0d111a', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}>
            <span className="honesty-badge" style={{ background: 'rgba(132, 204, 22, 0.2)', color: '#84cc16', border: '1px solid rgba(132, 204, 22, 0.4)' }}>Deterministic Rules</span>
            <div className="honesty-text">
              <strong style={{ color: '#f8fafc' }}>Transparent Extraction Engine:</strong> Aegis parses notice text using deterministic regex patterns, date parsers, and keyword heuristics. <em>No hidden third-party AI APIs or LLMs are used.</em> If a date cannot be extracted, it is left blank for mandatory manual review.
            </div>
          </div>

          {!showDraftForm ? (
            <div style={{ position: 'relative' }}>
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 600 }}>Paste Bill, Notice, Email, or SMS Text:</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                  placeholder="e.g., BESCOM bill of ₹2,450.00 due on 15/10/2026. Late penalty ₹250..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />

                {/* Animated Laser Scanning Overlay & Fragment Chips */}
                {isScanning && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(8, 11, 17, 0.92)', backdropFilter: 'blur(6px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', color: '#14b8a6', gap: '1rem', overflow: 'hidden' }}>
                    
                    {/* Sweeping Laser Beam Line */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, #14b8a6, #84cc16, transparent)', boxShadow: '0 0 15px #14b8a6', animation: 'laserScan 1.2s infinite ease-in-out' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', zIndex: 2 }}>
                      <Zap size={28} className="bounce-anim" color="#14b8a6" />
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Scanning Notice Heuristics...
                      </span>
                    </div>

                    {/* Animated Extracted Text Fragments */}
                    {fragments.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', zIndex: 2 }}>
                        {fragments.map((frag, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'rgba(20, 184, 166, 0.2)',
                              border: '1px solid rgba(20, 184, 166, 0.5)',
                              color: '#6ee7b7',
                              padding: '0.35rem 0.75rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              boxShadow: '0 0 15px rgba(20, 184, 166, 0.3)',
                              animation: 'fragmentPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                            }}
                          >
                            {frag.icon} {frag.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sample helper buttons */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Quick Indian Sample Inputs (Click to test extraction):
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {SAMPLE_NOTICES.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="btn-secondary vision-zoom-card"
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', background: '#0d111a', color: '#cbd5e1', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                      onClick={() => handleSampleClick(s.text)}
                    >
                      ⚡ {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn-ghost" style={{ color: '#94a3b8' }} onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary vision-zoom-card"
                  style={{ background: 'var(--accent-lime)', color: '#000000', fontWeight: 800 }}
                  disabled={!inputText.trim()}
                  onClick={handleExtract}
                >
                  <Sparkles size={16} />
                  <span>Extract Draft Fields</span>
                </button>
              </div>
            </div>
          ) : (
            /* Editable Draft Form */
            <form onSubmit={handleSubmit}>
              <div style={{ background: '#0d111a', border: '1px solid rgba(20, 184, 166, 0.35)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#14b8a6', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={14} />
                    <span>Extracted Fragment Draft (Editable)</span>
                  </span>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '2px 6px', color: '#94a3b8' }}
                    onClick={() => setShowDraftForm(false)}
                  >
                    <Edit3 size={12} /> Re-paste Notice
                  </button>
                </div>
                {draft?.extractionMetadata?.confidenceNotes && (
                  <ul style={{ fontSize: '0.78rem', color: '#94a3b8', paddingLeft: '1.2rem' }}>
                    {draft.extractionMetadata.confidenceNotes.map((note, i) => (
                      <li key={i} style={{ color: note.includes('⚠️') ? '#f97316' : 'inherit', fontWeight: note.includes('⚠️') ? 700 : 'normal' }}>
                        {note}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {!draft.dueDate && (
                <div style={{ background: 'rgba(249, 115, 22, 0.15)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.65rem 0.85rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#fdba74', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertCircle size={16} />
                  <span>Manual Date Review Required: Extraction could not detect an explicit date. Please select a Due Date below.</span>
                </div>
              )}

              {cycleError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.65rem 0.85rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#fca5a5', fontWeight: 600 }}>
                  🛑 {cycleError}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Obligation Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                    value={draft.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Category *</label>
                  <select
                    className="form-select"
                    style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                    value={draft.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                  >
                    <option value="Electricity">Electricity</option>
                    <option value="Gas">Gas</option>
                    <option value="Water">Water</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Documents">Documents</option>
                    <option value="Subscriptions">Subscriptions</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Appointments">Appointments</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Provider / Biller Issuer</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                    value={draft.provider}
                    onChange={(e) => handleFieldChange('provider', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Amount (₹ INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                    value={draft.amount}
                    onChange={(e) => handleFieldChange('amount', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Due Date * {draft.dueDate ? '' : '(Manual Review Needed)'}</label>
                  <input
                    type="date"
                    className="form-input"
                    style={!draft.dueDate ? { borderColor: '#f97316', background: 'rgba(249, 115, 22, 0.15)', color: '#f8fafc' } : { background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                    value={draft.dueDate || ''}
                    onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Consequence Severity</label>
                  <select
                    className="form-select"
                    style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                    value={draft.consequenceSeverity}
                    onChange={(e) => handleFieldChange('consequenceSeverity', e.target.value)}
                  >
                    <option value="critical">Critical (Disconnection, RTO Fine, Impound)</option>
                    <option value="high">High (Late Fee over ₹500, NCB Loss)</option>
                    <option value="medium">Medium (Standard Late Fee)</option>
                    <option value="low">Low (Minor Reminder)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Consequence / Penalty Details</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                  value={draft.consequenceNote}
                  onChange={(e) => handleFieldChange('consequenceNote', e.target.value)}
                  placeholder="e.g., ₹250 late fee after Oct 15, power disconnection after 7 days"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Prerequisite Dependency (Optional)</label>
                <select
                  className="form-select"
                  style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                  value={draft.prerequisiteId || ''}
                  onChange={(e) => handleFieldChange('prerequisiteId', e.target.value || null)}
                >
                  <option value="">None (Independent Obligation)</option>
                  {obligations.map(ob => (
                    <option key={ob.id} value={ob.id}>
                      Must complete "{ob.title}" first
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Notes & Raw Notice Context</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                  value={draft.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                />
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
                <button type="button" className="btn-secondary" style={{ background: '#0d111a', color: '#cbd5e1', borderColor: 'rgba(255, 255, 255, 0.12)' }} onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary vision-zoom-card" style={{ background: 'var(--accent-lime)', color: '#000000', fontWeight: 800 }} disabled={!draft.dueDate}>
                  <CheckCircle2 size={16} />
                  <span>Save Draft to Aegis LifeOps</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
