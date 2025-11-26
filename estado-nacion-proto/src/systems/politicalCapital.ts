import type { GameState } from '../context/GameContext';
import { POLITICAL_COSTS } from '../types/living_world';

export const regenPoliticalCapital = (state: GameState): GameState => {
    const popularity = state.stats.popularity ?? 50;
    const cohesion = (state.government.parliament as any).partyCohesion ?? 50;
    const gain = (popularity * 0.05) + (cohesion * 0.05);
    const politicalCapital = Math.max(0, Math.min(100, state.resources.politicalCapital + gain));
    const paralysis = politicalCapital <= 0;
    return {
        ...state,
        resources: { ...state.resources, politicalCapital },
        logs: paralysis ? [...state.logs, 'Gobierno paralizado por falta de capital político'] : state.logs,
    };
};

export const spendPoliticalCapital = (state: GameState, amount: number): GameState => {
    if (state.resources.politicalCapital < amount) return state;
    return {
        ...state,
        resources: { ...state.resources, politicalCapital: state.resources.politicalCapital - amount }
    };
};

export { POLITICAL_COSTS };
