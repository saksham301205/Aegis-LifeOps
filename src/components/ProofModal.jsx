import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { canCompleteObligation } from '../utils/storage';
import { ShieldCheck, Upload, CheckCircle2, X, AlertTriangle, Lock } from 'lucide-react';

export default function ProofModal({ isOpen, onClose, obligation, obligations = [], onSaveProof }) {
  const [refNumber, setRefNumber] = useState('');
  const [fileName, setFileName] = useState('');
  const [note, setNote] = useState('');
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (obligation && obligation.proof) {
      setRefNumber(obligation.proof.referenceNumber || '');
      setFileName(obligation.proof.fileName || '');
      setNote(obligation.proof.note || '');
      setCompletedDate(obligation.proof.attachedAt || new Date().toISOString().split('T')[0]);
    } else {
      setRefNumber('');
      setFileName('');
      setNote('');
      setCompletedDate(new Date().toISOString().split('T')[0]);
    }
  }, [obligation, isOpen]);

  if (!isOpen || !obligation) return null;

  const check = canCompleteObligation(obligation.id, obligations);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!check.allowed) {
      alert(check.reason);
      return;
    }

    // Trigger celebratory confetti effect
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#84cc16', '#14b8a6', '#10b981', '#3b82f6']
      });
    } catch (err) {
      // fallback
    }

    const proofData = {
      type: fileName ? 'file_upload' : 'reference_note',
      referenceNumber: refNumber,
      fileName: fileName || (refNumber ? `receipt_${refNumber}.pdf` : 'self_reported_proof.pdf'),
      note: note || 'Marked completed with self-reported UPI/Receipt confirmation.',
      attachedAt: completedDate,
      isSelfReported: true
    };
    onSaveProof(obligation.id, 'Completed', proofData);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ animation: 'fadeSlideUp 0.3s ease both' }}>
      <div className="modal-card vision-zoom-card anim-scale-pop card-glow-lime" style={{ maxWidth: '560px', background: '#161b26', border: '1px solid rgba(132, 204, 22, 0.4)', boxShadow: '0 25px 50px rgba(0,0,0,0.8)' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.5rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="modal-title" style={{ color: '#f8fafc', fontSize: '1.15rem' }}>Attach Proof & Mark Completed</h3>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Item: <strong style={{ color: '#ffffff' }}>{obligation.title}</strong>
              </div>
            </div>
          </div>
          <button className="btn-ghost" style={{ color: '#94a3b8' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ marginTop: '1rem' }}>
            {!check.allowed ? (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  color: '#fca5a5',
                  lineHeight: 1.45
                }}
              >
                <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', fontSize: '0.95rem', color: '#ef4444' }}>
                  <Lock size={18} />
                  <span>Prerequisite Incomplete - Action Blocked</span>
                </div>
                {check.reason}
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#f87171' }}>
                  Please complete and attach proof for the prerequisite obligation first before attempting to mark this downstream item as completed.
                </div>
              </div>
            ) : (
              /* Transparent Self-Reported Proof Disclaimer */
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.825rem',
                  color: '#fde68a',
                  lineHeight: 1.45
                }}
              >
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', color: '#f59e0b' }}>
                  <AlertTriangle size={16} />
                  <span>Self-Reported Proof Disclosure</span>
                </div>
                Aegis logs this attachment as <strong>user self-reported verification</strong>. Aegis does not execute bank transfers or verify receipts directly with third-party vendors.
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ color: '#cbd5e1' }}>UPI Reference / Confirmation Number</label>
              <input
                type="text"
                className="form-input"
                style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                placeholder="e.g., UPI Ref 99281, GPay Txn ID, or Receipt #"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                disabled={!check.allowed}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#cbd5e1' }}>Attach Receipt / Image / PDF File (Simulated Attachment)</label>
              <div
                style={{
                  border: '2px dashed rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.2rem',
                  textAlign: 'center',
                  background: '#0d111a',
                  cursor: check.allowed ? 'pointer' : 'not-allowed',
                  opacity: check.allowed ? 1 : 0.6,
                  transition: 'all 0.2s ease'
                }}
                className="dropzone-glow"
                onClick={() => {
                  if (!check.allowed) return;
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.onchange = (e) => {
                    if (e.target.files[0]) {
                      setFileName(e.target.files[0].name);
                    }
                  };
                  input.click();
                }}
              >
                <Upload size={24} color="#14b8a6" style={{ marginBottom: '0.35rem' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                  {fileName ? `Attached File: ${fileName}` : 'Click to select receipt image or PDF'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  PNG, JPG, PDF up to 10MB
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Completion Date</label>
                <input
                  type="date"
                  className="form-input"
                  style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                  value={completedDate}
                  onChange={(e) => setCompletedDate(e.target.value)}
                  disabled={!check.allowed}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Amount Cleared (₹ INR)</label>
                <input
                  type="text"
                  className="form-input"
                  value={`₹${Number(obligation.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  readOnly
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#14b8a6', fontWeight: 700 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#cbd5e1' }}>Proof Notes / Confirmation Details</label>
              <textarea
                className="form-textarea"
                rows={2}
                style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                placeholder="e.g., Paid via GooglePay UPI. Digital receipt saved."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={!check.allowed}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
            <button type="button" className="btn-secondary" style={{ background: '#0d111a', color: '#cbd5e1', borderColor: 'rgba(255, 255, 255, 0.12)' }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--accent-lime)', color: '#000000', fontWeight: 800 }} disabled={!check.allowed}>
              <CheckCircle2 size={16} />
              <span>Confirm & Mark Completed</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
