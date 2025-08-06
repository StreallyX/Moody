import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
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

  // Ajoute admin=false par défaut
  const docRef = await addDoc(usersRef, { 
    email, 
    password: hashedPassword, 
    admin: false, 
    createdAt: new Date() 
  });

  // Stocke localement l'état connecté
  await AsyncStorage.setItem('isLoggedIn', 'true');
  await AsyncStorage.setItem('userId', docRef.id);
  await AsyncStorage.setItem('userEmail', email);
  await AsyncStorage.setItem('showLoginModal', 'true');

  return true;
}

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

  // 🔥 Met à jour la date de dernière connexion
  const userDocRef = doc(db, 'users', userDoc.id);
  await updateDoc(userDocRef, {
    lastLogin: new Date(),
  });

  // Stocke localement l'état connecté
  await AsyncStorage.setItem('isLoggedIn', 'true');
  await AsyncStorage.setItem('userId', userDoc.id);
  await AsyncStorage.setItem('userEmail', userData.email);
  await AsyncStorage.setItem('showLoginModal', 'true');

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

// (optionnel) permet de synchroniser en live
export function monitorAuthState() {
  // Rien à faire ici pour AsyncStorage
}

export const getCurrentUserEmail = async (): Promise<string | null> => {
  const value = await AsyncStorage.getItem('userEmail');
  return value;
};

// Vérifie si le compte utilisateur est encore valide en ligne
export async function isAccountStillValidOnline(): Promise<boolean> {
  const userId = await AsyncStorage.getItem('userId');
  if (!userId) return false;

  const userDocRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userDocRef);

  if (!userSnap.exists()) return false;

  // 🔥 Met à jour la date de dernière connexion
  await updateDoc(userDocRef, {
    lastLogin: new Date(),
  });

  return true;
}
