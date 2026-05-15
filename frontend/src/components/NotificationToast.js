
import React, { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';
const NotificationToast = () => {
  const { notifications } = useSocket();
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5 text-2xl">
                {latest.icon || '🔔'}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{latest.title}</p>
                <p className="mt-1 text-sm text-gray-500">{latest.message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Fechar
            </button>
          </div>
        </div>
      ), { duration: 4000 });
    }
  }, [notifications]);
  return null;
};
export default NotificationToast;