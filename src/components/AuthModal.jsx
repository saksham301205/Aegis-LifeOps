import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import {
  Shield,
  Lock,
  Mail,
  User,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!isSupabaseConfigured) {
      setLoading(false);
      setErrorMsg('Supabase cloud parameters are not configured in your environment. You can explore Aegis features locally in Demo Mode.');
      return;
    }

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });

        if (error) throw error;

        setSuccessMsg('Account created successfully! Check your email to confirm registration or sign in directly.');
        if (data.user) {
          setTimeout(() => {
            onAuthSuccess(data.user);
            onClose();
          }, 1500);
        }
      } else if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        setSuccessMsg('Signed in successfully!');
        if (data.user) {
          setTimeout(() => {
            onAuthSuccess(data.user);
            onClose();
          }, 800);
        }
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });

        if (error) throw error;

        setSuccessMsg('Password reset instructions sent to your email address!');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ animation: 'fadeSlideUp 0.3s ease both' }}>
      <div
        className="modal-card vision-zoom-card card-glow-teal anim-scale-pop anim-float-slow scan-line-effect"
        style={{
          maxWidth: '460px',
          padding: 0,
          background: 'linear-gradient(135deg, rgba(22, 27, 38, 0.98) 0%, rgba(13, 17, 26, 0.99) 100%)',
          border: '1px solid rgba(20, 184, 166, 0.4)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(20, 184, 166, 0.2)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden'
        }}
      >
        {/* Header Branding */}
        <div
          style={{
            background: 'linear-gradient(180deg, #0d111a 0%, #161b26 100%)',
            color: '#ffffff',
            padding: '1.6rem 1.75rem 1.25rem',
            position: 'relative',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Close Button */}
          <button
            className="btn-ghost vision-zoom-card"
            style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: '#94a3b8', padding: '6px', borderRadius: '8px' }}
            onClick={onClose}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(20, 184, 166, 0.2)',
                border: '1px solid rgba(20, 184, 166, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(20, 184, 166, 0.3)'
              }}
            >
              <Shield size={20} color="#14b8a6" className="bounce-anim" />
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
                Aegis LifeOps
              </span>
              <div style={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={11} />
                <span>Deterministic Private Vault</span>
              </div>
            </div>
          </div>

          {/* Mode Switcher Segmented Control */}
          <div
            style={{
              display: 'flex',
              background: '#0d111a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '4px',
              marginTop: '1.1rem',
              gap: '4px'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                flex: 1,
                padding: '0.55rem',
                fontSize: '0.825rem',
                fontWeight: mode === 'login' ? 800 : 600,
                color: mode === 'login' ? '#ffffff' : '#94a3b8',
                background: mode === 'login' ? '#14b8a6' : 'transparent',
                border: 'none',
                borderRadius: '7px',
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 0 15px rgba(20, 184, 166, 0.4)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                flex: 1,
                padding: '0.55rem',
                fontSize: '0.825rem',
                fontWeight: mode === 'signup' ? 800 : 600,
                color: mode === 'signup' ? '#ffffff' : '#94a3b8',
                background: mode === 'signup' ? '#14b8a6' : 'transparent',
                border: 'none',
                borderRadius: '7px',
                cursor: 'pointer',
                boxShadow: mode === 'signup' ? '0 0 15px rgba(20, 184, 166, 0.4)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.6rem 1.75rem' }}>
          {errorMsg && (
            <div
              className="anim-fade-up"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.825rem',
                color: '#fca5a5',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.15)'
              }}
            >
              <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0, color: '#ef4444' }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              className="anim-fade-up"
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.825rem',
                color: '#6ee7b7',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.15)'
              }}
            >
              <CheckCircle2 size={16} style={{ marginTop: '2px', flexShrink: 0, color: '#10b981' }} />
              <span>{successMsg}</span>
            </div>
          )}

          {!isSupabaseConfigured && (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.78rem',
                color: '#fde68a',
                lineHeight: 1.5
              }}
            >
              <strong style={{ color: '#f59e0b' }}>Demo Storage Mode Active:</strong> Cloud authentication relies on optional Supabase keys. You can operate all feature workflows locally without logging in.
            </div>
          )}

          {mode === 'signup' && (
            <div className="form-group anim-fade-up" style={{ marginBottom: '1.1rem' }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 700, fontSize: '0.825rem', marginBottom: '0.4rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{
                    paddingLeft: '2.5rem',
                    background: '#0d111a',
                    color: '#f8fafc',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="e.g. Sanya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#14b8a6' }} />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 700, fontSize: '0.825rem', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                style={{
                  paddingLeft: '2.5rem',
                  background: '#0d111a',
                  color: '#f8fafc',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#14b8a6' }} />
            </div>
          </div>

          {mode !== 'reset' && (
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0, color: '#cbd5e1', fontWeight: 700, fontSize: '0.825rem' }}>
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ fontSize: '0.75rem', padding: 0, color: '#14b8a6', fontWeight: 700 }}
                    onClick={() => {
                      setMode('reset');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{
                    paddingLeft: '2.5rem',
                    paddingRight: '2.5rem',
                    background: '#0d111a',
                    color: '#f8fafc',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#14b8a6' }} />
                <button
                  type="button"
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary vision-zoom-card ripple-container"
            style={{
              width: '100%',
              marginTop: '0.5rem',
              justifyContent: 'center',
              padding: '0.75rem',
              background: 'var(--accent-lime)',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.9rem',
              borderRadius: '8px',
              boxShadow: '0 0 20px rgba(132, 204, 22, 0.35)'
            }}
            disabled={loading}
          >
            {loading ? 'Processing Authorization...' : (
              <>
                <span>{mode === 'login' ? 'Sign In to LifeOps' : mode === 'signup' ? 'Create Free Vault' : 'Send Password Reset Link'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Privacy & Trust Badge Footer */}
          <div
            style={{
              marginTop: '1.35rem',
              paddingTop: '1.1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#94a3b8'
            }}
          >
            <ShieldCheck size={14} color="#14b8a6" />
            <span>Row-Level Security (RLS) Protected Private Operations</span>
          </div>
        </form>
      </div>
    </div>
  );
}
