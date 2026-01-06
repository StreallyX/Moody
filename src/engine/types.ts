// Game Engine Types

export type GameMode = 'soft' | 'hard' | 'caliente';

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  drinks: number;
  penalties: number;
  jokers: number;
  isActive: boolean;
}

export interface GameConfig {
  mode: GameMode;
  playerCount: number;
  maxRounds: number;
  alcoholLevel: number; // 0-100
  enableMiniGames: boolean;
  enableRandomEvents: boolean;
  eventFrequency: number; // every N rounds
}

export interface Challenge {
  id: string;
  type: 'dare' | 'truth' | 'drink' | 'action';
  content: string;
  mode: GameMode[];
  minPlayers: number;
  maxPlayers?: number;
  tags: string[];
  difficulty: number;
}

export interface MiniGame {
  id: string;
  type: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers?: number;
  duration: number; // seconds
  config: Record<string, unknown>;
}

export interface GameEvent {
  id: string;
  type: 'joker' | 'reversal' | 'collective_penalty' | 'bonus_round' | 'skip';
  name: string;
  description: string;
  effect: EventEffect;
}

export interface EventEffect {
  targetType: 'current' | 'all' | 'random' | 'choice';
  action: 'add_drinks' | 'remove_drinks' | 'add_score' | 'skip_turn' | 'reverse_order' | 'give_joker';
  value?: number;
}

export interface RoundResult {
  roundNumber: number;
  playerId: string;
  challengeId?: string;
  miniGameId?: string;
  eventId?: string;
  completed: boolean;
  scoreChange: number;
  drinksGiven: number;
  timestamp: number;
}

export interface GameState {
  id: string;
  config: GameConfig;
  players: Player[];
  currentPlayerIndex: number;
  currentRound: number;
  roundHistory: RoundResult[];
  usedChallengeIds: Set<string>;
  isReversed: boolean;
  isPaused: boolean;
  isFinished: boolean;
  startedAt: number;
  lastUpdatedAt: number;
}

export interface MiniGameResult {
  winnerId?: string;
  loserId?: string;
  scores: Record<string, number>;
  drinks: Record<string, number>;
}

export type GameAction =
  | { type: 'START_GAME'; config: GameConfig; players: Omit<Player, 'score' | 'drinks' | 'penalties' | 'jokers' | 'isActive'>[] }
  | { type: 'NEXT_TURN' }
  | { type: 'COMPLETE_CHALLENGE'; result: Partial<RoundResult> }
  | { type: 'START_MINI_GAME'; miniGame: MiniGame }
  | { type: 'END_MINI_GAME'; result: MiniGameResult }
  | { type: 'TRIGGER_EVENT'; event: GameEvent }
  | { type: 'USE_JOKER'; playerId: string }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'END_GAME' };
