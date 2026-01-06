// Content Manager - fetches and manages challenges from Supabase

import { Challenge, GameMode } from './types';
// TODO: Import contentService when available
// import { contentService } from '../services/contentService';

export interface ContentFilters {
  mode: GameMode;
  playerCount: number;
  maxDifficulty: number;
  tags?: string[];
  excludeIds?: Set<string>;
}

export class ContentManager {
  private challengeCache: Challenge[] = [];
  private usedChallengeIds: Set<string> = new Set();
  private lastFetchTime: number = 0;
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutes

  async fetchChallenges(filters: ContentFilters): Promise<Challenge[]> {
    // TODO: Implement actual Supabase fetch via contentService
    // const challenges = await contentService.getChallenges(filters);
    
    // For now, return filtered cache
    return this.filterChallenges(this.challengeCache, filters);
  }

  async loadChallenges(): Promise<void> {
    const now = Date.now();
    if (this.challengeCache.length > 0 && now - this.lastFetchTime < this.cacheDuration) {
      return; // Use cache
    }

    // TODO: Fetch from Supabase
    // this.challengeCache = await contentService.getAllChallenges();
    this.lastFetchTime = now;
  }

  getRandomChallenge(filters: ContentFilters): Challenge | null {
    const available = this.filterChallenges(this.challengeCache, filters);
    if (available.length === 0) return null;

    // Weighted random selection - prefer less used challenges
    const weights = available.map((c) => {
      const usageCount = this.getUsageCount(c.id);
      return Math.max(1, 10 - usageCount);
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < available.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        this.markUsed(available[i].id);
        return available[i];
      }
    }

    const fallback = available[0];
    this.markUsed(fallback.id);
    return fallback;
  }

  markUsed(challengeId: string): void {
    this.usedChallengeIds.add(challengeId);
  }

  resetUsed(): void {
    this.usedChallengeIds.clear();
  }

  private filterChallenges(challenges: Challenge[], filters: ContentFilters): Challenge[] {
    return challenges.filter((c) => {
      if (!c.mode.includes(filters.mode)) return false;
      if (c.minPlayers > filters.playerCount) return false;
      if (c.maxPlayers && c.maxPlayers < filters.playerCount) return false;
      if (c.difficulty > filters.maxDifficulty) return false;
      if (filters.excludeIds?.has(c.id)) return false;
      if (filters.tags && filters.tags.length > 0) {
        if (!filters.tags.some((t) => c.tags.includes(t))) return false;
      }
      return true;
    });
  }

  private getUsageCount(challengeId: string): number {
    // Simple implementation - just check if used
    return this.usedChallengeIds.has(challengeId) ? 5 : 0;
  }

  // For testing/seeding
  setChallenges(challenges: Challenge[]): void {
    this.challengeCache = challenges;
    this.lastFetchTime = Date.now();
  }
}
