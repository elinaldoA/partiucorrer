
import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaTrash, FaTrophy, FaUsers, FaCalendarCheck, FaComments } from 'react-icons/fa';
import { useSocket } from '../contexts/SocketContext';
const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, clearAll } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <FaBell className="text-gray-600 text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-scaleIn">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Notificações</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <FaTrash /> Limpar
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-gray-500">Sem notificações</p>
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div
                  key={index}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => markAsRead(index)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 text-xl">
                      {notif.icon || getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{notif.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{getTimeAgo(notif.timestamp)}</p>
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
export default NotificationBell;