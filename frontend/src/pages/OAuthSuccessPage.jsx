import React, { useEffect, useState } from 'react';

/**
 * Helper function to decode JWT payload safely
 */
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export default function OAuthSuccessPage({ onNavigate, onLoginSuccess }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      setErrorMsg(decodeURIComponent(error));
      setIsProcessing(false);
      return;
    }

    if (token) {
      try {
        // 1. Store JWT token in localStorage
        localStorage.setItem('token', token);

        // 2. Extract user info from URL parameters first, fallback to decoded JWT payload
        const decodedPayload = parseJwt(token);
        const nameFromUrl = urlParams.get('name');
        const emailFromUrl = urlParams.get('email');
        const idFromUrl = urlParams.get('id');

        const userName = nameFromUrl || decodedPayload?.name || 'User';
        const userEmail = emailFromUrl || decodedPayload?.email || '';
        const userId = idFromUrl || decodedPayload?.id || decodedPayload?._id;

        const userData = {
          id: userId,
          _id: userId,
          role: decodedPayload?.role || 'user',
          name: userName,
          email: userEmail,
          provider: 'google',
        };

        // 3. Store user in localStorage
        localStorage.setItem('user', JSON.stringify(userData));

        // Clear query parameters from URL history without page refresh
        window.history.replaceState({}, document.title, window.location.pathname);

        // 4. Trigger login callback to transition user to dashboard
        onLoginSuccess(userData);
      } catch (err) {
        console.error('Failed to parse OAuth token:', err);
        setErrorMsg('Failed to process authentication token.');
        setIsProcessing(false);
      }
    } else {
      setErrorMsg('No authentication token found in response.');
      setIsProcessing(false);
    }
  }, [onLoginSuccess]);

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-between items-center relative overflow-hidden">
      {/* Ambient Light Blobs */}
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-[#7C3AED]/20 rounded-full blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 -left-20 w-96 h-96 bg-[#EC4899]/20 rounded-full blur-[100px] pointer-events-none"></div>

      <main className="w-full max-w-md px-4 z-10 my-auto">
        <div className="glass-card rounded-2xl p-8 md:p-10 border border-[#3F3F46]/60 shadow-2xl text-center">
          {isProcessing ? (
            <div className="space-y-4 py-6">
              <span className="material-symbols-outlined animate-spin text-4xl text-[#7C3AED]">
                progress_activity
              </span>
              <h2 className="text-xl font-bold text-white">Completing Google Sign-In...</h2>
              <p className="text-xs text-[#A1A1AA]">Please wait while we secure your session.</p>
            </div>
          ) : errorMsg ? (
            <div className="space-y-6 py-4">
              <span className="material-symbols-outlined text-4xl text-red-400">
                error
              </span>
              <h2 className="text-xl font-bold text-white">Authentication Error</h2>
              <p className="text-xs text-red-300 bg-red-500/10 p-3 rounded-xl border border-red-500/30">
                {errorMsg}
              </p>
              <button
                onClick={() => onNavigate('login')}
                className="w-full py-3 rounded-xl bg-[#7C3AED] text-white font-bold text-sm hover:scale-[1.02] transition-all cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
