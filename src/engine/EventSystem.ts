// Event System - random events, jokers, penalties

import { GameEvent, EventEffect, GameState, Player } from './types';

const DEFAULT_EVENTS: GameEvent[] = [
  {
    id: 'joker_grant',
    type: 'joker',
    name: 'Lucky Joker',
    description: 'You found a joker! Use it to skip any challenge.',
    effect: { targetType: 'current', action: 'give_joker', value: 1 },
  },
  {
    id: 'reversal',
    type: 'reversal',
    name: 'Reverse!',
    description: 'The turn order is now reversed!',
    effect: { targetType: 'all', action: 'reverse_order' },
  },
  {
    id: 'collective_drink',
    type: 'collective_penalty',
    name: 'Cheers!',
    description: 'Everyone drinks together!',
    effect: { targetType: 'all', action: 'add_drinks', value: 1 },
  },
  {
    id: 'bonus_points',
    type: 'bonus_round',
    name: 'Bonus Round',
    description: 'Double points for the next challenge!',
    effect: { targetType: 'current', action: 'add_score', value: 50 },
  },
  {
    id: 'skip_turn',
    type: 'skip',
    name: 'Skip!',
    description: 'Your turn is skipped!',
    effect: { targetType: 'current', action: 'skip_turn' },
  },
  {
    id: 'random_drink',
    type: 'collective_penalty',
    name: 'Roulette',
    description: 'A random player must drink!',
    effect: { targetType: 'random', action: 'add_drinks', value: 2 },
  },
];

export class EventSystem {
  private events: GameEvent[] = DEFAULT_EVENTS;
  private eventHistory: string[] = [];

  getRandomEvent(): GameEvent {
    // Avoid repeating recent events
    const available = this.events.filter(
      (e) => !this.eventHistory.slice(-3).includes(e.id)
    );
    const pool = available.length > 0 ? available : this.events;
    const event = pool[Math.floor(Math.random() * pool.length)];
    this.eventHistory.push(event.id);
    return event;
  }

  applyEvent(event: GameEvent, state: GameState): { affectedPlayers: Player[]; message: string } {
    const { effect } = event;
    const affectedPlayers: Player[] = [];

    const targets = this.resolveTargets(effect, state);

    for (const player of targets) {
      affectedPlayers.push(player);
      this.applyEffect(effect, player, state);
    }

    return {
      affectedPlayers,
      message: event.description,
    };
  }

  private resolveTargets(effect: EventEffect, state: GameState): Player[] {
    switch (effect.targetType) {
      case 'current':
        return [state.players[state.currentPlayerIndex]];
      case 'all':
        return state.players.filter((p) => p.isActive);
      case 'random': {
        const active = state.players.filter((p) => p.isActive);
        return [active[Math.floor(Math.random() * active.length)]];
      }
      case 'choice':
        // TODO: Implement player choice UI
        return [state.players[state.currentPlayerIndex]];
      default:
        return [];
    }
  }

  private applyEffect(effect: EventEffect, player: Player, state: GameState): void {
    switch (effect.action) {
      case 'add_drinks':
        player.drinks += effect.value || 1;
        break;
      case 'remove_drinks':
        player.drinks = Math.max(0, player.drinks - (effect.value || 1));
        break;
      case 'add_score':
        player.score += effect.value || 0;
        break;
      case 'skip_turn':
        // Handled by game engine
        break;
      case 'reverse_order':
        state.isReversed = !state.isReversed;
        break;
      case 'give_joker':
        player.jokers += effect.value || 1;
        break;
    }
  }

  // Custom events
  addEvent(event: GameEvent): void {
    this.events.push(event);
  }

  setEvents(events: GameEvent[]): void {
    this.events = events;
  }

  resetHistory(): void {
    this.eventHistory = [];
  }
}
