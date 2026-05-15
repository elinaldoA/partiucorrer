
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaShoePrints, FaTshirt, FaClock, FaDumbbell,
  FaStar, FaStarHalf, FaShoppingCart, FaInfoCircle
} from 'react-icons/fa';
const EquipmentRecommendations = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  useEffect(() => {
    fetchRecommendations();
  }, []);
  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/equipment/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Erro ao carregar recomendações');
    } finally {
      setLoading(false);
    }
  };
  const getProfileLabel = (profile) => {
    switch(profile) {
      case 'beginner': return { label: 'Iniciante', color: 'text-green-500', icon: '🌱' };
      case 'intermediate': return { label: 'Intermediário', color: 'text-blue-500', icon: '📈' };
      case 'advanced': return { label: 'Avançado', color: 'text-purple-500', icon: '⚡' };
      case 'elite': return { label: 'Elite', color: 'text-yellow-500', icon: '🏆' };
      default: return { label: 'Corredor', color: 'text-gray-500', icon: '🏃' };
    }
  };
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'shoes': return <FaShoePrints className="text-blue-500" />;
      case 'clothing': return <FaTshirt className="text-green-500" />;
      case 'watch': return <FaClock className="text-purple-500" />;
      case 'accessories': return <FaDumbbell className="text-orange-500" />;
      default: return <FaInfoCircle />;
    }
  };
  const getCategoryName = (category) => {
    switch(category) {
      case 'shoes': return 'Tênis';
      case 'clothing': return 'Vestuário';
      case 'watch': return 'Relógios';
      case 'accessories': return 'Acessórios';
      default: return category;
    }
  };
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-500" />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalf key="half" className="text-yellow-500" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-gray-300 dark:text-gray-600" />);
    }
    return stars;
  };
  const getRecommendationsByCategory = () => {
    if (!data) return [];
    if (selectedCategory === 'all') return data.recommendations;
    return data.recommendations.filter(item => item.category === selectedCategory);
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }
  const profile = getProfileLabel(data?.runner_profile);
  return (
    <div className="space-y-6 animate-fadeInUp">
      {}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FaShoePrints className="text-blue-500" />
          Recomendações de Equipamentos
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Sugestões personalizadas baseadas no seu perfil de corredor
        </p>
      </div>
      {}
      <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{profile.icon}</div>
            <div>
              <p className="text-sm opacity-90">Seu Perfil</p>
              <p className="text-2xl font-bold">{profile.label}</p>
              <p className="text-sm opacity-75 mt-1">
                {data?.runner_profile === 'beginner' && 'Continue correndo regularmente para evoluir!'}
                {data?.runner_profile === 'intermediate' && 'Ótimo progresso! Você está no caminho certo!'}
                {data?.runner_profile === 'advanced' && 'Excelente nível! Continue desafiando seus limites!'}
                {data?.runner_profile === 'elite' && 'Você é um corredor de elite! Inspiração para muitos!'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Estatísticas</p>
            <p className="text-lg font-bold">{data?.stats?.totalDistance?.toFixed(0) || 0} km</p>
            <p className="text-xs opacity-75">distância total</p>
          </div>
        </div>
      </div>
      {}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {['all', 'shoes', 'clothing', 'watch', 'accessories'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            {cat === 'all' ? 'Todos' : getCategoryName(cat)}
          </button>
        ))}
      </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {getRecommendationsByCategory().map((item, idx) => (
          <div 
            key={idx} 
            className="card hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            onClick={() => setSelectedProduct(item)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getCategoryIcon(item.category)}
                <span className="text-xs text-gray-500">{getCategoryName(item.category)}</span>
              </div>
              <div className="flex gap-1">
                {renderStars(item.rating)}
              </div>
            </div>
            <h3 className="font-bold text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">
              {item.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{item.brand}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {item.description}
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {item.price_range}
                </span>
                <button 
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(item);
                  }}
                >
                  <FaInfoCircle /> Detalhes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {}
      <div className="card">
        <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <FaShoePrints className="text-blue-500" />
          Tênis Recomendados para Você
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.categories?.shoes?.map((shoe, idx) => (
            <div key={idx} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <FaShoePrints className="text-3xl text-blue-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{shoe.name}</h4>
                <p className="text-xs text-gray-500">{shoe.brand}</p>
                <div className="flex items-center gap-1 mt-1">
                  {renderStars(shoe.rating)}
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{shoe.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                {getCategoryIcon(selectedProduct.category)}
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {selectedProduct.name}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Marca</span>
                <span className="font-semibold">{selectedProduct.brand}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Categoria</span>
                <span>{getCategoryName(selectedProduct.category)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Avaliação</span>
                <div className="flex gap-1">{renderStars(selectedProduct.rating)}</div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Faixa de Preço</span>
                <span className="font-semibold text-green-600">{selectedProduct.price_range}</span>
              </div>
              <div className="border-t pt-4">
                <p className="font-semibold mb-2">Descrição</p>
                <p className="text-gray-600 dark:text-gray-400">{selectedProduct.description}</p>
              </div>
              {selectedProduct.features && (
                <div className="border-t pt-4">
                  <p className="font-semibold mb-2">Características</p>
                  <ul className="space-y-1">
                    {selectedProduct.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                {selectedProduct.buy_url && (
                  <a
                    href={selectedProduct.buy_url.startsWith('http') ? selectedProduct.buy_url : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <FaShoppingCart /> Onde Comprar
                  </a>
                )}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 btn-secondary"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {}
      <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
        <h3 className="font-bold text-gray-800 dark:text-white mb-3">💡 Dicas para Escolher Equipamentos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-500">👟</span>
            <span className="text-gray-700 dark:text-gray-300">Troque seus tênis a cada 500-800km</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">🧦</span>
            <span className="text-gray-700 dark:text-gray-300">Use meias próprias para corrida</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">⌚</span>
            <span className="text-gray-700 dark:text-gray-300">Relógios com GPS ajudam no treinamento</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">💧</span>
            <span className="text-gray-700 dark:text-gray-300">Hidrate-se antes, durante e após a corrida</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EquipmentRecommendations;