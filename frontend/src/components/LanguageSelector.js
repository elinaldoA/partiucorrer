
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FaLanguage, FaGlobeAmericas, FaGlobe, FaCheck } from 'react-icons/fa';
const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const getLanguageLabel = () => {
    return language === 'pt-BR' ? 'PT' : 'EN';
  };
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Selecionar idioma"
      >
        <FaLanguage className="text-gray-600 text-lg" />
        <span className="text-sm font-medium text-gray-700">{getLanguageLabel()}</span>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 fade-in">
          <div className="py-1">
            <button
              onClick={() => {
                changeLanguage('pt-BR');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                language === 'pt-BR' ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex-shrink-0">
                <FaGlobeAmericas className={`text-xl ${language === 'pt-BR' ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-medium ${language === 'pt-BR' ? 'text-blue-600' : 'text-gray-700'}`}>
                  Português
                </div>
                <div className="text-xs text-gray-500">Brazilian Portuguese</div>
              </div>
              {language === 'pt-BR' && (
                <FaCheck className="text-blue-600 text-sm flex-shrink-0" />
              )}
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={() => {
                changeLanguage('en');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                language === 'en' ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex-shrink-0">
                <FaGlobe className={`text-xl ${language === 'en' ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-medium ${language === 'en' ? 'text-blue-600' : 'text-gray-700'}`}>
                  English
                </div>
                <div className="text-xs text-gray-500">US English</div>
              </div>
              {language === 'en' && (
                <FaCheck className="text-blue-600 text-sm flex-shrink-0" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default LanguageSelector;