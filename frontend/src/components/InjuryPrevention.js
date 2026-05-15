
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaHeartbeat, FaExclamationTriangle, FaCheckCircle, 
  FaCalendarAlt, FaChartLine, FaRunning, FaBed,
  FaStethoscope, FaBell, FaTimes
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
const InjuryPrevention = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  useEffect(() => {
    fetchAnalysis();
    fetchAlerts();
  }, []);
  const fetchAnalysis = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/injury/analyze', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalysis(response.data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      toast.error('Erro ao carregar análise');
    } finally {
      setLoading(false);
    }
  };
  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/injury/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(response.data);
      if (response.data.length > 0) {
        setSelectedAlert(response.data[0]);
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };
  const markAlertRead = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/injury/alerts/${alertId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(alerts.filter(a => a.id !== alertId));
      if (selectedAlert?.id === alertId) {
        setShowAlert(false);
        setSelectedAlert(null);
      }
    } catch (error) {
      console.error('Error marking alert:', error);
    }
  };
  const getRiskColor = (level) => {
    switch(level) {
      case 'low': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'moderate': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'high': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'critical': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-50';
    }
  };
  const getRiskLabel = (level) => {
    switch(level) {
      case 'low': return 'Baixo Risco';
      case 'moderate': return 'Risco Moderado';
      case 'high': return 'Alto Risco';
      case 'critical': return 'Risco Crítico!';
      default: return 'Indeterminado';
    }
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
      {}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FaHeartbeat className="text-red-500" />
          Prevenção de Lesões
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Análise inteligente do seu treino para prevenir lesões
        </p>
      </div>
      {}
      {showAlert && selectedAlert && (
        <div className={`p-4 rounded-xl border-2 animate-pulse ${
          selectedAlert.severity === 'danger' 
            ? 'bg-red-50 dark:bg-red-900/20 border-red-500' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
        }`}>
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <FaExclamationTriangle className={`text-2xl ${selectedAlert.severity === 'danger' ? 'text-red-500' : 'text-yellow-500'}`} />
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white">Alerta de Saúde</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{selectedAlert.message}</p>
              </div>
            </div>
            <button
              onClick={() => markAlertRead(selectedAlert.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
      {}
      <div className={`rounded-2xl p-6 ${getRiskColor(analysis?.risk_level)}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-75">Nível de Risco Atual</p>
            <p className="text-3xl font-bold">{getRiskLabel(analysis?.risk_level)}</p>
            <p className="text-2xl font-bold mt-2">{analysis?.risk_score}/100</p>
          </div>
          <div className="text-6xl">
            {analysis?.risk_level === 'low' && '✅'}
            {analysis?.risk_level === 'moderate' && '⚠️'}
            {analysis?.risk_level === 'high' && '❗'}
            {analysis?.risk_level === 'critical' && '🛑'}
          </div>
        </div>
      </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <FaChartLine className="text-2xl text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{analysis?.weekly_volume?.toFixed(1) || 0} km</p>
          <p className="text-xs text-gray-500">Volume Semanal</p>
          {analysis?.weekly_increase !== 0 && (
            <p className={`text-xs mt-1 ${analysis?.weekly_increase > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {analysis?.weekly_increase > 0 ? '+' : ''}{analysis?.weekly_increase?.toFixed(1)}% vs semana anterior
            </p>
          )}
        </div>
        <div className="card text-center">
          <FaRunning className="text-2xl text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{analysis?.fatigue_index?.toFixed(1) || 0}%</p>
          <p className="text-xs text-gray-500">Índice de Fadiga</p>
          <p className="text-xs text-gray-400 mt-1">Quanto maior, mais variável</p>
        </div>
        <div className="card text-center">
          <FaBed className="text-2xl text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{analysis?.last_weeks?.length || 0} semanas</p>
          <p className="text-xs text-gray-500">Histórico Analisado</p>
        </div>
      </div>
      {}
      {analysis?.recommendations && analysis.recommendations.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FaStethoscope className="text-blue-500" />
            Recomendações Personalizadas
          </h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-blue-500 mt-0.5">•</span>
                <span className="text-gray-700 dark:text-gray-300">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {}
      {analysis?.last_weeks && analysis.last_weeks.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">📊 Evolução Semanal</h3>
          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              <div className="flex justify-between items-end h-48 gap-2">
                {analysis.last_weeks.map((week, idx) => (
                  <div key={idx} className="flex-1 text-center">
                    <div 
                      className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${Math.min(week.distance * 4, 120)}px` }}
                    ></div>
                    <p className="text-xs font-semibold mt-2">{week.distance.toFixed(1)}km</p>
                    <p className="text-xs text-gray-500">{week.week}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <h3 className="font-bold text-gray-800 dark:text-white mb-3">💡 Dicas para Prevenir Lesões</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-500">🔥</span>
            <span className="text-gray-700 dark:text-gray-300">Aqueça por 10-15 minutos antes de correr</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">📏</span>
            <span className="text-gray-700 dark:text-gray-300">Aumente o volume semanal em no máximo 10%</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">💪</span>
            <span className="text-gray-700 dark:text-gray-300">Inclua fortalecimento muscular na rotina</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">😴</span>
            <span className="text-gray-700 dark:text-gray-300">Descanse pelo menos 1 dia por semana</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">🥤</span>
            <span className="text-gray-700 dark:text-gray-300">Mantenha-se hidratado antes, durante e após</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">👟</span>
            <span className="text-gray-700 dark:text-gray-300">Troque seus tênis a cada 500-800km</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default InjuryPrevention;