// Game State Manager - handles state initialization, updates, and persistence

import {
  GameState,
  GameConfig,
  Player,
  RoundResult,
  GameAction,
  MiniGameResult,
  GameEvent,
} from './types';

export class GameStateManager {
  private state: GameState | null = null;

  initialize(config: GameConfig, players: Omit<Player, 'score' | 'drinks' | 'penalties' | 'jokers' | 'isActive'>[]): GameState {
    const initializedPlayers: Player[] = players.map((p) => ({
      ...p,
      score: 0,
      drinks: 0,
      penalties: 0,
      jokers: config.mode === 'soft' ? 2 : config.mode === 'hard' ? 1 : 0,
      isActive: true,
    }));

    this.state = {
      id: this.generateId(),
      config,
      players: initializedPlayers,
      currentPlayerIndex: 0,
      currentRound: 1,
      roundHistory: [],
      usedChallengeIds: new Set(),
      isReversed: false,
      isPaused: false,
      isFinished: false,
      startedAt: Date.now(),
      lastUpdatedAt: Date.now(),
    };

    return this.state;
  }

  getState(): GameState | null {
    return this.state;
  }

  getCurrentPlayer(): Player | null {
    if (!this.state) return null;
    return this.state.players[this.state.currentPlayerIndex];
  }

  advanceTurn(): void {
    if (!this.state) return;

    const activePlayers = this.state.players.filter((p) => p.isActive);
    if (activePlayers.length === 0) return;

    const direction = this.state.isReversed ? -1 : 1;
    let nextIndex = this.state.currentPlayerIndex;

    do {
      nextIndex = (nextIndex + direction + this.state.players.length) % this.state.players.length;
    } while (!this.state.players[nextIndex].isActive && nextIndex !== this.state.currentPlayerIndex);

    this.state.currentPlayerIndex = nextIndex;

    // Check if we completed a full round
    if (nextIndex === 0 || (this.state.isReversed && nextIndex === this.state.players.length - 1)) {
      this.state.currentRound++;
    }

    this.state.lastUpdatedAt = Date.now();
  }

  updatePlayerScore(playerId: string, delta: number): void {
    if (!this.state) return;
    const player = this.state.players.find((p) => p.id === playerId);
    if (player) {
      player.score += delta;
      this.state.lastUpdatedAt = Date.now();
    }
  }

  addDrinks(playerId: string, count: number): void {
    if (!this.state) return;
    const player = this.state.players.find((p) => p.id === playerId);
    if (player) {
      player.drinks += count;
      this.state.lastUpdatedAt = Date.now();
    }
  }

  addPenalty(playerId: string): void {
    if (!this.state) return;
    const player = this.state.players.find((p) => p.id === playerId);
    if (player) {
      player.penalties++;
      this.state.lastUpdatedAt = Date.now();
    }
  }

  useJoker(playerId: string): boolean {
    if (!this.state) return false;
    const player = this.state.players.find((p) => p.id === playerId);
    if (player && player.jokers > 0) {
      player.jokers--;
      this.state.lastUpdatedAt = Date.now();
      return true;
    }
    return false;
  }

  reverseOrder(): void {
    if (!this.state) return;
    this.state.isReversed = !this.state.isReversed;
    this.state.lastUpdatedAt = Date.now();
  }

  markChallengeUsed(challengeId: string): void {
    if (!this.state) return;
    this.state.usedChallengeIds.add(challengeId);
  }

  addRoundResult(result: RoundResult): void {
    if (!this.state) return;
    this.state.roundHistory.push(result);
    this.state.lastUpdatedAt = Date.now();
  }

  pause(): void {
    if (this.state) this.state.isPaused = true;
  }

  resume(): void {
    if (this.state) this.state.isPaused = false;
  }

  finish(): void {
    if (this.state) this.state.isFinished = true;
  }

  // Persistence
  toJSON(): string {
    if (!this.state) return '{}';
    return JSON.stringify({
      ...this.state,
      usedChallengeIds: Array.from(this.state.usedChallengeIds),
    });
  }

  fromJSON(json: string): GameState | null {
    try {
      const data = JSON.parse(json);
      this.state = {
        ...data,
        usedChallengeIds: new Set(data.usedChallengeIds || []),
      };
      return this.state;
    } catch {
      return null;
    }
  }

  private generateId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
