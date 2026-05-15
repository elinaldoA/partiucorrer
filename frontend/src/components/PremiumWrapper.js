
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCrown, FaStar, FaLock } from 'react-icons/fa';
import { useSubscription } from '../hooks/useSubscription';
const PremiumWrapper = ({ 
  feature, 
  title, 
  description, 
  children,
  showUpgradeButton = true 
}) => {
  const { hasFeature } = useSubscription();
  const hasAccess = hasFeature(feature);
  if (hasAccess) {
    return children;
  }
  return (
    <div className="card text-center py-12">
      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <FaCrown className="text-4xl text-yellow-300" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        {title || 'Recurso Premium'}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
        {description || 'Este recurso está disponível apenas para assinantes Premium e Elite'}
      </p>
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 max-w-sm mx-auto">
        <div className="flex items-center justify-center gap-3 mb-2">
          <FaStar className="text-yellow-500" />
          <span className="font-semibold">Plano Premium</span>
          <FaStar className="text-yellow-500" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Desbloqueie todos os recursos premium por apenas <strong>R$ 19,90/mês</strong>
        </p>
      </div>
      {showUpgradeButton && (
        <Link to="/plans" className="btn-primary inline-flex items-center gap-2">
          <FaLock className="text-sm" />
          Fazer Upgrade Agora
        </Link>
      )}
      <p className="text-xs text-gray-400 mt-4">
        Cancele quando quiser. Sem fidelidade.
      </p>
    </div>
  );
};
export default PremiumWrapper;