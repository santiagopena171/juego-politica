import type { GameState } from '../context/GameContext';

export interface ActiveSituation {
    id: string; // e.g., HYPERINFLATION, INSURGENCY, PANDEMIC
    severity: number; // 0-100
    progress: number; // 0-100 closer to disaster
    weeklyEffects: {
        gdpDelta?: number; // percentage points
        stabilityDelta?: number;
        popularityDelta?: number;
        inflationDelta?: number;
    };
    resolveCondition?: (state: GameState) => boolean;
}

export const tickSituations = (state: GameState): { state: GameState; newEvents: string[] } => {
    const newEvents: string[] = [];
    let updatedSituations = state.activeSituations.map(sit => {
        const progress = Math.min(100, sit.progress + sit.severity * 0.1);
        const severity = Math.min(100, sit.severity + 1);
        return { ...sit, progress, severity };
    });

    // Remove resolved situations
    updatedSituations = updatedSituations.filter(sit => {
        if (sit.resolveCondition && sit.resolveCondition(state)) {
            newEvents.push(`Situación ${sit.id} resuelta.`);
            return false;
        }
        if (sit.progress >= 100) {
            newEvents.push(`Situación ${sit.id} explotó en crisis total.`);
        }
        return sit.progress < 100;
    });

    // Apply weekly effects
    let newState: GameState = { ...state };
    updatedSituations.forEach(sit => {
        if (sit.weeklyEffects.gdpDelta) newState.stats.gdp += sit.weeklyEffects.gdpDelta;
        if (sit.weeklyEffects.inflationDelta) newState.stats.inflation += sit.weeklyEffects.inflationDelta;
        if (sit.weeklyEffects.stabilityDelta) newState.resources.stability = Math.max(0, Math.min(100, newState.resources.stability + sit.weeklyEffects.stabilityDelta));
        if (sit.weeklyEffects.popularityDelta) newState.stats.popularity = Math.max(0, Math.min(100, newState.stats.popularity + sit.weeklyEffects.popularityDelta));
    });

    newState = { ...newState, activeSituations: updatedSituations };
    return { state: newState, newEvents };
};

export const maybeSpawnSituations = (state: GameState): GameState => {
    const situations = [...state.activeSituations];

    if (!situations.find(s => s.id === 'HYPERINFLATION') && state.stats.inflation > 0.15) {
        situations.push({
            id: 'HYPERINFLATION',
            severity: 60,
            progress: 10,
            weeklyEffects: { stabilityDelta: -2, popularityDelta: -1, gdpDelta: -1, inflationDelta: 0.01 },
            resolveCondition: s => s.stats.inflation < 0.05
        });
    }

    if (!situations.find(s => s.id === 'INSURGENCY') && state.resources.stability < 30) {
        situations.push({
            id: 'INSURGENCY',
            severity: 50,
            progress: 5,
            weeklyEffects: { stabilityDelta: -3, popularityDelta: -1 },
            resolveCondition: s => s.resources.stability > 50
        });
    }

    if (!situations.find(s => s.id === 'PANDEMIC') && state.stats.unemployment > 0.2) {
        situations.push({
            id: 'PANDEMIC',
            severity: 40,
            progress: 5,
            weeklyEffects: { gdpDelta: -0.5, stabilityDelta: -1 },
            resolveCondition: s => s.stats.unemployment < 0.1
        });
    }

    return { ...state, activeSituations: situations };
};
