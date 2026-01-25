// Game Engine - Main orchestrator for the drinking/party game

import {
  GameState,
  GameConfig,
  Player,
  Challenge,
  GameEvent,
  RoundResult,
} from './types';
import { GameStateManager } from './GameStateManager';
import { RulesEngine } from './RulesEngine';
import { ContentManager } from './ContentManager';
import { EventSystem } from './EventSystem';

export interface GameEngineCallbacks {
  onStateChange?: (state: GameState) => void;
  onChallenge?: (challenge: Challenge) => void;
  onEvent?: (event: GameEvent, affectedPlayers: Player[]) => void;
  onGameEnd?: (finalState: GameState) => void;
}

export class GameEngine {
  private stateManager: GameStateManager;
  private rulesEngine: RulesEngine | null = null;
  private contentManager: ContentManager;
  private eventSystem: EventSystem;
  private callbacks: GameEngineCallbacks = {};

  constructor() {
    this.stateManager = new GameStateManager();
    this.contentManager = new ContentManager();
    this.eventSystem = new EventSystem();
  }

  setCallbacks(callbacks: GameEngineCallbacks): void {
    this.callbacks = callbacks;
  }

  async initialize(
    config: GameConfig,
    players: Omit<Player, 'score' | 'drinks' | 'penalties' | 'jokers' | 'isActive'>[]
  ): Promise<GameState> {
    // Initialize state
    const state = this.stateManager.initialize(config, players);

    // Initialize rules engine with config
    this.rulesEngine = new RulesEngine(config);

    // Load content
    await this.contentManager.loadChallenges();

    this.notifyStateChange();
    return state;
  }

  getState(): GameState | null {
    return this.stateManager.getState();
  }

  getCurrentPlayer(): Player | null {
    return this.stateManager.getCurrentPlayer();
  }

  // Main game loop - get next action for current turn
  async getNextAction(): Promise<{ type: 'challenge' | 'event'; data: Challenge | GameEvent } | null> {
    const state = this.stateManager.getState();
    if (!state || state.isPaused || state.isFinished || !this.rulesEngine) return null;

    // Check for random event
    if (this.rulesEngine.shouldTriggerEvent(state.currentRound)) {
      const event = this.eventSystem.getRandomEvent();
      return { type: 'event', data: event };
    }

    // Get challenge
    const challenge = this.contentManager.getRandomChallenge({
      mode: state.config.mode,
      playerCount: state.players.length,
      maxDifficulty: this.rulesEngine.getRules().maxDifficulty,
      excludeIds: state.usedChallengeIds,
    });

    if (challenge) {
      this.callbacks.onChallenge?.(challenge);
      return { type: 'challenge', data: challenge };
    }

    return null;
  }

  // Handle challenge completion
  completeChallenge(challenge: Challenge, completed: boolean): void {
    const state = this.stateManager.getState();
    if (!state || !this.rulesEngine) return;

    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return;

    const scoreChange = this.rulesEngine.calculateScore(challenge, completed);
    const drinksGiven = completed ? 0 : this.rulesEngine.calculatePenalty();

    this.stateManager.updatePlayerScore(currentPlayer.id, scoreChange);
    if (drinksGiven > 0) {
      this.stateManager.addDrinks(currentPlayer.id, drinksGiven);
      this.stateManager.addPenalty(currentPlayer.id);
    }
    this.stateManager.markChallengeUsed(challenge.id);

    const result: RoundResult = {
      roundNumber: state.currentRound,
      playerId: currentPlayer.id,
      challengeId: challenge.id,
      completed,
      scoreChange,
      drinksGiven,
      timestamp: Date.now(),
    };
    this.stateManager.addRoundResult(result);

    this.notifyStateChange();
  }

  // Handle event
  triggerEvent(event: GameEvent): void {
    const state = this.stateManager.getState();
    if (!state) return;

    const { affectedPlayers } = this.eventSystem.applyEvent(event, state);
    this.callbacks.onEvent?.(event, affectedPlayers);
    this.notifyStateChange();
  }

  // Use joker to skip challenge
  useJoker(): boolean {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return false;

    const success = this.stateManager.useJoker(currentPlayer.id);
    if (success) {
      this.notifyStateChange();
    }
    return success;
  }

  // Advance to next turn
  nextTurn(): void {
    const state = this.stateManager.getState();
    if (!state) return;

    // Check if game should end
    if (state.currentRound >= state.config.maxRounds) {
      this.endGame();
      return;
    }

    this.stateManager.advanceTurn();
    this.notifyStateChange();
  }

  // Game control
  pause(): void {
    this.stateManager.pause();
    this.notifyStateChange();
  }

  resume(): void {
    this.stateManager.resume();
    this.notifyStateChange();
  }

  endGame(): void {
    this.stateManager.finish();
    const state = this.stateManager.getState();
    if (state) {
      this.callbacks.onGameEnd?.(state);
    }
    this.notifyStateChange();
  }

  // Persistence
  saveState(): string {
    return this.stateManager.toJSON();
  }

  loadState(json: string): boolean {
    const state = this.stateManager.fromJSON(json);
    if (state) {
      this.rulesEngine = new RulesEngine(state.config);
      this.notifyStateChange();
      return true;
    }
    return false;
  }

  // Getters for managers (for advanced usage)
  getContentManager(): ContentManager {
    return this.contentManager;
  }

  getEventSystem(): EventSystem {
    return this.eventSystem;
  }

  private notifyStateChange(): void {
    const state = this.stateManager.getState();
    if (state) {
      this.callbacks.onStateChange?.(state);
    }
  }
}
