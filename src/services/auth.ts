import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

export const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('userToken');
};

export const getCurrentUser = async (): Promise<User | null> => {
  const userData = await AsyncStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const setAuth = async (token: string, user: User) => {
  await AsyncStorage.setItem('userToken', token);
  await AsyncStorage.setItem('userData', JSON.stringify(user));
};

export const clearAuth = async () => {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('userData');
};
