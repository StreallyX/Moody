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
  // Note: On ne révoque pas les accès offline ici pour permettre
  // à l'utilisateur de jouer même déconnecté pendant 1 semaine
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

// ========== Système de clé locale pour accès offline ==========

const ACCESS_KEY_PREFIX = '@moody_access_';
const ACCESS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 1 semaine

interface AccessKey {
  grantedAt: number;
  expiresAt: number;
  userId: string;
}

// Accorde l'accès à un mode (appelé après connexion/achat réussi)
export async function grantModeAccess(mode: string): Promise<void> {
  const userId = await AsyncStorage.getItem('userId');
  if (!userId) return;

  const key: AccessKey = {
    grantedAt: Date.now(),
    expiresAt: Date.now() + ACCESS_DURATION_MS,
    userId,
  };

  await AsyncStorage.setItem(`${ACCESS_KEY_PREFIX}${mode}`, JSON.stringify(key));
}

// Vérifie si l'utilisateur a accès à un mode (même offline)
export async function hasModeAccess(mode: string): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(`${ACCESS_KEY_PREFIX}${mode}`);
    if (!data) return false;

    const key: AccessKey = JSON.parse(data);
    const userId = await AsyncStorage.getItem('userId');

    // Vérifie que la clé appartient à l'utilisateur actuel et n'est pas expirée
    if (key.userId !== userId) return false;
    if (Date.now() > key.expiresAt) {
      // Clé expirée, on la supprime
      await AsyncStorage.removeItem(`${ACCESS_KEY_PREFIX}${mode}`);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// Renouvelle l'accès (appelé quand l'utilisateur est online et vérifié)
export async function refreshModeAccess(mode: string): Promise<void> {
  const hasAccess = await hasModeAccess(mode);
  if (hasAccess) {
    await grantModeAccess(mode);
  }
}

// Révoque l'accès à un mode
export async function revokeModeAccess(mode: string): Promise<void> {
  await AsyncStorage.removeItem(`${ACCESS_KEY_PREFIX}${mode}`);
}

// Révoque tous les accès (appelé à la déconnexion)
export async function revokeAllAccess(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const accessKeys = keys.filter(k => k.startsWith(ACCESS_KEY_PREFIX));
  if (accessKeys.length > 0) {
    await AsyncStorage.multiRemove(accessKeys);
  }
}

// ========== Gestion des achats de modes ==========

const PURCHASED_MODES_KEY = '@moody_purchased_modes';

export async function purchaseMode(mode: string): Promise<void> {
  const purchased = await getPurchasedModes();
  if (!purchased.includes(mode)) {
    purchased.push(mode);
    await AsyncStorage.setItem(PURCHASED_MODES_KEY, JSON.stringify(purchased));
  }
  // Accorde aussi l'accès offline
  await grantModeAccess(mode);
}

export async function getPurchasedModes(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(PURCHASED_MODES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function hasModePurchased(mode: string): Promise<boolean> {
  const purchased = await getPurchasedModes();
  return purchased.includes(mode);
}
