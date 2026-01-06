// Vote Game - players vote for someone

import { BaseMiniGame } from './BaseMiniGame';
import { MiniGameResult } from '../types';

export type VoteCategory = 'most_likely' | 'best_dancer' | 'worst_liar' | 'party_animal' | 'custom';

export class VoteGame extends BaseMiniGame {
  private votes: Map<string, string> = new Map(); // voterId -> votedForId
  private category: VoteCategory = 'most_likely';
  private customPrompt: string = '';

  getType(): string {
    return 'vote';
  }

  getName(): string {
    return 'Vote!';
  }

  getDescription(): string {
    return 'Vote for a player based on the prompt!';
  }

  async start(): Promise<void> {
    await super.start();
    this.votes.clear();
    // Pick random category
    const categories: VoteCategory[] = ['most_likely', 'best_dancer', 'worst_liar', 'party_animal'];
    this.category = categories[Math.floor(Math.random() * categories.length)];
  }

  setCategory(category: VoteCategory, customPrompt?: string): void {
    this.category = category;
    if (customPrompt) this.customPrompt = customPrompt;
  }

  getPrompt(): string {
    switch (this.category) {
      case 'most_likely':
        return 'Who is most likely to embarrass themselves tonight?';
      case 'best_dancer':
        return 'Who is the best dancer here?';
      case 'worst_liar':
        return 'Who is the worst liar?';
      case 'party_animal':
        return 'Who is the biggest party animal?';
      case 'custom':
        return this.customPrompt || 'Vote for someone!';
      default:
        return 'Vote for someone!';
    }
  }

  castVote(voterId: string, votedForId: string): void {
    if (!this.isRunning) return;
    if (voterId === votedForId) return; // Can't vote for yourself
    this.votes.set(voterId, votedForId);
  }

  async getResult(): Promise<MiniGameResult> {
    const scores: Record<string, number> = {};
    const drinks: Record<string, number> = {};
    const voteCounts: Map<string, number> = new Map();

    // Count votes
    for (const votedForId of this.votes.values()) {
      voteCounts.set(votedForId, (voteCounts.get(votedForId) || 0) + 1);
    }

    // Find winner (most votes)
    let maxVotes = 0;
    let winnerId: string | undefined;

    for (const [playerId, count] of voteCounts) {
      if (count > maxVotes) {
        maxVotes = count;
        winnerId = playerId;
      }
      scores[playerId] = count * 10;
    }

    // Winner drinks based on votes received
    if (winnerId) {
      drinks[winnerId] = maxVotes;
    }

    return {
      winnerId,
      scores,
      drinks,
    };
  }

  protected getDuration(): number {
    return 20;
  }

  protected getDefaultConfig(): Record<string, unknown> {
    return {
      allowSelfVote: false,
      categories: ['most_likely', 'best_dancer', 'worst_liar', 'party_animal'],
    };
  }
}
