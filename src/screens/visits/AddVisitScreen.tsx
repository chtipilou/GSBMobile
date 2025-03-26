import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { fetchCabinets, fetchMedecins, createVisite } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Cabinet {
  id_cabinet: number;
  rue: string;
  ville: string;
  code_postal: string;
  telephone: string;
  latitude: string;
  longitude: string;
  distance: number;
  medecins: any[];
}

interface Medecin {
  id_medecin: number;
  nom: string;
  prenom: string;
}

const AddVisitScreen = () => {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [cabinets, setCabinets] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [selectedCabinet, setSelectedCabinet] = useState(null);
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  const [showCabinetModal, setShowCabinetModal] = useState(false);
  const [showMedecinModal, setShowMedecinModal] = useState(false);
  const [formData, setFormData] = useState({
    date_visite: new Date().toISOString().split('T')[0],
    heure_arrivee: '',
    heure_debut_entretien: '',
    heure_depart: '',
    rendez_vous: false
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTimeField, setCurrentTimeField] = useState<'arrivee' | 'debut' | 'depart' | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger la position
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const position = await Location.getCurrentPositionAsync({});
        setLocation(position);
        
        // Charger les cabinets proches
        const cabinetsData = await fetchCabinets(
          position.coords.latitude,
          position.coords.longitude
        );
        setCabinets(cabinetsData);
        if (cabinetsData.length > 0) {
          setSelectedCabinet(cabinetsData[0]);
        }

        // Charger les médecins
        const medecinsData = await fetchMedecins();
        setMedecins(medecinsData);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
    }
  };

  const validateTime = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const formatTimeForAPI = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}:00`;  // Format HH:mm:ss
  };

  const formatTimeForDisplay = (time: string | Date): string => {
    if (time instanceof Date) {
      const hours = String(time.getHours()).padStart(2, '0');
      const minutes = String(time.getMinutes()).padStart(2, '0');
      const seconds = String(time.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
    // Si c'est déjà une chaîne formatée, la retourner
    return time;
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate && currentTimeField) {
      // Utiliser directement formatTimeForAPI ici
      const formattedTime = formatTimeForAPI(selectedDate);
      console.log('Time selected:', formattedTime); // Debug

      switch (currentTimeField) {
        case 'arrivee':
          setFormData(prev => ({ ...prev, heure_arrivee: formattedTime }));
          break;
        case 'debut':
          setFormData(prev => ({ ...prev, heure_debut_entretien: formattedTime }));
          break;
        case 'depart':
          setFormData(prev => ({ ...prev, heure_depart: formattedTime }));
          break;
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedMedecin) {
        Alert.alert('Erreur', 'Veuillez sélectionner un médecin');
        return;
      }

      // Vérifier que toutes les heures sont remplies
      if (!formData.heure_arrivee || !formData.heure_debut_entretien || !formData.heure_depart) {
        Alert.alert('Erreur', 'Veuillez remplir toutes les heures');
        return;
      }

      const userData = await AsyncStorage.getItem('userData');
      const user = JSON.parse(userData);

      const visiteData = {
        id_visiteur: Number(user.id),
        id_medecin: Number(selectedMedecin.id_medecin),
        date_visite: formData.date_visite,
        heure_arrivee: formData.heure_arrivee,
        heure_debut_entretien: formData.heure_debut_entretien,
        heure_depart: formData.heure_depart,
        rendez_vous: formData.rendez_vous
      };

      console.log('Envoi des données:', visiteData);
      await createVisite(visiteData);
      Alert.alert('Succès', 'Visite enregistrée avec succès', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Erreur création visite:', error);
      Alert.alert('Erreur', 'Impossible de créer la visite');
    }
  };

  const showTimePickerFor = (field: 'arrivee' | 'debut' | 'depart') => {
    setCurrentTimeField(field);
    setShowTimePicker(true);
  };

  const renderCabinetItem = (cabinet: Cabinet) => (
    <TouchableOpacity
      key={`cabinet-${cabinet.id_cabinet}`}
      style={styles.modalItem}
      onPress={() => {
        setSelectedCabinet(cabinet);
        setShowCabinetModal(false);
      }}
    >
      <Text style={styles.modalItemTitle}>{`${cabinet.ville} - ${cabinet.code_postal}`}</Text>
      <Text style={styles.modalItemSubtitle}>{cabinet.rue}</Text>
      <Text style={styles.modalItemDistance}>{`${Math.round(cabinet.distance)} km`}</Text>
    </TouchableOpacity>
  );

  const renderTimeInput = (label: string, value: string, field: 'arrivee' | 'debut' | 'depart') => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.timePickerButton}
        onPress={() => showTimePickerFor(field)}
      >
        <Text style={styles.timePickerButtonText}>
          {value ? value.substring(0, 5) : 'Sélectionner une heure'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cabinet médical</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowCabinetModal(true)}
        >
          <Text style={styles.selectButtonText}>
            {selectedCabinet ? 
              `${selectedCabinet.ville} - ${selectedCabinet.rue}` : 
              'Sélectionner un cabinet'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Médecin</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowMedecinModal(true)}
        >
          <Text style={styles.selectButtonText}>
            {selectedMedecin ? `${selectedMedecin.prenom} ${selectedMedecin.nom}` : 'Sélectionner un médecin'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Formulaire de saisie des heures */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date de la visite</Text>
        <TextInput
          style={styles.input}
          value={formData.date_visite}
          onChangeText={(text) => setFormData({...formData, date_visite: text})}
          placeholder="YYYY-MM-DD"
        />
      </View>

      {renderTimeInput("Heure d'arrivée", formData.heure_arrivee, 'arrivee')}
      {renderTimeInput("Heure de début d'entretien", formData.heure_debut_entretien, 'debut')}
      {renderTimeInput("Heure de départ", formData.heure_depart, 'depart')}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Sur rendez-vous</Text>
        <Switch
          value={formData.rendez_vous}
          onValueChange={(value) => setFormData({...formData, rendez_vous: value})}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Enregistrer la visite</Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={handleTimeChange}
        />
      )}

      {/* Modal pour sélectionner un cabinet */}
      <Modal
        visible={showCabinetModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Sélectionner un cabinet</Text>
          <ScrollView>
            {cabinets
              .sort((a, b) => a.distance - b.distance)
              .map(renderCabinetItem)}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowCabinetModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal pour sélectionner un médecin */}
      <Modal
        visible={showMedecinModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Sélectionner un médecin</Text>
          <ScrollView>
            {medecins.map((medecin: Medecin) => (
              <TouchableOpacity
                key={`medecin-${medecin.id_medecin}`}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedMedecin(medecin);
                  setShowMedecinModal(false);
                }}
              >
                <Text>{`${medecin.prenom} ${medecin.nom}`}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowMedecinModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8'
  },
  selectButtonText: {
    fontSize: 16
  },
  submitButton: {
    backgroundColor: '#1e3c72',
    padding: 15,
    borderRadius: 8,
    marginTop: 20
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  },
  modalView: {
    flex: 1,
    marginTop: 60,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalItemDistance: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1e3c72',
    borderRadius: 8
  },
  modalCloseButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  },
  timePickerButton: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  timePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AddVisitScreen;
