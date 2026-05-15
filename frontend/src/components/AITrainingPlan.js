
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaBrain, FaCalendarAlt, FaClock, FaRunning, FaTachometerAlt,
  FaChartLine, FaCheckCircle, FaSpinner, FaPlus, FaTrash,
  FaChevronRight, FaChevronDown, FaFire, FaHeartbeat, FaMedal
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
const AITrainingPlan = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [formData, setFormData] = useState({
    goal_type: 'general',
    difficulty: 'intermediate',
    weeks: 8,
    start_date: new Date().toISOString().split('T')[0]
  });
  useEffect(() => {
    fetchPlans();
  }, []);
  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/ai-training/plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchPlanDetails = async (planId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/ai-training/plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedPlan(response.data);
    } catch (error) {
      toast.error('Erro ao carregar detalhes do plano');
    }
  };
  const generatePlan = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/ai-training/generate', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGeneratedPlan(response.data.plan);
      toast.success('Plano gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar plano');
    } finally {
      setGenerating(false);
    }
  };
  const savePlan = async () => {
    if (!generatedPlan) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/ai-training/save', 
        { plan: generatedPlan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Plano salvo com sucesso!');
      setShowGenerator(false);
      setGeneratedPlan(null);
      fetchPlans();
    } catch (error) {
      toast.error('Erro ao salvar plano');
    } finally {
      setSaving(false);
    }
  };
  const getGoalTypeLabel = (type) => {
    const goals = {
      '5k': '5km',
      '10k': '10km',
      'half_marathon': 'Meia Maratona',
      'marathon': 'Maratona',
      'general': 'Geral',
      'speed': 'Velocidade',
      'endurance': 'Resistência'
    };
    return goals[type] || type;
  };
  const getDifficultyLabel = (diff) => {
    const levels = {
      'beginner': 'Iniciante',
      'intermediate': 'Intermediário',
      'advanced': 'Avançado'
    };
    return levels[diff] || diff;
  };
  const getWorkoutTypeIcon = (type) => {
    switch(type) {
      case 'easy': return <FaRunning className="text-green-500" />;
      case 'tempo': return <FaTachometerAlt className="text-orange-500" />;
      case 'interval': return <FaFire className="text-red-500" />;
      case 'long_run': return <FaHeartbeat className="text-purple-500" />;
      case 'recovery': return <FaCheckCircle className="text-blue-500" />;
      default: return <FaRunning className="text-gray-500" />;
    }
  };
  const getWorkoutTypeLabel = (type) => {
    const labels = {
      'easy': 'Corrida Leve',
      'tempo': 'Treino de Ritmo',
      'interval': 'Treino Intervalado',
      'long_run': 'Longão',
      'recovery': 'Recuperação'
    };
    return labels[type] || type;
  };
  const toggleWeek = (week) => {
    setExpandedWeek(expandedWeek === week ? null : week);
  };
  const getDayName = (dayNum) => {
    const days = {
      2: 'Terça-feira',
      3: 'Quarta-feira',
      5: 'Sexta-feira',
      6: 'Sábado',
      7: 'Domingo'
    };
    return days[dayNum] || `Dia ${dayNum}`;
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
            <FaBrain className="text-blue-500" />
            Plano de Treino com IA
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Planos personalizados baseados no seu desempenho e objetivos
          </p>
        </div>
        <button
          onClick={() => setShowGenerator(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaBrain /> Gerar Novo Plano com IA
        </button>
      </div>
      {}
      {plans.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4 animate-float">🤖</div>
          <p className="text-gray-500">Você ainda não tem nenhum plano de treino</p>
          <p className="text-gray-400 text-sm mt-2">Clique em "Gerar Novo Plano com IA" para começar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map(plan => (
            <div key={plan.id} className="card hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FaBrain className="text-blue-500" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      {plan.name}
                    </h3>
                    {plan.is_active && (
                      <span className="badge-success text-xs">Ativo</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {plan.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      🎯 {getGoalTypeLabel(plan.goal_type)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      📊 {getDifficultyLabel(plan.difficulty)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      📅 {plan.weeks} semanas
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      🗓️ {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPlan(selectedPlan?.plan?.id === plan.id ? null : null);
                    fetchPlanDetails(plan.id);
                  }}
                  className="btn-outline text-sm py-2 px-4 flex items-center gap-2"
                >
                  {selectedPlan?.plan?.id === plan.id ? 'Fechar' : 'Ver detalhes'}
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
              {}
              {selectedPlan?.plan?.id === plan.id && selectedPlan.workouts && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-3">
                    {Array.from({ length: plan.weeks }).map((_, weekIdx) => {
                      const weekNum = weekIdx + 1;
                      const weekWorkouts = selectedPlan.workouts.filter(w => w.week === weekNum);
                      const isExpanded = expandedWeek === weekNum;
                      return (
                        <div key={weekNum} className="border rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleWeek(weekNum)}
                            className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FaCalendarAlt className="text-blue-500" />
                              <span className="font-semibold text-gray-800 dark:text-white">
                                Semana {weekNum}
                              </span>
                              <span className="text-sm text-gray-500">
                                {weekWorkouts.filter(w => w.completed).length}/{weekWorkouts.length} treinos
                              </span>
                            </div>
                            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                          </button>
                          {isExpanded && (
                            <div className="p-4 space-y-3">
                              {weekWorkouts.sort((a, b) => a.day - b.day).map(workout => (
                                <div key={workout.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                  <div className="flex-shrink-0 text-xl">
                                    {getWorkoutTypeIcon(workout.workout_type)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex flex-wrap justify-between items-start gap-2">
                                      <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white">
                                          {getDayName(workout.day)}: {workout.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                          {workout.description}
                                        </p>
                                      </div>
                                      {workout.completed && (
                                        <FaCheckCircle className="text-green-500" />
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                      {workout.distance_km > 0 && (
                                        <span className="text-gray-500">📏 {workout.distance_km} km</span>
                                      )}
                                      {workout.target_pace && (
                                        <span className="text-gray-500">⏱️ Ritmo: {workout.target_pace}/km</span>
                                      )}
                                      <span className="text-gray-500">💪 Intensidade: {workout.intensity}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {}
      {showGenerator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FaBrain className="text-blue-500" />
                Gerar Plano com IA
              </h2>
              <button 
                onClick={() => {
                  setShowGenerator(false);
                  setGeneratedPlan(null);
                }} 
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            {!generatedPlan ? (
              <form className="space-y-4">
                <div>
                  <label className="input-label">Objetivo</label>
                  <select
                    value={formData.goal_type}
                    onChange={(e) => setFormData({...formData, goal_type: e.target.value})}
                    className="input-field"
                  >
                    <option value="general">Geral (Melhorar condicionamento)</option>
                    <option value="5k">5km</option>
                    <option value="10k">10km</option>
                    <option value="half_marathon">Meia Maratona (21km)</option>
                    <option value="marathon">Maratona (42km)</option>
                    <option value="speed">Velocidade</option>
                    <option value="endurance">Resistência</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Nível</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="input-field"
                  >
                    <option value="beginner">Iniciante</option>
                    <option value="intermediate">Intermediário</option>
                    <option value="advanced">Avançado</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Duração (semanas)</label>
                  <select
                    value={formData.weeks}
                    onChange={(e) => setFormData({...formData, weeks: parseInt(e.target.value)})}
                    className="input-field"
                  >
                    <option value={4}>4 semanas</option>
                    <option value={6}>6 semanas</option>
                    <option value={8}>8 semanas</option>
                    <option value={10}>10 semanas</option>
                    <option value={12}>12 semanas</option>
                    <option value={16}>16 semanas</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Data de início</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="input-field"
                  />
                </div>
                <button
                  type="button"
                  onClick={generatePlan}
                  disabled={generating}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {generating ? <FaSpinner className="animate-spin" /> : <FaBrain />}
                  {generating ? 'Gerando plano...' : 'Gerar Plano com IA'}
                </button>
              </form>
            ) : (
              <div>
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                  <h3 className="font-bold text-lg">{generatedPlan.name}</h3>
                  <p className="text-sm text-white/90 mt-1">{generatedPlan.description}</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <span>{generatedPlan.weeks} semanas</span>
                    <span>{generatedPlan.workouts.length} treinos</span>
                  </div>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
                  {Array.from({ length: Math.min(generatedPlan.weeks, 4) }).map((_, weekIdx) => {
                    const weekNum = weekIdx + 1;
                    const weekWorkouts = generatedPlan.workouts.filter(w => w.week === weekNum);
                    return (
                      <div key={weekNum} className="border rounded-lg p-3">
                        <div className="font-semibold text-gray-800 dark:text-white mb-2">
                          Semana {weekNum}
                        </div>
                        <div className="space-y-2">
                          {weekWorkouts.map((workout, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              {getWorkoutTypeIcon(workout.workout_type)}
                              <span className="flex-1">{workout.title}</span>
                              <span className="text-gray-500">{workout.distance_km}km</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {generatedPlan.weeks > 4 && (
                    <p className="text-center text-gray-500 text-sm">
                      + mais {generatedPlan.weeks - 4} semanas
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={savePlan}
                    disabled={saving}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {saving ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                    Salvar Plano
                  </button>
                  <button
                    onClick={() => setGeneratedPlan(null)}
                    className="flex-1 btn-secondary"
                  >
                    Gerar Novamente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default AITrainingPlan;