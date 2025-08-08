// hooks/useLocalizedData.ts
import { useTranslation } from 'react-i18next';
import rawEn from '../app/data/dataen.json';
import rawFr from '../app/data/datafr.json';

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

export function useLocalizedData(): Challenge[] {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  if (lang.startsWith('en')) return rawEn as Challenge[];
  return rawFr as Challenge[];
}

