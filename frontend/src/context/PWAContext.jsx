import React, { createContext, useContext, useEffect, useState } from 'react';

const PWAContext = createContext(null);

export const PWAProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed/standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsAppInstalled(isStandalone);

    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log("PWA Install prompt captured");
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log("PWA Installed");
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsAppInstalled(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
        console.log("No deferred prompt available");
        return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setDeferredPrompt(null);
        setIsInstallable(false);
    } else {
        console.log('User dismissed the install prompt');
        // We keep the prompt if they just dismissed it, so they can try again?
        // Actually, once prompt() is called, the event is consumed. You cannot reuse it.
        // So we must set it to null.
        setDeferredPrompt(null);
        setIsInstallable(false);
    }
  };

  return (
    <PWAContext.Provider value={{ isInstallable, isAppInstalled, installPWA }}>
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => useContext(PWAContext);
