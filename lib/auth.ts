import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// ✅ Enregistre l'utilisateur et le connecte directement
export async function registerUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('already registered')) {
      throw new Error('Email déjà utilisé.');
    }
    throw error;
  }

  if (data.user) {
    // Stocke localement l'état connecté
    await AsyncStorage.setItem('isLoggedIn', 'true');
    await AsyncStorage.setItem('userId', data.user.id);
    await AsyncStorage.setItem('userEmail', email);
    await AsyncStorage.setItem('showLoginModal', 'true');
  }

  return true;
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login')) {
      throw new Error('Utilisateur introuvable ou mot de passe incorrect');
    }
    throw error;
  }

  if (data.user) {
    // Stocke localement l'état connecté
    await AsyncStorage.setItem('isLoggedIn', 'true');
    await AsyncStorage.setItem('userId', data.user.id);
    await AsyncStorage.setItem('userEmail', data.user.email || email);
    await AsyncStorage.setItem('showLoginModal', 'true');
  }

  return {
    id: data.user?.id || '',
    email: data.user?.email || email,
  };
}

// ✅ Déconnecte l'utilisateur
export async function logout() {
  await supabase.auth.signOut();
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
  // Supabase handles this via onAuthStateChange
}

export const getCurrentUserEmail = async (): Promise<string | null> => {
  const value = await AsyncStorage.getItem('userEmail');
  return value;
};

// Vérifie si le compte utilisateur est encore valide en ligne
export async function isAccountStillValidOnline(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
}
