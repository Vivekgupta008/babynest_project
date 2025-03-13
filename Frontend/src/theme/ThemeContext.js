import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

const themes = {
  light: {
    primary: '#ff4081',
    background: '#000000',
    text: 'rgb(255, 15, 15)',
    cardBackground: '#F5F5F5',
    iconBackground: '#E3F2FD',
  },
  dark: {
    primary: '#ff4081',
    background: '#121212',
    text: 'rgb(0, 76, 255)',
    cardBackground: '#1E1E1E',
    iconBackground: '#424242',
  },
  pastel: {
    primary: '#FFB6C1',
    background: '#FFF8E1',
    text: '#4A4A4A',
    cardBackground: '#FFE0B2',
    iconBackground: '#C5E1A5',
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.light);

  const updateTheme = (themeName) => {
    if (themes[themeName]) {
      setTheme(themes[themeName]);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
