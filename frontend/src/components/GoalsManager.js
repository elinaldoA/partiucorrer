
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaPlus, FaTrash, FaCheckCircle, FaHourglassHalf, 
  FaCalendarAlt, FaTrophy, FaRunning, FaMedal, FaClock,
  FaChartLine, FaTimes, FaSpinner
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
const GoalsManager = () => {
  const { t } = useLanguage();
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_type: 'distance',
    target_value: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [deletingId, setDeletingId] = useState(null);
  useEffect(() => {
    fetchGoals();
    fetchStats();
  }, []);
  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/goals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(response.data);
    } catch (error) {
      toast.error('Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/goals/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.target_value) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/goals', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Meta criada com sucesso! 🎯');
      setShowCreateModal(false);
      resetForm();
      fetchGoals();
      fetchStats();
    } catch (error) {
      toast.error('Erro ao criar meta');
    }
  };
  const handleDeleteGoal = async (id) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Meta removida');
      fetchGoals();
      fetchStats();
    } catch (error) {
      toast.error('Erro ao remover meta');
    } finally {
      setDeletingId(null);
    }
  };
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      goal_type: 'distance',
      target_value: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };
  const getGoalTypeIcon = (type) => {
    switch(type) {
      case 'distance': return <FaRunning className="text-blue-500" />;
      case 'runs': return <FaMedal className="text-green-500" />;
      case 'pace': return <FaClock className="text-purple-500" />;
      case 'streak': return <FaCalendarAlt className="text-orange-500" />;
      case 'time': return <FaHourglassHalf className="text-red-500" />;
      default: return <FaTrophy className="text-yellow-500" />;
    }
  };
  const getGoalTypeLabel = (type) => {
    switch(type) {
      case 'distance': return 'Distância (km)';
      case 'runs': return 'Número de Corridas';
      case 'pace': return 'Ritmo (min/km)';
      case 'streak': return 'Sequência (dias)';
      case 'time': return 'Tempo (horas)';
      default: return type;
    }
  };
  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <span className="badge-success flex items-center gap-1"><FaCheckCircle className="text-xs" /> Concluída</span>;
      case 'active':
        return <span className="badge-info flex items-center gap-1"><FaHourglassHalf className="text-xs" /> Em andamento</span>;
      case 'pending':
        return <span className="badge-warning flex items-center gap-1"><FaClock className="text-xs" /> Pendente</span>;
      case 'expired':
        return <span className="badge-error flex items-center gap-1"><FaTimes className="text-xs" /> Expirada</span>;
      default:
        return <span className="badge">{status}</span>;
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Minhas Metas
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Defina objetivos e acompanhe seu progresso
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Nova Meta
        </button>
      </div>
      {}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <FaTrophy className="text-3xl text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.total_goals || 0}</p>
          <p className="text-xs text-gray-500">Total de Metas</p>
        </div>
        <div className="card text-center">
          <FaCheckCircle className="text-3xl text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.completed_goals || 0}</p>
          <p className="text-xs text-gray-500">Metas Concluídas</p>
        </div>
        <div className="card text-center">
          <FaHourglassHalf className="text-3xl text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.active_goals || 0}</p>
          <p className="text-xs text-gray-500">Em Andamento</p>
        </div>
        <div className="card text-center">
          <FaChartLine className="text-3xl text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">
            {stats.total_goals > 0 ? Math.round((stats.completed_goals / stats.total_goals) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-500">Taxa de Sucesso</p>
        </div>
      </div>
      {}
      {goals.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4 animate-float">🎯</div>
          <p className="text-gray-500">Você ainda não tem nenhuma meta</p>
          <p className="text-gray-400 text-sm mt-2">Clique em "Nova Meta" para começar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => (
            <div key={goal.id} className="card hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getGoalTypeIcon(goal.goal_type)}
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      {goal.title}
                    </h3>
                    {getStatusBadge(goal.status)}
                  </div>
                  {goal.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {goal.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      🎯 {getGoalTypeLabel(goal.goal_type)}: {goal.target_value}
                      {goal.goal_type === 'distance' ? 'km' : 
                       goal.goal_type === 'runs' ? ' corridas' :
                       goal.goal_type === 'pace' ? ' min/km' :
                       goal.goal_type === 'streak' ? ' dias' : ' horas'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      📍 Progresso: {goal.current_value || 0} / {goal.target_value}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      📅 Prazo: {new Date(goal.end_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progresso</span>
                      <span className="font-semibold">{goal.progress_percentage || 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${goal.progress_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                {goal.status !== 'completed' && goal.status !== 'expired' && (
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    disabled={deletingId === goal.id}
                    className="btn-danger py-2 px-4 text-sm flex items-center gap-2"
                  >
                    {deletingId === goal.id ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                    Remover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                🎯 Criar Nova Meta
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="input-label">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="input-field"
                  placeholder="Ex: Correr 100km no mês"
                />
              </div>
              <div>
                <label className="input-label">Descrição (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field"
                  rows="2"
                  placeholder="Descreva sua meta..."
                />
              </div>
              <div>
                <label className="input-label">Tipo de Meta *</label>
                <select
                  value={formData.goal_type}
                  onChange={(e) => setFormData({...formData, goal_type: e.target.value})}
                  className="input-field"
                >
                  <option value="distance">Distância (km)</option>
                  <option value="runs">Número de Corridas</option>
                  <option value="pace">Ritmo (min/km)</option>
                  <option value="streak">Sequência (dias)</option>
                  <option value="time">Tempo (horas)</option>
                </select>
              </div>
              <div>
                <label className="input-label">Valor Alvo *</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={formData.target_value}
                  onChange={(e) => setFormData({...formData, target_value: parseFloat(e.target.value)})}
                  className="input-field"
                  placeholder="Ex: 100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Data Início</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">Data Fim</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Criar Meta
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default GoalsManager;