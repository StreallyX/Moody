// Bluff Game - truth or lie detection

import { BaseMiniGame } from './BaseMiniGame';
import { MiniGameResult } from '../types';

export class BluffGame extends BaseMiniGame {
  private storytellerId: string = '';
  private isBluff: boolean = false;
  private guesses: Map<string, boolean> = new Map(); // playerId -> guessedBluff

  getType(): string {
    return 'bluff';
  }

  getName(): string {
    return 'Truth or Bluff';
  }

  getDescription(): string {
    return 'One player tells a story. Others guess if it\'s true or a bluff!';
  }

  async start(): Promise<void> {
    await super.start();
    this.guesses.clear();
    // Pick random storyteller
    const storyteller = this.players[Math.floor(Math.random() * this.players.length)];
    this.storytellerId = storyteller.id;
    // Storyteller decides if they'll bluff
    this.isBluff = Math.random() > 0.5;
  }

  getStorytellerId(): string {
    return this.storytellerId;
  }

  shouldBluff(): boolean {
    return this.isBluff;
  }

  setBluff(isBluff: boolean): void {
    this.isBluff = isBluff;
  }

  submitGuess(playerId: string, guessedBluff: boolean): void {
    if (!this.isRunning) return;
    if (playerId === this.storytellerId) return; // Storyteller can't guess
    this.guesses.set(playerId, guessedBluff);
  }

  async getResult(): Promise<MiniGameResult> {
    const scores: Record<string, number> = {};
    const drinks: Record<string, number> = {};

    let correctGuesses = 0;
    let wrongGuesses = 0;

    for (const [playerId, guessedBluff] of this.guesses) {
      const correct = guessedBluff === this.isBluff;
      if (correct) {
        correctGuesses++;
        scores[playerId] = 20;
      } else {
        wrongGuesses++;
        scores[playerId] = 0;
        drinks[playerId] = 1;
      }
    }

    // Storyteller scores based on how many they fooled
    const fooledCount = this.isBluff ? wrongGuesses : correctGuesses;
    scores[this.storytellerId] = fooledCount * 15;

    // If storyteller fooled everyone, they're the winner
    const totalGuessers = this.guesses.size;
    const winnerId = fooledCount === totalGuessers && totalGuessers > 0
      ? this.storytellerId
      : undefined;

    // If no one was fooled, storyteller drinks
    if (fooledCount === 0 && totalGuessers > 0) {
      drinks[this.storytellerId] = 2;
    }

    return {
      winnerId,
      scores,
      drinks,
    };
  }

  protected getDuration(): number {
    return 60;
  }

  protected getMinPlayers(): number {
    return 3;
  }

  protected getDefaultConfig(): Record<string, unknown> {
    return {
      storyTimeLimit: 30,
      guessTimeLimit: 15,
    };
  }
}
