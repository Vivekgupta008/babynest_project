// App.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider } from './src/theme/ThemeContext';
import StackNavigation from './src/navigation/StackNavigator';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs();

export default function App() {
  return (
    <PaperProvider>
      <ThemeProvider>
        <NavigationContainer>
          <StackNavigation />
        </NavigationContainer>
      </ThemeProvider>
    </PaperProvider>
  );
}
