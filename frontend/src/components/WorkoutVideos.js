
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaPlay, FaClock, FaDumbbell, FaMedal, FaTimes, FaExpand, FaCompress } from 'react-icons/fa';
const VideoModal = ({ video, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };
  const toggleFullscreen = () => {
    const elem = document.getElementById('video-modal-container');
    if (!isFullscreen) {
      if (elem?.requestFullscreen) {
        elem.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const videoId = getYoutubeId(video.video_url);
  const embedUrl = videoId 
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1` 
    : (video.video_url?.startsWith('http') ? video.video_url : 'about:blank');
  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const getDifficultyLabel = (level) => {
    switch(level) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return level;
    }
  };
  return (
    <div 
      className={`fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div 
        id="video-modal-container"
        className={`bg-black rounded-t-2xl w-full h-full md:h-auto md:max-w-5xl md:rounded-2xl overflow-hidden transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        } ${isFullscreen ? '!rounded-none' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div className="flex justify-between items-center p-3 md:p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h3 className="text-sm md:text-xl font-semibold truncate flex-1">{video.title}</h3>
          <div className="flex gap-2">
            <button 
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            >
              {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
            </button>
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>
        {}
        <div className="bg-black w-full">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title={video.title}
            />
          </div>
        </div>
        {}
        <div className="p-3 md:p-4 bg-gray-900 text-white overflow-y-auto max-h-32 md:max-h-40">
          <p className="text-xs md:text-sm text-gray-300">{video.description}</p>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">⏱️ {formatDuration(video.duration)}</span>
            <span className="flex items-center gap-1">🏋️ {video.equipment_needed || 'Nenhum'}</span>
            <span className="flex items-center gap-1">🎯 {getDifficultyLabel(video.difficulty)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
const WorkoutVideos = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const categories = [
    { id: 'all', label: 'Todos', icon: '🎬' },
    { id: 'warmup', label: 'Aquecimento', icon: '🔥' },
    { id: 'strength', label: 'Fortalecimento', icon: '💪' },
    { id: 'stretching', label: 'Alongamento', icon: '🧘' },
    { id: 'core', label: 'Core', icon: '🎯' },
    { id: 'mobility', label: 'Mobilidade', icon: '🦵' },
  ];
  useEffect(() => {
    fetchVideos();
  }, [activeCategory]);
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:5000/api/workout-videos${activeCategory !== 'all' ? `?category=${activeCategory}` : ''}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setVideos(response.data);
    } catch (error) {
      toast.error('Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  };
  const openVideo = (video) => {
    setSelectedVideo(video);
  };
  const closeVideo = () => {
    setSelectedVideo(null);
  };
  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const getDifficultyColor = (level) => {
    switch(level) {
      case 'beginner': return 'text-green-500';
      case 'intermediate': return 'text-yellow-500';
      case 'advanced': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };
  const getDifficultyLabel = (level) => {
    switch(level) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return level;
    }
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
      <div>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
          🎥 Treinos
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
          Aquecimento e fortalecimento para sua corrida
        </p>
      </div>
      {}
      <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all flex items-center gap-1 md:gap-2 whitespace-nowrap text-sm md:text-base ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-base md:text-lg">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
      {videos.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-gray-500">Nenhum vídeo encontrado nesta categoria.</p>
          <p className="text-gray-400 text-sm mt-2">Em breve novos conteúdos!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {videos.map(video => (
            <div key={video.id} className="card hover:shadow-2xl transition-all cursor-pointer group p-0 overflow-hidden" onClick={() => openVideo(video)}>
              <div className="relative pb-[56.25%] bg-gradient-to-r from-gray-800 to-gray-900">
                <img 
                  src={video.thumbnail_url || 'https://via.placeholder.com/320x180?text=RunTrack+Video'} 
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-blue-600 rounded-full p-3 md:p-4 shadow-lg">
                    <FaPlay className="text-white text-xl md:text-2xl" />
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <FaClock size={10} /> {formatDuration(video.duration)}
                </div>
              </div>
              <div className="p-3 md:p-4">
                <h3 className="font-bold text-gray-800 dark:text-white text-sm md:text-lg line-clamp-1">{video.title}</h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{video.description}</p>
                <div className="flex justify-between items-center mt-2 md:mt-3">
                  <div className="flex flex-wrap items-center gap-1 md:gap-2 text-xs">
                    <span className={`flex items-center gap-1 ${getDifficultyColor(video.difficulty)}`}>
                      <FaMedal size={10} /> {getDifficultyLabel(video.difficulty)}
                    </span>
                    {video.equipment_needed && (
                      <span className="flex items-center gap-1 text-gray-500 text-xs">
                        <FaDumbbell size={10} /> {video.equipment_needed}
                      </span>
                    )}
                  </div>
                  <span className="text-blue-500 text-xs md:text-sm font-medium">Assistir →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={closeVideo} />
      )}
    </div>
  );
};
export default WorkoutVideos;