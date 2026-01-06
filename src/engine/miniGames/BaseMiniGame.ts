// Base Mini-Game - abstract class for all mini-games

import { MiniGame, MiniGameResult, Player } from '../types';

export abstract class BaseMiniGame {
  protected config: MiniGame | null = null;
  protected players: Player[] = [];
  protected isRunning: boolean = false;
  protected startTime: number = 0;

  abstract getType(): string;
  abstract getName(): string;
  abstract getDescription(): string;

  async initialize(config: MiniGame, players: Player[]): Promise<void> {
    this.config = config;
    this.players = players;
  }

  async start(): Promise<void> {
    this.isRunning = true;
    this.startTime = Date.now();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
  }

  abstract getResult(): Promise<MiniGameResult>;

  async cleanup(): Promise<void> {
    this.config = null;
    this.players = [];
    this.isRunning = false;
  }

  getConfig(): MiniGame {
    return {
      id: this.getType(),
      type: this.getType(),
      name: this.getName(),
      description: this.getDescription(),
      minPlayers: this.getMinPlayers(),
      maxPlayers: this.getMaxPlayers(),
      duration: this.getDuration(),
      config: this.getDefaultConfig(),
    };
  }

  protected getMinPlayers(): number {
    return 2;
  }

  protected getMaxPlayers(): number | undefined {
    return undefined;
  }

  protected getDuration(): number {
    return 30; // seconds
  }

  protected getDefaultConfig(): Record<string, unknown> {
    return {};
  }

  getElapsedTime(): number {
    if (!this.isRunning) return 0;
    return Date.now() - this.startTime;
  }

  getRemainingTime(): number {
    if (!this.config) return 0;
    const elapsed = this.getElapsedTime();
    return Math.max(0, this.config.duration * 1000 - elapsed);
  }
}
