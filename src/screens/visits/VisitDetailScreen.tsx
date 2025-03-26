/**
 * Écran de détail d'une visite
 * Affiche les informations complètes d'une visite
 */
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { getVisite, deleteVisite } from '../../services/api';

// Interface pour les détails d'une visite
interface VisiteDetails {
  id_visite: number;
  date_visite: string;
  heure_arrivee: string;
  heure_debut_entretien: string;
  heure_depart: string;
  rendez_vous: boolean | number;
  id_medecin: number;
  id_visiteur: number;
  nom_medecin?: string;
  prenom_medecin?: string;
  temps_attente?: string;
  temps_visite?: string;
}

// Écran de détail d'une visite
const VisitDetailScreen = ({ route, navigation }) => {
  // Récupérer l'ID de la visite depuis les paramètres
  const { visitId } = route.params;
  
  // États
  const [visite, setVisite] = useState<VisiteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les détails de la visite
  const loadVisite = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appel à l'API
      const response = await getVisite(visitId);
      
      // Si la réponse est un tableau, prendre le premier élément
      const data = Array.isArray(response) ? response[0] : response;
      
      if (data) {
        // Normaliser le type de rendez_vous à boolean
        setVisite({
          ...data,
          rendez_vous: Boolean(data.rendez_vous)
        });
      } else {
        setError("Aucune donnée reçue");
      }
    } catch (error) {
      console.error("Erreur de chargement:", error);
      setError(`Impossible de charger la visite: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadVisite();
  }, [visitId]);

  // Fonction pour supprimer la visite
  const handleDelete = async () => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer cette visite ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVisite(visitId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la visite');
            }
          }
        }
      ]
    );
  };

  // Formater une heure depuis un datetime
  const formatTime = (datetime: string | null | undefined): string => {
    if (!datetime) return '-';
    try {
      // Extraire l'heure de la date complète
      if (datetime.includes(' ')) {
        return datetime.split(' ')[1].substring(0, 5); // HH:MM
      }
      return datetime.substring(0, 5);
    } catch (e) {
      return '-';
    }
  };

  // Formater une date
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e3c72" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // Afficher un message d'erreur
  if (error || !visite) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "Erreur de chargement"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadVisite}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Rendu de l'interface
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          Visite du {formatDate(visite.date_visite)}
        </Text>
        
        {visite.nom_medecin && (
          <Text style={styles.subtitle}>
            Dr. {visite.prenom_medecin} {visite.nom_medecin}
          </Text>
        )}

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type:</Text>
            <View style={[
              styles.badge, 
              visite.rendez_vous ? styles.rdvBadge : styles.noRdvBadge
            ]}>
              <Text style={[
                styles.badgeText,
                visite.rendez_vous ? styles.rdvText : styles.noRdvText
              ]}>
                {visite.rendez_vous ? 'Sur rendez-vous' : 'Sans rendez-vous'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horaires</Text>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Arrivée:</Text>
            <Text style={styles.timeValue}>{formatTime(visite.heure_arrivee)}</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Début d'entretien:</Text>
            <Text style={styles.timeValue}>{formatTime(visite.heure_debut_entretien)}</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Départ:</Text>
            <Text style={styles.timeValue}>{formatTime(visite.heure_depart)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Durées</Text>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Temps d'attente:</Text>
            <Text style={styles.timeValue}>{visite.temps_attente?.substring(0, 5) || '-'}</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Durée totale:</Text>
            <Text style={styles.timeValue}>{visite.temps_visite?.substring(0, 5) || '-'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Supprimer la visite</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Styles de l'écran
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e3c72',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    width: 100,
  },
  section: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3c72',
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timeLabel: {
    fontSize: 15,
    color: '#666',
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  rdvBadge: {
    backgroundColor: '#e8f5e9',
  },
  noRdvBadge: {
    backgroundColor: '#ffebee',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rdvText: {
    color: '#2e7d32',
  },
  noRdvText: {
    color: '#c62828',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#1e3c72',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default VisitDetailScreen;