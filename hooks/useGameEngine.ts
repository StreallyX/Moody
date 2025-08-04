import { useCallback, useRef } from 'react';
import rawChallenges from '../app/data/challenges.json';
import type { GameState } from '../lib/storage';
import { saveGameState } from '../lib/storage';

const challenges = rawChallenges as Challenge[];

type Challenge = {
  id: string;
  type:
    | 'challenge'
    | 'question'
    | 'roulette'
    | 'wheelshot'
    | 'event'
    | 'oracle'
    | 'explosion'
    | 'guessword'
    | 'selfie'
    | 'tapbattle'
    | 'hotseat'
    | 'flashquiz';
  text: string;
  level: number;
  modes: string[];
  minPlayers?: number;
  maxPlayers?: number;
  slots?: number;
};

type NextOpts = { level?: number; target?: string };

// 👇 CONSTANTE : combien d’IDs on mémorise
const RECENT_MEMORY = 50;
// ... imports & types inchangés

export function useGameEngine(
  game: GameState | null,
  setGame: (g: GameState) => void,
  setCurrent: (c: any) => void
) {
  const lastPicked = useRef<string[]>([]);

  const balancedRandom = useCallback(
    (n: number) => {
      if (!game) return [];
      const shuffled = [...game.players].sort(
        (a, b) => (game.stats[a] - game.stats[b]) || Math.random() - 0.5
      );
      return shuffled.slice(0, n);
    },
    [game]
  );

  const nextChallenge = useCallback(
    (opts: NextOpts = {}) => {
      if (!game) return;

      const nextRound =
        (game as any)?.current?.targets && opts.level !== -0
          ? game.rounds + 1
          : game.rounds;

      const isMiniGameRound = nextRound > 0 && nextRound % 10 === 5;
      const isEventRound = nextRound > 0 && nextRound % 10 === 0;

      console.log(`▶️ Lancement du tour ${nextRound}`);
      if (isMiniGameRound) {
        console.log('🎰 Tour spécial : Mini-jeu');
      } else if (isEventRound) {
        console.log('🎉 Tour spécial : Événement');
      } else {
        console.log('🎲 Tour normal : Défi ou question');
      }

      if ((game as any)?.current?.targets && opts.level !== -0) {
        const stats = { ...game.stats };
        (game as any).current.targets.forEach((p: string) => {
          stats[p] = (stats[p] || 0) + 1;
        });
        game.stats = stats;
        game.rounds = nextRound;
        game.heat = Math.min(10, 1 + Math.floor(game.rounds / 3));
      }

      const baseFilter = (strictMode = true) =>
        challenges.filter((c) => {
          const modeOK =
            strictMode
              ? c.modes?.includes(game.mode)
              : c.modes?.includes(game.mode) || c.modes?.includes('friends');

          if (!modeOK) return false;
          if ((c.minPlayers ?? 1) > game.players.length) return false;

          if (isMiniGameRound)
            return [
              'roulette',
              'wheelshot',
              'oracle',
              'explosion',
              'guessword',
              'selfie',
              'tapbattle',
              'hotseat',
              'flashquiz',
            ].includes(c.type);

          if (isEventRound) return c.type === 'event';
          if (c.type !== 'challenge' && c.type !== 'question') return false;

          if (
            opts.level !== undefined &&
            opts.level !== -0 &&
            c.level !== opts.level
          )
            return false;

          return true;
        });

      let validChallenges = baseFilter(true);

      if (isMiniGameRound && validChallenges.length) {
        const grouped: Record<string, Challenge[]> = {};
        validChallenges.forEach((c) => {
          (grouped[c.type] ??= []).push(c);
        });
        const types = Object.keys(grouped);
        const chosenType = types[Math.floor(Math.random() * types.length)];
        validChallenges = grouped[chosenType];
        console.log(`🎯 Type de mini-jeu choisi aléatoirement : ${chosenType}`);
      }

      const fresh = validChallenges.filter(
        (c) => !lastPicked.current.includes(c.id)
      );
      if (fresh.length) validChallenges = fresh;

      if (validChallenges.length === 0) {
        console.warn('⚠️ Aucun défi strict ; fallback plus large');
        validChallenges = baseFilter(false);
      }

      if (validChallenges.length === 0) {
        console.warn('❌ Toujours rien à proposer.');
        setCurrent({
          type: 'info',
          text: 'Plus de défis adaptés 😢',
          targets: [],
        });
        return;
      }

      const weightedPool: Challenge[] = [];
      validChallenges.forEach((c) => {
        const weight = Math.max(1, 10 - Math.abs(c.level - game.heat));
        for (let i = 0; i < weight; i++) weightedPool.push(c);
      });

      const picked =
        weightedPool[Math.floor(Math.random() * weightedPool.length)];

      const placeholders = [...new Set(picked.text.match(/%PLAYER\d*%/g) ?? [])];
      const targets: string[] = [];

      const availablePlayers = [...game.players];
      if (opts.target) {
        targets.push(opts.target);
        availablePlayers.splice(availablePlayers.indexOf(opts.target), 1);
      }
      while (targets.length < placeholders.length && availablePlayers.length) {
        const p = availablePlayers.splice(
          Math.floor(Math.random() * availablePlayers.length),
          1
        )[0];
        targets.push(p);
      }
      if (targets.length < placeholders.length) {
        setCurrent({
          type: 'info',
          text: 'Pas assez de joueurs pour ce défi 😢',
          targets: [],
        });
        return;
      }

      let finalText = picked.text;
      placeholders.forEach((ph, i) => {
        finalText = finalText.replaceAll(ph, targets[i]);
      });

      lastPicked.current.push(picked.id);
      if (lastPicked.current.length > RECENT_MEMORY)
        lastPicked.current.shift();

      console.log(`📝 Défi sélectionné : ${finalText}`);
      console.log(`🎯 Joueurs ciblés : ${targets.join(', ')}`);
      console.log(`🎯 Paramètres reçus : ${JSON.stringify(opts)}`);

      const newCurrent = { ...picked, targets, text: finalText };
      (game as any).current = newCurrent;
      setCurrent(newCurrent);
      setGame({ ...game });
      saveGameState(game);
    },
    [game, setGame, setCurrent]
  );

  return { balancedRandom, nextChallenge };
}
