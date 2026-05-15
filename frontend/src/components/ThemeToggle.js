
import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Alternar tema"
            title={isDark ? 'Modo Claro' : 'Modo Escuro'}
        >
            <div className="relative w-5 h-5">
                <FaSun 
                    className={`absolute inset-0 text-yellow-500 transition-all duration-300 transform ${
                        isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                    }`} 
                    size={18}
                />
                <FaMoon 
                    className={`absolute inset-0 text-blue-400 transition-all duration-300 transform ${
                        isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
                    }`} 
                    size={18}
                />
            </div>
        </button>
    );
};
export default ThemeToggle;