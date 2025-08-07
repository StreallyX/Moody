import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYER_KEY = '@moody_players';
const GAME_KEY = '@moody_game_state';

export interface GameState {
  players: string[];
  stats: Record<string, number>; // nb de défis par joueur
  heat: number;                  // 1 – 10
  rounds: number;                // nombre total de cartes déjà jouées
  mode: string;
  history?: { id: string; type: string; targets?: string[] }[]; // 👈 Ajouté
}


export const saveGameState = async (state: GameState) => {
  try {
    await AsyncStorage.setItem(GAME_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Erreur saveGameState :', e);
  }
};

export const loadGameState = async (): Promise<GameState | null> => {
  try {
    const data = await AsyncStorage.getItem(GAME_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Erreur loadGameState :', e);
    return null;
  }
};

export const clearGameState = async () => {
  try {
    await AsyncStorage.removeItem(GAME_KEY);
  } catch (e) {
    console.error('Erreur clearGameState :', e);
  }
};

export const savePlayers = async (players: string[]) => {
  try {
    await AsyncStorage.setItem(PLAYER_KEY, JSON.stringify(players));
  } catch (e) {
    console.error('Erreur lors de la sauvegarde des joueurs :', e);
  }
};

export const loadPlayers = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(PLAYER_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Erreur lors du chargement des joueurs :', e);
    return [];
  }
};
