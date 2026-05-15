
import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { FaFacebook, FaTwitter, FaWhatsapp, FaLink, FaCheck, FaSpinner, FaTimes, FaTrophy } from 'react-icons/fa';
import toast from 'react-hot-toast';
const ShareAchievement = ({ achievement, onClose }) => {
  const cardRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareToFacebook = async () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`Desbloqueei a conquista: ${achievement.name}! 🏆`)}`, '_blank');
  };
  const shareToTwitter = async () => {
    const text = `🏆 Desbloqueei a conquista "${achievement.name}" no RunTrack! ${achievement.description || ''} #RunTrack #Conquista`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };
  const shareToWhatsApp = async () => {
    const text = `🏆 *Nova Conquista!*\n\nDesbloqueei: *${achievement.name}*\n${achievement.description || ''}\n\n#RunTrack #Conquista`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
  const copyLink = async () => {
    const text = `🏆 Desbloqueei a conquista "${achievement.name}" no RunTrack! ${achievement.description || ''}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Texto copiado!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Compartilhar Conquista
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={24} />
          </button>
        </div>
        <div
          ref={cardRef}
          className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white text-center"
        >
          <div className="text-6xl mb-4">{achievement.icon || '🏆'}</div>
          <h3 className="text-xl font-bold mb-2">{achievement.name}</h3>
          <p className="text-white/90 text-sm">{achievement.description}</p>
          <div className="mt-4 text-xs text-white/70">RunTrack • {new Date().toLocaleDateString('pt-BR')}</div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <button onClick={shareToFacebook} className="py-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90">
              <FaFacebook className="mx-auto" />
            </button>
            <button onClick={shareToTwitter} className="py-2 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90">
              <FaTwitter className="mx-auto" />
            </button>
            <button onClick={shareToWhatsApp} className="py-2 bg-[#25D366] text-white rounded-lg hover:opacity-90">
              <FaWhatsapp className="mx-auto" />
            </button>
          </div>
          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 transition-all"
          >
            {copied ? <FaCheck className="text-green-500" /> : <FaLink />}
            Copiar texto
          </button>
        </div>
      </div>
    </div>
  );
};
export default ShareAchievement;