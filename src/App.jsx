import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import DashboardView from './components/DashboardView';
import ObligationList from './components/ObligationList';
import CalendarTimelineView from './components/CalendarTimelineView';
import DependencyGraphView from './components/DependencyGraphView';
import SmartInboxModal from './components/SmartInboxModal';
import ObligationFormModal from './components/ObligationFormModal';
import ProofModal from './components/ProofModal';
import RemindersDrawer from './components/RemindersDrawer';
import AuthModal from './components/AuthModal';
import InternalAmbientBackdrop from './components/InternalAmbientBackdrop';

import { supabase, isSupabaseConfigured } from './utils/supabaseClient';
import { fetchUserObligations, saveUserObligation, deleteUserObligation, updateUserObligationStatus, importLocalStorageDataToSupabase } from './utils/dbService';
import { resetDemoData } from './utils/storage';
import { calculatePriorityScore } from './utils/priorityCalculator';
import { Database, AlertTriangle, CheckCircle2, Sparkles, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [obligations, setObligations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLandingPage, setShowLandingPage] = useState(true);

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingObligation, setEditingObligation] = useState(null);
  const [isSmartInboxOpen, setIsSmartInboxOpen] = useState(false);
  const [proofObligation, setProofObligation] = useState(null);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Auth Listener & Session initialization
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const user = session?.user ?? null;
        setCurrentUser(user);
        setAuthLoading(false);
        if (!user) {
          setShowLandingPage(true);
        } else {
          setShowLandingPage(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        const user = session?.user ?? null;
        setCurrentUser(user);
        setAuthLoading(false);
        if (user) {
          setShowLandingPage(false);
        } else {
          setShowLandingPage(true);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setAuthLoading(false);
      // In local demo mode, landing page is shown by default until user explores app
    }
  }, []);

  // 2. Load Obligations whenever currentUser or auth state changes
  const loadData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchUserObligations(currentUser?.id);
      setObligations(data);
    } catch (err) {
      console.error('Error loading obligations:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleStorageUpdate = () => {
      loadData();
    };

    window.addEventListener('aegis-storage-update', handleStorageUpdate);
    return () => {
      window.removeEventListener('aegis-storage-update', handleStorageUpdate);
    };
  }, [currentUser]);

  // Urgent count for badge (overdue or due <= 3 days)
  const urgentCount = obligations.filter(o => {
    if (o.status === 'Completed') return false;
    const p = calculatePriorityScore(o, obligations);
    return p.daysRemaining <= 3;
  }).length;

  // CRUD Handlers
  const handleSaveObligation = async (item) => {
    try {
      await saveUserObligation(item, currentUser?.id);
      await loadData();
      showToast(item.id ? 'Obligation updated successfully!' : 'New obligation saved to command center!');
    } catch (err) {
      console.error('Save error:', err);
      showToast(err.message || 'Error saving obligation', 'error');
    }
  };

  const handleDeleteObligation = async (id) => {
    try {
      await deleteUserObligation(id, currentUser?.id);
      await loadData();
      showToast('Obligation removed.');
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Error deleting obligation', 'error');
    }
  };

  const handleUpdateStatus = async (id, newStatus, proof = null) => {
    try {
      await updateUserObligationStatus(id, newStatus, proof, currentUser?.id);
      await loadData();
      showToast(`Status updated to "${newStatus}"!`);
    } catch (err) {
      console.error('Status update error:', err);
      showToast('Error updating status', 'error');
    }
  };

  const handleResetDemo = () => {
    resetDemoData();
    loadData();
    showToast('Demo data reset to initial sample state!');
  };

  const handleSaveSmartInboxDraft = async (draft) => {
    await handleSaveObligation(draft);
    setActiveTab('obligations');
  };

  const handleImportLocalData = async () => {
    if (!currentUser) {
      showToast('Please sign in to import data into your database.', 'error');
      return;
    }
    const result = await importLocalStorageDataToSupabase(currentUser.id);
    if (result.success) {
      await loadData();
      showToast(result.message);
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setShowLandingPage(true);
    showToast('Signed out successfully.');
  };

  // If viewing Public Landing Page
  if (showLandingPage) {
    return (
      <div className="app-container">
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setShowLandingPage(false);
          }}
          currentUser={currentUser}
          onOpenAuthModal={(mode) => {
            setAuthInitialMode(mode);
            setIsAuthModalOpen(true);
          }}
          onSignOut={handleSignOut}
          onImportLocalData={handleImportLocalData}
          onOpenAddModal={() => {
            setShowLandingPage(false);
            setEditingObligation(null);
            setIsAddModalOpen(true);
          }}
          onOpenSmartInbox={() => {
            setShowLandingPage(false);
            setIsSmartInboxOpen(true);
          }}
          onOpenReminders={() => setIsRemindersOpen(true)}
          onResetDemo={handleResetDemo}
          urgentCount={urgentCount}
        />

        <LandingPage
          onOpenLogin={() => {
            setAuthInitialMode('login');
            setIsAuthModalOpen(true);
          }}
          onOpenSignup={() => {
            setAuthInitialMode('signup');
            setIsAuthModalOpen(true);
          }}
          onDemoExplore={() => {
            setShowLandingPage(false);
          }}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authInitialMode}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setShowLandingPage(false);
            loadData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 60fps Ambient Floating Life-Admin Backdrop */}
      <InternalAmbientBackdrop />

      {/* Toast Feedback Banner */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 1000,
          background: toast.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: toast.type === 'error' ? '#991b1b' : '#065f46',
          border: toast.type === 'error' ? '1px solid #fca5a5' : '1px solid #6ee7b7',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setShowLandingPage(false);
        }}
        currentUser={currentUser}
        onOpenLandingPage={() => setShowLandingPage(true)}
        onOpenAuthModal={(mode) => {
          setAuthInitialMode(mode);
          setIsAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
        onImportLocalData={handleImportLocalData}
        onOpenAddModal={() => {
          setEditingObligation(null);
          setIsAddModalOpen(true);
        }}
        onOpenSmartInbox={() => setIsSmartInboxOpen(true)}
        onOpenReminders={() => setIsRemindersOpen(true)}
        onResetDemo={handleResetDemo}
        urgentCount={urgentCount}
      />


      {/* Main View Shell */}
      <main className="main-content">
        {loadingData ? (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Sparkles size={32} className="spin-icon" color="var(--accent-teal)" style={{ marginBottom: '1rem' }} />
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>Loading Aegis LifeOps Data...</div>
            <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>Syncing private obligations with database security policies</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                obligations={obligations}
                onNavigateToObligations={() => setActiveTab('obligations')}
                onOpenProofModal={(ob) => setProofObligation(ob)}
                onOpenSmartInbox={() => setIsSmartInboxOpen(true)}
                onOpenAddModal={() => {
                  setEditingObligation(null);
                  setIsAddModalOpen(true);
                }}
              />
            )}

            {activeTab === 'obligations' && (
              <ObligationList
                obligations={obligations}
                onOpenAddModal={() => {
                  setEditingObligation(null);
                  setIsAddModalOpen(true);
                }}
                onOpenEditModal={(ob) => {
                  setEditingObligation(ob);
                  setIsAddModalOpen(true);
                }}
                onOpenProofModal={(ob) => setProofObligation(ob)}
                onOpenSmartInbox={() => setIsSmartInboxOpen(true)}
                onDeleteObligation={handleDeleteObligation}
                onUpdateStatus={handleUpdateStatus}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarTimelineView
                obligations={obligations}
                onOpenProofModal={(ob) => setProofObligation(ob)}
              />
            )}

            {activeTab === 'dependencies' && (
              <DependencyGraphView
                obligations={obligations}
                onOpenProofModal={(ob) => setProofObligation(ob)}
              />
            )}
          </>
        )}
      </main>

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authInitialMode}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setShowLandingPage(false);
          loadData();
          showToast(`Welcome back, ${user.email}!`);
        }}
      />

      <SmartInboxModal
        isOpen={isSmartInboxOpen}
        onClose={() => setIsSmartInboxOpen(false)}
        onSaveDraft={handleSaveSmartInboxDraft}
        obligations={obligations}
      />

      <ObligationFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingObligation(null);
        }}
        onSave={handleSaveObligation}
        editingObligation={editingObligation}
        obligations={obligations}
      />

      <ProofModal
        isOpen={!!proofObligation}
        onClose={() => setProofObligation(null)}
        obligation={proofObligation}
        obligations={obligations}
        onSaveProof={(id, status, proofData) => {
          handleUpdateStatus(id, status, proofData);
        }}
      />

      <RemindersDrawer
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        obligations={obligations}
        onOpenProofModal={(ob) => setProofObligation(ob)}
      />
    </div>
  );
}
