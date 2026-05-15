import React, { useState, useEffect } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('PWA installed');
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };
  if (!showPrompt) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl p-4 z-50 animate-slideInUp">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <FaDownload className="text-white text-xl" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">Instalar App</h3>
          <p className="text-sm text-gray-600 mt-1">
            Instale o RunTrack no seu dispositivo para uma experiência melhor!
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="btn-primary text-sm py-1.5"
            >
              Instalar
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="btn-secondary text-sm py-1.5"
            >
              Agora não
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};
export default PWAInstallPrompt;