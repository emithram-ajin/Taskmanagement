import React, { useState, useEffect, useRef } from 'react';
import UserSidebar from '../components/Sidebar/UserSidebar';
import UserDashboard from '../pages/Dashboard/UserDashboard';
import userapiservicer from '../services/userapiServices';

const UserLayout = ({ children, currentUser, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
      {/* Sidebar */}
      <UserSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} onLogout={onLogout} />

      {/* Right side container */}
      <div
        className={`flex-1 flex flex-col min-h-screen overflow-y-auto transition-all duration-300 ${
          isSidebarOpen ? 'ml-72' : 'ml-0'
        }`}
      >
        {/* Header bar */}
        <header className="sticky top-0 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 z-40 w-full shrink-0">
          <div
            className={`flex items-center text-sm font-medium text-slate-900 transition-all duration-300 ${
              isSidebarOpen ? 'pl-0' : 'pl-12'
            }`}
          >
            ProjectFlow User Portal
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