
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaUser, FaEnvelope, FaCalendarAlt, FaEdit, FaSave, FaTimes, 
  FaStar, FaCrown, FaLock, FaMicrophone, FaWeight, FaFire,
  FaHeartbeat, FaRunning, FaRulerVertical
} from 'react-icons/fa';
import AudioCoachSettings from './AudioCoachSettings';
import AvatarUpload from './AvatarUpload';
import BMICard from './BMICard';
import { useSubscription } from '../hooks/useSubscription';
import { Link } from 'react-router-dom';
const Profile = ({ user, setUser }) => {
  const { hasFeature, subscription, loading: subLoading } = useSubscription();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [bmiData, setBmiData] = useState(null);
  const hasAudioCoach = hasFeature('audio_coach');
  const isPremium = subscription && subscription.name !== 'Grátis';
  const isFree = !subscription || subscription.name === 'Grátis';
  const fetchUserStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);
  const fetchBMIData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users/bmi-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBmiData(response.data);
    } catch (error) {
      console.error('Error fetching BMI:', error);
    }
  }, []);
  useEffect(() => {
    fetchUserStats();
    fetchBMIData(); 
  }, [fetchUserStats, fetchBMIData]);
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/api/users/profile', {
        name: formData.name,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };
  const getMemberSince = () => {
    if (!user?.created_at) return 'N/A';
    return new Date(user.created_at).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long'
    });
  };
  const getPlanBadge = () => {
    if (isPremium && subscription.name === 'Premium') {
      return (
        <span className="inline-flex items-center gap-1 ml-2 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
          <FaStar className="text-xs" /> Premium
        </span>
      );
    }
    if (isPremium && subscription.name === 'Elite') {
      return (
        <span className="inline-flex items-center gap-1 ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">
          <FaCrown className="text-xs" /> Elite
        </span>
      );
    }
    return null;
  };
  const getBMIClassification = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    if (bmi < 25) return { label: 'Peso normal', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
    if (bmi < 35) return { label: 'Obesidade grau I', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' };
    if (bmi < 40) return { label: 'Obesidade grau II', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' };
    return { label: 'Obesidade grau III', color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-900/30' };
  };
  if (subLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }
  const bmiClassification = getBMIClassification(bmiData?.bmi);
  const hasBMIData = bmiData?.weight && bmiData?.height;
  return (
    <div className="container-custom py-8 animate-fadeInUp">
      {}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 mb-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
          <p className="text-blue-100">Gerencie suas informações pessoais e métricas corporais</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-1 space-y-6">
          {}
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <AvatarUpload user={user} setUser={setUser} currentAvatar={user?.avatar_url} />
            </div>
            <h2 className="text-xl font-bold mt-4">
              {user?.name}
              {getPlanBadge()}
            </h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
              <FaCalendarAlt /> Membro desde {getMemberSince()}
            </p>
            <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <FaRunning className="text-xl text-blue-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-blue-600">{stats?.total_runs || 0}</p>
                  <p className="text-xs text-gray-500">Corridas</p>
                </div>
                <div>
                  <FaFire className="text-xl text-orange-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-blue-600">{stats?.total_distance?.toFixed(1) || 0}km</p>
                  <p className="text-xs text-gray-500">Distância</p>
                </div>
                <div>
                  <FaHeartbeat className="text-xl text-red-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-blue-600">
                    {stats?.average_pace ? `${parseFloat(stats.average_pace).toFixed(1)}` : '0:00'}
                  </p>
                  <p className="text-xs text-gray-500">Ritmo</p>
                </div>
              </div>
            </div>
          </div>
          {}
          {hasBMIData && (
            <div className={`card text-center ${bmiClassification?.bg}`}>
              <FaWeight className={`text-2xl mx-auto mb-2 ${bmiClassification?.color}`} />
              <p className={`text-3xl font-bold ${bmiClassification?.color}`}>
                {bmiData.bmi}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">IMC Atual</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${bmiClassification?.color} bg-white dark:bg-gray-800`}>
                {bmiClassification?.label}
              </span>
              {bmiData?.weight && bmiData?.height && (
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500">Peso</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{bmiData.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Altura</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{bmiData.height} m</p>
                  </div>
                </div>
              )}
            </div>
          )}
          {}
          <div>
            {hasAudioCoach ? (
              <AudioCoachSettings />
            ) : (
              <div className="card text-center py-6">
                <FaMicrophone className="text-4xl text-purple-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-800 dark:text-white">🎙️ Áudio Coach</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Receba feedback por voz durante a corrida
                </p>
                <Link to="/plans" className="inline-flex items-center gap-1 mt-4 text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                  <FaLock className="text-xs" />
                  Disponível no Premium
                </Link>
              </div>
            )}
          </div>
          {}
          {isFree && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl text-center border border-purple-200 dark:border-purple-800">
              <FaCrown className="text-3xl text-yellow-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Desbloqueie o Premium!</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Tenha acesso a Áudio Coach, IA, Prevenção de lesões e muito mais
              </p>
              <Link to="/plans" className="inline-block mt-3 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition">
                Ver Planos
              </Link>
            </div>
          )}
        </div>
        {}
        <div className="lg:col-span-2 space-y-6">
          {}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Informações Pessoais</h2>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2">
                  <FaEdit /> Editar Perfil
                </button>
              )}
            </div>
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <FaUser className="text-gray-400 text-xl" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nome completo</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{user?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <FaEnvelope className="text-gray-400 text-xl" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">E-mail</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{user?.email}</p>
                  </div>
                </div>
                {}
                {hasBMIData && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <FaWeight className="text-gray-400 text-xl" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Peso</p>
                        <p className="font-semibold text-gray-800 dark:text-white">{bmiData.weight} kg</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <FaRulerVertical className="text-gray-400 text-xl" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Altura</p>
                        <p className="font-semibold text-gray-800 dark:text-white">{bmiData.height} m</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="input-label">Nome completo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Alterar senha</h3>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Senha atual"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                      className="input-field"
                    />
                    <input
                      type="password"
                      placeholder="Nova senha"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      className="input-field"
                    />
                    <input
                      type="password"
                      placeholder="Confirmar nova senha"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Salvando...' : <><FaSave /> Salvar alterações</>}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary flex-1">
                    <FaTimes /> Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
          {}
          <BMICard />
        </div>
      </div>
    </div>
  );
};
export default Profile;