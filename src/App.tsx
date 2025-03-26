/**
 * Point d'entrée principal de l'application
 * Gère la navigation et la vérification d'authentification
 */
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';

// Écrans
import LoginScreen from './screens/auth/LoginScreen';
import HomeScreen from './screens/home/HomeScreen';
import VisitListScreen from './screens/visits/VisitListScreen';
import AddVisitScreen from './screens/visits/AddVisitScreen';
import VisitDetailScreen from './screens/visits/VisitDetailScreen';

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Vérifier si un token existe au démarrage de l'app
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        // Si un token existe, on considère l'utilisateur comme connecté
        // Dans une vraie application, on vérifierait la validité du token
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Erreur vérification token:', error);
        setIsLoggedIn(false);
      } finally {
        // Dans tous les cas, on termine le chargement
        setIsLoading(false);
      }
    };
    
    checkLoginStatus();
  }, []);
  
  // Afficher un écran de chargement pendant la vérification
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3c72" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isLoggedIn ? 'Home' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1e3c72',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="VisitList" 
          component={VisitListScreen}
          options={{ title: 'Mes Visites' }}
        />
        <Stack.Screen 
          name="AddVisit" 
          component={AddVisitScreen}
          options={{ title: 'Nouvelle Visite' }}
        />
        <Stack.Screen 
          name="VisitDetail" 
          component={VisitDetailScreen}
          options={{ title: 'Détail de la visite' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555'
  }
});

export default App;