/**
 * Écran de liste des visites
 * Affiche toutes les visites et permet de les consulter
 */
import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchVisites } from '../../services/api';

// Interface pour le type de visite
interface VisitItem {
  id_visite: number;
  date_visite: string;
  heure_arrivee: string;
  heure_debut_entretien: string;
  heure_depart: string;
  nom_medecin: string;
  prenom_medecin: string;
  rendez_vous: boolean | number;
  temps_visite: string;
}

// Écran de liste des visites
const VisitListScreen = ({ navigation }) => {
  // États pour les visites et le chargement
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les visites
  const loadVisites = async () => {
    try {
      setError(null);
      const data = await fetchVisites();
      setVisits(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erreur lors du chargement des visites');
      console.error('Erreur loadVisites:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les visites quand l'écran devient visible
  useFocusEffect(
    useCallback(() => {
      loadVisites();
    }, [])
  );

  // Fonction pour rafraîchir les données
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadVisites();
  }, []);

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formater l'heure pour l'affichage
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    // Extraire l'heure depuis un datetime complet (YYYY-MM-DD HH:MM:SS)
    if (timeString && timeString.includes(' ')) {
      return timeString.split(' ')[1].substring(0, 5); // Extrait HH:MM
    }
    return timeString.substring(0, 5); // Si déjà au format HH:MM:SS
  };

  // Rendering d'une visite
  const renderVisitItem = ({ item }: { item: VisitItem }) => {
    // Déterminer si c'est un rendez-vous (gestion du boolean ou number)
    const isRdv = typeof item.rendez_vous === 'boolean' 
      ? item.rendez_vous 
      : Boolean(item.rendez_vous);

    return (
      <TouchableOpacity 
        style={styles.visitCard}
        onPress={() => navigation.navigate('VisitDetail', { visitId: item.id_visite })}
      >
        <View style={styles.visitHeader}>
          <Text style={styles.dateText}>{formatDate(item.date_visite)}</Text>
          <View style={[
            styles.badge, 
            isRdv ? styles.rdvBadge : styles.noRdvBadge
          ]}>
            <Text style={[
              styles.badgeText,
              isRdv ? styles.rdvText : styles.noRdvText
            ]}>
              {isRdv ? 'RDV' : 'Sans RDV'}
            </Text>
          </View>
        </View>
        
        <View style={styles.visitBody}>
          <Text style={styles.doctorName}>
            Dr. {item.prenom_medecin} {item.nom_medecin}
          </Text>
          <Text style={styles.visitTime}>
            Arrivée: {formatTime(item.heure_arrivee)} - Départ: {formatTime(item.heure_depart)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Afficher un indicateur de chargement
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e3c72" />
      </View>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadVisites}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Rendu de l'interface
  return (
    <View style={styles.container}>
      <FlatList
        data={visits}
        renderItem={renderVisitItem}
        keyExtractor={(item) => `visit-${item.id_visite}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune visite trouvée</Text>
          </View>
        }
      />
    </View>
  );
};

// Styles de l'écran
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    paddingVertical: 10,
  },
  visitCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  visitBody: {
    marginTop: 5,
  },
  doctorName: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  visitTime: {
    fontSize: 14,
    color: '#666',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rdvBadge: {
    backgroundColor: '#e8f5e9',
  },
  noRdvBadge: {
    backgroundColor: '#ffebee',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rdvText: {
    color: '#2e7d32',
  },
  noRdvText: {
    color: '#c62828',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    color: '#c62828',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1e3c72',
    padding: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  }
});

export default VisitListScreen;