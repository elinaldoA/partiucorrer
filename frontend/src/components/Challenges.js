
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaTrophy, FaUsers, FaPlus, FaSearch, FaCheck, 
  FaTimes, FaRunning, FaCalendarAlt, FaClock,
  FaMedal, FaFire, FaUserPlus, FaSpinner
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
const Challenges = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [formData, setFormData] = useState({
    opponent_id: '',
    opponent_name: '',
    title: '',
    description: '',
    challenge_type: 'distance',
    target_value: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  useEffect(() => {
    fetchChallenges();
  }, []);
  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/challenges', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChallenges(response.data);
    } catch (error) {
      toast.error('Erro ao carregar desafios');
    } finally {
      setLoading(false);
    }
  };
  const searchUsers = async () => {
    if (searchTerm.length < 2) return;
    setSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/users/search?q=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };
  const selectOpponent = (user) => {
    setFormData({
      ...formData,
      opponent_id: user.id,
      opponent_name: user.name
    });
    setSearchTerm('');
    setSearchResults([]);
  };
  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    if (!formData.opponent_id || !formData.title || !formData.target_value) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/challenges', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Desafio enviado!');
      setShowCreateModal(false);
      resetForm();
      fetchChallenges();
    } catch (error) {
      toast.error('Erro ao criar desafio');
    }
  };
  const acceptChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/challenges/${challengeId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Desafio aceito!');
      fetchChallenges();
    } catch (error) {
      toast.error('Erro ao aceitar desafio');
    }
  };
  const declineChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/challenges/${challengeId}/decline`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Desafio recusado');
      fetchChallenges();
    } catch (error) {
      toast.error('Erro ao recusar desafio');
    }
  };
  const resetForm = () => {
    setFormData({
      opponent_id: '',
      opponent_name: '',
      title: '',
      description: '',
      challenge_type: 'distance',
      target_value: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };
  const getChallengeTypeLabel = (type) => {
    switch(type) {
      case 'distance': return '🏃 Distância (km)';
      case 'runs': return '🎯 Número de Corridas';
      case 'pace': return '⚡ Melhor Ritmo';
      case 'streak': return '🔥 Sequência (dias)';
      default: return type;
    }
  };
  const getStatusBadge = (status, isCreator) => {
    switch(status) {
      case 'pending':
        return isCreator ? 
          <span className="badge-warning">Aguardando resposta</span> :
          <span className="badge-info">Pendente</span>;
      case 'active':
        return <span className="badge-success">Em andamento</span>;
      case 'completed':
        return <span className="badge">Finalizado</span>;
      default:
        return <span className="badge-error">Cancelado</span>;
    }
  };
  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
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
            <FaUsers className="text-blue-500" />
            Desafios entre Amigos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Desafie seus amigos e veja quem é o melhor!
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Novo Desafio
        </button>
      </div>
      {}
      {challenges.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4 animate-float">🎯</div>
          <p className="text-gray-500">Você ainda não tem desafios</p>
          <p className="text-gray-400 text-sm mt-2">Clique em "Novo Desafio" para começar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map(challenge => (
            <div key={challenge.id} className="card hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTrophy className="text-yellow-500" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      {challenge.title}
                    </h3>
                    {getStatusBadge(challenge.status, challenge.is_creator)}
                  </div>
                  {challenge.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {challenge.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    <span className="text-gray-500">
                      📅 {new Date(challenge.start_date).toLocaleDateString('pt-BR')} - {new Date(challenge.end_date).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-gray-500">
                      🎯 {getChallengeTypeLabel(challenge.challenge_type)}: {challenge.target_value}
                    </span>
                  </div>
                  {}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold">Você</span>
                        <span>{challenge.is_creator ? challenge.creator_progress?.toFixed(1) : challenge.opponent_progress?.toFixed(1)} / {challenge.target_value}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-bar-fill"
                          style={{ width: `${getProgressPercentage(challenge.is_creator ? challenge.creator_progress : challenge.opponent_progress, challenge.target_value)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold">{challenge.is_creator ? challenge.opponent_name : challenge.creator_name}</span>
                        <span>{challenge.is_creator ? challenge.opponent_progress?.toFixed(1) : challenge.creator_progress?.toFixed(1)} / {challenge.target_value}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-bar-fill"
                          style={{ width: `${getProgressPercentage(challenge.is_creator ? challenge.opponent_progress : challenge.creator_progress, challenge.target_value)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                {}
                {challenge.status === 'pending' && !challenge.is_creator && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptChallenge(challenge.id)}
                      className="btn-success px-4 py-2 text-sm flex items-center gap-1"
                    >
                      <FaCheck /> Aceitar
                    </button>
                    <button
                      onClick={() => declineChallenge(challenge.id)}
                      className="btn-danger px-4 py-2 text-sm flex items-center gap-1"
                    >
                      <FaTimes /> Recusar
                    </button>
                  </div>
                )}
                {challenge.status === 'completed' && challenge.winner_id && (
                  <div className="flex items-center justify-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <FaMedal className="text-yellow-500 text-2xl" />
                    <div className="ml-2">
                      <p className="text-xs text-gray-500">Vencedor</p>
                      <p className="font-bold">
                        {challenge.winner_id === challenge.creator_id ? challenge.creator_name : challenge.opponent_name}
                      </p>
                    </div>
                  </div>
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
                🎯 Criar Novo Desafio
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="input-label">Oponente *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      searchUsers();
                    }}
                    className="input-field pr-10"
                    placeholder="Buscar por nome ou email..."
                  />
                  {searching && <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" />}
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    {searchResults.map(user => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => selectOpponent(user)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {formData.opponent_name && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2">
                    <FaUserPlus className="text-green-500" />
                    <span className="text-sm">Desafiando: <strong>{formData.opponent_name}</strong></span>
                  </div>
                )}
              </div>
              <div>
                <label className="input-label">Título do Desafio *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="input-field"
                  placeholder="Ex: Quem corre mais essa semana?"
                />
              </div>
              <div>
                <label className="input-label">Descrição (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field"
                  rows="2"
                  placeholder="Descreva o desafio..."
                />
              </div>
              <div>
                <label className="input-label">Tipo de Desafio *</label>
                <select
                  value={formData.challenge_type}
                  onChange={(e) => setFormData({...formData, challenge_type: e.target.value})}
                  className="input-field"
                >
                  <option value="distance">🏃 Distância (km)</option>
                  <option value="runs">🎯 Número de Corridas</option>
                  <option value="pace">⚡ Melhor Ritmo (min/km)</option>
                  <option value="streak">🔥 Sequência (dias)</option>
                </select>
              </div>
              <div>
                <label className="input-label">Meta *</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={formData.target_value}
                  onChange={(e) => setFormData({...formData, target_value: parseFloat(e.target.value)})}
                  className="input-field"
                  placeholder="Ex: 50"
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
                  Criar Desafio
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
export default Challenges;