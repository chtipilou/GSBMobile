/**
 * Écran d'accueil
 * Affiche les options principales et les informations de l'utilisateur
 */
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  SafeAreaView,
  Alert,
  ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Écran d'accueil
const HomeScreen = ({ navigation }) => {
  // État pour les données utilisateur et le chargement
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Récupérer les données utilisateur au chargement
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        } else {
          // Si aucune donnée utilisateur, rediriger vers la connexion
          handleLogout();
        }
      } catch (error) {
        console.error('Erreur récupération données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      // Supprimer les données de session
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      // Rediriger vers l'écran de connexion
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }]
      });
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e3c72" />
      </View>
    );
  }

  // Rendu de l'interface
  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête avec logo et info utilisateur */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {/* Assurez-vous d'avoir ce fichier d'image dans le dossier assets */}
          <Text style={styles.logoText}>GSB</Text>
        </View>
        
        <View style={styles.userSection}>
          {userData && (
            <Text style={styles.userEmail}>{userData.email}</Text>
          )}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Contenu principal */}
      <View style={styles.content}>
        <Text style={styles.welcome}>
          Bonjour, {userData ? `${userData.prenom} ${userData.nom}` : 'Visiteur'}
        </Text>
        
        <Text style={styles.title}>Suivi des Visites</Text>
        
        <Text style={styles.description}>
          Application mobile pour les visiteurs médicaux
        </Text>
        
        {/* Boutons d'action */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('VisitList')}
          >
            <Text style={styles.buttonText}>Voir les visites</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('AddVisit')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Ajouter une visite
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Styles de l'écran
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  logoContainer: {
    backgroundColor: '#1e3c72',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userEmail: {
    marginRight: 10,
    fontSize: 14,
    color: '#555',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  logoutText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '500'
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  welcome: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3c72',
    marginBottom: 10,
    textAlign: 'center'
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center'
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    paddingHorizontal: 20
  },
  button: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center'
  },
  primaryButton: {
    backgroundColor: '#1e3c72',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1e3c72'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  secondaryButtonText: {
    color: '#1e3c72'
  }
});

export default HomeScreen;
