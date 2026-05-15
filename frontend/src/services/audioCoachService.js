
import { Howl } from 'howler';
const voices = {
  male: {
    name: 'Google UK English Male',
    rate: 1.0,
    pitch: 1.0
  },
  female: {
    name: 'Google UK English Female',
    rate: 1.0,
    pitch: 1.0
  }
};
class AudioCoach {
  constructor() {
    this.enabled = localStorage.getItem('audioCoachEnabled') !== 'false';
    this.voiceType = localStorage.getItem('audioCoachVoice') || 'male';
    this.feedbackInterval = parseInt(localStorage.getItem('audioCoachInterval') || '1');
    this.lastFeedbackKm = 0;
    this.speechSynthesis = window.speechSynthesis;
    this.synth = window.speechSynthesis;
  }
  isEnabled() {
    return this.enabled;
  }
  setEnabled(enabled) {
    this.enabled = enabled;
    localStorage.setItem('audioCoachEnabled', enabled);
  }
  setVoiceType(type) {
    this.voiceType = type;
    localStorage.setItem('audioCoachVoice', type);
  }
  setFeedbackInterval(km) {
    this.feedbackInterval = km;
    localStorage.setItem('audioCoachInterval', km);
  }
  speak(text, urgency = 'normal') {
    if (!this.enabled) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = urgency === 'urgent' ? 1.2 : 1.0;
    utterance.pitch = urgency === 'urgent' ? 1.1 : 1.0;
    utterance.volume = 1;
    utterance.lang = 'pt-BR';
    const voices = this.synth.getVoices();
    const brazilianVoice = voices.find(v => v.lang === 'pt-BR');
    if (brazilianVoice) {
      utterance.voice = brazilianVoice;
    }
    this.synth.speak(utterance);
  }
  checkAndAnnounce(distance, time, pace, kmSplit) {
    const currentKm = Math.floor(distance);
    if (currentKm > this.lastFeedbackKm && currentKm % this.feedbackInterval === 0) {
      this.lastFeedbackKm = currentKm;
      this.announceKmSplit(currentKm, pace, time);
      return true;
    }
    return false;
  }
  announceKmSplit(km, pace, totalTime) {
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    const paceMinutes = Math.floor(pace);
    const paceSeconds = Math.round((pace - paceMinutes) * 60);
    let message = `Quilômetro ${km} completo. `;
    message += `Tempo total: ${minutes} minutos e ${seconds} segundos. `;
    message += `Ritmo atual: ${paceMinutes}:${paceSeconds.toString().padStart(2, '0')} por quilômetro.`;
    if (pace < 5) {
      message += ' Excelente ritmo! Continue assim!';
    } else if (pace < 6) {
      message += ' Bom ritmo! Mantenha o foco!';
    } else if (pace < 7) {
      message += ' Ritmo regular. Você consegue acelerar um pouco?';
    } else {
      message += ' Vamos lá! Aumente o passo!';
    }
    this.speak(message);
  }
  announceStart() {
    this.speak('Boa sorte! Vamos começar a corrida. Lembre-se de manter um ritmo confortável e se hidratar.');
    this.lastFeedbackKm = 0;
  }
  announcePause() {
    this.speak('Corrida pausada. Descanse um pouco e volte quando estiver pronto.');
  }
  announceResume() {
    this.speak('Corrida retomada. Continue no seu ritmo!');
  }
  announceFinish(distance, time, pace) {
    const minutes = Math.floor(time / 60);
    const paceMinutes = Math.floor(pace);
    const paceSeconds = Math.round((pace - paceMinutes) * 60);
    let message = `Parabéns! Corrida finalizada! `;
    message += `Você percorreu ${distance.toFixed(2)} quilômetros em ${minutes} minutos. `;
    message += `Ritmo médio de ${paceMinutes}:${paceSeconds.toString().padStart(2, '0')} por quilômetro. `;
    if (pace < 5) {
      message += 'Excelente desempenho! Você é um corredor de elite!';
    } else if (pace < 6) {
      message += 'Ótimo resultado! Continue treinando!';
    } else {
      message += 'Bom trabalho! Cada corrida é uma vitória!';
    }
    this.speak(message, 'urgent');
  }
  announceHalfway(distance, targetDistance) {
    const halfway = targetDistance / 2;
    if (distance >= halfway && distance < halfway + 0.1) {
      this.speak(`Parabéns! Você chegou na metade da corrida. Continue firme!`, 'urgent');
      return true;
    }
    return false;
  }
  announceMotivationalPhrase() {
    const phrases = [
      'Você está indo muito bem!',
      'Mantenha o ritmo, você consegue!',
      'Acredite no seu potencial!',
      'Cada passo te aproxima do seu objetivo!',
      'Força! Você é mais forte que seus desafios!',
      'Continue assim, o resultado virá!',
      'Sua determinação é inspiradora!',
      'Vamos lá! Mais um quilômetro!'
    ];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    this.speak(randomPhrase);
  }
  announcePersonalRecord(recordType, value) {
    let message = `Novo recorde pessoal! `;
    if (recordType === 'distance') {
      message += `Maior distância: ${value.toFixed(2)} quilômetros!`;
    } else if (recordType === 'pace') {
      message += `Melhor ritmo: ${value} por quilômetro!`;
    }
    message += ' Parabéns pela conquista!';
    this.speak(message, 'urgent');
  }
}
export default new AudioCoach();