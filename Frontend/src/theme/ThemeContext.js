import React, { createContext, useState, useContext } from 'react';
import { Button } from 'react-native-paper';

const ThemeContext = createContext();

const themes = {
  default: {
    primary: 'rgb(218,79,122)',
    background: '#fff',
    text: 'rgb(0, 0, 0)',
    cardBackgroundprimary: 'rgb(35,79,147)',
    cardBackgroundsecondary: 'rgb(90,110,203)',
    iconBackground: '#ff4081',
    iconText: 'rgb(255, 255, 255)',
    button: 'rgb(218,79,122)',
    factcardprimary: 'rgb(246,199,210)',
    factcardsecondary: 'rgb(249, 234, 234)',
    appointment: '#fce4ec'
  },
  light: {
    primary: '#5271FF', 
    background: '#fff', 
    text: '#333333', 
    cardBackgroundprimary: '#DDE4F0', 
    cardBackgroundsecondary: '#E3EAF5', 
    iconBackground: '#E3F2FD', 
    button: '#5271FF', 
    factcardprimary: '#F3E6E8', 
    factcardsecondary: '#FAF3F4', 
    appointment: '#F8E8EC' 
  },
  dark: {
    primary: '#A9A9A9', 
    background: '#fff', 
    text: '#E0E0E0', 
    cardBackgroundprimary: '#2A2A2A', 
    cardBackgroundsecondary: '#3A3A3A', 
    iconBackground: '#4A4A4A', 
    button: '#A9A9A9', 
    factcardprimary: '#343434', 
    factcardsecondary: '#4A4A4A', 
    appointment: '#2D2D2D' 
  },
  pastel: {
    primary: '#CFA7C8',
    background: '#fff', 
    text: '#5F5F5F', 
    cardBackgroundprimary: '#E8D8E0', 
    cardBackgroundsecondary: '#F2E8ED', 
    iconBackground: '#D6E8D6',
    button: '#CFA7C8', 
    factcardprimary: '#F4E7E8', 
    factcardsecondary: '#FAF4F5', 
    appointment: '#F6F0F2' 
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
