import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

// Fonction pour hacher un mot de passe
async function hashPassword(password: string) {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

// ✅ Enregistre l'utilisateur et le connecte directement
export async function registerUser(email: string, password: string) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    throw new Error('Email déjà utilisé.');
  }

  const hashedPassword = await hashPassword(password);
  const doc = await addDoc(usersRef, { email, password: hashedPassword, createdAt: new Date() });

  // Stocke localement l'état connecté
  await AsyncStorage.setItem('isLoggedIn', 'true');
  await AsyncStorage.setItem('userId', doc.id);
  await AsyncStorage.setItem('userEmail', email);

  return true;
}

// ✅ Connecte un utilisateur
export async function loginUser(email: string, password: string) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('Utilisateur introuvable');
  }

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();
  const hashedPassword = await hashPassword(password);

  if (userData.password !== hashedPassword) {
    throw new Error('Mot de passe incorrect');
  }

  // Stocke localement l'état connecté
  await AsyncStorage.setItem('isLoggedIn', 'true');
  await AsyncStorage.setItem('userId', userDoc.id);
  await AsyncStorage.setItem('userEmail', userData.email);

  return {
    id: userDoc.id,
    email: userData.email,
  };
}

// ✅ Déconnecte l'utilisateur
export async function logout() {
  await AsyncStorage.removeItem('isLoggedIn');
  await AsyncStorage.removeItem('userId');
  await AsyncStorage.removeItem('userEmail');
}

// ✅ Vérifie si l'utilisateur est connecté
export async function isUserLoggedIn(): Promise<boolean> {
  const value = await AsyncStorage.getItem('isLoggedIn');
  return value === 'true';
}

// ✅ (optionnel) permet de synchroniser en live (non nécessaire ici, mais utile si tu veux écouter un logout dans un autre onglet plus tard)
export function monitorAuthState() {
  // Rien à faire dans ce cas précis car on ne peut pas écouter AsyncStorage
}

export const getCurrentUserEmail = async (): Promise<string | null> => {
  const value = await AsyncStorage.getItem('userEmail');
  return value;
};

