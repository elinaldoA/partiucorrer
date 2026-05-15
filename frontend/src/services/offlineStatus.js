
import React, { useState, useEffect } from 'react';
import { FaWifi, FaSignal, FaSync } from 'react-icons/fa';
import toast from 'react-hot-toast';
const OfflineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingSync, setPendingSync] = useState(0);
    const [syncing, setSyncing] = useState(false);
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast.success('🟢 Conexão restaurada!');
        };
        const handleOffline = () => {
            setIsOnline(false);
            toast.error('🔴 Você está offline. As corridas serão salvas localmente.');
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    if (!isOnline) {
        return (
            <div className="fixed bottom-4 left-4 z-50">
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
                    <FaSignal />
                    <span className="text-sm font-medium">Modo Offline</span>
                </div>
            </div>
        );
    }
    return null;
};
export default OfflineStatus;