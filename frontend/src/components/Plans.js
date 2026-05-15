
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaCheck, FaTimes, FaCrown, FaStar, FaSpinner, FaCreditCard, FaQrcode, FaBarcode, FaLock } from 'react-icons/fa';

const plans = [
  {
    id: 1,
    name: 'Grátis',
    price: 0,
    period: 'sempre',
    tagline: 'Para quem está começando',
    features: [
      { text: 'Corridas ilimitadas', included: true },
      { text: 'Dashboard com estatísticas básicas', included: true },
      { text: 'Histórico de 30 dias', included: true },
      { text: 'Mapa da corrida', included: true },
      { text: 'Ranking global', included: true },
      { text: 'Calendário de treino', included: true },
      { text: 'Sequências (Streaks)', included: true },
      { text: 'Até 3 metas pessoais', included: true },
      { text: 'IMC básico', included: true },
      { text: 'Até 2 grupos', included: true },
      { text: 'Conquistas e badges', included: true },
      { text: 'Compartilhar corridas', included: true },
      { text: '3 vídeos de treino gratuitos', included: true },
      { text: 'Análise de performance avançada', included: false },
      { text: 'Heatmap de atividade', included: false },
      { text: 'Histórico ilimitado', included: false },
      { text: 'IA Coach', included: false },
      { text: 'Prevenção de lesões', included: false },
      { text: 'Desafios entre amigos', included: false },
      { text: 'Exportação GPX', included: false },
      { text: 'Criar competições', included: false },
    ],
    color: 'from-gray-500 to-gray-600',
    buttonColor: 'btn-secondary'
  },
  {
    id: 2,
    name: 'Premium',
    price: 19.90,
    period: 'mês',
    tagline: 'Para corredores sérios',
    popular: true,
    features: [
      { text: 'Tudo do Grátis', included: true },
      { text: 'Histórico ilimitado', included: true },
      { text: 'Análise de performance avançada', included: true },
      { text: 'Heatmap de atividade', included: true },
      { text: 'Grupos ilimitados', included: true },
      { text: 'Metas ilimitadas', included: true },
      { text: 'Criar competições', included: true },
      { text: 'Desafios entre amigos', included: true },
      { text: 'IA Coach (Plano de treino com IA)', included: true },
      { text: 'Prevenção de lesões', included: true },
      { text: 'Exportação GPX ilimitada', included: true },
      { text: 'Todos os vídeos de treino', included: true },
      { text: 'Notificações push', included: true },
      { text: 'IMC avançado com histórico', included: true },
      { text: 'Sem anúncios', included: true },
      { text: 'Áudio Coach em tempo real', included: true },
      { text: 'Consultoria personalizada', included: false },
    ],
    color: 'from-blue-500 to-purple-600',
    buttonColor: 'btn-primary'
  },
  {
    id: 3,
    name: 'Elite',
    price: 39.90,
    period: 'mês',
    tagline: 'Para atletas de alto desempenho',
    features: [
      { text: 'Tudo do Premium', included: true },
      { text: 'Elite Hub exclusivo', included: true },
      { text: 'Vídeos exclusivos premium', included: true },
      { text: 'Consultoria personalizada', included: true },
      { text: 'Webinars ao vivo com especialistas', included: true },
      { text: 'Descontos em parceiros', included: true },
      { text: 'Suporte prioritário 24/7', included: true },
    ],
    color: 'from-yellow-500 to-orange-600',
    buttonColor: 'btn-success'
  }
];

const Plans = ({ user }) => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [checkingOut, setCheckingOut] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/subscriptions/current', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentPlan(response.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSubscribe = async (plan) => {
    if (plan.price === 0) {
      toast.info('Você já tem acesso ao plano grátis');
      return;
    }

    setCheckingOut(plan.id);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/subscriptions/create-preference',
        { plan_id: plan.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = response.data.init_point;
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Erro ao processar assinatura');
    } finally {
      setCheckingOut(null);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/subscriptions/cancel', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Assinatura cancelada com sucesso');
      fetchCurrentSubscription();
      setShowCancelModal(false);
    } catch (error) {
      toast.error('Erro ao cancelar assinatura');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container-custom py-12 animate-fadeInUp">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Escolha o Plano Ideal
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Comece grátis. Cancele quando quiser.</p>
        <div className="flex justify-center flex-wrap gap-4 mt-4 text-sm text-gray-500">
          <span>✅ Sem taxa de setup</span>
          <span>✅ Cancele a qualquer momento</span>
          <span>✅ Pagamento seguro</span>
        </div>
      </div>

      {currentPlan && currentPlan.plan_id > 1 && (
        <div className="max-w-md mx-auto mb-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center border border-green-200 dark:border-green-800">
          <p className="text-green-600 dark:text-green-400 font-semibold">
            🎉 Você é assinante <strong>{currentPlan.name}</strong>
          </p>
          <button
            onClick={() => setShowCancelModal(true)}
            className="mt-2 text-sm text-red-500 hover:text-red-600 underline"
          >
            Cancelar assinatura
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map(plan => {
          const isCurrentPlan = currentPlan?.plan_id === plan.id;
          const includedFeatures = plan.features.filter(f => f.included);
          const notIncludedFeatures = plan.features.filter(f => !f.included).slice(0, 3);
          const displayFeatures = [...includedFeatures, ...notIncludedFeatures];

          return (
            <div
              key={plan.id}
              className={`rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2 ${
                plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
              } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="bg-purple-500 text-white text-center py-2 text-sm font-semibold">
                  🔥 MAIS POPULAR
                </div>
              )}
              {isCurrentPlan && !plan.popular && (
                <div className="bg-green-500 text-white text-center py-2 text-sm font-semibold">
                  ✓ SEU PLANO ATUAL
                </div>
              )}

              <div className={`p-6 bg-gradient-to-br ${plan.color} text-white`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{plan.name}</h2>
                    <p className="opacity-90 mt-1 text-sm">{plan.tagline}</p>
                  </div>
                  {plan.name === 'Premium' && <FaCrown className="text-3xl opacity-80" />}
                  {plan.name === 'Elite' && <FaStar className="text-3xl opacity-80" />}
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2).replace('.', ',')}`}
                  </span>
                  {plan.price > 0 && <span className="text-sm opacity-80">/{plan.period}</span>}
                </div>
                {plan.price > 0 && (
                  <p className="text-xs mt-2 opacity-70">
                    ou R$ {(plan.price * 10).toFixed(2).replace('.', ',')} / ano (2 meses grátis)
                  </p>
                )}
              </div>

              <div className="p-6 bg-white dark:bg-gray-800">
                <ul className="space-y-2 mb-6 max-h-72 overflow-y-auto pr-1">
                  {displayFeatures.map((feature, idx) => (
                    <li key={idx} className={`flex items-center gap-3 text-sm ${
                      feature.included ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {feature.included
                        ? <FaCheck className="text-green-500 flex-shrink-0 text-xs" />
                        : <FaTimes className="text-gray-300 flex-shrink-0 text-xs" />
                      }
                      <span className={feature.included ? '' : 'line-through'}>{feature.text}</span>
                      {!feature.included && <FaLock className="text-gray-300 text-xs ml-auto flex-shrink-0" />}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={checkingOut === plan.id || isCurrentPlan}
                  className={`w-full ${plan.buttonColor} py-3 rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {checkingOut === plan.id ? (
                    <FaSpinner className="animate-spin mx-auto" />
                  ) : isCurrentPlan ? (
                    '✓ Plano Atual'
                  ) : plan.price === 0 ? (
                    'Começar Grátis'
                  ) : (
                    `Assinar por R$ ${plan.price.toFixed(2).replace('.', ',')}/mês`
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <div className="flex justify-center gap-4 text-gray-500 flex-wrap">
          <span className="flex items-center gap-1"><FaCreditCard /> Cartão</span>
          <span className="flex items-center gap-1"><FaQrcode /> PIX</span>
          <span className="flex items-center gap-1"><FaBarcode /> Boleto</span>
        </div>
        <p className="text-xs text-gray-400 mt-4">Pagamento 100% seguro via Mercado Pago</p>
      </div>

      {}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Cancelar Assinatura
              </h2>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja cancelar sua assinatura? Você perderá acesso a todos os recursos premium.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 btn-danger py-2"
              >
                {cancelling ? <FaSpinner className="animate-spin mx-auto" /> : 'Sim, cancelar'}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 btn-secondary py-2"
              >
                Não, voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;