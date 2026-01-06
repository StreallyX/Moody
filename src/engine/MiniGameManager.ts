// Mini-Game Manager - registry and orchestration of mini-games

import { MiniGame, MiniGameResult, Player } from './types';
import { BaseMiniGame } from './miniGames/BaseMiniGame';

export type MiniGameFactory = () => BaseMiniGame;

export class MiniGameManager {
  private registry: Map<string, MiniGameFactory> = new Map();
  private activeMiniGame: BaseMiniGame | null = null;

  registerMiniGame(type: string, factory: MiniGameFactory): void {
    this.registry.set(type, factory);
  }

  getAvailableTypes(): string[] {
    return Array.from(this.registry.keys());
  }

  createMiniGame(type: string): BaseMiniGame | null {
    const factory = this.registry.get(type);
    if (!factory) return null;
    return factory();
  }

  async startMiniGame(config: MiniGame, players: Player[]): Promise<void> {
    const miniGame = this.createMiniGame(config.type);
    if (!miniGame) {
      throw new Error(`Unknown mini-game type: ${config.type}`);
    }

    this.activeMiniGame = miniGame;
    await miniGame.initialize(config, players);
    await miniGame.start();
  }

  async endMiniGame(): Promise<MiniGameResult | null> {
    if (!this.activeMiniGame) return null;

    const result = await this.activeMiniGame.getResult();
    await this.activeMiniGame.cleanup();
    this.activeMiniGame = null;

    return result;
  }

  getActiveMiniGame(): BaseMiniGame | null {
    return this.activeMiniGame;
  }

  isActive(): boolean {
    return this.activeMiniGame !== null;
  }

  // Get random mini-game config for player count
  getRandomMiniGame(playerCount: number): MiniGame | null {
    const types = this.getAvailableTypes();
    if (types.length === 0) return null;

    const randomType = types[Math.floor(Math.random() * types.length)];
    const miniGame = this.createMiniGame(randomType);
    if (!miniGame) return null;

    const config = miniGame.getConfig();
    if (config.minPlayers > playerCount) return null;
    if (config.maxPlayers && config.maxPlayers < playerCount) return null;

    return config;
  }
}
