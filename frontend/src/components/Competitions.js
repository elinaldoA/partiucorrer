
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaTrophy, FaUsers, FaCalendarAlt, FaMedal, FaPlus, FaClock, FaCheck, FaStar, FaLock } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useSubscription } from '../hooks/useSubscription';
import { Link } from 'react-router-dom';
const Competitions = () => {
  const { t } = useLanguage();
  const { hasFeature, subscription, loading: subLoading } = useSubscription();
  const [competitions, setCompetitions] = useState([]);
  const [myCompetitions, setMyCompetitions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    distance_target: '',
    start_date: '',
    end_date: ''
  });
  const canCreateCompetitions = hasFeature('challenges');
  const isFree = !subscription || subscription.name === 'Grátis';
  const fetchCompetitions = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/competitions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompetitions(response.data);
    } catch (error) {
      toast.error(t('common.error'));
    }
  }, [t]);
  const fetchMyCompetitions = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/competitions/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyCompetitions(response.data);
    } catch (error) {
      console.error('Error fetching my competitions:', error);
    }
  }, []);
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCompetitions(), fetchMyCompetitions()]);
      setLoading(false);
    };
    loadData();
  }, [fetchCompetitions, fetchMyCompetitions]);
  const handleJoinCompetition = async (competitionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/competitions/${competitionId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('competitions.joinSuccess'));
      await Promise.all([fetchCompetitions(), fetchMyCompetitions()]);
    } catch (error) {
      toast.error(error.response?.data?.error || t('common.error'));
    }
  };
  const handleCreateCompetition = async (e) => {
    e.preventDefault();
    if (!canCreateCompetitions) {
      toast.error('Criar competições é um recurso Premium');
      return;
    }
    if (!formData.name || !formData.distance_target || !formData.start_date || !formData.end_date) {
      toast.error(t('competitions.fillAllFields'));
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/competitions', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('competitions.createSuccess'));
      setShowCreateModal(false);
      setFormData({ name: '', description: '', distance_target: '', start_date: '', end_date: '' });
      await Promise.all([fetchCompetitions(), fetchMyCompetitions()]);
    } catch (error) {
      toast.error(t('common.error'));
    }
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} ${t('competitions.daysLeft')}` : t('competitions.ended');
  };
  if (loading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">{t('common.loading')}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="container-custom py-8 animate-fadeInUp">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('competitions.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('competitions.subtitle')}</p>
        </div>
        {}
        {canCreateCompetitions ? (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> {t('competitions.create')}
          </button>
        ) : (
          <div className="relative group">
            <button 
              className="btn-primary flex items-center gap-2 opacity-50 cursor-not-allowed"
              disabled
            >
              <FaLock /> {t('competitions.create')}
            </button>
            <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Criar competições é um recurso Premium. 
              <Link to="/plans" className="text-purple-400 block mt-1">Fazer Upgrade →</Link>
            </div>
          </div>
        )}
      </div>
      {}
      {isFree && (
        <div className="mb-6 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl text-center border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-center gap-2">
            <FaStar className="text-yellow-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Crie suas próprias competições no plano Premium!
            </span>
            <Link to="/plans" className="text-purple-600 font-semibold text-sm hover:underline">Saiba mais</Link>
          </div>
        </div>
      )}
      {myCompetitions.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" /> {t('competitions.myCompetitions')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCompetitions.map((comp, idx) => (
              <div key={comp.id} className="card group hover:scale-105 transition-all duration-300 animate-fadeInUp" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                    <FaTrophy className="text-white text-xl" />
                  </div>
                  <div className="badge badge-warning">
                    <FaClock className="mr-1 text-xs" /> {getDaysRemaining(comp.end_date)}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {comp.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{comp.description || 'Sem descrição'}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{t('competitions.progress')}</span>
                    <span className="font-semibold">{comp.current_distance?.toFixed(1)} / {comp.distance_target} km</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${Math.min(comp.progress_percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <FaUsers /> {comp.participants_count} {t('competitions.participants')}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt /> {formatDate(comp.start_date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaMedal className="text-blue-500" /> {t('competitions.available')}
        </h2>
        {competitions.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4 animate-float">🏆</div>
            <p className="text-gray-500">{t('competitions.noActive')}</p>
            <p className="text-gray-400 text-sm mt-2">{t('competitions.createOne')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((comp, idx) => (
              <div key={comp.id} className="card group hover:scale-105 transition-all duration-300 animate-fadeInUp" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <FaMedal className="text-white text-xl" />
                  </div>
                  <div className="badge badge-info">
                    <FaClock className="mr-1 text-xs" /> {getDaysRemaining(comp.end_date)}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {comp.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{comp.description || 'Sem descrição'}</p>
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    {t('competitions.goal')}: <span className="font-semibold">{comp.distance_target} km</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <FaUsers /> {comp.participants_count} {t('competitions.participants')}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt /> {formatDate(comp.start_date)}
                  </span>
                </div>
                {!comp.user_joined ? (
                  <button
                    onClick={() => handleJoinCompetition(comp.id)}
                    className="w-full btn-primary py-2"
                  >
                    {t('competitions.join')}
                  </button>
                ) : (
                  <div className="w-full text-center py-2 bg-green-50 text-green-600 rounded-xl font-semibold flex items-center justify-center gap-2">
                    <FaCheck /> {t('competitions.joined')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {}
      {showCreateModal && canCreateCompetitions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('competitions.create')}
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>
            <form onSubmit={handleCreateCompetition} className="space-y-4">
              <div>
                <label className="input-label">{t('competitions.name')}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="Ex: Desafio Semanal"
                />
              </div>
              <div>
                <label className="input-label">{t('competitions.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field"
                  rows="3"
                  placeholder="Descreva sua competição..."
                />
              </div>
              <div>
                <label className="input-label">{t('competitions.distanceTarget')} (km)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={formData.distance_target}
                  onChange={(e) => setFormData({...formData, distance_target: parseFloat(e.target.value)})}
                  className="input-field"
                  placeholder="42.2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">{t('competitions.startDate')}</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">{t('competitions.endDate')}</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {t('competitions.createButton')}
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">
                  {t('competitions.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Competitions;