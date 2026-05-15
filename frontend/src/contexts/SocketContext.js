
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
const SocketContext = createContext();
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !socketRef.current) {
      const newSocket = io('http://localhost:5000', {
        auth: { token },
        transports: ['websocket']
      });
      newSocket.on('connect', () => {
        console.log('📡 Socket connected');
      });
      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
      newSocket.on('disconnect', () => {
        console.log('📡 Socket disconnected');
      });
      socketRef.current = newSocket;
      setSocket(newSocket);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);
  const markAsRead = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };
  return (
    <SocketContext.Provider value={{ 
      socket, 
      notifications, 
      unreadCount, 
      markAsRead, 
      clearAll 
    }}>
      {children}
    </SocketContext.Provider>
  );
};