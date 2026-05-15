
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaRunning, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
const Login = () => {
  const { t } = useLanguage();
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error(t('auth.fillAllFields'));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email inválido');
      return;
    }
    if (password.length < 6) {
      toast.error(t('auth.passwordMinLength'));
      return;
    }
    setLoading(true);
    setFormError('');
    try {
      const success = await login(email, password);
      if (success) {
        toast.success(t('auth.loginSuccess') || 'Login realizado com sucesso!');
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setFormError(authError || t('auth.invalidCredentials'));
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = t('auth.invalidCredentials');
      if (error.response?.status === 401) {
        errorMessage = t('auth.invalidCredentials');
      } else if (error.response?.status === 429) {
        errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (!error.response) {
        errorMessage = t('messages.networkError');
      }
      toast.error(errorMessage);
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const initialEmail = location.state?.email || '';
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>
      <div className="max-w-md w-full animate-fadeInUp">
        {}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl mb-4 hover:scale-110 transition-transform duration-300">
            <FaRunning className="text-4xl text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('auth.welcomeBack')}
          </h2>
          <p className="text-gray-600 mt-2">{t('auth.signInToTrack')}</p>
        </div>
        {}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          {}
          {formError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm animate-shake">
              {formError}
            </div>
          )}
          {}
          {location.state?.message && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-600 dark:text-blue-400 text-sm">
              {location.state.message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {}
            <div>
              <label className="input-label">{t('auth.email')}</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormError('');
                  }}
                  className="input-field pl-10"
                  placeholder="voce@exemplo.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>
            {}
            <div>
              <label className="input-label">{t('auth.password')}</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormError('');
                  }}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            {}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  defaultChecked
                />
                <span className="text-sm text-gray-600">Lembrar-me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                {t('auth.forgotPassword') || 'Esqueceu a senha?'}
              </Link>
            </div>
            {}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('auth.loggingIn')}
                </div>
              ) : (
                t('auth.signIn')
              )}
            </button>
          </form>
          {}
          <p className="text-center mt-6 text-gray-600">
            {t('auth.dontHaveAccount')}{' '}
            <Link 
              to="/register" 
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              {t('auth.signUp')}
            </Link>
          </p>
        </div>
        {}
        <p className="text-center mt-6 text-xs text-gray-500">
          Ao fazer login, você concorda com nossos{' '}
          <a href="#" className="text-blue-600 hover:underline">Termos de Uso</a>
          {' '}e{' '}
          <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>
        </p>
        {}
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};
export default Login;