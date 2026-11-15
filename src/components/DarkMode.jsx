import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('bs-dark-mode');
    return saved === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('bs-dark-mode', darkMode);
  }, [darkMode]);

  return (
    <button 
      className="dark-mode-toggle" 
      onClick={() => setDarkMode(!darkMode)}
      title={darkMode ? 'Modo claro' : 'Modo escuro'}
    >
      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
