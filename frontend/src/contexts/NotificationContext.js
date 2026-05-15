
import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaBell, FaTrophy, FaUserPlus, FaCalendarCheck } from 'react-icons/fa';
const NotificationContext = createContext();
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const showNotification = useCallback((title, message, type = 'info', icon = null) => {
    toast.custom((t) => (
      <div className={`max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 ${
        t.visible ? 'animate-enter' : 'animate-leave'
      }`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              {type === 'success' && <FaTrophy className="text-green-500 text-xl" />}
              {type === 'info' && <FaBell className="text-blue-500 text-xl" />}
              {type === 'warning' && <FaCalendarCheck className="text-yellow-500 text-xl" />}
              {icon && icon}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="mt-1 text-sm text-gray-500">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
          >
            Fechar
          </button>
        </div>
      </div>
    ), { duration: 5000 });
    const newNotification = {
      id: Date.now(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date(),
      icon
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);
  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  }, []);
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);
  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      showNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};