
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaCheck, FaRunning, FaCalendarCheck, FaChartLine, FaAward } from 'react-icons/fa';
import toast from 'react-hot-toast';
const TrainingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTrainingPlans();
  }, []);
  useEffect(() => {
    if (selectedPlan) {
      fetchWorkoutsForPlan();
    }
  }, [selectedPlan]);
  const fetchTrainingPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/training/plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrainingPlans(response.data);
      if (response.data.length > 0) {
        setSelectedPlan(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching training plans:', error);
      setTrainingPlans([
        { id: 1, name: 'Plano 5km em 8 semanas', description: 'Perfeito para iniciantes', weeks: 8 },
        { id: 2, name: 'Plano 10km em 10 semanas', description: 'Para corredores intermediários', weeks: 10 },
        { id: 3, name: 'Plano Meia Maratona', description: 'Desafio intermediário/avançado', weeks: 12 }
      ]);
      setSelectedPlan({ id: 1, name: 'Plano 5km em 8 semanas', description: 'Perfeito para iniciantes', weeks: 8 });
    } finally {
      setLoading(false);
    }
  };
  const fetchWorkoutsForPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/training/plans/${selectedPlan.id}/workouts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkouts(response.data.workouts || []);
      setCompletedWorkouts(response.data.completed || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setWorkouts([
        { id: 1, week: 0, day_of_week: 1, type: 'easy', distance: 5, suggested_pace: '6:00', description: 'Corrida leve para aquecimento' },
        { id: 2, week: 0, day_of_week: 3, type: 'tempo', distance: 8, suggested_pace: '5:30', description: 'Mantenha ritmo constante' },
        { id: 3, week: 0, day_of_week: 5, type: 'long', distance: 10, suggested_pace: '6:15', description: 'Trecho longo, ritmo confortável' },
      ]);
    }
  };
  const getWorkoutForDate = (date) => {
    if (!selectedPlan?.start_date) return null;
    const startDate = new Date(selectedPlan.start_date);
    const diffDays = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return null;
    const weekNumber = Math.floor(diffDays / 7);
    const dayOfWeek = date.getDay();
    return workouts.find(w => w.week === weekNumber && w.day_of_week === dayOfWeek);
  };
  const markWorkoutComplete = async (workoutId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/training/workouts/${workoutId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Treino marcado como concluído! 🎉');
      fetchWorkoutsForPlan();
    } catch (error) {
      toast.error('Erro ao marcar treino');
    }
  };
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const workout = getWorkoutForDate(date);
    const isCompleted = completedWorkouts.some(cw => 
      new Date(cw.completed_date).toDateString() === date.toDateString()
    );
    if (!workout) return null;
    return (
      <div className="mt-1">
        {isCompleted ? (
          <FaCheck className="text-green-500 text-xs mx-auto" />
        ) : (
          <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto"></div>
        )}
      </div>
    );
  };
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    const workout = getWorkoutForDate(date);
    const isCompleted = completedWorkouts.some(cw => 
      new Date(cw.completed_date).toDateString() === date.toDateString()
    );
    if (isCompleted) return 'bg-green-50 rounded-lg';
    if (workout) return 'bg-blue-50 rounded-lg';
    return '';
  };
  const getProgress = () => {
    const total = workouts.length;
    const completed = completedWorkouts.length;
    return total > 0 ? (completed / total) * 100 : 0;
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
          <h2 className="text-2xl font-bold text-gray-800">Calendário de Treinos</h2>
          <p className="text-gray-600 mt-1">Organize seus treinos e acompanhe seu progresso</p>
        </div>
        {trainingPlans.length > 0 && (
          <select
            value={selectedPlan?.id || ''}
            onChange={(e) => setSelectedPlan(trainingPlans.find(p => p.id === parseInt(e.target.value)))}
            className="input-field w-64"
          >
            {trainingPlans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
        )}
      </div>
      {}
      {selectedPlan && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-gray-800">{selectedPlan.name}</h3>
              <p className="text-sm text-gray-600">{selectedPlan.description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{getProgress().toFixed(0)}%</p>
              <p className="text-xs text-gray-500">Concluído</p>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${getProgress()}%` }}></div>
          </div>
          <div className="flex justify-between mt-4 text-sm text-gray-600">
            <span className="flex items-center gap-1"><FaCalendarCheck /> {completedWorkouts.length} de {workouts.length} treinos</span>
            <span className="flex items-center gap-1"><FaChartLine /> Meta: {selectedPlan.weeks} semanas</span>
          </div>
        </div>
      )}
      {}
      <div className="card">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
          className="w-full border-0"
        />
      </div>
      {}
      {selectedPlan && (() => {
        const workout = getWorkoutForDate(selectedDate);
        const isCompleted = completedWorkouts.some(cw => 
          new Date(cw.completed_date).toDateString() === selectedDate.toDateString()
        );
        if (!workout) {
          return (
            <div className="card text-center py-8">
              <div className="text-4xl mb-2">🏃‍♂️</div>
              <p className="text-gray-500">Nenhum treino programado para esta data</p>
              <p className="text-sm text-gray-400 mt-1">Aproveite para descansar ou fazer um treino livre!</p>
            </div>
          );
        }
        const workoutTypes = {
          easy: 'Leve',
          tempo: 'Ritmo',
          interval: 'Intervalado',
          long: 'Longo',
          recovery: 'Recuperação'
        };
        return (
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              {isCompleted ? <FaCalendarCheck className="text-green-500" /> : <FaRunning className="text-blue-500" />}
              Treino para {selectedDate.toLocaleDateString('pt-BR')}
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Tipo de treino:</span>
                <span className="font-semibold capitalize">{workoutTypes[workout.type] || workout.type}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Distância:</span>
                <span className="font-semibold">{workout.distance} km</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Ritmo sugerido:</span>
                <span className="font-semibold">{workout.suggested_pace}/km</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800">📝 {workout.description}</p>
              </div>
            </div>
            {!isCompleted && (
              <button
                onClick={() => markWorkoutComplete(workout.id)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <FaCheck /> Marcar como Concluído
              </button>
            )}
            {isCompleted && (
              <div className="text-center p-4 bg-green-50 rounded-xl text-green-700">
                <FaAward className="inline-block mr-2" />
                Treino concluído! Continue assim! 🎉
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
export default TrainingCalendar;