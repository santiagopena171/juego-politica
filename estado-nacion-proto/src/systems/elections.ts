import type { GameState } from '../context/GameContext';
import type { SocialGroup } from '../types/living_world';

export const isCampaignTurn = (turn: number) => turn >= 45 && turn <= 48;

export const calculateElectionResults = (state: GameState): { won: boolean; support: number } => {
    const supportPerRegion = state.economy.regions.map(region => {
        const pops = region.pops || [];
        const popSupport = pops.reduce((sum, pop: SocialGroup) => {
            const weight = pop.politicalInfluence ?? 1;
            return sum + (pop.satisfaction * weight);
        }, 0);
        const totalWeight = pops.reduce((s, p) => s + (p.politicalInfluence ?? 1), 0) || 1;
        const regionSupport = popSupport / totalWeight;
        return regionSupport;
    });
    const avgSupport = supportPerRegion.length
        ? supportPerRegion.reduce((s, v) => s + v, 0) / supportPerRegion.length
        : 0;
    const won = avgSupport >= 50;
    return { won, support: avgSupport };
};

export const handleElectionIfNeeded = (state: GameState): GameState => {
    const turn = state.time.turn ?? 0;
    if (turn < 48) return state;
    const { won, support } = calculateElectionResults(state);
    if (won) {
        return {
            ...state,
            resources: { ...state.resources, politicalCapital: 100 },
            time: { ...state.time, turn: 1, isCampaignMode: false },
            logs: [...state.logs, `Reelección lograda con ${support.toFixed(1)}% de apoyo`],
        };
    }
    return {
        ...state,
        time: { ...state.time, isCampaignMode: false },
        logs: [...state.logs, `Derrota electoral con ${support.toFixed(1)}% de apoyo. Game Over / modo oposición.`],
    };
};
