/**
 * Service d'API pour communiquer avec le backend
 * Contient toutes les fonctions de communication avec l'API
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de base de l'API - À MODIFIER selon votre environnement
const BASE_URL = 'https://s5-4242.nuage-peda.fr/gsbvttMobile/API';

// Types de données pour la connexion
interface LoginResponse {
  status: string;
  message: string;
  user: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  token: string;
}

// Types pour les visites
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

interface CreateVisiteData {
  id_visiteur: number;
  id_medecin: number;
  date_visite: string;
  heure_arrivee: string;
  heure_debut_entretien: string;
  heure_depart: string;
  rendez_vous: boolean;
}

// Fonction utilitaire pour formater les heures
const formatDateTime = (date: string, time: string): string => {
  // Formate date et heure au format MySQL datetime (YYYY-MM-DD HH:MM:SS)
  return `${date} ${time}`;
}

const formatTimeValue = (minutes: number): string => {
  // Convertit les minutes en format time MySQL (HH:MM:SS)
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
}

// Fonction de connexion
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    // Appel à l'API pour la connexion
    const response = await fetch(`${BASE_URL}/ApiAuth.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Récupération des données
    const data = await response.json();
    
    // Vérification de la réponse
    if (!response.ok) {
      throw new Error(data.message || 'Erreur de connexion');
    }

    return data;
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
};

// Fonction pour les requêtes authentifiées
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  try {
    // Récupération du token d'authentification
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      throw new Error('Token non trouvé');
    }

    // Appel à l'API avec le token
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Récupération des données
    const data = await response.json();
    
    // Vérification de la réponse
    if (!response.ok) {
      throw new Error(data.message || 'Erreur API');
    }

    return data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

// Récupération des visites
export const fetchVisites = async () => {
  return fetchWithAuth('/ApiVisite.php');
};

// Création d'une visite
export const createVisite = async (visiteData: CreateVisiteData) => {
  try {
    // Formatage des datetime pour MySQL
    const dateTime_arrivee = formatDateTime(visiteData.date_visite, visiteData.heure_arrivee);
    const dateTime_debut = formatDateTime(visiteData.date_visite, visiteData.heure_debut_entretien);
    const dateTime_depart = formatDateTime(visiteData.date_visite, visiteData.heure_depart);

    // Calcul des temps d'attente et de visite en minutes
    const [hA, mA] = visiteData.heure_arrivee.split(':').map(Number);
    const [hD, mD] = visiteData.heure_debut_entretien.split(':').map(Number);
    const [hF, mF] = visiteData.heure_depart.split(':').map(Number);

    const tempsAttenteMinutes = Math.max(0, (hD * 60 + mD) - (hA * 60 + mA));
    const tempsVisiteMinutes = Math.max(0, (hF * 60 + mF) - (hA * 60 + mA));

    // Préparation des données pour l'API
    const formattedData = {
      id_visiteur: Number(visiteData.id_visiteur),
      id_medecin: Number(visiteData.id_medecin),
      date_visite: visiteData.date_visite,
      heure_arrivee: dateTime_arrivee,
      heure_debut_entretien: dateTime_debut,
      heure_depart: dateTime_depart,
      temps_attente: formatTimeValue(tempsAttenteMinutes),
      temps_visite: formatTimeValue(tempsVisiteMinutes),
      rendez_vous: visiteData.rendez_vous ? 1 : 0 // Convertir boolean en 0/1
    };

    return fetchWithAuth('/ApiVisite.php', {
      method: 'POST',
      body: JSON.stringify(formattedData),
    });
  } catch (error) {
    console.error('Erreur création visite:', error);
    throw error;
  }
};

// Récupération des cabinets médicaux
export const fetchCabinets = async (latitude?: number, longitude?: number) => {
  const params = latitude && longitude ? `?latitude=${latitude}&longitude=${longitude}` : '';
  return fetchWithAuth(`/ApiCabinet.php${params}`);
};

// Récupération des médecins
export const fetchMedecins = async () => {
  return fetchWithAuth('/ApiMedecin.php');
};

// Récupération d'une visite spécifique
export const getVisite = async (id: number): Promise<VisiteDetails> => {
  return fetchWithAuth(`/ApiVisite.php?id=${id}`);
};

// Mise à jour d'une visite
export const updateVisite = async (visiteData: VisiteDetails) => {
  // Conversion du boolean en 0/1 si nécessaire
  const formattedData = {
    ...visiteData,
    rendez_vous: typeof visiteData.rendez_vous === 'boolean' 
      ? (visiteData.rendez_vous ? 1 : 0) 
      : visiteData.rendez_vous
  };
  
  return fetchWithAuth('/ApiVisite.php', {
    method: 'PUT',
    body: JSON.stringify(formattedData),
  });
};

// Suppression d'une visite
export const deleteVisite = async (id: number) => {
  return fetchWithAuth(`/ApiVisite.php`, {
    method: 'DELETE',
    body: JSON.stringify({ id_visite: id }),
  });
};
