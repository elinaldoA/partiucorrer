
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, AreaChart, Area, ComposedChart
} from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaClock, FaFire, FaChartLine, FaTable } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
const ActivityHeatmap = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [hourlyData, setHourlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [matrixData, setMatrixData] = useState([]);
  const [selectedView, setSelectedView] = useState('matrix');
  useEffect(() => {
    fetchHeatmapData();
  }, []);
  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/performance/heatmap', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHourlyData(response.data.hourly || generateHourlyMockData());
      setWeeklyData(response.data.weekly || generateWeeklyMockData());
      setMonthlyData(response.data.monthly || generateMonthlyMockData());
      setMatrixData(response.data.matrix || generateMatrixMockData());
    } catch (error) {
      console.log('Usando dados mock para heatmap');
      setHourlyData(generateHourlyMockData());
      setWeeklyData(generateWeeklyMockData());
      setMonthlyData(generateMonthlyMockData());
      setMatrixData(generateMatrixMockData());
    } finally {
      setLoading(false);
    }
  };
  const generateHourlyMockData = () => {
    const hours = [];
    for (let hour = 0; hour < 24; hour++) {
      let intensity = 20;
      if (hour >= 6 && hour <= 8) intensity = 85;
      else if (hour >= 17 && hour <= 19) intensity = 90;
      else if (hour >= 20 && hour <= 22) intensity = 65;
      else if (hour >= 12 && hour <= 14) intensity = 45;
      else intensity = 15 + Math.floor(Math.random() * 20);
      hours.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        intensity: intensity,
        runs: Math.floor(intensity / 10) + Math.floor(Math.random() * 2),
        distance: ((intensity / 10) * 1.2 + Math.random() * 2).toFixed(1)
      });
    }
    return hours;
  };
  const generateWeeklyMockData = () => {
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    return days.map((day, idx) => {
      let intensity = 50;
      if (idx === 5) intensity = 75; 
      else if (idx === 6) intensity = 65; 
      else if (idx === 3) intensity = 35; 
      else intensity = 45 + Math.floor(Math.random() * 20);
      return {
        day,
        intensity: intensity,
        runs: Math.floor(intensity / 10) + Math.floor(Math.random() * 3),
        distance: ((intensity / 10) * 2 + Math.random() * 3).toFixed(1)
      };
    });
  };
  const generateMonthlyMockData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.map((month, idx) => {
      let intensity = 50;
      if (idx >= 5 && idx <= 9) intensity = 75 + Math.floor(Math.random() * 15);
      else if (idx <= 1 || idx >= 10) intensity = 25 + Math.floor(Math.random() * 15);
      else intensity = 45 + Math.floor(Math.random() * 20);
      return {
        month,
        intensity: intensity,
        runs: Math.floor(intensity / 10) + Math.floor(Math.random() * 4),
        distance: ((intensity / 10) * 3 + Math.random() * 8).toFixed(1)
      };
    });
  };
  const generateMatrixMockData = () => {
    const data = [];
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    for (let hour = 0; hour < 24; hour++) {
      for (let day = 0; day < 7; day++) {
        let intensity = 20;
        if ((hour >= 6 && hour <= 8) && day < 5) {
          intensity = 85 + Math.floor(Math.random() * 10);
        }
        else if ((hour >= 17 && hour <= 20) && day < 5) {
          intensity = 90 + Math.floor(Math.random() * 10);
        }
        else if ((hour >= 8 && hour <= 10) && day >= 5) {
          intensity = 75 + Math.floor(Math.random() * 15);
        }
        else if (hour >= 20 && hour <= 22) {
          intensity = 55 + Math.floor(Math.random() * 20);
        }
        else {
          intensity = 15 + Math.floor(Math.random() * 30);
        }
        data.push({
          hour: hour,
          day: days[day],
          dayIndex: day,
          intensity: intensity
        });
      }
    }
    return data;
  };
  const getIntensityColor = (intensity) => {
    if (intensity >= 80) return '#EF4444';
    if (intensity >= 60) return '#F59E0B';
    if (intensity >= 40) return '#10B981';
    if (intensity >= 20) return '#3B82F6';
    return '#8B5CF6';
  };
  const getIntensityLabel = (intensity) => {
    if (intensity >= 80) return 'Muito Alta';
    if (intensity >= 60) return 'Alta';
    if (intensity >= 40) return 'Média';
    if (intensity >= 20) return 'Baixa';
    return 'Muito Baixa';
  };
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            🔥 Intensidade: {data.intensity}% ({getIntensityLabel(data.intensity)})
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            🏃 Corridas: {data.runs || Math.floor(data.intensity / 10)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            📍 Distância: {data.distance || (data.intensity / 10 * 1.5).toFixed(1)} km
          </p>
        </div>
      );
    }
    return null;
  };
  const renderMatrixHeatmap = () => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return (
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {}
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center p-1">
              Hora/Dia
            </div>
            {hours.map(hour => (
              <div key={hour} className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center p-1">
                {hour.toString().padStart(2, '0')}h
              </div>
            ))}
          </div>
          {}
          {days.map((day, dayIdx) => (
            <div key={day} className="grid grid-cols-8 gap-1 mb-1">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center p-1">
                {day}
              </div>
              {hours.map(hour => {
                const cellData = matrixData.find(d => d.day === day && d.hour === hour);
                const intensity = cellData?.intensity || 20;
                return (
                  <div
                    key={hour}
                    className="h-14 rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer group relative"
                    style={{ backgroundColor: getIntensityColor(intensity) }}
                    title={`${day} às ${hour}:00 - Intensidade: ${intensity}% (${getIntensityLabel(intensity)})`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                      <span className="text-white text-xs font-bold">{intensity}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };
  const renderHourlyChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="hour" stroke="#6B7280" />
        <YAxis stroke="#6B7280" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="intensity" name="Intensidade (%)" fill="#8884d8" radius={[8, 8, 0, 0]}>
          {hourlyData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getIntensityColor(entry.intensity)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
  const renderWeeklyChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={weeklyData} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis type="number" stroke="#6B7280" />
        <YAxis dataKey="day" type="category" stroke="#6B7280" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="intensity" name="Intensidade (%)" fill="#8884d8" radius={[0, 8, 8, 0]}>
          {weeklyData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getIntensityColor(entry.intensity)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
  const renderMonthlyChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="month" stroke="#6B7280" />
        <YAxis stroke="#6B7280" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="intensity" 
          name="Intensidade (%)" 
          stroke="#3B82F6" 
          fill="#3B82F6" 
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
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
            <FaFire className="text-orange-500" />
            Mapa de Calor de Atividades
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualize seus horários e dias de maior atividade
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedView('matrix')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              selectedView === 'matrix'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <FaTable size={14} />
            Matriz
          </button>
          <button
            onClick={() => setSelectedView('hourly')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              selectedView === 'hourly'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <FaClock size={14} />
            Por Hora
          </button>
          <button
            onClick={() => setSelectedView('weekly')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              selectedView === 'weekly'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <FaCalendarAlt size={14} />
            Por Dia
          </button>
          <button
            onClick={() => setSelectedView('monthly')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              selectedView === 'monthly'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <FaChartLine size={14} />
            Por Mês
          </button>
        </div>
      </div>
      {}
      <div className="card">
        <h3 className="font-bold text-gray-800 dark:text-white mb-4">
          {selectedView === 'matrix' && 'Matriz de Atividade (Hora x Dia da Semana)'}
          {selectedView === 'hourly' && 'Atividade por Hora do Dia'}
          {selectedView === 'weekly' && 'Atividade por Dia da Semana'}
          {selectedView === 'monthly' && 'Atividade por Mês do Ano'}
        </h3>
        {selectedView === 'matrix' && renderMatrixHeatmap()}
        {selectedView === 'hourly' && renderHourlyChart()}
        {selectedView === 'weekly' && renderWeeklyChart()}
        {selectedView === 'monthly' && renderMonthlyChart()}
      </div>
      {}
      <div className="card">
        <h3 className="font-bold text-gray-800 dark:text-white mb-4">📊 Legenda de Intensidade</h3>
        <div className="grid grid-cols-5 gap-2">
          <div className="text-center">
            <div className="h-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 mb-1"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">0-20%</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 block">Muito Baixa</span>
          </div>
          <div className="text-center">
            <div className="h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 mb-1"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">20-40%</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 block">Baixa</span>
          </div>
          <div className="text-center">
            <div className="h-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 mb-1"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">40-60%</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 block">Média</span>
          </div>
          <div className="text-center">
            <div className="h-8 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 mb-1"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">60-80%</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 block">Alta</span>
          </div>
          <div className="text-center">
            <div className="h-8 rounded-lg bg-gradient-to-r from-red-500 to-red-600 mb-1"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">80-100%</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 block">Muito Alta</span>
          </div>
        </div>
      </div>
      {}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <FaClock className="text-2xl text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {hourlyData.reduce((max, h) => h.intensity > max.intensity ? h : max, { intensity: 0 }).hour || '06:00'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Horário de Pico</p>
        </div>
        <div className="card text-center">
          <FaCalendarAlt className="text-2xl text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {weeklyData.reduce((max, d) => d.intensity > max.intensity ? d : max, { intensity: 0 }).day || 'Sábado'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Dia de Pico</p>
        </div>
        <div className="card text-center">
          <FaFire className="text-2xl text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {Math.max(...hourlyData.map(h => h.intensity))}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Intensidade Máxima</p>
        </div>
        <div className="card text-center">
          <FaChartLine className="text-2xl text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {monthlyData.filter(m => m.intensity > 60).length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Meses de Alta</p>
        </div>
      </div>
    </div>
  );
};
export default ActivityHeatmap;