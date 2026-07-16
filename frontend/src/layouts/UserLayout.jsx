import React, { useState, useEffect, useRef } from 'react';
import UserSidebar from '../components/Sidebar/UserSidebar';
import UserDashboard from '../pages/Dashboard/UserDashboard';
import userapiservicer from '../services/userapiServices';

const UserLayout = ({ children, currentUser, onLogout }) => {
  // Start closed on mobile (window check for SSR safety)
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setProfileLoading(true);
      try {
        const data = await userapiservicer.getMyProfile();
        // Support either a flat user object or { user: {...} } response shape.
        const user = data?.user || data;
        if (isMounted) setProfile(user);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close the profile popover when clicking outside it.
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileCard(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = profile?.name || currentUser?.username || '';
  const firstLetter = displayName ? displayName.charAt(0).toUpperCase() : 'U';
  const role = profile?.role || '—';

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile backdrop overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <UserSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} onLogout={onLogout} />

      {/* Right side container — no left margin on mobile (sidebar overlays), margin on md+ */}
      <div
        className={`flex-1 flex flex-col min-h-screen overflow-y-auto transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-72' : 'ml-0'
        }`}
      >
        {/* Header bar */}
        <header className="sticky top-0 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 z-40 w-full shrink-0">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-900">
            {/* Hamburger — visible when sidebar is closed */}
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <span>ProjectFlow User Portal</span>
          </div>

          {/* Avatar + profile popover */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfileCard((v) => !v)}
              title={displayName || 'User'}
              className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-semibold select-none hover:bg-indigo-600 transition-colors cursor-pointer"
            >
              {profileLoading ? '…' : firstLetter}
            </button>

            {showProfileCard && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden animate-[profile-card-in_0.15s_ease-out]">
                <div className="px-4 py-4 flex items-center gap-3 border-b border-slate-100">
                  <div className="w-11 h-11 shrink-0 rounded-full bg-indigo-500 flex items-center justify-center text-white text-base font-semibold">
                    {profileLoading ? '…' : firstLetter}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {profileLoading ? 'Loading...' : displayName || 'Unknown user'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {profileLoading ? '—' : role}
                    </p>
                  </div>
                </div>
                {profile?.email && (
                  <div className="px-4 py-3 text-xs text-slate-500 truncate">
                    {profile.email}
                  </div>
                )}
              </div>
            )}
          </div>

          <style>{`
            @keyframes profile-card-in {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1">
          {children || <UserDashboard currentUser={currentUser} onLogout={onLogout} />}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;