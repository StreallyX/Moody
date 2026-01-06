// React Hook wrapper for GameEngine

import { useState, useCallback, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import {
  GameEngine,
  GameEngineCallbacks,
  GameState,
  GameConfig,
  Player,
  Challenge,
  MiniGame,
  GameEvent,
  MiniGameResult,
} from '../src/engine';
import { GameState as StorageGameState } from '../lib/storage';

// Legacy interface for play.tsx compatibility
interface NextChallengeOptions {
  level?: number;
  target?: string;
}

export interface UseGameEngineReturn {
  // State
  state: GameState | null;
  currentPlayer: Player | null;
  isLoading: boolean;
  error: string | null;

  // Current action
  currentChallenge: Challenge | null;
  currentMiniGame: MiniGame | null;
  currentEvent: GameEvent | null;

  // Actions
  initializeGame: (config: GameConfig, players: Omit<Player, 'score' | 'drinks' | 'penalties' | 'jokers' | 'isActive'>[]) => Promise<void>;
  getNextAction: () => Promise<void>;
  completeChallenge: (completed: boolean) => void;
  startMiniGame: () => Promise<void>;
  endMiniGame: () => Promise<MiniGameResult | null>;
  triggerEvent: () => void;
  useJoker: () => boolean;
  nextTurn: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;

  // Persistence
  saveGame: () => string;
  loadGame: (json: string) => boolean;
  
  // Legacy support
  nextChallenge: (options?: NextChallengeOptions) => void;
}

// Overloaded function signatures
export function useGameEngine(): UseGameEngineReturn;
export function useGameEngine(
  game: StorageGameState | null,
  setGame: Dispatch<SetStateAction<StorageGameState | null>>,
  setCurrent: Dispatch<SetStateAction<unknown>>
): { nextChallenge: (options?: NextChallengeOptions) => void };
export function useGameEngine(
  game?: StorageGameState | null,
  setGame?: Dispatch<SetStateAction<StorageGameState | null>>,
  setCurrent?: Dispatch<SetStateAction<unknown>>
): UseGameEngineReturn | { nextChallenge: (options?: NextChallengeOptions) => void } {
  // Legacy mode - when called with game state arguments
  if (game !== undefined && setGame !== undefined && setCurrent !== undefined) {
    const nextChallenge = useCallback((options: NextChallengeOptions = {}) => {
      // Legacy implementation - advance to next challenge
      if (!game) return;
      
      // Update game state - increment rounds and update heat
      const newRounds = game.rounds + 1;
      const newHeat = Math.min(5, Math.floor(newRounds / 10) + 1);
      
      // Apply level from options if provided (e.g., from roulette)
      const effectiveHeat = options.level ?? newHeat;
      
      const updatedGame = {
        ...game,
        rounds: newRounds,
        heat: effectiveHeat,
      };
      
      setGame(updatedGame);
      
      // Fetch a random challenge from localized data
      // Import data based on language (default to English)
      const lang = typeof window !== 'undefined' && window.navigator?.language?.startsWith('fr') ? 'fr' : 'en';
      const challenges = lang === 'fr' 
        ? require('../app/data/datafr.json') 
        : require('../app/data/dataen.json');
      
      // Filter challenges by mode and heat level
      const validChallenges = challenges.filter((c: { modes?: string[]; level?: number }) => {
        const modeMatch = !c.modes || c.modes.includes(game.mode);
        const levelMatch = c.level === undefined || c.level <= effectiveHeat;
        return modeMatch && levelMatch;
      });
      
      if (validChallenges.length > 0) {
        // Pick a random challenge
        const randomIndex = Math.floor(Math.random() * validChallenges.length);
        const challenge = validChallenges[randomIndex];
        
        // Add targets (random players) for challenges that need them
        const targets = game.players.length >= 2 
          ? game.players.sort(() => Math.random() - 0.5).slice(0, 2)
          : game.players;
        
        setCurrent({
          ...challenge,
          targets,
        });
      } else {
        // Fallback: pick any challenge if no valid ones found
        const randomIndex = Math.floor(Math.random() * challenges.length);
        setCurrent(challenges[randomIndex]);
      }
    }, [game, setGame, setCurrent]);
    
    return { nextChallenge };
  }
  
  // Modern mode - full engine wrapper
  return useGameEngineInternal();
}

function useGameEngineInternal(): UseGameEngineReturn {
  const engineRef = useRef<GameEngine | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [currentMiniGame, setCurrentMiniGame] = useState<MiniGame | null>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);

  // Initialize engine with callbacks
  useEffect(() => {
    const engine = new GameEngine();
    
    const callbacks: GameEngineCallbacks = {
      onStateChange: (newState) => setState({ ...newState }),
      onChallenge: (challenge) => setCurrentChallenge(challenge),
      onMiniGameStart: (miniGame) => setCurrentMiniGame(miniGame),
      onMiniGameEnd: () => setCurrentMiniGame(null),
      onEvent: (event) => setCurrentEvent(event),
      onGameEnd: () => {
        setCurrentChallenge(null);
        setCurrentMiniGame(null);
        setCurrentEvent(null);
      },
    };
    
    engine.setCallbacks(callbacks);
    engineRef.current = engine;

    return () => {
      engineRef.current = null;
    };
  }, []);

  const initializeGame = useCallback(async (
    config: GameConfig,
    players: Omit<Player, 'score' | 'drinks' | 'penalties' | 'jokers' | 'isActive'>[]
  ) => {
    if (!engineRef.current) return;
    setIsLoading(true);
    setError(null);
    try {
      await engineRef.current.initialize(config, players);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initialize game');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getNextAction = useCallback(async () => {
    if (!engineRef.current) return;
    setIsLoading(true);
    try {
      const action = await engineRef.current.getNextAction();
      if (action) {
        switch (action.type) {
          case 'challenge':
            setCurrentChallenge(action.data as Challenge);
            setCurrentMiniGame(null);
            setCurrentEvent(null);
            break;
          case 'miniGame':
            setCurrentMiniGame(action.data as MiniGame);
            setCurrentChallenge(null);
            setCurrentEvent(null);
            break;
          case 'event':
            setCurrentEvent(action.data as GameEvent);
            setCurrentChallenge(null);
            setCurrentMiniGame(null);
            break;
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get next action');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeChallenge = useCallback((completed: boolean) => {
    if (!engineRef.current || !currentChallenge) return;
    engineRef.current.completeChallenge(currentChallenge, completed);
    setCurrentChallenge(null);
  }, [currentChallenge]);

  const startMiniGame = useCallback(async () => {
    if (!engineRef.current || !currentMiniGame) return;
    await engineRef.current.startMiniGame(currentMiniGame);
  }, [currentMiniGame]);

  const endMiniGame = useCallback(async () => {
    if (!engineRef.current) return null;
    const result = await engineRef.current.endMiniGame();
    setCurrentMiniGame(null);
    return result;
  }, []);

  const triggerEvent = useCallback(() => {
    if (!engineRef.current || !currentEvent) return;
    engineRef.current.triggerEvent(currentEvent);
    setCurrentEvent(null);
  }, [currentEvent]);

  const useJoker = useCallback(() => {
    if (!engineRef.current) return false;
    const success = engineRef.current.useJoker();
    if (success) {
      setCurrentChallenge(null);
    }
    return success;
  }, []);

  const nextTurn = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.nextTurn();
  }, []);

  const pauseGame = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.pause();
  }, []);

  const resumeGame = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.resume();
  }, []);

  const endGame = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.endGame();
  }, []);

  const saveGame = useCallback(() => {
    if (!engineRef.current) return '{}';
    return engineRef.current.saveState();
  }, []);

  const loadGame = useCallback((json: string) => {
    if (!engineRef.current) return false;
    return engineRef.current.loadState(json);
  }, []);

  const nextChallenge = useCallback((_options?: NextChallengeOptions) => {
    getNextAction();
  }, [getNextAction]);

  return {
    state,
    currentPlayer: state ? state.players[state.currentPlayerIndex] : null,
    isLoading,
    error,
    currentChallenge,
    currentMiniGame,
    currentEvent,
    initializeGame,
    getNextAction,
    completeChallenge,
    startMiniGame,
    endMiniGame,
    triggerEvent,
    useJoker,
    nextTurn,
    pauseGame,
    resumeGame,
    endGame,
    saveGame,
    loadGame,
    nextChallenge,
  };
}
