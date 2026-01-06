// Reflex Game - tap fastest to win

import { BaseMiniGame } from './BaseMiniGame';
import { MiniGameResult } from '../types';

export class ReflexGame extends BaseMiniGame {
  private tapTimes: Map<string, number> = new Map();
  private signalTime: number = 0;

  getType(): string {
    return 'reflex';
  }

  getName(): string {
    return 'Reflex Challenge';
  }

  getDescription(): string {
    return 'Tap as fast as you can when the signal appears!';
  }

  async start(): Promise<void> {
    await super.start();
    this.tapTimes.clear();
    // Signal will appear after random delay (1-3 seconds)
    const delay = 1000 + Math.random() * 2000;
    this.signalTime = Date.now() + delay;
  }

  recordTap(playerId: string): void {
    if (!this.isRunning) return;
    const now = Date.now();
    if (now < this.signalTime) {
      // Too early - penalty
      this.tapTimes.set(playerId, Infinity);
    } else if (!this.tapTimes.has(playerId)) {
      this.tapTimes.set(playerId, now - this.signalTime);
    }
  }

  async getResult(): Promise<MiniGameResult> {
    const scores: Record<string, number> = {};
    const drinks: Record<string, number> = {};

    let fastestTime = Infinity;
    let fastestPlayer: string | undefined;
    let slowestTime = 0;
    let slowestPlayer: string | undefined;

    for (const player of this.players) {
      const time = this.tapTimes.get(player.id) ?? Infinity;
      if (time < fastestTime) {
        fastestTime = time;
        fastestPlayer = player.id;
      }
      if (time !== Infinity && time > slowestTime) {
        slowestTime = time;
        slowestPlayer = player.id;
      }
      // Score based on reaction time (lower is better)
      scores[player.id] = time === Infinity ? 0 : Math.max(0, 100 - Math.floor(time / 10));
    }

    // Slowest player drinks
    if (slowestPlayer) {
      drinks[slowestPlayer] = 2;
    }

    return {
      winnerId: fastestPlayer,
      loserId: slowestPlayer,
      scores,
      drinks,
    };
  }

  protected getDuration(): number {
    return 10;
  }

  protected getDefaultConfig(): Record<string, unknown> {
    return {
      minDelay: 1000,
      maxDelay: 3000,
    };
  }
}
