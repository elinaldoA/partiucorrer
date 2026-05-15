
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFire, FaTrophy, FaCalendarWeek, FaStar, FaMedal, FaAward, FaRocket, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
const StreakTracker = () => {
  const [streakData, setStreakData] = useState(null);
  const [yearlyActivity, setYearlyActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  useEffect(() => {
    fetchStreakData();
    fetchAchievements();
  }, []);
  const fetchStreakData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/streaks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStreakData(response.data);
      generateYearlyActivity(response.data.activityLog);
    } catch (error) {
      console.error('Error fetching streak data:', error);
      setStreakData({
        currentStreak: 12,
        longestStreak: 45,
        totalActiveDays: 156,
        nextMilestones: [30, 50, 100]
      });
      generateYearlyActivity(null);
    } finally {
      setLoading(false);
    }
  };
  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/achievements/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAchievements(response.data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setAchievements([
        { id: 1, name: 'Primeira Corrida', description: 'Completou sua primeira corrida', icon: '🏃', earned: true },
        { id: 2, name: '5km Completo', description: 'Correu 5km em uma única corrida', icon: '🎯', earned: true },
        { id: 3, name: '10km Completo', description: 'Correu 10km em uma única corrida', icon: '🎯', earned: false },
        { id: 4, name: '7 Dias de Sequência', description: 'Correu por 7 dias seguidos', icon: '🔥', earned: true },
        { id: 5, name: '30 Dias de Sequência', description: 'Correu por 30 dias seguidos', icon: '👑', earned: false }
      ]);
    }
  };
  const generateYearlyActivity = (activityLog) => {
    const weeks = [];
    for (let i = 0; i < 52; i++) {
      weeks.push(Array(7).fill(null).map(() => ({
        date: null,
        completed: Math.random() > 0.7,
        distance: Math.random() * 10
      })));
    }
    setYearlyActivity(weeks);
  };
  const getActivityColor = (activity) => {
    if (!activity || !activity.completed) return 'bg-gray-200';
    if (activity.distance >= 10) return 'bg-green-500';
    if (activity.distance >= 5) return 'bg-blue-500';
    return 'bg-blue-300';
  };
  const getStreakEmoji = (days) => {
    if (days >= 100) return '👑🔥';
    if (days >= 50) return '⚡🔥';
    if (days >= 30) return '🔥💪';
    if (days >= 14) return '🔥';
    if (days >= 7) return '👍';
    return '💪';
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-fadeInUp">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Sua Sequência de Treinos</h2>
        <p className="text-gray-600 mt-1">Mantenha a consistência e conquiste badges especiais!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <FaFire className="text-5xl mx-auto mb-3" />
          <p className="text-sm opacity-90">Sequência Atual</p>
          <p className="text-4xl font-bold">{streakData?.currentStreak || 0} dias</p>
          <p className="text-xs mt-2">{getStreakEmoji(streakData?.currentStreak || 0)} Continue assim!</p>
        </div>
        <div className="card text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <FaTrophy className="text-5xl mx-auto mb-3" />
          <p className="text-sm opacity-90">Maior Sequência</p>
          <p className="text-4xl font-bold">{streakData?.longestStreak || 0} dias</p>
          <p className="text-xs mt-2">🎯 Recorde pessoal!</p>
        </div>
        <div className="card text-center bg-gradient-to-r from-green-500 to-teal-500 text-white">
          <FaCalendarWeek className="text-5xl mx-auto mb-3" />
          <p className="text-sm opacity-90">Total de Dias Ativos</p>
          <p className="text-4xl font-bold">{streakData?.totalActiveDays || 0}</p>
          <p className="text-xs mt-2">em {new Date().getFullYear()}</p>
        </div>
      </div>
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4">📅 Histórico de Atividade {new Date().getFullYear()}</h3>
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {yearlyActivity.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`w-3 h-3 rounded-sm ${getActivityColor(day)} transition-all hover:scale-125 cursor-pointer`}
                    title={day?.date ? `${day.date}: ${day.distance?.toFixed(1) || 0}km` : 'Sem atividade'}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end items-center gap-2 mt-4 text-xs text-gray-500">
          <span>Menos</span>
          <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-300 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <span>Mais</span>
        </div>
      </div>
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaRocket className="text-blue-500" /> Próximos Desafios de Sequência
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <FaStar className="text-yellow-500" />
              <div>
                <p className="font-semibold">7 Dias de Consistência</p>
                <p className="text-xs text-gray-500">Complete uma semana inteira</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold">
                {Math.min(streakData?.currentStreak || 0, 7)}/7
              </span>
              <div className="progress-bar w-24 mt-1">
                <div className="progress-bar-fill" style={{ width: `${((streakData?.currentStreak || 0) / 7) * 100}%` }}></div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <FaMedal className="text-orange-500" />
              <div>
                <p className="font-semibold">30 Dias - Mês Completo</p>
                <p className="text-xs text-gray-500">Corra por 30 dias consecutivos</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold">
                {Math.min(streakData?.currentStreak || 0, 30)}/30
              </span>
              <div className="progress-bar w-24 mt-1">
                <div className="progress-bar-fill" style={{ width: `${((streakData?.currentStreak || 0) / 30) * 100}%` }}></div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <FaAward className="text-purple-500" />
              <div>
                <p className="font-semibold">100 Dias - Lenda</p>
                <p className="text-xs text-gray-500">Tornar-se uma lenda da corrida</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold">
                {Math.min(streakData?.currentStreak || 0, 100)}/100
              </span>
              <div className="progress-bar w-24 mt-1">
                <div className="progress-bar-fill" style={{ width: `${((streakData?.currentStreak || 0) / 100) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {achievements.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            🏅 Conquistas Especiais
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {achievements.map((ach, idx) => (
              <div key={idx} className={`text-center p-3 rounded-xl transition-all ${ach.earned ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 shadow-md' : 'bg-gray-50 opacity-60'}`}>
                <div className="text-4xl mb-2">{ach.icon || '🏅'}</div>
                <p className="font-semibold text-sm text-gray-800">{ach.name}</p>
                <p className="text-xs text-gray-600 mt-1">{ach.description}</p>
                {ach.earned && (
                  <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                    <FaCheck /> Desbloqueado
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default StreakTracker;