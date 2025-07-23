import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYER_KEY = '@moody_players';

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
