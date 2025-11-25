import type { GameState } from '../context/GameContext';
import { EVENTS, type GameEvent } from '../data/events';
import type { Situation } from '../types/politics';

// --- Situation Definitions ---
// In a real app, these might be in a data file like events.ts
const SITUATIONS_DATA: Omit<Situation, 'active' | 'progress' | 'severity' | 'trend'>[] = [
    {
        id: 'high_inflation',
        name: 'Hiperinflación',
        description: 'La moneda pierde valor rápidamente, destruyendo el poder adquisitivo.',
    },
    {
        id: 'social_unrest',
        name: 'Estallido Social',
        description: 'Protestas masivas y desorden público generalizado.',
    },
    {
        id: 'budget_crisis',
        name: 'Crisis Fiscal',
        description: 'El estado no puede cumplir con sus obligaciones financieras.',
    },
    {
        id: 'economic_boom',
        name: 'Milagro Económico',
        description: 'Crecimiento acelerado y confianza inversora.',
    }
];

export const checkEventTriggers = (state: GameState): GameEvent | null => {
    // 1. Filter events that meet their trigger condition
    const possibleEvents = EVENTS.filter(event => {
        if (!event.trigger) return false;
        // Don't trigger if already active (though activeEvent check handles this usually)
        return event.trigger(state);
    });

    if (possibleEvents.length === 0) return null;

    // 2. Select one based on weight (or random for now)
    // Simple random selection from eligible events
    const randomIndex = Math.floor(Math.random() * possibleEvents.length);
    return possibleEvents[randomIndex];
};

export const checkSituationUpdates = (state: GameState): Situation[] => {
    const currentSituations = state.events.situations;
    const newSituations: Situation[] = [];

    // Helper to find or create a situation state
    const getSituationState = (id: string) => {
        return currentSituations.find(s => s.id === id) || {
            ...SITUATIONS_DATA.find(s => s.id === id)!,
            active: false,
            severity: 0,
            progress: 0,
            trend: 0
        };
    };

    // --- 1. High Inflation ---
    const inflationSit = getSituationState('high_inflation');
    let infTrend = 0;
    if (state.stats.inflation > 0.10) infTrend += 5;
    else if (state.stats.inflation > 0.05) infTrend += 2;
    else if (state.stats.inflation < 0.03) infTrend -= 5;

    // Update progress
    let infProgress = Math.max(0, Math.min(100, inflationSit.progress + infTrend));
    let infActive = infProgress > 0; // Active if any progress, or maybe threshold > 20? Let's say > 0 is "tracked", > 50 is "Critical"

    if (infActive) {
        newSituations.push({
            ...inflationSit,
            active: true,
            progress: infProgress,
            severity: infProgress, // Map progress to severity 1:1 for now
            trend: infTrend
        });
    }

    // --- 2. Social Unrest ---
    const unrestSit = getSituationState('social_unrest');
    let unrestTrend = 0;
    if (state.stats.popularity < 30) unrestTrend += 5;
    if (state.stats.unemployment > 0.15) unrestTrend += 3;
    if (state.resources.stability < 40) unrestTrend += 4;
    if (state.stats.popularity > 60) unrestTrend -= 5;
    if (state.resources.stability > 70) unrestTrend -= 5;

    let unrestProgress = Math.max(0, Math.min(100, unrestSit.progress + unrestTrend));
    if (unrestProgress > 0) {
        newSituations.push({
            ...unrestSit,
            active: true,
            progress: unrestProgress,
            severity: unrestProgress,
            trend: unrestTrend
        });
    }

    // --- 3. Budget Crisis ---
    const budgetSit = getSituationState('budget_crisis');
    let budgetTrend = 0;
    if (state.resources.budget < -5) budgetTrend += 5; // Deficit > 5B
    else if (state.resources.budget > 0) budgetTrend -= 10;

    let budgetProgress = Math.max(0, Math.min(100, budgetSit.progress + budgetTrend));
    if (budgetProgress > 0) {
        newSituations.push({
            ...budgetSit,
            active: true,
            progress: budgetProgress,
            severity: budgetProgress,
            trend: budgetTrend
        });
    }

    // --- 4. Economic Boom ---
    const boomSit = getSituationState('economic_boom');
    let boomTrend = 0;
    // We don't have growth rate in state directly (it's calc'd in reducer), 
    // so we use proxies like low unemployment + high GDP (relative) or just random/event driven.
    // For now, let's base it on Stability + Low Unemployment
    if (state.resources.stability > 80 && state.stats.unemployment < 0.06) boomTrend += 3;
    else boomTrend -= 2;

    let boomProgress = Math.max(0, Math.min(100, boomSit.progress + boomTrend));
    if (boomProgress > 0) {
        newSituations.push({
            ...boomSit,
            active: true,
            progress: boomProgress,
            severity: boomProgress,
            trend: boomTrend
        });
    }

    return newSituations;
};
