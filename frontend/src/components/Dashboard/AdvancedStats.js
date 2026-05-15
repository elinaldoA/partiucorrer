
import React from 'react';
import { FaRunning, FaTachometerAlt, FaCalendarWeek, FaFire, FaMedal, FaChartLine } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import ProgressChart from '../Charts/ProgressChart';
const AdvancedStats = ({ stats, weeklyData, monthlyData }) => {
  const { t } = useLanguage();
  const calculateTrend = () => {
    if (!weeklyData || weeklyData.length < 2) return 0;
    const lastWeek = weeklyData[weeklyData.length - 1].distance;
    const prevWeek = weeklyData[weeklyData.length - 2].distance;
    return ((lastWeek - prevWeek) / prevWeek * 100).toFixed(1);
  };
  const trend = calculateTrend();
  const isPositive = trend > 0;
  return (
    <div className="space-y-6">
      {}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Tendência Semanal</p>
            <p className="text-3xl font-bold mt-2">
              {isPositive ? '+' : ''}{trend}%
            </p>
            <p className="text-sm mt-2 opacity-90">
              {isPositive ? '📈 Aumento no desempenho' : '📉 Melhore nos treinos'}
            </p>
          </div>
          <FaChartLine className="text-5xl opacity-50" />
        </div>
      </div>
      {}
      <ProgressChart 
        data={weeklyData} 
        type="area" 
        title="Progresso Semanal"
        height={300}
      />
      {}
      <ProgressChart 
        data={monthlyData} 
        type="bar" 
        title="Comparativo Mensal"
        height={300}
      />
      {}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 text-white">
          <FaMedal className="text-2xl mb-2" />
          <p className="text-xs opacity-90">Melhor Distância</p>
          <p className="text-xl font-bold">{stats.bestDistance || 0} km</p>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-xl p-4 text-white">
          <FaTachometerAlt className="text-2xl mb-2" />
          <p className="text-xs opacity-90">Melhor Pace</p>
          <p className="text-xl font-bold">{stats.bestPace || '0:00'}</p>
        </div>
        <div className="bg-gradient-to-br from-red-400 to-pink-500 rounded-xl p-4 text-white">
          <FaFire className="text-2xl mb-2" />
          <p className="text-xs opacity-90">Maior Sequência</p>
          <p className="text-xl font-bold">{stats.longestStreak || 0} dias</p>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl p-4 text-white">
          <FaCalendarWeek className="text-2xl mb-2" />
          <p className="text-xs opacity-90">Atividade Recente</p>
          <p className="text-xl font-bold">{stats.activeDays || 0} dias</p>
        </div>
      </div>
    </div>
  );
};
export default AdvancedStats;