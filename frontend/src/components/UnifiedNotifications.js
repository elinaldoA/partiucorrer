
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaBell, FaBellSlash, FaSpinner, FaTrash, FaTrophy, FaUsers, FaCalendarCheck, FaComments } from 'react-icons/fa';
import { useSocket } from '../contexts/SocketContext';
const UnifiedNotifications = () => {
  const { notifications, unreadCount, markAsRead, clearAll } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);
  const dropdownRef = useRef(null);
  const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || "BNzVx8v_vjvqBpIC5fNc7aGACYUjoxxU8_pFFLw0BQkph5vB4Q4PStCkHbeJBf6nY2xRxbfnNPAq_nLS134rUkI";
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
      initializeServiceWorker();
    }
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  const initializeServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      setSwRegistration(registration);
      await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setPushSubscribed(!!subscription);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };
  const urlBase64ToUint8Array = (base64String) => {
    if (!base64String) return new Uint8Array(0);
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };
  const togglePushSubscription = async () => {
    if (!swRegistration) return;
    setPushLoading(true);
    try {
      if (pushSubscribed) {
        const subscription = await swRegistration.pushManager.getSubscription();
        if (subscription) {
          const token = localStorage.getItem('token');
          await axios.post('http://localhost:5000/api/notifications/unsubscribe', 
            { endpoint: subscription.endpoint },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          await subscription.unsubscribe();
          setPushSubscribed(false);
          toast.success('Notificações push desativadas');
        }
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast.error('Permita notificações no navegador');
          setPushLoading(false);
          return;
        }
        const subscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/notifications/subscribe', 
          { subscription },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPushSubscribed(true);
        toast.success('Notificações push ativadas!');
      }
    } catch (error) {
      console.error('Push subscription error:', error);
      toast.error('Erro ao configurar notificações');
    } finally {
      setPushLoading(false);
    }
  };
  const getIcon = (type) => {
    switch(type) {
      case 'achievement': return <FaTrophy className="text-yellow-500" />;
      case 'competition': return <FaCalendarCheck className="text-blue-500" />;
      case 'group': return <FaUsers className="text-green-500" />;
      case 'chat': return <FaComments className="text-purple-500" />;
      default: return <FaBell className="text-gray-500" />;
    }
  };
  const getTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'agora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <FaBell className="text-gray-600 dark:text-gray-400 text-lg" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-scaleIn">
          {}
          <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white">Notificações</h3>
            <div className="flex items-center gap-2">
              {pushSupported && (
                <button
                  onClick={togglePushSubscription}
                  disabled={pushLoading}
                  className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                    pushSubscribed 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                  title={pushSubscribed ? 'Notificações push ativas' : 'Ativar notificações push'}
                >
                  {pushLoading ? <FaSpinner className="animate-spin" /> : pushSubscribed ? '🔔 Push ON' : '🔕 Push OFF'}
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <FaTrash /> Limpar
                </button>
              )}
            </div>
          </div>
          {}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-gray-500 dark:text-gray-400">Sem notificações</p>
                {!pushSubscribed && pushSupported && (
                  <p className="text-xs text-gray-400 mt-2">
                    Ative as notificações push para receber alertas
                  </p>
                )}
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div
                  key={index}
                  className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => markAsRead(index)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 text-xl">
                      {notif.icon || getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">{notif.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{getTimeAgo(notif.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default UnifiedNotifications;