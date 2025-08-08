// hooks/useLocalizedData.ts
import { useTranslation } from 'react-i18next';
import rawFr from '../app/data/data.json';
import rawEn from '../app/data/dataen.json';

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

  console.log("🌍 Langue actuelle:", lang); // 👈 Ajoute ça pour vérifier

  if (lang.startsWith('en')) return rawEn as Challenge[];
  return rawFr as Challenge[];
}

