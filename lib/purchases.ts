/**
 * Purchases Library - Gestion des achats de modes en base de données
 *
 * Ce fichier gère :
 * - Sauvegarde des modes débloqués dans Supabase
 * - Vérification des modes achetés
 * - Synchronisation avec le cache local
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PURCHASES_CACHE_KEY = '@moody_purchased_modes';

// Types
interface ModeUnlock {
  user_id: string;
  mode_id: string;
  purchased_at: string;
  price: number;
  currency: string;
  transaction_id?: string;
}

/**
 * Sauvegarde le déblocage d'un mode en base de données
 */
export async function saveModeUnlock(
  modeId: string,
  price: number = 0,
  currency: string = 'EUR',
  transactionId?: string
): Promise<boolean> {
  try {
    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('No user logged in, saving locally only');
      await saveLocalPurchase(modeId);
      return true;
    }

    // Sauvegarder en base
    const { error } = await supabase
      .from('user_purchases')
      .upsert({
        user_id: user.id,
        mode_id: modeId,
        purchased_at: new Date().toISOString(),
        price,
        currency,
        transaction_id: transactionId,
      }, {
        onConflict: 'user_id,mode_id',
      });

    if (error) {
      console.error('Error saving purchase to Supabase:', error);
      // Fallback to local storage
      await saveLocalPurchase(modeId);
      return true;
    }

    // Sauvegarder aussi localement pour l'accès offline
    await saveLocalPurchase(modeId);

    console.log(`Mode ${modeId} unlocked and saved to database`);
    return true;

  } catch (error) {
    console.error('Error in saveModeUnlock:', error);
    // En cas d'erreur réseau, sauvegarder localement
    await saveLocalPurchase(modeId);
    return true;
  }
}

/**
 * Vérifie si un mode est débloqué (base de données + cache local)
 * STRICT: Ne retourne true que si vraiment acheté
 */
export async function hasModeUnlocked(modeId: string): Promise<boolean> {
  try {
    // Vérifier le cache local des ACHATS (pas les access keys)
    const localPurchases = await getLocalPurchases();
    if (localPurchases.includes(modeId)) {
      console.log(`Mode ${modeId} found in local purchases cache`);
      return true;
    }

    // Vérifier en base de données
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('No user logged in, cannot check DB purchases');
      return false;
    }

    const { data, error } = await supabase
      .from('user_purchases')
      .select('mode_id')
      .eq('user_id', user.id)
      .eq('mode_id', modeId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors

    if (error) {
      // Table might not exist yet
      console.log('Error checking purchase (table may not exist):', error.message);
      return false;
    }

    if (data) {
      console.log(`Mode ${modeId} found in database`);
      // Synchroniser avec le cache local
      await saveLocalPurchase(modeId);
      return true;
    }

    console.log(`Mode ${modeId} NOT found - not purchased`);
    return false;

  } catch (error) {
    console.error('Error in hasModeUnlocked:', error);
    return false; // En cas d'erreur, considérer comme non acheté
  }
}

/**
 * Récupère tous les modes débloqués pour l'utilisateur
 */
export async function getUnlockedModes(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return getLocalPurchases();
    }

    const { data, error } = await supabase
      .from('user_purchases')
      .select('mode_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching unlocked modes:', error);
      return getLocalPurchases();
    }

    const modes = data?.map(row => row.mode_id) || [];

    // Synchroniser avec le cache local
    for (const mode of modes) {
      await saveLocalPurchase(mode);
    }

    return modes;

  } catch (error) {
    console.error('Error in getUnlockedModes:', error);
    return getLocalPurchases();
  }
}

/**
 * Synchronise les achats de la base vers le cache local
 * Appelé au login pour s'assurer que l'utilisateur a accès à ses achats offline
 */
export async function syncPurchasesFromDatabase(): Promise<void> {
  try {
    const modes = await getUnlockedModes();
    console.log('Synced purchases from database:', modes);
  } catch (error) {
    console.error('Error syncing purchases:', error);
  }
}

// ============ Local Storage Helpers ============

async function saveLocalPurchase(modeId: string): Promise<void> {
  try {
    const purchases = await getLocalPurchases();
    if (!purchases.includes(modeId)) {
      purchases.push(modeId);
      await AsyncStorage.setItem(PURCHASES_CACHE_KEY, JSON.stringify(purchases));
    }
  } catch (error) {
    console.error('Error saving local purchase:', error);
  }
}

async function getLocalPurchases(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(PURCHASES_CACHE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting local purchases:', error);
    return [];
  }
}

/**
 * Efface le cache local des achats (pour debug/logout)
 */
export async function clearLocalPurchases(): Promise<void> {
  await AsyncStorage.removeItem(PURCHASES_CACHE_KEY);
}

/**
 * Debug: Affiche l'état des achats (local + base)
 */
export async function debugPurchaseStatus(): Promise<{
  localPurchases: string[];
  dbPurchases: string[];
  userId: string | null;
}> {
  const localPurchases = await getLocalPurchases();

  let dbPurchases: string[] = [];
  let userId: string | null = null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id || null;

    if (user) {
      const { data } = await supabase
        .from('user_purchases')
        .select('mode_id')
        .eq('user_id', user.id);

      dbPurchases = data?.map(row => row.mode_id) || [];
    }
  } catch (error) {
    console.error('Debug error:', error);
  }

  console.log('=== PURCHASE DEBUG ===');
  console.log('User ID:', userId);
  console.log('Local purchases:', localPurchases);
  console.log('DB purchases:', dbPurchases);
  console.log('======================');

  return { localPurchases, dbPurchases, userId };
}

/**
 * Reset complet des achats (pour debug uniquement)
 * Supprime en local ET en base de données
 */
export async function resetAllPurchases(): Promise<void> {
  // Clear local cache
  await AsyncStorage.removeItem(PURCHASES_CACHE_KEY);

  // Clear old auth-based purchases
  await AsyncStorage.removeItem('@moody_purchased_modes');

  // Clear access keys
  const keys = await AsyncStorage.getAllKeys();
  const accessKeys = keys.filter(k => k.startsWith('@moody_access_'));
  if (accessKeys.length > 0) {
    await AsyncStorage.multiRemove(accessKeys);
  }

  // Clear from database
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('user_purchases')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.log('Error clearing DB purchases (table may not exist):', error.message);
      } else {
        console.log('DB purchases cleared for user:', user.id);
      }
    }
  } catch (error) {
    console.error('Error clearing DB purchases:', error);
  }

  console.log('All purchase data cleared (local + DB)');
}
