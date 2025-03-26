import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface VisitCardProps {
  visit: {
    id_visite: number;
    date_visite: string;
    heure_arrivee: string;
    nom_medecin: string;
    prenom_medecin: string;
    rendez_vous: boolean;
    temps_visite?: string;
  };
}

const VisitCard: React.FC<VisitCardProps> = ({ visit }) => {
  const navigation = useNavigation();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    // Extrait l'heure depuis un datetime complet (2025-03-06 14:57:25)
    if (timeString && timeString.includes(' ')) {
      return timeString.split(' ')[1].substring(0, 5); // Extrait HH:MM
    }
    return timeString ? timeString.substring(0, 5) : '';
  };

  const handlePress = () => {
    navigation.navigate('VisitDetail', { visitId: visit.id_visite });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(visit.date_visite)}</Text>
        <View style={[
          styles.badge, 
          visit.rendez_vous ? styles.rdvBadge : styles.noRdvBadge
        ]}>
          <Text style={[
            styles.badgeText,
            visit.rendez_vous ? styles.rdvText : styles.noRdvText
          ]}>
            {visit.rendez_vous ? 'RDV' : 'Sans RDV'}
          </Text>
        </View>
      </View>
      
      <View style={styles.body}>
        <Text style={styles.medecin}>
          Dr. {visit.prenom_medecin} {visit.nom_medecin}
        </Text>
        <Text style={styles.time}>
          {formatTime(visit.heure_arrivee)}
          {visit.temps_visite && ` (${formatTime(visit.temps_visite)})`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  body: {
    marginTop: 5,
  },
  medecin: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
});

export default VisitCard;
