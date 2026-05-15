import React, { createContext, useState, useContext, useEffect } from 'react';
import ptBR from '../locales/pt-BR';
import en from '../locales/en';
const LanguageContext = createContext();
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'pt-BR';
  });
  const [translations, setTranslations] = useState(language === 'pt-BR' ? ptBR : en);
  useEffect(() => {
    localStorage.setItem('language', language);
    setTranslations(language === 'pt-BR' ? ptBR : en);
    document.documentElement.lang = language === 'pt-BR' ? 'pt' : 'en';
  }, [language]);
  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    return value;
  };
  const changeLanguage = (lang) => {
    if (lang === 'pt-BR' || lang === 'en') {
      setLanguage(lang);
    }
  };
  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};