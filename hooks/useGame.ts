import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import challenge data
import friendlyFr from '../app/data/challenges/fr/friendly.json';
import friendlyEn from '../app/data/challenges/en/friendly.json';
import spicyFr from '../app/data/challenges/fr/spicy.json';
import spicyEn from '../app/data/challenges/en/spicy.json';
import couplesFr from '../app/data/challenges/fr/couples.json';
import couplesEn from '../app/data/challenges/en/couples.json';

const GAME_STATE_KEY = '@moody_game_v2';
const CARDS_PER_LEVEL = 10;
const MAX_LEVEL = 5;
const TOTAL_CARDS = CARDS_PER_LEVEL * MAX_LEVEL;

export interface Challenge {
  id: string;
  type: 'truth' | 'dare' | 'group';
  text: string;
}

// Raw JSON challenge type (before casting)
interface RawChallenge {
  id: string;
  type: string;
  text: string;
}

type RawChallengesByLevel = Record<string, RawChallenge[]>;

// Challenge data organized by mode and language
const CHALLENGE_DATA: Record<string, Record<string, RawChallengesByLevel>> = {
  friendly: { fr: friendlyFr as RawChallengesByLevel, en: friendlyEn as RawChallengesByLevel },
  spicy: { fr: spicyFr as RawChallengesByLevel, en: spicyEn as RawChallengesByLevel },
  couples: { fr: couplesFr as RawChallengesByLevel, en: couplesEn as RawChallengesByLevel },
};

export interface GameState {
  players: string[];
  mode: string;
  deck: Challenge[];
  currentIndex: number;
  playerIndex: number;
  isComplete: boolean;
  // For infinite mode after level 5
  extraCardsAdded: number;
  // Drink tracking per player
  drinks: Record<string, number>;
}

interface UseGameOptions {
  players: string[];
  mode: string;
}

interface UseGameReturn {
  // State
  currentChallenge: Challenge | null;
  currentPlayer: string;
  secondPlayer: string;
  thirdPlayer: string;
  leastDrunkPlayer: string;
  currentRound: number;
  currentLevel: number;
  isGameComplete: boolean;
  isLoading: boolean;
  drinks: Record<string, number>;

  // Actions
  nextCard: () => void;
  addDrink: (playerName: string, amount?: number) => void;
  restartGame: () => void;
  endGame: () => Promise<void>;
}

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Get extra level 5 cards for infinite mode
function getExtraLevel5Cards(mode: string, language: string, count: number): Challenge[] {
  const modeData = CHALLENGE_DATA[mode] || CHALLENGE_DATA['friendly'];
  const langData = modeData[language] || modeData['en'];
  const level5Challenges = langData['5'] || [];

  if (level5Challenges.length === 0) return [];

  const shuffled = shuffle(level5Challenges);
  const selected = shuffled.slice(0, count);

  return selected.map((raw) => ({
    id: `${raw.id}_extra_${Date.now()}`,
    type: raw.type as 'truth' | 'dare' | 'group',
    text: raw.text,
  }));
}

// Build a deck of 50 cards (10 per level, shuffled within each level)
function buildDeck(mode: string, language: string): Challenge[] {
  const modeData = CHALLENGE_DATA[mode];
  if (!modeData) {
    console.warn(`Mode "${mode}" not found, using "friendly"`);
    return buildDeck('friendly', language);
  }

  const langData = modeData[language] || modeData['en'];
  if (!langData) {
    console.warn(`Language "${language}" not found for mode "${mode}"`);
    return [];
  }

  const deck: Challenge[] = [];

  // For each level (1-5), pick 10 random cards
  for (let level = 1; level <= MAX_LEVEL; level++) {
    const levelKey = String(level);
    const levelChallenges = langData[levelKey] || [];

    if (levelChallenges.length === 0) {
      console.warn(`No challenges found for level ${level} in mode ${mode}`);
      continue;
    }

    // Shuffle and pick 10 cards from this level
    const shuffled = shuffle(levelChallenges);
    const selected = shuffled.slice(0, CARDS_PER_LEVEL);

    // Cast raw challenges to Challenge type
    const typedChallenges: Challenge[] = selected.map((raw) => ({
      id: raw.id,
      type: raw.type as 'truth' | 'dare' | 'group',
      text: raw.text,
    }));

    deck.push(...typedChallenges);
  }

  return deck;
}

export function useGame({ players, mode }: UseGameOptions): UseGameReturn {
  const { i18n } = useTranslation();
  const language = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize or restore game
  useEffect(() => {
    const initGame = async () => {
      setIsLoading(true);

      try {
        // Try to load existing game
        const savedData = await AsyncStorage.getItem(GAME_STATE_KEY);
        if (savedData) {
          const saved = JSON.parse(savedData) as GameState;
          // Check if it's the same game (same players and mode)
          if (
            saved.mode === mode &&
            saved.players.length === players.length &&
            saved.players.every((p, i) => p === players[i]) &&
            !saved.isComplete
          ) {
            setGameState(saved);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error('Error loading game state:', e);
      }

      // Create new game
      const deck = buildDeck(mode, language);
      const initialDrinks: Record<string, number> = {};
      players.forEach(p => { initialDrinks[p] = 0; });

      const newGame: GameState = {
        players,
        mode,
        deck,
        currentIndex: 0,
        playerIndex: 0,
        isComplete: false,
        extraCardsAdded: 0,
        drinks: initialDrinks,
      };

      setGameState(newGame);
      await saveState(newGame);
      setIsLoading(false);
    };

    if (players.length > 0) {
      initGame();
    }
  }, [players, mode, language]);

  // Save state helper
  const saveState = useCallback(async (state: GameState) => {
    try {
      await AsyncStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving game state:', e);
    }
  }, []);

  // Current challenge
  const currentChallenge = useMemo(() => {
    if (!gameState || gameState.isComplete) return null;
    return gameState.deck[gameState.currentIndex] || null;
  }, [gameState]);

  // Current player (round-robin rotation)
  const currentPlayer = useMemo(() => {
    if (!gameState || gameState.players.length === 0) return '';
    return gameState.players[gameState.playerIndex];
  }, [gameState]);

  // Second player (for duo challenges)
  const secondPlayer = useMemo(() => {
    if (!gameState || gameState.players.length < 2) return '';
    const nextIndex = (gameState.playerIndex + 1) % gameState.players.length;
    return gameState.players[nextIndex];
  }, [gameState]);

  // Third player (for trio challenges)
  const thirdPlayer = useMemo(() => {
    if (!gameState || gameState.players.length < 3) return '';
    const nextIndex = (gameState.playerIndex + 2) % gameState.players.length;
    return gameState.players[nextIndex];
  }, [gameState]);

  // Player who has drunk the least (for balancing)
  const leastDrunkPlayer = useMemo(() => {
    if (!gameState || gameState.players.length === 0) return '';
    const { players } = gameState;
    const drinks = gameState.drinks || {};
    let minDrinks = Infinity;
    let minPlayer = players[0];

    players.forEach(p => {
      const playerDrinks = drinks[p] || 0;
      if (playerDrinks < minDrinks) {
        minDrinks = playerDrinks;
        minPlayer = p;
      }
    });

    return minPlayer;
  }, [gameState]);

  // Current round (1-indexed)
  const currentRound = useMemo(() => {
    if (!gameState) return 1;
    return gameState.currentIndex + 1;
  }, [gameState]);

  // Current level (1-5)
  const currentLevel = useMemo(() => {
    if (!gameState) return 1;
    return Math.min(Math.ceil(currentRound / CARDS_PER_LEVEL), MAX_LEVEL);
  }, [currentRound]);

  // Is game complete - now never true, infinite mode!
  const isGameComplete = useMemo(() => {
    return false; // Game never ends, infinite mode
  }, []);

  // Next card action
  const nextCard = useCallback(() => {
    if (!gameState) return;

    const nextIndex = gameState.currentIndex + 1;

    // Rotate to next player
    const nextPlayerIndex = (gameState.playerIndex + 1) % gameState.players.length;

    // Check if we need more cards (infinite mode after level 5)
    let newDeck = gameState.deck;
    let extraCardsAdded = gameState.extraCardsAdded;

    if (nextIndex >= newDeck.length) {
      // Add 10 more level 5 cards
      const extraCards = getExtraLevel5Cards(mode, language, CARDS_PER_LEVEL);
      newDeck = [...newDeck, ...extraCards];
      extraCardsAdded += CARDS_PER_LEVEL;
    }

    const newState: GameState = {
      ...gameState,
      deck: newDeck,
      currentIndex: nextIndex,
      playerIndex: nextPlayerIndex,
      isComplete: false,
      extraCardsAdded,
    };

    setGameState(newState);
    saveState(newState);
  }, [gameState, mode, language, saveState]);

  // Add drink to a player
  const addDrink = useCallback((playerName: string, amount: number = 1) => {
    if (!gameState) return;

    const newDrinks = { ...(gameState.drinks || {}) };
    newDrinks[playerName] = (newDrinks[playerName] || 0) + amount;

    const newState: GameState = {
      ...gameState,
      drinks: newDrinks,
    };

    setGameState(newState);
    saveState(newState);
  }, [gameState, saveState]);

  // Restart game
  const restartGame = useCallback(() => {
    const deck = buildDeck(mode, language);
    const initialDrinks: Record<string, number> = {};
    players.forEach(p => { initialDrinks[p] = 0; });

    const newGame: GameState = {
      players,
      mode,
      deck,
      currentIndex: 0,
      playerIndex: 0,
      isComplete: false,
      extraCardsAdded: 0,
      drinks: initialDrinks,
    };

    setGameState(newGame);
    saveState(newGame);
  }, [players, mode, language, saveState]);

  // End game (clear state)
  const endGame = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(GAME_STATE_KEY);
      setGameState(null);
    } catch (e) {
      console.error('Error clearing game state:', e);
    }
  }, []);

  // Current drinks
  const drinks = useMemo(() => {
    return gameState?.drinks || {};
  }, [gameState]);

  return {
    currentChallenge,
    currentPlayer,
    secondPlayer,
    thirdPlayer,
    leastDrunkPlayer,
    currentRound,
    currentLevel,
    isGameComplete,
    isLoading,
    drinks,
    nextCard,
    addDrink,
    restartGame,
    endGame,
  };
}

export default useGame;
