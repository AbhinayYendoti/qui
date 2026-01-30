import { useState, useEffect } from 'react';

const SPLASH_SHOWN_KEY = 'ic_splash_shown';

export function useSplash() {
  const [showSplash, setShowSplash] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if this is a fresh page load (not route change)
    const hasShownSplash = sessionStorage.getItem(SPLASH_SHOWN_KEY);
    
    if (!hasShownSplash) {
      setShowSplash(true);
      sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
    } else {
      setIsReady(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setIsReady(true);
  };

  return {
    showSplash,
    isReady,
    handleSplashComplete,
  };
}
