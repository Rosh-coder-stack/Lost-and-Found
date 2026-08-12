import React, { useState, useEffect } from 'react';
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
  const [userReports, setUserReports] = useState(INITIAL_USER_REPORTS);
  const [suggestedItems] = useState(SUGGESTED_ITEMS);
  const [globalItems, setGlobalItems] = useState([...GLOBAL_DATABASE_ITEMS, ...INITIAL_USER_REPORTS]);

  // Modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);
  const [isStoriesModalOpen, setIsStoriesModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (message) => {
    setToastMsg(message);
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewReport = (newReport) => {
    setUserReports([newReport, ...userReports]);
    setGlobalItems([newReport, ...globalItems]);
    showToast(`Report published for "${newReport.title}"`);
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
    showToast('Logged out successfully.');
    handleNavigate('landing');
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#e5e1e4] flex flex-col font-['Inter',sans-serif] selection:bg-[#7C3AED] selection:text-white">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed top-24 right-6 z-50 bg-[#7C3AED] text-white font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 animate-in slide-in-from-top duration-300">
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
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      {/* Main Screen Body */}
      <div className="flex-1">
        {currentScreen === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            user={user}
            onOpenReport={() => user ? setIsReportModalOpen(true) : handleNavigate('login')}
            onOpenBrowse={() => user ? setIsBrowseModalOpen(true) : handleNavigate('login')}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardPage
            user={user}
            userReports={userReports}
            suggestedItems={suggestedItems}
            onOpenReport={() => setIsReportModalOpen(true)}
            onOpenBrowse={() => setIsBrowseModalOpen(true)}
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenStories={() => setIsStoriesModalOpen(true)}
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
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleNewReport}
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
        onClose={() => setSelectedItem(null)}
        onClaimItem={handleClaimItem}
      />

      <SuccessStoriesModal
        isOpen={isStoriesModalOpen}
        onClose={() => setIsStoriesModalOpen(false)}
      />
    </div>
  );
}
