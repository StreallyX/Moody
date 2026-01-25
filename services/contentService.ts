import { supabase } from '../lib/supabase';

export interface Challenge {
  id: string;
  mode: string;
  text: string;
  language: string;
  difficulty?: number;
  created_at?: string;
}

export interface MiniGame {
  id: string;
  name: string;
  description: string;
  language: string;
  component_name: string;
  icon?: string;
}

export interface GameMode {
  id: string;
  name: string;
  description: string;
  language: string;
  icon?: string;
  color?: string;
}

export async function getChallenges(
  mode: string,
  language: string,
  limit: number = 50
): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('mode', mode)
    .eq('language', language)
    .limit(limit);

  if (error) {
    console.error('Error fetching challenges:', error);
    return [];
  }

  return data || [];
}

export async function getMiniGames(language: string): Promise<MiniGame[]> {
  const { data, error } = await supabase
    .from('mini_games')
    .select('*')
    .eq('language', language);

  if (error) {
    console.error('Error fetching mini games:', error);
    return [];
  }

  return data || [];
}

export async function getModes(language: string): Promise<GameMode[]> {
  const { data, error } = await supabase
    .from('modes')
    .select('*')
    .eq('language', language);

  if (error) {
    console.error('Error fetching modes:', error);
    return [];
  }

  return data || [];
}

export async function getRandomChallenge(
  mode: string,
  excludeIds: string[] = []
): Promise<Challenge | null> {
  let query = supabase
    .from('challenges')
    .select('*')
    .eq('mode', mode);

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    console.error('Error fetching random challenge:', error);
    return null;
  }

  // Return a random challenge from the results
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}

export async function getChallengeById(id: string): Promise<Challenge | null> {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching challenge:', error);
    return null;
  }

  return data;
}
