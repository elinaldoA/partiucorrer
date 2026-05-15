
import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { 
  FaFacebook, FaTwitter, FaWhatsapp, FaTelegram, 
  FaLink, FaCheck, FaSpinner, FaTimes, FaRunning,
  FaTrophy, FaCalendarAlt, FaClock, FaMapMarkerAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';
const ShareCard = ({ run, onClose }) => {
  const cardRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  const formatTime = (seconds) => {
    if (!seconds) return '0min';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };
  const formatPace = (pace) => {
    if (!pace) return '0:00';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  const generateImage = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true
      });
      const image = canvas.toDataURL('image/png');
      return image;
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Erro ao gerar imagem');
      return null;
    } finally {
      setGenerating(false);
    }
  };
  const shareToFacebook = async () => {
    const image = await generateImage();
    if (image) {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`Acabei de correr ${run.distance}km! 🏃‍♂️`)}`, '_blank', 'width=600,height=400');
    }
  };
  const shareToTwitter = async () => {
    const text = `Acabei de correr ${run.distance}km em ${formatTime(run.duration)}! 🏃‍♂️ Ritmo médio de ${formatPace(run.pace)}/km. #RunTrack #Corrida`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
  };
  const shareToWhatsApp = async () => {
    const text = `🏃‍♂️ *Corrida RunTrack*\n\n📊 Distância: ${run.distance}km\n⏱️ Tempo: ${formatTime(run.duration)}\n📈 Ritmo: ${formatPace(run.pace)}/km\n📅 Data: ${formatDate(run.start_time)}\n\n#RunTrack #Corrida`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
  const shareToTelegram = async () => {
    const text = `🏃‍♂️ *Corrida RunTrack*\n\n📊 Distância: ${run.distance}km\n⏱️ Tempo: ${formatTime(run.duration)}\n📈 Ritmo: ${formatPace(run.pace)}/km\n📅 Data: ${formatDate(run.start_time)}\n\n#RunTrack #Corrida`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`, '_blank');
  };
  const copyLink = async () => {
    const text = `🏃‍♂️ Minha corrida no RunTrack!\n\nDistância: ${run.distance}km\nTempo: ${formatTime(run.duration)}\nRitmo: ${formatPace(run.pace)}/km\n\nVeja mais no app!`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Texto copiado! Cole onde quiser compartilhar.');
    setTimeout(() => setCopied(false), 2000);
  };
  const downloadImage = async () => {
    const image = await generateImage();
    if (image) {
      const link = document.createElement('a');
      link.download = `corrida_${run.id}_compartilhar.png`;
      link.href = image;
      link.click();
      toast.success('Imagem salva! Compartilhe onde quiser.');
    }
  };
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {}
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Compartilhar Corrida
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes size={24} />
          </button>
        </div>
        {}
        <div className="p-6">
          <div
            ref={cardRef}
            className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl"
          >
            {}
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-white/20 rounded-full mb-3">
                <FaRunning className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold">RunTrack</h3>
              <p className="text-white/80 text-sm">Minha corrida de hoje</p>
            </div>
            {}
            <div className="space-y-4 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold">{run.distance} km</div>
                <div className="text-white/80 text-sm">Distância percorrida</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <FaClock className="mx-auto mb-1 text-white/80" />
                  <div className="font-semibold">{formatTime(run.duration)}</div>
                  <div className="text-white/70 text-xs">Tempo</div>
                </div>
                <div className="text-center">
                  <FaTrophy className="mx-auto mb-1 text-white/80" />
                  <div className="font-semibold">{formatPace(run.pace)}/km</div>
                  <div className="text-white/70 text-xs">Ritmo médio</div>
                </div>
              </div>
              <div className="flex justify-between text-sm border-t border-white/20 pt-4">
                <span className="flex items-center gap-1">
                  <FaCalendarAlt size={12} />
                  {formatDate(run.start_time)}
                </span>
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt size={12} />
                  Brasil
                </span>
              </div>
            </div>
            {}
            <div className="text-center text-white/60 text-xs">
              #RunTrack #Corrida #Saúde
            </div>
          </div>
          {}
          <div className="mt-6 space-y-3">
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
              Compartilhe sua conquista!
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={shareToFacebook}
                className="flex items-center justify-center gap-2 py-2 px-4 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition-all"
              >
                <FaFacebook />
                Facebook
              </button>
              <button
                onClick={shareToTwitter}
                className="flex items-center justify-center gap-2 py-2 px-4 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-all"
              >
                <FaTwitter />
                Twitter
              </button>
              <button
                onClick={shareToWhatsApp}
                className="flex items-center justify-center gap-2 py-2 px-4 bg-[#25D366] text-white rounded-lg hover:opacity-90 transition-all"
              >
                <FaWhatsapp />
                WhatsApp
              </button>
              <button
                onClick={shareToTelegram}
                className="flex items-center justify-center gap-2 py-2 px-4 bg-[#0088cc] text-white rounded-lg hover:opacity-90 transition-all"
              >
                <FaTelegram />
                Telegram
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                {copied ? <FaCheck className="text-green-500" /> : <FaLink />}
                Copiar texto
              </button>
              <button
                onClick={downloadImage}
                disabled={generating}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {generating ? <FaSpinner className="animate-spin" /> : <FaRunning />}
                {generating ? 'Gerando...' : 'Salvar imagem'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ShareCard;