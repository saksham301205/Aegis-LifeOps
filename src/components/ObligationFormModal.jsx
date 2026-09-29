import React, { useState, useEffect } from 'react';
import { wouldCreateDependencyCycle } from '../utils/storage';
import { X, CheckCircle2, FileEdit, Plus, AlertTriangle } from 'lucide-react';

export default function ObligationFormModal({
  isOpen,
  onClose,
  onSave,
  editingObligation = null,
  obligations = []
}) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electricity',
    provider: '',
    amount: '',
    dueDate: '',
    status: 'Pending',
    consequenceSeverity: 'medium',
    consequenceNote: '',
    prerequisiteId: '',
    notes: ''
  });

  const [cycleError, setCycleError] = useState('');

  useEffect(() => {
    setCycleError('');
    if (editingObligation) {
      setFormData({
        id: editingObligation.id,
        title: editingObligation.title || '',
        category: editingObligation.category || 'Electricity',
        provider: editingObligation.provider || '',
        amount: editingObligation.amount || '',
        dueDate: editingObligation.dueDate || '',
        status: editingObligation.status || 'Pending',
        consequenceSeverity: editingObligation.consequenceSeverity || 'medium',
        consequenceNote: editingObligation.consequenceNote || '',
        prerequisiteId: editingObligation.prerequisiteId || '',
        notes: editingObligation.notes || ''
      });
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setFormData({
        title: '',
        category: 'Electricity',
        provider: '',
        amount: '',
        dueDate: d.toISOString().split('T')[0],
        status: 'Pending',
        consequenceSeverity: 'medium',
        consequenceNote: '',
        prerequisiteId: '',
        notes: ''
      });
    }
  }, [editingObligation, isOpen]);

  if (!isOpen) return null;

  const handlePrereqChange = (prereqId) => {
    const targetId = formData.id || 'NEW_TEMP';
    if (prereqId && wouldCreateDependencyCycle(targetId, prereqId, obligations)) {
      setCycleError('Dependency Cycle Error: Choosing this item creates a circular loop (A → B → A)!');
    } else {
      setCycleError('');
    }
    setFormData(prev => ({ ...prev, prerequisiteId: prereqId }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) {
      alert('Please fill out Title and Due Date.');
      return;
    }
    if (cycleError) {
      alert(cycleError);
      return;
    }
    onSave({
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : 0,
      prerequisiteId: formData.prerequisiteId || null
    });
    onClose();
  };

  const availablePrereqs = obligations.filter(
    ob => !formData.id || ob.id !== formData.id
  );

  return (
    <div className="modal-overlay">
      <div className="modal-card vision-zoom-card" style={{ maxWidth: '640px', background: '#161b26', border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 25px 50px rgba(0,0,0,0.8)' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#14b8a6', padding: '0.4rem', borderRadius: '8px' }}>
              {formData.id ? <FileEdit size={20} /> : <Plus size={20} />}
            </div>
            <h3 className="modal-title" style={{ color: '#f8fafc', fontSize: '1.15rem' }}>{formData.id ? 'Edit Obligation' : 'Add New Obligation'}</h3>
          </div>
          <button className="btn-ghost" style={{ color: '#94a3b8' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ marginTop: '1rem' }}>
            {cycleError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.65rem 0.85rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#fca5a5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={16} />
                <span>{cycleError}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Title *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                  placeholder="e.g., RTO Vehicle Tax Renewal"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Category *</label>
                <select
                  className="form-select"
                  style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                <label className="form-label" style={{ color: '#cbd5e1' }}>Provider / Issuer</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                  placeholder="e.g., BESCOM, RTO, Star Health"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Amount (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Due Date *</label>
                <input
                  type="date"
                  className="form-input"
                  style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Status Workflow</label>
                <select
                  className="form-select"
                  style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="In progress">In progress</option>
                  <option value="Awaiting proof">Awaiting proof</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Consequence Severity</label>
                <select
                  className="form-select"
                  style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                  value={formData.consequenceSeverity}
                  onChange={(e) => setFormData({ ...formData, consequenceSeverity: e.target.value })}
                >
                  <option value="critical">Critical (Disconnection / RTO Fine)</option>
                  <option value="high">High (Late Fee over ₹500 / Credit Risk)</option>
                  <option value="medium">Medium (Standard Late Charge)</option>
                  <option value="low">Low (Minor Reminder)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Prerequisite Dependency</label>
                <select
                  className="form-select"
                  style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                  value={formData.prerequisiteId}
                  onChange={(e) => handlePrereqChange(e.target.value)}
                >
                  <option value="">None (Independent Task)</option>
                  {availablePrereqs.map((ob) => {
                    const isCycle = wouldCreateDependencyCycle(formData.id || 'NEW_TEMP', ob.id, obligations);
                    return (
                      <option key={ob.id} value={ob.id} disabled={isCycle}>
                        Must complete "{ob.title}" first {isCycle ? '(Creates Cycle Loop!)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#cbd5e1' }}>Consequence Details / Penalty Risk</label>
              <input
                type="text"
                className="form-input"
                style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                placeholder="e.g., ₹250 late fee + BESCOM power disconnection notice after 7 days"
                value={formData.consequenceNote}
                onChange={(e) => setFormData({ ...formData, consequenceNote: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#cbd5e1' }}>Notes & Instructions</label>
              <textarea
                className="form-textarea"
                rows={3}
                style={{ background: '#0d111a', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.12)' }}
                placeholder="Consumer ID, UPI transaction details, or portal notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
            <button type="button" className="btn-secondary" style={{ background: '#0d111a', color: '#cbd5e1', borderColor: 'rgba(255, 255, 255, 0.12)' }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--accent-lime)', color: '#000000', fontWeight: 800 }} disabled={!!cycleError}>
              <CheckCircle2 size={16} />
              <span>{formData.id ? 'Update Obligation' : 'Add Obligation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
