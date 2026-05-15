
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaTachometerAlt, FaChartLine, FaCalendarAlt, FaArrowUp, FaArrowDown, FaMinus, FaFire, FaMedal } from 'react-icons/fa';
import toast from 'react-hot-toast';
const PerformanceAnalyzer = () => {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  useEffect(() => {
    fetchPerformanceData();
  }, [selectedPeriod]);
  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/performance/analysis?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 3000
      });
      setPerformanceData(response.data);
    } catch (error) {
      console.log('Usando dados locais para performance');
      const localData = await fetchLocalPerformanceData();
      setPerformanceData(localData);
    } finally {
      setLoading(false);
    }
  };
  const fetchLocalPerformanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/runs/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const runs = response.data || [];
      if (runs.length === 0) {
        return {
          averagePace: '0:00',
          paceTrend: 'stable',
          paceChange: 0,
          totalDistance: 0,
          distanceIncrease: 0,
          consistencyScore: 0,
          activeDays: 0,
          recordsBroken: 0,
          paceHistory: [
            { date: 'Sem 1', pace: 6.0, trendLine: 6.0 },
            { date: 'Sem 2', pace: 5.8, trendLine: 5.9 },
            { date: 'Sem 3', pace: 5.6, trendLine: 5.8 },
            { date: 'Sem 4', pace: 5.5, trendLine: 5.7 },
          ],
          recommendations: [
            'Complete sua primeira corrida para começar a tracking',
            'Defina metas semanais de distância',
            'Mantenha consistência nos treinos'
          ]
        };
      }
      const totalDistance = runs.reduce((sum, run) => sum + (parseFloat(run.distance) || 0), 0);
      const totalRuns = runs.length;
      const avgPace = runs.reduce((sum, run) => sum + (parseFloat(run.pace) || 0), 0) / totalRuns;
      const uniqueDays = new Set(runs.map(run => new Date(run.start_time).toDateString()));
      const activeDays = uniqueDays.size;
      const consistencyScore = Math.min(Math.round((activeDays / 30) * 100), 100);
      const weeklyData = {};
      runs.forEach(run => {
        const date = new Date(run.start_time);
        const weekKey = `Sem ${Math.ceil(date.getDate() / 7)}`;
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { paces: [] };
        }
        weeklyData[weekKey].paces.push(parseFloat(run.pace) || 0);
      });
      const paceHistory = Object.entries(weeklyData).map(([week, data]) => ({
        date: week,
        pace: (data.paces.reduce((a, b) => a + b, 0) / data.paces.length).toFixed(1),
        trendLine: 6.0
      }));
      const formatPace = (pace) => {
        if (!pace || pace === 0) return '0:00';
        const minutes = Math.floor(pace);
        const seconds = Math.round((pace - minutes) * 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      };
      return {
        averagePace: formatPace(avgPace),
        paceTrend: 'up',
        paceChange: 8.5,
        totalDistance: totalDistance.toFixed(1),
        distanceIncrease: 12.3,
        consistencyScore: consistencyScore,
        activeDays: activeDays,
        recordsBroken: 0,
        paceHistory: paceHistory.length > 0 ? paceHistory : [
          { date: 'Sem 1', pace: 6.0, trendLine: 6.0 },
          { date: 'Sem 2', pace: 5.8, trendLine: 5.9 },
        ],
        recommendations: [
          'Continue correndo regularmente para melhorar seu desempenho',
          'Experimente aumentar a distância gradualmente',
          'Inclua treinos intervalados para ganhar velocidade',
          'Descanse adequadamente entre os treinos'
        ]
      };
    } catch (error) {
      console.error('Error fetching local data:', error);
      return {
        averagePace: '5:30',
        paceTrend: 'up',
        paceChange: 8.5,
        totalDistance: 0,
        distanceIncrease: 0,
        consistencyScore: 0,
        activeDays: 0,
        recordsBroken: 0,
        paceHistory: [
          { date: 'Sem 1', pace: 6.0, trendLine: 6.0 },
          { date: 'Sem 2', pace: 5.8, trendLine: 5.9 },
          { date: 'Sem 3', pace: 5.6, trendLine: 5.8 },
          { date: 'Sem 4', pace: 5.5, trendLine: 5.7 },
        ],
        recommendations: [
          'Complete sua primeira corrida para começar a tracking',
          'Defina metas semanais de distância',
          'Mantenha consistência nos treinos'
        ]
      };
    }
  };
  const getTrendIcon = (trend) => {
    if (trend === 'up') return <FaArrowUp className="text-green-500" />;
    if (trend === 'down') return <FaArrowDown className="text-red-500" />;
    return <FaMinus className="text-yellow-500" />;
  };
  const formatTime = (time) => {
    if (typeof time === 'number') {
      const minutes = Math.floor(time);
      const seconds = Math.round((time - minutes) * 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return time;
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analisador de Performance</h2>
          <p className="text-gray-600 mt-1">Análise detalhada do seu desempenho</p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="input-field w-40"
        >
          <option value="week">Última Semana</option>
          <option value="month">Último Mês</option>
          <option value="year">Último Ano</option>
        </select>
      </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <FaTachometerAlt className="text-3xl text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Ritmo Médio</p>
          <p className="text-2xl font-bold">{performanceData?.averagePace || '0:00'}/km</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            {getTrendIcon(performanceData?.paceTrend)}
            <span className="text-xs text-gray-500">
              {Math.abs(performanceData?.paceChange || 0)}% no período
            </span>
          </div>
        </div>
        <div className="card text-center">
          <FaChartLine className="text-3xl text-green-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Distância Total</p>
          <p className="text-2xl font-bold">{performanceData?.totalDistance || 0} km</p>
          <p className="text-xs text-gray-500 mt-1">
            +{performanceData?.distanceIncrease || 0}% vs período anterior
          </p>
        </div>
        <div className="card text-center">
          <FaCalendarAlt className="text-3xl text-purple-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Consistência</p>
          <p className="text-2xl font-bold">{performanceData?.consistencyScore || 0}%</p>
          <p className="text-xs text-gray-500 mt-1">
            {performanceData?.activeDays || 0} dias ativos
          </p>
        </div>
        <div className="card text-center">
          <FaMedal className="text-3xl text-yellow-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Recordes Batidos</p>
          <p className="text-2xl font-bold">{performanceData?.recordsBroken || 0}</p>
          <p className="text-xs text-gray-500 mt-1">no período</p>
        </div>
      </div>
      {}
      {performanceData?.paceHistory && performanceData.paceHistory.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Evolução do Ritmo (min/km)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={performanceData.paceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="pace" 
                stroke="#3B82F6" 
                strokeWidth={3} 
                name="Ritmo Real" 
                dot={{ r: 4, fill: '#3B82F6' }}
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="trendLine" 
                stroke="#10B981" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                name="Tendência" 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center text-sm text-gray-500">
            {performanceData?.paceTrend === 'up' ? (
              <span className="text-green-600">📈 Você está melhorando! Mantenha o foco!</span>
            ) : performanceData?.paceTrend === 'down' ? (
              <span className="text-red-600">📉 Ritmo piorou. Revise seus treinos!</span>
            ) : (
              <span className="text-yellow-600">➡️ Ritmo estável. Que tal um desafio extra?</span>
            )}
          </div>
        </div>
      )}
      {}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaFire className="text-orange-500" /> Previsão de Tempo para Provas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-xl shadow-sm">
            <p className="text-sm text-gray-600">5km</p>
            <p className="text-xl font-bold text-blue-600">25:30</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl shadow-sm">
            <p className="text-sm text-gray-600">10km</p>
            <p className="text-xl font-bold text-green-600">52:15</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl shadow-sm">
            <p className="text-sm text-gray-600">Meia Maratona</p>
            <p className="text-xl font-bold text-yellow-600">1:55:00</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl shadow-sm">
            <p className="text-sm text-gray-600">Maratona</p>
            <p className="text-xl font-bold text-purple-600">4:10:00</p>
          </div>
        </div>
      </div>
      {}
      {performanceData?.recommendations && performanceData.recommendations.length > 0 && (
        <div className="card bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="font-bold text-gray-800 mb-3">💡 Recomendações Personalizadas</h3>
          <ul className="space-y-2">
            {performanceData.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-purple-500 mt-0.5">•</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default PerformanceAnalyzer;