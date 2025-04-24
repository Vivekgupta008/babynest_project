// Screens/DueDateScreen.jsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function DueDateScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { dueDate } = route.params || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.message}>Your expected due date is:</Text>
      <Text style={styles.date}>{dueDate || 'Not available'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  message: {
    fontSize: 18,
    marginBottom: 10,
  },
  date: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff4081',
  },
});
