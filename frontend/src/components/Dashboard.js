
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaRunning, FaTrophy, FaClock, FaCalendarAlt, 
  FaFire, FaMedal, FaArrowRight, FaChartLine, FaHeartbeat,
  FaAward, FaStar, FaRocket, FaStopwatch, FaMapMarkedAlt,
  FaChartBar, FaCalendarCheck, FaBolt, FaEye, FaDownload, 
  FaSpinner, FaShareAlt, FaBrain, FaUsers, FaShoePrints,
  FaDumbbell, FaCreditCard, FaLock, FaWeight
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import PerformanceAnalyzer from './PerformanceAnalyzer';
import TrainingCalendar from './TrainingCalendar';
import StreakTracker from './StreakTracker';
import ActivityHeatmap from './Charts/ActivityHeatmap';
import GoalsManager from './GoalsManager';
import ShareCard from './ShareCard';
import RunMap from './RunMap';
import AITrainingPlan from './AITrainingPlan';
import Ranking from './Ranking';
import InjuryPrevention from './InjuryPrevention';
import Challenges from './Challenges';
import EquipmentRecommendations from './EquipmentRecommendations';
import WorkoutVideos from './WorkoutVideos';
import Plans from './Plans';
import BMICard from './BMICard'; 
import { useSubscription } from '../hooks/useSubscription';
import { Link } from 'react-router-dom';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
const Dashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { hasFeature, subscription, isFree, loading: subLoading } = useSubscription();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ total_distance: 0, total_runs: 0, average_pace: 0 });
  const [recentRuns, setRecentRuns] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [personalRecords, setPersonalRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRunMap, setSelectedRunMap] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  const [shareRun, setShareRun] = useState(null);
  const canExport = hasFeature('export_gpx');
  useEffect(() => {
    fetchDashboardData();
    fetchStreakData();
  }, []);
  const fetchStreakData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/streaks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStreakData(response.data);
    } catch (error) {
      console.error('Error fetching streak data:', error);
    }
  };
  const fetchDashboardData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = response.data.stats || {};
      setStats({
        total_distance: typeof statsData.total_distance === 'number' ? statsData.total_distance : parseFloat(statsData.total_distance) || 0,
        total_runs: typeof statsData.total_runs === 'number' ? statsData.total_runs : parseInt(statsData.total_runs) || 0,
        average_pace: typeof statsData.average_pace === 'number' ? statsData.average_pace : parseFloat(statsData.average_pace) || 0
      });
      setRecentRuns(Array.isArray(response.data.recentRuns) ? response.data.recentRuns : []);
      setAchievements(Array.isArray(response.data.achievements) ? response.data.achievements : []);
      setWeeklyStats(Array.isArray(response.data.weeklyStats) ? response.data.weeklyStats : []);
      const monthlyData = calculateMonthlyStats(response.data.recentRuns || []);
      setMonthlyStats(monthlyData);
      const records = calculatePersonalRecords(response.data.recentRuns || []);
      setPersonalRecords(records);
    } catch (error) {
      console.error('Dashboard error:', error);
      let errorMessage = t('dashboard.errorLoading');
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message === 'Network Error') {
        errorMessage = t('dashboard.connectionError');
      } else if (error.response?.status === 401) {
        errorMessage = t('dashboard.sessionExpired');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const exportToGPX = async (run) => {
    if (!canExport) {
      toast.error('Exportação disponível apenas para assinantes Premium');
      setActiveTab('plans');
      return;
    }
    setExportingId(run.id);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/runs/${run.id}/export-gpx`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const dateStr = run.start_time ? new Date(run.start_time).toISOString().split('T')[0] : 'corrida';
      link.setAttribute('download', `corrida_${run.id}_${dateStr}.gpx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Corrida exportada com sucesso! 🎉');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar corrida. Tente novamente.');
    } finally {
      setExportingId(null);
    }
  };
  const getRunDate = (run) => {
    return run.start_time || run.created_at;
  };
  const calculateMonthlyStats = (runs) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyData = months.map(month => ({ name: month, distance: 0, runs: 0 }));
    runs.forEach(run => {
      const runDate = getRunDate(run);
      if (runDate) {
        const date = new Date(runDate);
        const monthIndex = date.getMonth();
        monthlyData[monthIndex].distance += parseFloat(run.distance) || 0;
        monthlyData[monthIndex].runs += 1;
      }
    });
    return monthlyData;
  };
  const calculatePersonalRecords = (runs) => {
    let maxDistance = 0;
    let minPace = Infinity;
    let maxDuration = 0;
    runs.forEach(run => {
      const distance = parseFloat(run.distance) || 0;
      const pace = parseFloat(run.pace) || Infinity;
      const duration = parseInt(run.duration) || 0;
      if (distance > maxDistance) maxDistance = distance;
      if (pace < minPace && pace > 0) minPace = pace;
      if (duration > maxDuration) maxDuration = duration;
    });
    return {
      maxDistance: maxDistance.toFixed(2),
      bestPace: minPace !== Infinity ? formatPace(minPace) : '0:00',
      maxDuration: formatDuration(maxDuration)
    };
  };
  const formatPace = (pace) => {
    if (!pace || isNaN(pace) || pace === 0) return '0:00';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0min';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };
  const getProgressToNextGoal = () => {
    const goals = [50, 100, 200, 500, 1000];
    const currentDistance = stats.total_distance;
    const nextGoal = goals.find(goal => goal > currentDistance);
    if (!nextGoal) return { current: currentDistance, next: currentDistance, percentage: 100 };
    const percentage = (currentDistance / nextGoal) * 100;
    return { current: currentDistance, next: nextGoal, percentage: Math.min(percentage, 100) };
  };
  const chartData = {
    labels: weeklyStats.map(day => day.day?.substring(0, 3) || ''),
    datasets: [
      {
        label: 'Distância (km)',
        data: weeklyStats.map(day => parseFloat(day.total_distance) || 0),
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointHoverBackgroundColor: 'rgb(37, 99, 235)',
        pointHoverBorderColor: 'white',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };
  const monthlyChartData = {
    labels: monthlyStats.map(month => month.name),
    datasets: [
      {
        label: 'Distância Mensal (km)',
        data: monthlyStats.map(month => month.distance),
        fill: true,
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(139, 92, 246)',
        pointBorderColor: 'white',
        pointRadius: 3,
        pointHoverRadius: 5,
      }
    ]
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Quilômetros',
          color: '#6B7280',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  };
  const progressData = getProgressToNextGoal();
  const tabs = [
    { id: 'overview',     label: 'Visão Geral',  icon: FaChartBar,      free: true },
    { id: 'ranking',      label: 'Ranking',       icon: FaChartLine,     free: true },
    { id: 'goals',        label: 'Metas',          icon: FaTrophy,        free: true },
    { id: 'performance',  label: 'Performance',   icon: FaChartLine,     free: false, feature: 'advanced_stats' },
    { id: 'body',         label: 'Corpo',          icon: FaWeight,        free: false, feature: 'body_bmi' },
    { id: 'calendar',     label: 'Calendário',    icon: FaCalendarCheck, free: false, feature: 'calendar_tab' },
    { id: 'streaks',      label: 'Sequências',    icon: FaBolt,          free: false, feature: 'streaks_tab' },
    { id: 'equipment',    label: 'Loja',           icon: FaShoePrints,    free: false, feature: 'equipment' },
    { id: 'workouts',     label: 'Treinos',        icon: FaDumbbell,      free: false, feature: 'workout_videos' },
    { id: 'heatmap',      label: 'Heatmap',        icon: FaFire,          free: false, feature: 'heatmap' },
    { id: 'ai-plan',      label: 'IA Coach',       icon: FaBrain,         free: false, feature: 'ai_coach' },
    { id: 'injury',       label: 'Saúde',          icon: FaHeartbeat,     free: false, feature: 'injury_prevention' },
    { id: 'challenges',   label: 'Desafios',       icon: FaUsers,         free: false, feature: 'challenges' },
    { id: 'plans',        label: 'Planos',         icon: FaCreditCard,    free: true }
  ];
  const visibleTabs = tabs; 
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
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 text-center max-w-md animate-scaleIn">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('dashboard.errorLoading')}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="container-custom py-8 animate-fadeInUp">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {t('dashboard.welcome')}, {user?.name || t('dashboard.runner')}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">{t('dashboard.trackProgress')}</p>
        <div className="flex gap-3 mt-4">
          {streakData?.currentStreak > 0 && (
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 px-4 py-2 rounded-xl text-sm font-medium">
              <FaFire />
              <span>{streakData.currentStreak} dias seguidos!</span>
            </div>
          )}
          {isFree && (
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-4 py-2 rounded-xl text-sm font-medium">
              <FaStar />
              <span>Plano Grátis - <button onClick={() => setActiveTab('plans')} className="underline">Faça Upgrade</button></span>
            </div>
          )}
        </div>
      </div>
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
        {visibleTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-200 whitespace-nowrap ${
                isActive 
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
              }`}
            >
              <Icon className={isActive ? '' : 'text-gray-400'} />
              <span>{tab.label}</span>
              {!tab.free && hasFeature(tab.feature) && (
                <FaStar className="text-yellow-400 text-xs ml-1" />
              )}
              {!tab.free && !hasFeature(tab.feature) && (
                <FaLock className="text-gray-400 text-xs ml-1" />
              )}
            </button>
          );
        })}
      </div>
      {activeTab === 'overview' && (
        <>
          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="stat-card group animate-fadeInLeft">
              <div className="flex items-center justify-between mb-4">
                <div className="stat-icon">
                  <FaRunning className="text-2xl" />
                </div>
                <FaFire className="text-orange-400 text-2xl opacity-75" />
              </div>
              <div className="stat-value">{stats.total_distance.toFixed(2)}</div>
              <div className="stat-label">{t('dashboard.totalDistance')}</div>
            </div>
            <div className="stat-card group animate-fadeInUp">
              <div className="flex items-center justify-between mb-4">
                <div className="stat-icon">
                  <FaClock className="text-2xl" />
                </div>
                <FaHeartbeat className="text-red-400 text-2xl opacity-75" />
              </div>
              <div className="stat-value">{formatPace(stats.average_pace)}</div>
              <div className="stat-label">{t('dashboard.averagePace')}</div>
            </div>
            <div className="stat-card group animate-fadeInRight">
              <div className="flex items-center justify-between mb-4">
                <div className="stat-icon">
                  <FaTrophy className="text-2xl" />
                </div>
                <FaMedal className="text-yellow-400 text-2xl opacity-75" />
              </div>
              <div className="stat-value">{stats.total_runs}</div>
              <div className="stat-label">{t('dashboard.totalRuns')}</div>
            </div>
          </div>
          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fadeInUp">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={() => setActiveTab('performance')}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl"><FaTrophy /></div>
                <p className="text-sm font-medium text-gray-500">Melhor Distância</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{personalRecords.maxDistance} km</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={() => setActiveTab('performance')}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 text-green-600 rounded-xl"><FaStopwatch /></div>
                <p className="text-sm font-medium text-gray-500">Melhor Pace</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{personalRecords.bestPace} /km</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={() => setActiveTab('performance')}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><FaRocket /></div>
                <p className="text-sm font-medium text-gray-500">Maior Tempo</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{personalRecords.maxDuration}</p>
            </div>
          </div>
          {}
          <div className="card mb-8 animate-fadeInUp">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Progresso para Próxima Meta</h3>
                <p className="text-sm text-gray-500">{progressData.current.toFixed(1)} km de {progressData.next} km</p>
              </div>
              <FaStar className="text-yellow-500 text-2xl" />
            </div>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill"
                style={{ width: `${progressData.percentage}%` }}
              >
                <span className="absolute right-2 text-white text-xs font-bold">
                  {progressData.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
          {}
          {weeklyStats.length > 0 && weeklyStats.some(day => day.total_distance > 0) && (
            <div className="card mb-8 animate-fadeInUp">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{t('dashboard.weeklyActivity')}</h3>
                  <p className="text-sm text-gray-500">Últimos 7 dias</p>
                </div>
                <FaChartLine className="text-blue-500 text-2xl" />
              </div>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}
          {}
          {monthlyStats.some(m => m.distance > 0) && (
            <div className="card mb-8 animate-fadeInUp">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Atividade Mensal</h3>
                  <p className="text-sm text-gray-500">Distância por mês</p>
                </div>
                <FaMapMarkedAlt className="text-purple-500 text-2xl" />
              </div>
              <div className="h-64">
                <Line data={monthlyChartData} options={chartOptions} />
              </div>
            </div>
          )}
          {}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card animate-fadeInLeft">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" /> {t('dashboard.recentRuns')}
              </h3>
              {recentRuns.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-2">🏃</div>
                  <p className="text-gray-500">{t('dashboard.noRuns')}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentRuns.map((run, index) => (
                    <div key={index} className="group bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">
                              {run.title || `${t('history.run')} ${index + 1}`}
                            </p>
                            {run.has_route && (
                              <button onClick={() => setSelectedRunMap(run)} className="text-blue-500 text-xs hover:underline flex items-center gap-1">
                                <FaEye className="text-xs" /> Ver percurso
                              </button>
                            )}
                            {canExport ? (
                              <button onClick={() => exportToGPX(run)} disabled={exportingId === run.id} className="text-green-500 text-xs hover:underline flex items-center gap-1 disabled:opacity-50" title="Exportar GPX">
                                {exportingId === run.id ? <FaSpinner className="animate-spin text-xs" /> : <FaDownload className="text-xs" />}
                                GPX
                              </button>
                            ) : (
                              <div className="relative group inline-flex">
                                <button className="text-gray-400 text-xs flex items-center gap-1 cursor-not-allowed" title="Disponível no Premium">
                                  <FaLock className="text-xs" /> GPX
                                </button>
                              </div>
                            )}
                            <button onClick={() => setShareRun(run)} className="text-purple-500 text-xs hover:underline flex items-center gap-1" title="Compartilhar">
                              <FaShareAlt className="text-xs" /> Compartilhar
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">🏃 {parseFloat(run.distance).toFixed(2)}km</span>
                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">⏱️ {formatDuration(run.duration)}</span>
                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">📊 {formatPace(parseFloat(run.pace))}/km</span>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                          {run.start_time ? new Date(run.start_time).toLocaleDateString('pt-BR') : 'Data não disponível'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card animate-fadeInRight">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaMedal className="text-yellow-500" /> {t('dashboard.achievements')}
              </h3>
              {achievements.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-2">🏆</div>
                  <p className="text-gray-500">{t('dashboard.noAchievements')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {achievements.map((achievement, index) => (
                    <div key={index} className={`text-center p-4 rounded-2xl transition-all duration-200 border ${achievement.earned_at ? 'bg-white border-yellow-200 dark:bg-gray-800 dark:border-yellow-600/30' : 'bg-gray-50 border-gray-100 opacity-60 dark:bg-gray-800 dark:border-gray-700'}`}>
                      <div className="text-3xl mb-2">{achievement.icon || '🏅'}</div>
                      <p className="font-semibold text-sm text-gray-800 dark:text-white">{achievement.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                      {achievement.earned_at && (
                        <div className="mt-2 inline-flex items-center gap-1 text-xs text-green-600 font-semibold">✓ {t('dashboard.unlocked')}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 animate-fadeInUp">
            <button onClick={() => window.location.href = '/run'} className="btn-primary flex items-center justify-center gap-2 group transition-all duration-300">
              <FaRunning className="group-hover:animate-pulse" /> {t('dashboard.startNewRun')}
              <FaArrowRight className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
            </button>
            <button onClick={() => window.location.href = '/competitions'} className="btn-success flex items-center justify-center gap-2 group transition-all duration-300">
              <FaTrophy /> {t('dashboard.joinCompetition')}
              <FaArrowRight className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
            </button>
            <button onClick={() => setActiveTab('calendar')} className="btn-outline flex items-center justify-center gap-2 group transition-all duration-300">
              <FaCalendarCheck /> Plano de Treino
              <FaArrowRight className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
            </button>
          </div>
          {}
          {stats.total_runs > 0 && (
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-6 animate-fadeInUp border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <FaAward className="text-blue-500" />
                    🎉 {t('dashboard.youHaveCompleted')} <strong className="text-2xl mx-1">{stats.total_runs}</strong> {t('dashboard.runs')}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">{t('dashboard.runsAndCovered')} <strong>{stats.total_distance.toFixed(2)}km</strong>!</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {}
      {activeTab === 'body' && (
        <div className="space-y-6 animate-fadeInUp">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FaWeight className="text-blue-500" />
              Composição Corporal
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Acompanhe seu IMC e receba recomendações personalizadas
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BMICard />
            <div className="card">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                🏥 Saúde e Performance
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">📊 Por que o IMC é importante?</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    O IMC (Índice de Massa Corporal) ajuda a identificar se seu peso está adequado para sua altura.
                    Para corredores, manter o IMC na faixa ideal (18.5 - 24.9) melhora a performance e reduz o risco de lesões.
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">🏃 Impacto na Corrida</h4>
                  <ul className="text-sm text-green-700 dark:text-green-200 space-y-2">
                    <li>• Cada kg a menos reduz ~4% do impacto nas articulações</li>
                    <li>• IMC ideal melhora a economia de corrida em até 2%</li>
                    <li>• Peso adequado diminui risco de lesões nos joelhos e tornozelos</li>
                    <li>• Corredores com IMC normal têm melhor recuperação pós-treino</li>
                  </ul>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">⚠️ Recomendações por Faixa</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">18.5:</span>
                      <span className="text-gray-700 dark:text-gray-300">Abaixo do peso - Foco em ganho de massa muscular</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 font-bold">18.5-24.9:</span>
                      <span className="text-gray-700 dark:text-gray-300">Peso normal - Faixa ideal para corrida</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-500 font-bold">25-29.9:</span>
                      <span className="text-gray-700 dark:text-gray-300">Sobrepeso - Priorize amortecimento nos tênis</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">30+:</span>
                      <span className="text-gray-700 dark:text-gray-300">Obesidade - Comece com caminhadas e evolua gradualmente</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {}
      {activeTab === 'performance' && (
        hasFeature('advanced_stats') ? <PerformanceAnalyzer /> : (
          <div className="card text-center py-12 animate-fadeInUp">
            <FaChartLine className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Análise de Performance</h3>
            <p className="text-gray-600 mb-4">Veja tendências, compare períodos e acompanhe sua evolução com gráficos avançados</p>
            <p className="text-sm text-purple-600 mb-4">Disponível a partir do plano Premium</p>
            <button onClick={() => setActiveTab('plans')} className="btn-primary inline-flex items-center gap-2">
              <FaStar /> Fazer Upgrade
            </button>
          </div>
        )
      )}
      {}
      {activeTab === 'body' && (
        hasFeature('body_bmi') ? (
          <div className="space-y-6 animate-fadeInUp">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FaWeight className="text-blue-500" />
                Composição Corporal
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Acompanhe seu IMC e receba recomendações personalizadas</p>
            </div>
            {}
          </div>
        ) : (
          <div className="card text-center py-12 animate-fadeInUp">
            <FaWeight className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Composição Corporal</h3>
            <p className="text-gray-600 mb-4">Acompanhe peso, altura, IMC e receba recomendações de treino baseadas no seu corpo</p>
            <p className="text-sm text-blue-600 font-semibold mb-4">📊 Disponível no plano Premium</p>
            <button onClick={() => setActiveTab('plans')} className="btn-primary inline-flex items-center gap-2">
              <FaStar /> Fazer Upgrade para Premium
            </button>
          </div>
        )
      )}
      {}
      {activeTab === 'calendar' && (
        hasFeature('calendar_tab') ? <TrainingCalendar /> : (
          <div className="card text-center py-12 animate-fadeInUp">
            <FaCalendarCheck className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Calendário de Treino</h3>
            <p className="text-gray-600 mb-4">Planeje seus treinos e visualize sua agenda semanal e mensal</p>
            <p className="text-sm text-blue-600 font-semibold mb-4">📅 Disponível no plano Premium</p>
            <button onClick={() => setActiveTab('plans')} className="btn-primary inline-flex items-center gap-2">
              <FaStar /> Fazer Upgrade para Premium
            </button>
          </div>
        )
      )}
      {}
      {activeTab === 'streaks' && (
        hasFeature('streaks_tab') ? <StreakTracker /> : (
          <div className="card text-center py-12 animate-fadeInUp">
            <FaBolt className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Sequências de Treino</h3>
            <p className="text-gray-600 mb-4">Veja quantos dias seguidos você treinou e bata seus recordes de consistência</p>
            <p className="text-sm text-blue-600 font-semibold mb-4">⚡ Disponível no plano Premium</p>
            <button onClick={() => setActiveTab('plans')} className="btn-primary inline-flex items-center gap-2">
              <FaStar /> Fazer Upgrade para Premium
            </button>
          </div>
        )
      )}
      {}
      {activeTab === 'heatmap' && (
        hasFeature('heatmap') ? <ActivityHeatmap /> : (
          <div className="card text-center py-12 animate-fadeInUp">
            <FaFire className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Heatmap de Atividade</h3>
            <p className="text-gray-600 mb-4">Visualize seus padrões de treino ao longo do ano em um mapa de calor</p>
            <p className="text-sm text-orange-600 font-semibold mb-4">🔥 Disponível no plano Elite</p>
            <button onClick={() => setActiveTab('plans')} className="btn-success inline-flex items-center gap-2">
              <FaStar /> Fazer Upgrade para Elite
            </button>
          </div>
        )
      )}
      {}
      {activeTab === 'ai-plan' && (
        hasFeature('ai_coach') ? <AITrainingPlan /> : (
          <div className="card text-center py-12 animate-fadeInUp">
            <FaBrain className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">IA Coach</h3>
            <p className="text-gray-600 mb-4">Planos de treino personalizados com inteligência artificial</p>
            <p className="text-sm text-orange-600 font-semibold mb-4">🤖 Disponível no plano Elite</p>
            <button onClick={() => setActiveTab('plans')} className="btn-success inline-flex items-center gap-2">
              <FaStar /> Fazer Upgrade para Elite
            </button>
          </div>
        )
      )}
      {}
      {activeTab === 'injury' && (
        hasFeature('injury_prevention') ? <InjuryPrevention /> : (
          <div className="card text-center py-12 animate-fadeInUp">
            <FaHeartbeat className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Prevenção de Lesões</h3>
            <p className="text-gray-600 mb-4">Análise avançada de risco e alertas personalizados de saúde</p>
            <p className="text-sm text-orange-600 font-semibold mb-4">🩺 Disponível no plano Elite</p>
            <button onClick={() => setActiveTab('plans')} className="btn-success inline-flex items-center gap-2">
              <FaStar /> Fazer Upgrade para Elite
            </button>
          </div>
        )
      )}
      {}
      {activeTab === 'challenges' && (
        hasFeature('challenges') ? <Challenges /> : (
          <div className="card text-center py-12 animate-fadeInUp">
            <FaUsers className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Desafios entre Amigos</h3>
            <p className="text-gray-600 mb-4">Crie desafios e compita com amigos em distância, ritmo e consistência</p>
            <p className="text-sm text-orange-600 font-semibold mb-4">⚔️ Disponível no plano Elite</p>
            <button onClick={() => setActiveTab('plans')} className="btn-success inline-flex items-center gap-2">
              <FaStar /> Fazer Upgrade para Elite
            </button>
          </div>
        )
      )}
      {}
      {activeTab === 'equipment' && (
        hasFeature('equipment') ? <EquipmentRecommendations /> : (
          <div className="card text-center py-12 animate-fadeInUp">
            <FaShoePrints className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Loja & Equipamentos</h3>
            <p className="text-gray-600 mb-4">Recomendações personalizadas de tênis, relógios e acessórios para sua corrida</p>
            <p className="text-sm text-blue-600 font-semibold mb-4">🛒 Disponível no plano Premium</p>
            <button onClick={() => setActiveTab('plans')} className="btn-primary inline-flex items-center gap-2">
              <FaStar /> Fazer Upgrade para Premium
            </button>
          </div>
        )
      )}
      {}
      {activeTab === 'workouts' && (
        hasFeature('workout_videos') ? <WorkoutVideos /> : (
          <div className="card text-center py-12 animate-fadeInUp">
            <FaDumbbell className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Vídeos de Treino</h3>
            <p className="text-gray-600 mb-4">Biblioteca completa de vídeos de aquecimento, força e alongamento para corredores</p>
            <p className="text-sm text-blue-600 font-semibold mb-4">🎬 Disponível no plano Premium</p>
            <button onClick={() => setActiveTab('plans')} className="btn-primary inline-flex items-center gap-2">
              <FaStar /> Fazer Upgrade para Premium
            </button>
          </div>
        )
      )}
      {activeTab === 'ranking' && <Ranking />}
      {activeTab === 'goals' && <GoalsManager />}
      {activeTab === 'plans' && <Plans user={user} />}
      {selectedRunMap && (
        <RunMap runId={selectedRunMap.id} onClose={() => setSelectedRunMap(null)} />
      )}
      {shareRun && (
        <ShareCard run={shareRun} onClose={() => setShareRun(null)} />
      )}
    </div>
  );
};
export default Dashboard;