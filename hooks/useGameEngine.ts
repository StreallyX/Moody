// React Hook wrapper for GameEngine

import { useState, useCallback, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import {
  GameEngine,
  GameEngineCallbacks,
  GameState,
  GameConfig,
  Player,
  Challenge,
  GameEvent,
} from '../src/engine';
import { GameState as StorageGameState } from '../lib/storage';

// Import new JSON data files
import friendlyData from '../app/data/friendly.json';
import spicyData from '../app/data/spicy.json';
import couplesData from '../app/data/couples.json';

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
  currentEvent: GameEvent | null;

  // Actions
  initializeGame: (config: GameConfig, players: Omit<Player, 'score' | 'drinks' | 'penalties' | 'jokers' | 'isActive'>[]) => Promise<void>;
  getNextAction: () => Promise<void>;
  completeChallenge: (completed: boolean) => void;
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
      // Heat increases every 10 rounds (1-10: heat 1, 11-20: heat 2, etc.)
      const newHeat = Math.min(5, Math.floor((newRounds - 1) / 10) + 1);

      // Apply level from options if provided
      const effectiveHeat = options.level ?? newHeat;

      const updatedGame = {
        ...game,
        rounds: newRounds,
        heat: effectiveHeat,
      };

      setGame(updatedGame);

      // Get data based on game mode
      type HeatData = Record<string, Array<{ type: string; text: string; variant?: string }>>;
      let modeData: HeatData;

      switch (game.mode) {
        case 'spicy':
        case 'hard':
        case 'caliente':
          modeData = spicyData as HeatData;
          break;
        case 'couples':
          modeData = couplesData as HeatData;
          break;
        case 'friends':
        case 'soft':
        default:
          modeData = friendlyData as HeatData;
          break;
      }

      // Get challenges for current heat level
      const heatKey = String(effectiveHeat);
      const challenges = modeData[heatKey] || modeData['1'] || [];

      if (challenges.length > 0) {
        // Pick a random challenge from current heat level
        const randomIndex = Math.floor(Math.random() * challenges.length);
        const challenge = challenges[randomIndex];

        // Shuffle players for random selection
        const shuffledPlayers = [...game.players].sort(() => Math.random() - 0.5);
        const selectedPlayer = shuffledPlayers[0];

        // Replace %PLAYER% placeholder with actual player name
        const processedText = challenge.text.replace(/%PLAYER%/g, selectedPlayer);

        setCurrent({
          id: `${game.mode}_${effectiveHeat}_${randomIndex}`,
          type: challenge.type,
          text: processedText,
          variant: challenge.variant,
          heat: effectiveHeat,
          targets: shuffledPlayers.slice(0, 2),
        });
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
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);

  // Initialize engine with callbacks
  useEffect(() => {
    const engine = new GameEngine();

    const callbacks: GameEngineCallbacks = {
      onStateChange: (newState) => setState({ ...newState }),
      onChallenge: (challenge) => setCurrentChallenge(challenge),
      onEvent: (event) => setCurrentEvent(event),
      onGameEnd: () => {
        setCurrentChallenge(null);
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
            setCurrentEvent(null);
            break;
          case 'event':
            setCurrentEvent(action.data as GameEvent);
            setCurrentChallenge(null);
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
    currentEvent,
    initializeGame,
    getNextAction,
    completeChallenge,
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
