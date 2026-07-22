import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function DriveStatus() {
  const { t } = useTranslation();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const auth = await window.api.isDriveAuthenticated();
      setIsAuth(auth);
    } catch (err) {
      console.error('Failed to check Drive auth:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      await window.api.authenticateDrive();
      setIsAuth(true);
    } catch (err) {
      console.error('Failed to authenticate:', err);
      alert(t('drive.connectFailed') + err.message);
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm(t('drive.confirmDisconnect'))) {
      setLoading(true);
      try {
        await window.api.logoutDrive();
        setIsAuth(false);
      } catch (err) {
        console.error('Failed to logout:', err);
      } finally {
        setLoading(false);
        setShowMenu(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
          isAuth
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
        }`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 19.5h20L12 2zm0 4l6.5 11h-13L12 6z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7.5 17.5l3-5.25h9l-3 5.25h-9zM16.5 6.75L21 14.5h-6l-4.5-7.75h6z"/>
          <path d="M3 14.5L7.5 6.75 12 14.5H3z"/>
        </svg>
        {isAuth ? t('drive.connected') : t('drive.connect')}
        <svg className={`w-3 h-3 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl border border-border shadow-panel-lg z-50 py-1">
            {isAuth ? (
              <>
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs font-medium text-ink">{t('drive.googleDrive')}</p>
                  <p className="text-2xs text-emerald-600 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    {t('drive.statusConnected')}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('drive.disconnect')}
                </button>
              </>
            ) : (
              <button
                onClick={handleConnect}
                className="w-full px-3 py-2 text-left text-xs text-accent hover:bg-accent-soft flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {t('drive.connectToDrive')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
