import { useCallback } from 'react';
import rawChallenges from '../app/data/challenges.json';
import type { GameState } from '../lib/storage';
import { saveGameState } from '../lib/storage';


const challenges = rawChallenges as Challenge[];

type Challenge = {
  id: string;
  type: 'challenge' | 'question' | 'roulette' | 'wheelshot';
  text: string;
  level: number;
  modes: string[];
  minPlayers?: number;
  maxPlayers?: number;
  slots?: number;
};

type NextOpts = { level?: number; target?: string };

export function useGameEngine(game: GameState | null, setGame: (g: GameState) => void, setCurrent: (c: any) => void) {
  const balancedRandom = useCallback((n: number) => {
    if (!game) return [];
    const shuffled = [...game.players].sort(
      (a, b) => (game.stats[a] - game.stats[b]) || Math.random() - 0.5
    );
    return shuffled.slice(0, n);
  }, [game]);

  const nextChallenge = useCallback((opts: NextOpts = {}) => {
    if (!game) return;

    if ((game as any)?.current?.targets && opts.level !== -1) {
      const newStats = { ...game.stats };
      (game as any).current.targets.forEach((p: string) => {
        newStats[p] = (newStats[p] || 0) + 1;
      });
      game.stats = newStats;
      game.rounds += 1;
      game.heat = Math.min(10, 1 + Math.floor(game.rounds / 3));
    }

    let validChallenges = challenges.filter(
      (c) =>
        c.modes?.includes(game.mode) &&
        (c.minPlayers ?? 1) <= game.players.length
    );

    if (opts.level !== undefined && opts.level !== -1) {
      validChallenges = validChallenges.filter(
        (c) => c.level === opts.level && c.type === 'challenge'
      );
    }

    const weightedPool: Challenge[] = [];
    validChallenges.forEach((challenge) => {
      const level = challenge.level ?? 1;
      const heat = game.heat;
      const weight = Math.max(1, 10 - Math.abs(level - heat));
      for (let i = 0; i < weight; i++) {
        weightedPool.push(challenge);
      }
    });

    if (weightedPool.length === 0) {
      setCurrent({ type: 'info', text: 'Plus de défis adaptés 😢', targets: [] });
      return;
    }

    const picked = weightedPool[Math.floor(Math.random() * weightedPool.length)];
    const textPlaceholders = [...new Set(picked.text.match(/%PLAYER\d*%/g) ?? [])];
    const totalNeeded = textPlaceholders.length;
    const allPlayers = [...game.players];

    let targets: string[] = [];
    if (opts.target) {
      targets.push(opts.target);
      allPlayers.splice(allPlayers.indexOf(opts.target), 1);
    }

    while (targets.length < totalNeeded && allPlayers.length > 0) {
      const index = Math.floor(Math.random() * allPlayers.length);
      const player = allPlayers.splice(index, 1)[0];
      targets.push(player);
    }

    if (targets.length < totalNeeded) {
      setCurrent({
        type: 'info',
        text: `Pas assez de joueurs différents pour ce défi (${totalNeeded} requis) 😢`,
        targets: [],
      });
      return;
    }

    let finalText = picked.text;
    textPlaceholders.forEach((ph, i) => {
      finalText = finalText.replaceAll(ph, targets[i] ?? targets[0]);
    });

    const newCurrent = { ...picked, targets, text: finalText };
    (game as any).current = newCurrent;
    setCurrent(newCurrent);
    setGame({ ...game });
    saveGameState(game);
  }, [game, setGame, setCurrent]);

  return { balancedRandom, nextChallenge };
}
