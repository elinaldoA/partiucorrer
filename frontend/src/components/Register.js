
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaRunning, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
const Register = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error(t('auth.fillAllFields'));
      return;
    }
    if (password.length < 6) {
      toast.error(t('auth.passwordMinLength'));
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success(t('common.success'));
      navigate('/dashboard');
    } catch (error) {
      console.error('Register error:', error);
      let errorMessage = t('auth.emailExists');
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.request) {
        errorMessage = t('messages.networkError');
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="max-w-md w-full animate-fadeInUp">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl mb-4">
            <FaRunning className="text-4xl text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('auth.createAccount')}
          </h2>
          <p className="text-gray-600 mt-2">{t('auth.joinCommunity')}</p>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">{t('auth.fullName')}</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-10"
                  placeholder="João Silva"
                  required
                />
              </div>
            </div>
            <div>
              <label className="input-label">{t('auth.email')}</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="joao@exemplo.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="input-label">{t('auth.password')}</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder={t('auth.passwordMinLength')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t('auth.passwordMinLength')}</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('auth.registering')}
                </div>
              ) : (
                t('auth.signUp')
              )}
            </button>
          </form>
          <p className="text-center mt-6 text-gray-600">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};
export default Register;