
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaClock, FaRoad, FaTachometerAlt, FaSearch, FaFilter, FaDownload, FaSpinner, FaShareAlt, FaStar, FaLock } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import ShareCard from './ShareCard';
import { useSubscription } from '../hooks/useSubscription';
import { Link } from 'react-router-dom';
const History = () => {
  const { t } = useLanguage();
  const { hasFeature, subscription, loading: subLoading } = useSubscription();
  const [runs, setRuns] = useState([]);
  const [filteredRuns, setFilteredRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [exportingId, setExportingId] = useState(null);
  const [shareRun, setShareRun] = useState(null);
  const canExport = hasFeature('export_gpx');
  const isFree = !subscription || subscription.name === 'Grátis';
  const exportLimit = 5;
  const [exportCount, setExportCount] = useState(0);
  const filterRuns = useCallback(() => {
    let filtered = [...runs];
    if (searchTerm) {
      filtered = filtered.filter(run => 
        run.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    const now = new Date();
    let cutoffDate = null;
    switch(filterPeriod) {
      case 'week':
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        filtered = filtered.filter(run => new Date(run.start_time) >= cutoffDate);
        break;
      case 'month':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        filtered = filtered.filter(run => new Date(run.start_time) >= cutoffDate);
        break;
      case 'year':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        filtered = filtered.filter(run => new Date(run.start_time) >= cutoffDate);
        break;
      default:
        break;
    }
    setFilteredRuns(filtered);
  }, [runs, searchTerm, filterPeriod]);
  const fetchRunHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/runs/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRuns(response.data);
      setFilteredRuns(response.data);
      const savedCount = localStorage.getItem('exportCount');
      const lastMonth = localStorage.getItem('exportMonth');
      const currentMonth = new Date().getMonth();
      if (lastMonth !== currentMonth.toString()) {
        setExportCount(0);
        localStorage.setItem('exportCount', '0');
        localStorage.setItem('exportMonth', currentMonth.toString());
      } else {
        setExportCount(parseInt(savedCount) || 0);
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);
  const exportToGPX = async (run) => {
    if (!canExport && exportCount >= exportLimit) {
      toast.error(`Você atingiu o limite de ${exportLimit} exportações neste mês. Faça upgrade para exportar mais.`);
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
      const newCount = exportCount + 1;
      setExportCount(newCount);
      localStorage.setItem('exportCount', newCount.toString());
      toast.success('Corrida exportada com sucesso! 🎉');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar corrida. Tente novamente.');
    } finally {
      setExportingId(null);
    }
  };
  useEffect(() => {
    fetchRunHistory();
  }, [fetchRunHistory]);
  useEffect(() => {
    filterRuns();
  }, [filterRuns]);
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };
  const formatPace = (pace) => {
    if (!pace) return '0:00';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const getTotalStats = () => {
    const totalDistance = filteredRuns.reduce((sum, run) => sum + (parseFloat(run.distance) || 0), 0);
    const totalDuration = filteredRuns.reduce((sum, run) => sum + (parseInt(run.duration) || 0), 0);
    const averagePace = totalDistance > 0 ? (totalDuration / 60) / totalDistance : 0;
    return {
      totalDistance: totalDistance.toFixed(2),
      totalDuration: formatDuration(totalDuration),
      averagePace: formatPace(averagePace),
      totalRuns: filteredRuns.length
    };
  };
  const stats = getTotalStats();
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('history.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Visualize todo o seu histórico de corridas</p>
      </div>
      {isFree && (
        <div className="mb-6 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl text-center border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-center gap-2">
            <FaStar className="text-yellow-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Exporte suas corridas para GPX e compartilhe com outros aplicativos!
            </span>
            <Link to="/plans" className="text-purple-600 font-semibold text-sm hover:underline">Saiba mais</Link>
          </div>
        </div>
      )}
      {isFree && exportCount >= exportLimit && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-400 flex items-center justify-center gap-2">
            <FaLock className="text-sm" />
            Você atingiu o limite de {exportLimit} exportações neste mês.
            <Link to="/plans" className="underline font-semibold">Faça upgrade para exportação ilimitada!</Link>
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card text-center">
          <div className="stat-icon inline-flex mb-3">
            <FaRoad className="text-xl" />
          </div>
          <div className="stat-value">{stats.totalRuns}</div>
          <div className="stat-label">{t('history.totalRuns')}</div>
        </div>
        <div className="stat-card text-center">
          <div className="stat-icon inline-flex mb-3">
            <FaTachometerAlt className="text-xl" />
          </div>
          <div className="stat-value">{stats.totalDistance}</div>
          <div className="stat-label">{t('history.totalDistance')}</div>
        </div>
        <div className="stat-card text-center">
          <div className="stat-icon inline-flex mb-3">
            <FaClock className="text-xl" />
          </div>
          <div className="stat-value text-lg">{stats.totalDuration}</div>
          <div className="stat-label">{t('history.totalTime')}</div>
        </div>
        <div className="stat-card text-center">
          <div className="stat-icon inline-flex mb-3">
            <FaTachometerAlt className="text-xl" />
          </div>
          <div className="stat-value">{stats.averagePace}</div>
          <div className="stat-label">{t('history.avgPace')}</div>
        </div>
      </div>
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('history.searchRuns')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="input-field pl-10 md:w-48"
            >
              <option value="all">{t('history.allTime')}</option>
              <option value="week">{t('history.last7Days')}</option>
              <option value="month">{t('history.last30Days')}</option>
              <option value="year">{t('history.lastYear')}</option>
            </select>
          </div>
        </div>
      </div>
      {filteredRuns.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🏃‍♂️</div>
          <p className="text-gray-500">{t('history.noRunsFound')}</p>
          {runs.length > 0 && <p className="text-gray-400 text-sm mt-2">{t('history.tryAdjustFilters')}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRuns.map((run, index) => (
            <div key={index} className="card hover:shadow-2xl transition-all duration-300 group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">
                        {run.title || `${t('history.run')} ${index + 1}`}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <FaCalendarAlt className="text-xs" />
                        {formatDate(run.start_time)}
                      </p>
                    </div>
                    <div className="badge badge-info">
                      {parseFloat(run.distance).toFixed(1)}km
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('history.distance')}</p>
                      <p className="font-semibold text-gray-800 dark:text-white">{parseFloat(run.distance).toFixed(2)} km</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('history.duration')}</p>
                      <p className="font-semibold text-gray-800 dark:text-white">{formatDuration(run.duration)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('history.pace')}</p>
                      <p className="font-semibold text-gray-800 dark:text-white">{formatPace(parseFloat(run.pace))}/km</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShareRun(run)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-300"
                    title="Compartilhar corrida"
                  >
                    <FaShareAlt />
                    <span className="text-sm hidden sm:inline">Compartilhar</span>
                  </button>
                  {canExport ? (
                    <button
                      onClick={() => exportToGPX(run)}
                      disabled={exportingId === run.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-300 disabled:opacity-50"
                      title="Exportar para GPX (Strava, Garmin, etc)"
                    >
                      {exportingId === run.id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaDownload />
                      )}
                      <span className="text-sm hidden sm:inline">GPX</span>
                    </button>
                  ) : (
                    <div className="relative group">
                      <button
                        disabled
                        className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50"
                        title="Disponível no Premium"
                      >
                        <FaLock />
                        <span className="text-sm hidden sm:inline">GPX</span>
                      </button>
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Exportação disponível no Premium
                        <Link to="/plans" className="text-purple-400 block mt-1">Fazer Upgrade →</Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {filteredRuns.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <FaShareAlt className="text-sm" />
            💡 Dica: Compartilhe suas conquistas nas redes sociais ou exporte suas corridas para GPX e importe no Strava, Garmin Connect!
          </p>
        </div>
      )}
      {shareRun && (
        <ShareCard run={shareRun} onClose={() => setShareRun(null)} />
      )}
    </div>
  );
};
export default History;