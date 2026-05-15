
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaPlay, FaPause, FaStop, FaTrophy, FaSave, FaTrash, FaMapMarkerAlt, FaHeartbeat, FaWifi, FaSignal, FaMicrophone, FaLock, FaStar } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { saveRunOffline, isOffline, syncPendingOperations } from '../services/offlineService';
import audioCoach from '../services/audioCoachService';
import AudioCoachSettings from './AudioCoachSettings';
import { useSubscription } from '../hooks/useSubscription';
import { Link } from 'react-router-dom';
const RunTracker = () => {
  const { t } = useLanguage();
  const { hasFeature, subscription, loading: subLoading } = useSubscription();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [title, setTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [personalRecords, setPersonalRecords] = useState({ maxDistance: 0 });
  const intervalRef = useRef(null);
  const lastPositionRef = useRef(null);
  const hasAudioCoach = hasFeature('audio_coach');
  const isFree = !subscription || subscription.name === 'Grátis';
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('🟢 Conexão restaurada!');
      syncPendingOperations();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('🔴 Sem conexão. A corrida será salva localmente.');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    loadPersonalRecords();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const loadPersonalRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/runs/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const runs = response.data;
      const maxDist = Math.max(...runs.map(r => parseFloat(r.distance)), 0);
      setPersonalRecords({ maxDistance: maxDist });
    } catch (error) {
      console.error('Error loading personal records:', error);
    }
  };
  const fetchCompetitions = useCallback(async () => {
    if (!isOnline) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/competitions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const activeCompetitions = response.data.filter(c => !c.user_joined);
      setCompetitions(activeCompetitions);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    }
  }, [isOnline]);
  const cleanup = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [watchId]);
  useEffect(() => {
    fetchCompetitions();
    return () => {
      cleanup();
    };
  }, [fetchCompetitions, cleanup]);
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const formatPace = () => {
    if (distance === 0) return '0:00';
    const pacePerKm = time / 60 / distance;
    const minutes = Math.floor(pacePerKm);
    const seconds = Math.round((pacePerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  const formatPaceNumeric = () => {
    if (distance === 0) return 0;
    return time / 60 / distance;
  };
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const resetRun = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTime(0);
    setDistance(0);
    setTitle('');
    setSelectedCompetition(null);
    setStartTime(null);
    setGpsActive(false);
    lastPositionRef.current = null;
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [watchId]);
  const startRun = () => {
    if (!navigator.geolocation) {
      toast.error(t('run.geolocationError'));
      return;
    }
    setStartTime(new Date().toISOString());
    setIsRunning(true);
    setIsPaused(false);
    setGpsActive(true);
    if (hasAudioCoach) {
      audioCoach.announceStart();
    }
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (lastPositionRef.current) {
          const newDistance = calculateDistance(
            lastPositionRef.current.lat,
            lastPositionRef.current.lng,
            latitude,
            longitude
          );
          if (newDistance > 0.01) {
            const newTotalDistance = distance + newDistance;
            setDistance(newTotalDistance);
            if (hasAudioCoach) {
              audioCoach.checkAndAnnounce(newTotalDistance, time, formatPaceNumeric(), 1);
            }
          }
        }
        lastPositionRef.current = { lat: latitude, lng: longitude };
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error(t('run.trackingError'));
        setGpsActive(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    setWatchId(id);
    intervalRef.current = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
  };
  const pauseRun = () => {
    setIsPaused(true);
    setIsRunning(false);
    setGpsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    if (hasAudioCoach) {
      audioCoach.announcePause();
    }
  };
  const resumeRun = () => {
    setIsPaused(false);
    setIsRunning(true);
    setGpsActive(true);
    if (hasAudioCoach) {
      audioCoach.announceResume();
    }
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (lastPositionRef.current) {
          const newDistance = calculateDistance(
            lastPositionRef.current.lat,
            lastPositionRef.current.lng,
            latitude,
            longitude
          );
          if (newDistance > 0.01) {
            setDistance(prev => prev + newDistance);
          }
        }
        lastPositionRef.current = { lat: latitude, lng: longitude };
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true }
    );
    setWatchId(id);
    intervalRef.current = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
  };
  const stopRun = () => {
    pauseRun();
    setShowSaveDialog(true);
  };
  const saveRun = async () => {
    const endTime = new Date().toISOString();
    const calculatedPace = distance > 0 ? (time / 60) / distance : 0;
    const runData = {
      title: title || `${t('run.myRun')} ${distance.toFixed(2)}km`,
      distance: parseFloat(distance.toFixed(2)),
      duration: time,
      pace: calculatedPace,
      start_time: startTime,
      end_time: endTime,
      is_competition: !!selectedCompetition,
      competition_id: selectedCompetition
    };
    if (hasAudioCoach && distance > personalRecords.maxDistance) {
      audioCoach.announcePersonalRecord('distance', distance);
    }
    if (isOffline()) {
      const saved = await saveRunOffline(runData);
      if (saved) {
        toast.success('📦 Corrida salva localmente! Será sincronizada quando online.');
        if (hasAudioCoach) {
          audioCoach.announceFinish(distance, time, calculatedPace);
        }
        resetRun();
        setShowSaveDialog(false);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        toast.error('Erro ao salvar corrida offline');
      }
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/runs', runData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('run.saveSuccess'));
      if (hasAudioCoach) {
        audioCoach.announceFinish(distance, time, calculatedPace);
      }
      resetRun();
      setShowSaveDialog(false);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (error) {
      toast.error(t('run.saveError'));
      console.error(error);
    }
  };
  const discardRun = () => {
      resetRun();
      setShowSaveDialog(false);
      toast('Corrida descartada'); 
  };
  if (subLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }
  return (
    <div className="container-custom py-8 max-w-2xl animate-fadeInUp">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center mb-8">
        {t('run.trackYourRun')}
      </h1>
      {!showSaveDialog ? (
        <div className="card">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center gap-2">
                {isOnline ? <FaWifi className="text-green-500" /> : <FaSignal className="text-red-500" />}
                <span className="text-sm font-medium">Conexão</span>
              </div>
              <div className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className={gpsActive ? 'text-green-500 animate-pulse' : 'text-red-500'} />
                <span className="text-sm font-medium">GPS</span>
              </div>
              <div className={`text-xs ${gpsActive ? 'text-green-600' : 'text-red-600'}`}>
                {gpsActive ? 'Ativo' : 'Inativo'}
              </div>
            </div>
          </div>
          {isFree && (
            <div className="mb-4 p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg text-center">
              <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
                <FaStar className="text-xs" />
                Faça upgrade para Premium e tenha Áudio Coach!
                <Link to="/plans" className="underline font-semibold">Saiba mais</Link>
              </p>
            </div>
          )}
          <div className="text-center mb-8">
            <div className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 font-mono">
              {formatTime(time)}
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('run.distance')}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {distance.toFixed(2)} <span className="text-lg">km</span>
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('run.averagePace')}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {formatPace()} <span className="text-lg">/km</span>
                </p>
              </div>
            </div>
          </div>
          {!isOnline && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                <FaSignal />
                Modo Offline ativado. A corrida será salva localmente e sincronizada quando online.
              </p>
            </div>
          )}
          <div className="flex justify-center gap-4 mb-8">
            {!isRunning && !isPaused && time === 0 && (
              <button onClick={startRun} className="btn-success flex items-center gap-2 px-8 py-4 text-lg">
                <FaPlay /> {t('run.startRun')}
              </button>
            )}
            {isRunning && !isPaused && (
              <button onClick={pauseRun} className="btn-secondary flex items-center gap-2 px-8 py-4 text-lg">
                <FaPause /> {t('run.pause')}
              </button>
            )}
            {isPaused && (
              <div className="flex gap-4">
                <button onClick={resumeRun} className="btn-primary flex items-center gap-2 px-8 py-4 text-lg">
                  <FaPlay /> {t('run.resume')}
                </button>
                <button onClick={stopRun} className="btn-danger flex items-center gap-2 px-8 py-4 text-lg">
                  <FaStop /> {t('run.stop')}
                </button>
              </div>
            )}
            {isRunning && !isPaused && time > 0 && (
              <button onClick={stopRun} className="btn-danger flex items-center gap-2 px-8 py-4 text-lg">
                <FaStop /> {t('run.finish')}
              </button>
            )}
          </div>
          {selectedCompetition && (
            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                <FaTrophy className="text-yellow-600 dark:text-yellow-400" /> 
                {t('run.participatingIn')} {competitions.find(c => c.id === selectedCompetition)?.name}
              </p>
            </div>
          )}
          {!isRunning && time === 0 && (
            <div className="mt-4">
              {hasAudioCoach ? (
                <>
                  <button
                    onClick={() => setShowAudioSettings(!showAudioSettings)}
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                  >
                    <FaMicrophone /> Configurar Áudio Coach
                  </button>
                  {showAudioSettings && (
                    <div className="mt-4">
                      <AudioCoachSettings />
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl text-center border border-purple-200 dark:border-purple-800">
                  <FaMicrophone className="text-3xl text-purple-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-purple-800 dark:text-purple-400">
                    🎙️ Áudio Coach
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                    Receba feedback por voz durante a corrida
                  </p>
                  <Link to="/plans" className="inline-flex items-center gap-1 mt-3 text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                    <FaLock className="text-xs" />
                    Disponível no Premium
                  </Link>
                </div>
              )}
            </div>
          )}
          {!isRunning && time === 0 && (
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
              <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2">
                <FaHeartbeat className="text-blue-600 dark:text-blue-400" /> 💡 {t('run.tips')}:
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <li className="flex items-center gap-2">• {t('run.tip1')}</li>
                <li className="flex items-center gap-2">• {t('run.tip2')}</li>
                <li className="flex items-center gap-2">• {t('run.tip3')}</li>
                <li className="flex items-center gap-2">• {t('run.tip4')}</li>
                {hasAudioCoach && (
                  <li className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    • 🎙️ Áudio Coach ativo - você receberá feedback por voz durante a corrida
                  </li>
                )}
              </ul>
              {!isOnline && (
                <li className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mt-2">
                  • 📦 Modo Offline ativo - seus dados serão salvos localmente
                </li>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="card animate-scaleIn">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {t('run.saveRun')}
            {!isOnline && <span className="text-sm text-yellow-500 ml-2">(Modo Offline)</span>}
          </h2>
          <div className="mb-4">
            <label className="input-label">{t('run.runTitle')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder={t('run.myRun')}
            />
          </div>
          <div className="mb-4">
            <label className="input-label">{t('run.joinCompetition')} ({t('run.optional')})</label>
            <select
              value={selectedCompetition || ''}
              onChange={(e) => setSelectedCompetition(e.target.value || null)}
              className="input-field"
              disabled={!isOnline}
            >
              <option value="">{t('run.noCompetition')}</option>
              {competitions.map(comp => (
                <option key={comp.id} value={comp.id}>
                  {comp.name} - {comp.distance_target}km
                </option>
              ))}
            </select>
            {!isOnline && (
              <p className="text-xs text-yellow-500 mt-1">Competições indisponíveis offline</p>
            )}
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-5 rounded-xl mb-6">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3">{t('run.runSummary')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>🏃 {t('run.distance')}:</span>
                <span className="font-semibold">{distance.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between">
                <span>⏱️ {t('run.time')}:</span>
                <span className="font-semibold">{formatTime(time)}</span>
              </div>
              <div className="flex justify-between">
                <span>📊 {t('run.averagePace')}:</span>
                <span className="font-semibold">{formatPace()}/km</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={saveRun} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <FaSave /> {!isOnline ? 'Salvar Localmente' : t('run.saveRun')}
            </button>
            <button onClick={discardRun} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <FaTrash /> {t('run.discard')}
            </button>
          </div>
          {!isOnline && (
            <p className="text-xs text-center text-yellow-500 mt-3">
              🔄 A corrida será sincronizada automaticamente quando a conexão for restaurada
            </p>
          )}
        </div>
      )}
    </div>
  );
};
export default RunTracker;