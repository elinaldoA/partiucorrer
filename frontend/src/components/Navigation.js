
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaRunning, FaTachometerAlt, FaRoad, FaTrophy, 
  FaUsers, FaHistory, FaSignOutAlt, FaBars, FaTimes, 
  FaChevronDown, FaUserCircle, FaDownload,
  FaStar, FaCrown, FaCog, FaChevronLeft
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import ExportManager from './ExportManager';
import UnifiedNotifications from './UnifiedNotifications';
import { useSubscription } from '../hooks/useSubscription';
import { useHaptic } from '../hooks/useHaptic';

const Navigation = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const haptic = useHaptic();
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const { subscription } = useSubscription();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const getAvatarUrl = () => {
    if (user?.avatar_url && user.avatar_url !== 'null' && user.avatar_url !== 'undefined') {
      return `http://localhost:5000${user.avatar_url}`;
    }
    return null;
  };

  const getPlanBadge = () => {
    if (!subscription) return null;
    if (subscription.name === 'Premium') {
      return (
        <span className="ml-2 text-xs bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded-full font-semibold shadow-sm">
          <FaStar className="inline mr-1 text-xs" />Premium
        </span>
      );
    }
    if (subscription.name === 'Elite') {
      return (
        <span className="ml-2 text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-0.5 rounded-full font-semibold shadow-sm">
          <FaCrown className="inline mr-1 text-xs" />Elite
        </span>
      );
    }
    return null;
  };

  const isPremium = subscription && subscription.name !== 'Grátis';
  const isFree = !subscription || subscription.name === 'Grátis';

  const navItems = [
    { path: '/dashboard', icon: FaTachometerAlt, label: 'Início' },
    { path: '/history', icon: FaHistory, label: 'Atividade' },
    { path: '/run', icon: FaRoad, label: 'Correr', isMain: true },
    { path: '/competitions', icon: FaTrophy, label: 'Ranking' },
    { path: '/groups', icon: FaUsers, label: 'Social' },
  ];

  const isRootTab = navItems.some(item => item.path === location.pathname);

  const handleBack = () => {
    haptic('light');
    navigate(-1);
  };

  return (
    <>
      {}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-800/50' 
          : 'bg-transparent'
      }`}>
        <div className="flex justify-between items-center h-16 px-4 max-w-5xl mx-auto">
          {}
          {!isRootTab ? (
            <button 
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2 -ml-2 transition-colors"
            >
              <FaChevronLeft className="text-xl" />
              <span className="font-semibold text-lg tracking-tight">Voltar</span>
            </button>
          ) : (
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 group"
              onClick={() => haptic('light')}
            >
              <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-xl shadow-md">
                <FaRunning className="text-white text-lg" />
              </div>
              <span className="font-extrabold text-xl bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 tracking-tight">
                PartiuCorrer
              </span>
            </Link>
          )}

          {}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <UnifiedNotifications />

            {}
            <div className="relative profile-dropdown">
              <button
                onClick={() => {
                  haptic('light');
                  setIsProfileOpen(!isProfileOpen);
                }}
                className="flex items-center justify-center focus:outline-none ml-2 rounded-full ring-2 ring-transparent focus:ring-blue-500 transition-all"
              >
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()}
                    alt={user?.name}
                    className="w-9 h-9 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-700"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="w-9 h-9 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                          <span class="text-white font-bold text-xs">${user?.name?.charAt(0).toUpperCase()}</span>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-xs">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </button>

              {}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn dark:bg-gray-800/95 dark:border-gray-700 transform origin-top-right">
                  <div className="p-4 bg-gradient-to-br from-blue-600/10 to-purple-600/10 dark:from-blue-900/20 dark:to-purple-900/20">
                    <p className="font-bold text-gray-800 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    <div className="mt-2">{getPlanBadge()}</div>
                  </div>

                  <div className="p-2 space-y-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-gray-700 hover:bg-gray-100/80 transition-colors dark:text-gray-300 dark:hover:bg-gray-700/80 font-medium text-sm"
                    >
                      <FaUserCircle className="text-blue-500 text-lg" />
                      <span>Meu Perfil</span>
                    </Link>

                    <button
                      onClick={() => {
                        if (!isPremium) {
                          toast.error('Exportação disponível apenas para assinantes Premium');
                          navigate('/plans');
                          return;
                        }
                        setShowExportModal(true);
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-gray-700 hover:bg-gray-100/80 transition-colors dark:text-gray-300 dark:hover:bg-gray-700/80 font-medium text-sm"
                    >
                      <FaDownload className={`text-lg ${isPremium ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className={`${!isPremium ? 'opacity-70' : ''}`}>Exportar GPX</span>
                    </button>

                    {isFree && (
                      <Link
                        to="/plans"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors font-medium text-sm"
                      >
                        <FaStar className="text-yellow-500 text-lg" />
                        <span>Fazer Upgrade</span>
                      </Link>
                    )}

                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:bg-red-900/20 font-medium text-sm"
                    >
                      <FaSignOutAlt className="text-lg" />
                      <span>Sair do App</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {}
      <nav className="fixed bottom-0 w-full z-50 pb-safe">
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl"></div>
        <div className="relative flex justify-around items-end h-20 px-2 sm:px-6 max-w-md mx-auto pb-3">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (item.isMain) {
              return (
                <div key={item.path} className="relative flex flex-col items-center justify-center -mt-8 px-2 group">
                  <Link
                    to={item.path}
                    onClick={() => haptic('medium')}
                    className={`flex items-center justify-center w-16 h-16 rounded-full shadow-xl transition-transform duration-300 transform group-hover:scale-105 active:scale-95 ${
                      isActive 
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-blue-500/30' 
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/20'
                    }`}
                  >
                    <Icon className="text-2xl" />
                  </Link>
                  <span className="text-[10px] font-semibold mt-1 text-gray-600 dark:text-gray-300">{item.label}</span>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => haptic('light')}
                className="flex flex-col items-center justify-center w-16 group relative"
              >
                <div className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive ? '-translate-y-1' : 'hover:-translate-y-1'}`}>
                  <div className={`p-1.5 rounded-xl transition-colors duration-300 ${
                    isActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-800'
                  }`}>
                    <Icon className={`text-[22px] transition-colors duration-300 ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`} />
                  </div>
                  <span className={`text-[10px] mt-0.5 font-medium transition-all duration-300 ${
                    isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                </div>
                {}
                {isActive && (
                  <div className="absolute -bottom-2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {}
      {showExportModal && (
        <ExportManager onClose={() => setShowExportModal(false)} />
      )}

      {isFree && (
        <div className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40 animate-fadeInUp pointer-events-none">
          <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-md text-white p-3 rounded-2xl shadow-lg border border-white/10 pointer-events-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaCrown className="text-yellow-300 text-xl" />
              <div>
                <p className="font-bold text-sm leading-tight">Desbloqueie o Premium</p>
                <p className="text-[10px] opacity-90">Áudio Coach, IA e mais</p>
              </div>
            </div>
            <Link to="/plans" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors">
              Ver
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;