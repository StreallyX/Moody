import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getChallenges,
  getMiniGames,
  getModes,
  getRandomChallenge,
  Challenge,
  MiniGame,
  GameMode,
} from '../services/contentService';

const CACHE_PREFIX = 'game_content_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CachedData<T> {
  data: T;
  timestamp: number;
}

async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;

    const parsed: CachedData<T> = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_EXPIRY) {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

async function setCachedData<T>(key: string, data: T): Promise<void> {
  try {
    const cacheEntry: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error('Error caching data:', error);
  }
}

export function useGameContent(language: string = 'en') {
  const [challenges, setChallenges] = useState<Record<string, Challenge[]>>({});
  const [miniGames, setMiniGames] = useState<MiniGame[]>([]);
  const [modes, setModes] = useState<GameMode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedChallengeIds, setUsedChallengeIds] = useState<string[]>([]);

  const loadChallengesByMode = useCallback(
    async (mode: string, forceRefresh: boolean = false) => {
      const cacheKey = `challenges_${mode}_${language}`;

      if (!forceRefresh) {
        const cached = await getCachedData<Challenge[]>(cacheKey);
        if (cached) {
          setChallenges((prev) => ({ ...prev, [mode]: cached }));
          return cached;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getChallenges(mode, language);
        setChallenges((prev) => ({ ...prev, [mode]: data }));
        await setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        setError('Failed to load challenges');
        // Try to return cached data as fallback
        const cached = await getCachedData<Challenge[]>(cacheKey);
        if (cached) {
          setChallenges((prev) => ({ ...prev, [mode]: cached }));
          return cached;
        }
        return [];
      } finally {
        setLoading(false);
      }
    },
    [language]
  );

  const loadMiniGames = useCallback(
    async (forceRefresh: boolean = false) => {
      const cacheKey = `minigames_${language}`;

      if (!forceRefresh) {
        const cached = await getCachedData<MiniGame[]>(cacheKey);
        if (cached) {
          setMiniGames(cached);
          return cached;
        }
      }

      setLoading(true);
      try {
        const data = await getMiniGames(language);
        setMiniGames(data);
        await setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        const cached = await getCachedData<MiniGame[]>(cacheKey);
        if (cached) {
          setMiniGames(cached);
          return cached;
        }
        return [];
      } finally {
        setLoading(false);
      }
    },
    [language]
  );

  const loadModes = useCallback(
    async (forceRefresh: boolean = false) => {
      const cacheKey = `modes_${language}`;

      if (!forceRefresh) {
        const cached = await getCachedData<GameMode[]>(cacheKey);
        if (cached) {
          setModes(cached);
          return cached;
        }
      }

      setLoading(true);
      try {
        const data = await getModes(language);
        setModes(data);
        await setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        const cached = await getCachedData<GameMode[]>(cacheKey);
        if (cached) {
          setModes(cached);
          return cached;
        }
        return [];
      } finally {
        setLoading(false);
      }
    },
    [language]
  );

  const getNextChallenge = useCallback(
    async (mode: string): Promise<Challenge | null> => {
      const challenge = await getRandomChallenge(mode, usedChallengeIds);
      if (challenge) {
        setUsedChallengeIds((prev) => [...prev, challenge.id]);
      }
      return challenge;
    },
    [usedChallengeIds]
  );

  const resetUsedChallenges = useCallback(() => {
    setUsedChallengeIds([]);
  }, []);

  const clearCache = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  return {
    challenges,
    miniGames,
    modes,
    loading,
    error,
    loadChallengesByMode,
    loadMiniGames,
    loadModes,
    getNextChallenge,
    resetUsedChallenges,
    clearCache,
  };
}
