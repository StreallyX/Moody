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
  enableRandomEvents: boolean;
  eventFrequency: number; // every N rounds
}

export interface Challenge {
  id: string;
  type: 'truth' | 'dare' | 'group';
  text: string;
  heat?: number; // 1-5
  mode?: GameMode[];
  variant?: 'vote' | 'condition' | 'action' | 'everyone_except' | 'together' | 'competition';
  // Optional legacy properties for ContentManager/RulesEngine compatibility
  minPlayers?: number;
  maxPlayers?: number;
  difficulty?: number;
  tags?: string[];
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

export type GameAction =
  | { type: 'START_GAME'; config: GameConfig; players: Omit<Player, 'score' | 'drinks' | 'penalties' | 'jokers' | 'isActive'>[] }
  | { type: 'NEXT_TURN' }
  | { type: 'COMPLETE_CHALLENGE'; result: Partial<RoundResult> }
  | { type: 'TRIGGER_EVENT'; event: GameEvent }
  | { type: 'USE_JOKER'; playerId: string }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'END_GAME' };
