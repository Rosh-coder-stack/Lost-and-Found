import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ReportModal from './components/ReportModal.jsx';
import BrowseModal from './components/BrowseModal.jsx';
import ItemDetailsModal from './components/ItemDetailsModal.jsx';
import SuccessStoriesModal from './components/SuccessStoriesModal.jsx';

import LandingPage from './pages/LandingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import OAuthSuccessPage from './pages/OAuthSuccessPage.jsx';

import { INITIAL_USER_REPORTS, SUGGESTED_ITEMS, GLOBAL_DATABASE_ITEMS } from './data/mockData.js';
import { getMyReports, getAllItems, deleteItemReport } from './services/itemService.js';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // Auto-detect reset password token or OAuth callback in URL on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;

    if (pathname.includes('oauth-success') || (urlParams.has('token') && !urlParams.has('resetToken') && !pathname.includes('reset-password'))) {
      setCurrentScreen('oauth-success');
    } else if (urlParams.has('token') || pathname.includes('reset-password')) {
      setCurrentScreen('reset-password');
    }
  }, []);

  // Data states
  const [userReports, setUserReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [suggestedItems] = useState(SUGGESTED_ITEMS);
  const [globalItems, setGlobalItems] = useState([]);


  // Modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);
  const [isStoriesModalOpen, setIsStoriesModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (message) => {
    setToastMsg(message);
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch real user reports from backend
  const fetchUserReports = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setIsLoadingReports(true);
    try {
      const response = await getMyReports();
      if (response && response.data) {
        setUserReports(response.data);
      }
    } catch (err) {
      console.warn('[App] Could not fetch remote user reports, keeping local state:', err.message);
    } finally {
      setIsLoadingReports(false);
    }
  }, []);

  // Fetch all global items from MongoDB for public browse list
  const fetchGlobalItems = useCallback(async () => {
    try {
      const response = await getAllItems();
      if (response && response.data) {
        setGlobalItems(response.data);
      }
    } catch (err) {
      console.warn('[App] Could not fetch global items from backend:', err.message);
    }
  }, []);


  // Initial load of global items
  useEffect(() => {
    fetchGlobalItems();
  }, [fetchGlobalItems]);

  // Sync user reports when user logs in or switches to dashboard
  useEffect(() => {
    if (user && currentScreen === 'dashboard') {
      fetchUserReports();
      fetchGlobalItems();
    }
  }, [user, currentScreen, fetchUserReports, fetchGlobalItems]);

  // Handler for opening Report Modal in Create Mode
  const handleOpenCreateReport = () => {
    if (!user) {
      handleNavigate('login');
      return;
    }
    setEditingReport(null);
    setIsReportModalOpen(true);
  };

  // Handler for opening Report Modal in Edit Mode
  const handleOpenEditReport = (report) => {
    if (!user) {
      handleNavigate('login');
      return;
    }
    setEditingReport(report);
    setIsReportModalOpen(true);
  };

  // Handler after successful Create or Edit in ReportModal
  const handleReportSubmitSuccess = (savedItem, actionType) => {
    const itemId = savedItem._id || savedItem.id;

    if (actionType === 'updated') {
      setUserReports((prev) =>
        prev.map((r) => ((r._id || r.id) === itemId ? savedItem : r))
      );
      setGlobalItems((prev) =>
        prev.map((r) => ((r._id || r.id) === itemId ? savedItem : r))
      );
      showToast(`Report for "${savedItem.title}" updated successfully`);
    } else {
      setUserReports((prev) => [savedItem, ...prev]);
      setGlobalItems((prev) => [savedItem, ...prev]);
      showToast(`Lost item report published for "${savedItem.title}"`);
      handleNavigate('dashboard');
    }

    // Refresh backend data in background
    fetchUserReports();
    fetchGlobalItems();
  };

  // Handler for Deleting a Report
  const handleDeleteReport = async (report) => {
    const itemId = report._id || report.id;
    try {
      await deleteItemReport(itemId);

      // Optimistically remove from state
      setUserReports((prev) => prev.filter((r) => (r._id || r.id) !== itemId));
      setGlobalItems((prev) => prev.filter((r) => (r._id || r.id) !== itemId));

      if (selectedItem && (selectedItem._id || selectedItem.id) === itemId) {
        setSelectedItem(null);
      }

      showToast(`Report "${report.title}" removed successfully.`);

      // Re-sync with backend
      fetchUserReports();
      fetchGlobalItems();
    } catch (err) {
      showToast(err.message || 'Failed to delete report.');
      throw err;
    }
  };

  const handleClaimItem = (item, proofMessage) => {
    showToast(`Claim verification submitted for "${item.title}"`);
    setSelectedItem(null);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    showToast(`Welcome back, ${userData.name}!`);
    handleNavigate('dashboard');
  };

  const handleSignUpSuccess = (userData) => {
    setUser(userData);
    showToast(`Account created for ${userData.name}!`);
    handleNavigate('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserReports([]);
    showToast('Logged out successfully.');
    handleNavigate('landing');
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#e5e1e4] flex flex-col font-['Inter',sans-serif] selection:bg-[#7C3AED] selection:text-white">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed top-24 right-6 z-50 bg-[#7C3AED] text-white font-bold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 animate-in slide-in-from-top duration-300">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Top Fixed Navbar */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
        onOpenReport={handleOpenCreateReport}
      />

      {/* Main Screen Body */}
      <div className="flex-1">
        {currentScreen === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            user={user}
            onOpenReport={handleOpenCreateReport}
            onOpenBrowse={() => setIsBrowseModalOpen(true)}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardPage
            user={user}
            userReports={userReports}
            isLoadingReports={isLoadingReports}
            suggestedItems={suggestedItems}
            onOpenReport={handleOpenCreateReport}
            onOpenBrowse={() => setIsBrowseModalOpen(true)}
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenStories={() => setIsStoriesModalOpen(true)}
            onEditReport={handleOpenEditReport}
            onDeleteReport={handleDeleteReport}
          />
        )}

        {currentScreen === 'signup' && (
          <SignupPage
            onNavigate={handleNavigate}
            onSignUpSuccess={handleSignUpSuccess}
          />
        )}

        {currentScreen === 'login' && (
          <LoginPage
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentScreen === 'forgot-password' && (
          <ForgotPasswordPage
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'reset-password' && (
          <ResetPasswordPage
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}

        {currentScreen === 'oauth-success' && (
          <OAuthSuccessPage
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>

      {/* Global Footer (shown on landing and dashboard) */}
      {(currentScreen === 'landing' || currentScreen === 'dashboard') && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Modals */}
      <ReportModal
        isOpen={isReportModalOpen}
        editingItem={editingReport}
        onClose={() => {
          setIsReportModalOpen(false);
          setEditingReport(null);
        }}
        onSubmitSuccess={handleReportSubmitSuccess}
      />

      <BrowseModal
        isOpen={isBrowseModalOpen}
        onClose={() => setIsBrowseModalOpen(false)}
        items={globalItems}
        onSelectItem={(item) => {
          setIsBrowseModalOpen(false);
          setSelectedItem(item);
        }}
      />

      <ItemDetailsModal
        item={selectedItem}
        currentUser={user}
        onClose={() => setSelectedItem(null)}
        onClaimItem={handleClaimItem}
        onEditItem={handleOpenEditReport}
        onDeleteItem={handleDeleteReport}
      />

      <SuccessStoriesModal
        isOpen={isStoriesModalOpen}
        onClose={() => setIsStoriesModalOpen(false)}
      />
    </div>
  );
}
