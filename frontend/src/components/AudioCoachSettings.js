
import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaVolumeUp, FaVolumeMute, FaUser, FaUserFriends, FaClock } from 'react-icons/fa';
import audioCoach from '../services/audioCoachService';
import toast from 'react-hot-toast';
const AudioCoachSettings = () => {
  const [enabled, setEnabled] = useState(audioCoach.isEnabled());
  const [voiceType, setVoiceType] = useState(localStorage.getItem('audioCoachVoice') || 'male');
  const [feedbackInterval, setFeedbackInterval] = useState(parseInt(localStorage.getItem('audioCoachInterval') || '1'));
  const toggleEnabled = () => {
    const newState = !enabled;
    setEnabled(newState);
    audioCoach.setEnabled(newState);
    toast.success(newState ? 'Áudio Coach ativado!' : 'Áudio Coach desativado');
    if (newState) {
      setTimeout(() => {
        audioCoach.speak('Áudio Coach ativado! Você receberá feedback durante a corrida.');
      }, 500);
    }
  };
  const handleVoiceChange = (type) => {
    setVoiceType(type);
    audioCoach.setVoiceType(type);
    toast.success(`Voz ${type === 'male' ? 'masculina' : 'feminina'} selecionada`);
    audioCoach.speak(`Teste de voz ${type === 'male' ? 'masculina' : 'feminina'}. Áudio funcionando perfeitamente.`);
  };
  const handleIntervalChange = (interval) => {
    setFeedbackInterval(interval);
    audioCoach.setFeedbackInterval(interval);
    toast.success(`Feedback a cada ${interval}km`);
  };
  const testAudio = () => {
    audioCoach.speak('Teste de áudio. O som está funcionando perfeitamente! Boa corrida!');
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaMicrophone className="text-purple-500 text-xl" />
          <h3 className="font-bold text-gray-800 dark:text-white">Áudio Coach</h3>
        </div>
        <button
          onClick={toggleEnabled}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            enabled 
              ? 'bg-purple-500 text-white hover:bg-purple-600' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300'
          }`}
        >
          {enabled ? <FaVolumeUp className="inline mr-2" /> : <FaVolumeMute className="inline mr-2" />}
          {enabled ? 'Ativado' : 'Desativado'}
        </button>
      </div>
      {enabled && (
        <div className="space-y-4">
          {}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              Tipo de Voz
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => handleVoiceChange('male')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all ${
                  voiceType === 'male'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <FaUser /> Masculina
              </button>
              <button
                onClick={() => handleVoiceChange('female')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all ${
                  voiceType === 'female'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <FaUserFriends /> Feminina
              </button>
            </div>
          </div>
          {}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              Feedback a cada
            </label>
            <div className="flex gap-2">
              {[1, 2, 5].map(km => (
                <button
                  key={km}
                  onClick={() => handleIntervalChange(km)}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                    feedbackInterval === km
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {km} km
                </button>
              ))}
            </div>
          </div>
          {}
          <button
            onClick={testAudio}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            <FaVolumeUp /> Testar Áudio
          </button>
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-xs text-purple-700 dark:text-purple-300">
              💡 Dica: O Áudio Coach anuncia seu pace a cada quilômetro e dá dicas motivacionais durante a corrida.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default AudioCoachSettings;