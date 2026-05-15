
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaTrophy, FaMedal, FaRunning, FaCalendarWeek, 
  FaCalendarAlt, FaChartLine, FaUserGraduate,
  FaCrown, FaMedal as FaMedalIcon
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
const Ranking = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [rankingData, setRankingData] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [activeTab, setActiveTab] = useState('distance');
  const [period, setPeriod] = useState('all_time');
  useEffect(() => {
    fetchRanking();
    fetchGlobalStats();
  }, [period]);
  const fetchRanking = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/ranking/global?period=${period}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRankingData(response.data);
    } catch (error) {
      console.error('Error fetching ranking:', error);
      toast.error('Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };
  const fetchGlobalStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/ranking/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGlobalStats(response.data);
    } catch (error) {
      console.error('Error fetching global stats:', error);
    }
  };
  const getRankIcon = (position) => {
    if (position === 1) return <FaCrown className="text-yellow-500 text-xl" />;
    if (position === 2) return <FaMedal className="text-gray-400 text-xl" />;
    if (position === 3) return <FaMedal className="text-amber-600 text-xl" />;
    return <span className="text-gray-500 font-bold w-8 text-center">{position}</span>;
  };
  const getRankClass = (position) => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500';
    if (position === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400';
    if (position === 3) return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600';
    return '';
  };
  const formatPace = (pace) => {
    if (!pace || pace === 0) return '0:00';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  const renderDistanceRanking = () => (
    <div className="space-y-3">
      {rankingData?.distance_ranking?.map((user, idx) => (
        <div 
          key={user.id} 
          className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${getRankClass(user.rank)} ${user.id === rankingData.user_stats?.user_id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 text-center">
              {getRankIcon(user.rank)}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {user.name}
                  {user.id === rankingData.user_stats?.user_id && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(Você)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.total_runs} corridas
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {user.total_distance.toFixed(1)} km
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ritmo: {formatPace(user.average_pace)}/km
            </p>
          </div>
        </div>
      ))}
    </div>
  );
  const renderRunsRanking = () => (
    <div className="space-y-3">
      {rankingData?.runs_ranking?.map((user, idx) => (
        <div 
          key={user.id} 
          className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${getRankClass(user.rank)} ${user.id === rankingData.user_stats?.user_id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 text-center">
              {getRankIcon(user.rank)}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {user.name}
                  {user.id === rankingData.user_stats?.user_id && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(Você)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.total_distance.toFixed(1)} km
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {user.total_runs}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              corridas
            </p>
          </div>
        </div>
      ))}
    </div>
  );
  const renderPaceRanking = () => (
    <div className="space-y-3">
      {rankingData?.pace_ranking?.map((user, idx) => (
        <div 
          key={user.id} 
          className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${getRankClass(user.rank)} ${user.id === rankingData.user_stats?.user_id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 text-center">
              {getRankIcon(user.rank)}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {user.name}
                  {user.id === rankingData.user_stats?.user_id && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(Você)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.total_runs} corridas
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatPace(user.average_pace)}/km
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ritmo médio
            </p>
          </div>
        </div>
      ))}
    </div>
  );
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-fadeInUp">
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Ranking Global
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Compare seu desempenho com outros corredores
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              period === 'weekly'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            <FaCalendarWeek />
            Semana
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              period === 'monthly'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            <FaCalendarAlt />
            Mês
          </button>
          <button
            onClick={() => setPeriod('all_time')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              period === 'all_time'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            <FaChartLine />
            Geral
          </button>
        </div>
      </div>
      {}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-3xl mb-2">🏃</div>
          <p className="text-2xl font-bold">{globalStats?.total_runners || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Corredores</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">📏</div>
          <p className="text-2xl font-bold">{globalStats?.total_global_distance || 0} km</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Distância Total</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-2xl font-bold">{globalStats?.total_runs_global || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Corridas</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">⚡</div>
          <p className="text-2xl font-bold">{formatPace(globalStats?.global_avg_pace)}/km</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ritmo Médio</p>
        </div>
      </div>
      {}
      {rankingData?.user_stats && (
        <div className="card bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-sm opacity-90">Sua Posição</p>
              <p className="text-3xl font-bold">#{rankingData.user_stats.user_rank}</p>
              <p className="text-sm mt-1">de {rankingData.user_stats.total_athletes} corredores</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Seu desempenho</p>
              <p className="text-xl font-bold">{rankingData.user_stats.total_distance.toFixed(1)} km</p>
              <p className="text-sm">{rankingData.user_stats.total_runs} corridas</p>
            </div>
          </div>
          <div className="mt-3 progress-bar bg-white/20">
            <div 
              className="progress-bar-fill bg-white"
              style={{ width: `${(rankingData.user_stats.user_rank / rankingData.user_stats.total_athletes) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      {}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('distance')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'distance'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          🏆 Mais Distância
        </button>
        <button
          onClick={() => setActiveTab('runs')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'runs'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          🎯 Mais Corridas
        </button>
        <button
          onClick={() => setActiveTab('pace')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'pace'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          ⚡ Melhor Ritmo
        </button>
      </div>
      {}
      <div className="card">
        <h3 className="font-bold text-gray-800 dark:text-white mb-4">
          {activeTab === 'distance' && '🏆 Top Corredores por Distância'}
          {activeTab === 'runs' && '🎯 Top Corredores por Número de Corridas'}
          {activeTab === 'pace' && '⚡ Top Corredores por Melhor Ritmo'}
        </h3>
        {activeTab === 'distance' && renderDistanceRanking()}
        {activeTab === 'runs' && renderRunsRanking()}
        {activeTab === 'pace' && renderPaceRanking()}
        {activeTab === 'distance' && rankingData?.distance_ranking?.length === 0 && (
          <div className="text-center py-8 text-gray-500">Nenhum dado disponível</div>
        )}
      </div>
    </div>
  );
};
export default Ranking;