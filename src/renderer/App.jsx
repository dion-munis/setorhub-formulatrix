import React, { useEffect, useState, useCallback } from 'react';
import { useProjectStore } from './store/useProjectStore.js';
import Onboarding from './screens/Onboarding.jsx';
import Dashboard from './screens/Dashboard.jsx';
import Preloader from './components/Preloader.jsx';

export default function App() {
  const { isOnboarded, checkOnboarding } = useProjectStore();
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const handlePreloaderComplete = useCallback(() => {
    setShowPreloader(false);
  }, []);

  if (showPreloader) {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  return isOnboarded ? <Dashboard /> : <Onboarding />;
}
