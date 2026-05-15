import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaTimes, FaUser } from 'react-icons/fa';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
const GroupChat = ({ groupId, groupName, onClose }) => {
  const { t } = useLanguage();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/groups/${groupId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  }, [groupId]);
  useEffect(() => {
    fetchMessages();
    if (socket) {
      socket.emit('join_group', groupId);
      socket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
      });
    }
    return () => {
      if (socket) {
        socket.emit('leave_group', groupId);
        socket.off('new_message');
      }
    };
  }, [groupId, socket, fetchMessages]);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/groups/${groupId}/messages`, {
        message: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('pt-BR');
  };
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg h-96 flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-2xl" style={{ height: '600px' }}>
        {}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FaUser className="text-white text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-white">Chat do Grupo</h3>
              <p className="text-sm text-blue-100">{groupName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        {}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">💬</div>
              <p>Nenhuma mensagem ainda. Seja o primeiro a enviar!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isCurrentUser = msg.user_id === currentUser?.id;
              return (
                <div
                  key={idx}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-fadeInUp`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div
                    className={`max-w-[70%] rounded-xl p-3 ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {!isCurrentUser && (
                      <p className="text-xs font-semibold mb-1 text-blue-600">
                        {msg.user_name}
                      </p>
                    )}
                    <p className="text-sm break-words">{msg.message}</p>
                    <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-400'}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        {}
        <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="input-field flex-1"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="btn-primary flex items-center gap-2 px-4 disabled:opacity-50"
          >
            <FaPaperPlane /> Enviar
          </button>
        </form>
      </div>
    </div>
  );
};
export default GroupChat;