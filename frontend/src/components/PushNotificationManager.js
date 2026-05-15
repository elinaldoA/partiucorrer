
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaBell, FaBellSlash, FaSpinner } from 'react-icons/fa';
const PushNotificationManager = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      initializeServiceWorker();
    } else {
      console.log('Push notifications not supported');
    }
  }, []);
  const initializeServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      setSwRegistration(registration);
      await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };
  const subscribeToPush = async () => {
    if (!swRegistration) {
      toast.error('Service Worker não está pronto');
      return;
    }
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Você precisa permitir notificações no seu navegador');
        setLoading(false);
        return;
      }
      const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('VAPID Public Key not found in .env');
        toast.error('Configuração de notificações incompleta. Contate o administrador.');
        setLoading(false);
        return;
      }
      console.log('VAPID Public Key:', vapidPublicKey);
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
      console.log('Push subscription created:', subscription);
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/notifications/subscribe', 
        { subscription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSubscribed(true);
      toast.success('Notificações ativadas! Você receberá alertas de novidades.');
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error('Erro ao ativar notificações: ' + (error.message || 'Tente novamente'));
    } finally {
      setLoading(false);
    }
  };
  const unsubscribeFromPush = async () => {
    if (!swRegistration) return;
    setLoading(true);
    try {
      const subscription = await swRegistration.pushManager.getSubscription();
      if (subscription) {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/notifications/unsubscribe', 
          { endpoint: subscription.endpoint },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await subscription.unsubscribe();
        setIsSubscribed(false);
        toast.success('Notificações desativadas');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Erro ao desativar notificações');
    } finally {
      setLoading(false);
    }
  };
  if (!isSupported) {
    return null;
  }
  return (
    <button
      onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
      disabled={loading}
      className={`relative p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
        isSubscribed ? 'text-green-500' : 'text-gray-600 dark:text-gray-400'
      }`}
      title={isSubscribed ? 'Desativar notificações' : 'Ativar notificações'}
    >
      {loading ? (
        <FaSpinner className="animate-spin text-lg" />
      ) : isSubscribed ? (
        <FaBell className="text-lg text-green-500" />
      ) : (
        <FaBellSlash className="text-lg" />
      )}
    </button>
  );
};
export default PushNotificationManager;