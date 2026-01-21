// Rules Engine - dynamic rules based on mode, player count, difficulty

import { GameMode, GameConfig, Player, Challenge } from './types';

export interface ModeRules {
  baseDrinkMultiplier: number;
  penaltyDrinks: number;
  skipPenalty: number;
  jokerCount: number;
  eventChance: number; // 0-1
  maxDifficulty: number;
}

const MODE_RULES: Record<GameMode, ModeRules> = {
  soft: {
    baseDrinkMultiplier: 1,
    penaltyDrinks: 1,
    skipPenalty: 1,
    jokerCount: 2,
    eventChance: 0.1,
    maxDifficulty: 3,
  },
  hard: {
    baseDrinkMultiplier: 2,
    penaltyDrinks: 2,
    skipPenalty: 2,
    jokerCount: 1,
    eventChance: 0.2,
    maxDifficulty: 7,
  },
  caliente: {
    baseDrinkMultiplier: 3,
    penaltyDrinks: 3,
    skipPenalty: 3,
    jokerCount: 0,
    eventChance: 0.3,
    maxDifficulty: 10,
  },
};

export class RulesEngine {
  private config: GameConfig;
  private rules: ModeRules;

  constructor(config: GameConfig) {
    this.config = config;
    this.rules = MODE_RULES[config.mode];
  }

  getRules(): ModeRules {
    return this.rules;
  }

  // Calculate drinks based on mode and alcohol level
  calculateDrinks(baseDrinks: number): number {
    const alcoholMultiplier = 1 + (this.config.alcoholLevel / 100) * 0.5;
    return Math.ceil(baseDrinks * this.rules.baseDrinkMultiplier * alcoholMultiplier);
  }

  // Calculate penalty for skipping/failing
  calculatePenalty(): number {
    return this.calculateDrinks(this.rules.penaltyDrinks);
  }

  // Get initial joker count for mode
  getInitialJokers(): number {
    return this.rules.jokerCount;
  }

  // Check if random event should trigger
  shouldTriggerEvent(currentRound: number): boolean {
    if (!this.config.enableRandomEvents) return false;
    if (this.config.eventFrequency > 0 && currentRound % this.config.eventFrequency === 0) {
      return true;
    }
    return Math.random() < this.rules.eventChance;
  }

  // Filter challenges by current rules
  filterChallenges(challenges: Challenge[], playerCount: number): Challenge[] {
    return challenges.filter((c) => {
      // Mode check
      if (c.mode && !c.mode.includes(this.config.mode)) return false;
      // Player count check
      if (c.minPlayers && c.minPlayers > playerCount) return false;
      if (c.maxPlayers && c.maxPlayers < playerCount) return false;
      // Difficulty check
      if (c.difficulty && c.difficulty > this.rules.maxDifficulty) return false;
      return true;
    });
  }

  // Calculate score for completing challenge
  calculateScore(challenge: Challenge, completed: boolean): number {
    if (!completed) return 0;
    const baseScore = (challenge.difficulty || 1) * 10;
    const modeMultiplier = this.config.mode === 'caliente' ? 1.5 : this.config.mode === 'hard' ? 1.2 : 1;
    return Math.round(baseScore * modeMultiplier);
  }

  // Adjust difficulty based on player performance
  getDifficultyForPlayer(player: Player, averageScore: number): number {
    const performanceRatio = averageScore > 0 ? player.score / averageScore : 1;
    if (performanceRatio > 1.2) {
      return Math.min(this.rules.maxDifficulty, Math.ceil(this.rules.maxDifficulty * 0.8));
    } else if (performanceRatio < 0.8) {
      return Math.max(1, Math.floor(this.rules.maxDifficulty * 0.5));
    }
    return Math.ceil(this.rules.maxDifficulty * 0.6);
  }
}
