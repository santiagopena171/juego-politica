import type { GameState } from '../context/GameContext';
import { EVENTS, type GameEvent } from '../data/events';
import type { Situation } from '../types/politics';
import type { EconomicEvent } from '../types/economy';

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

// --- Economic Events System ---
// Economic events can trigger based on game conditions
export const checkEconomicEvents = (state: GameState): EconomicEvent | null => {
    // Don't trigger if there's already an active economic event
    if (state.economy?.economicEvent) return null;
    
    // Random chance for an event each month (5% base chance)
    if (Math.random() > 0.05) return null;

    const possibleEvents: EconomicEvent[] = [];

    // Economic Crash - triggered by low stability, high deficit, or high unemployment
    if (state.resources.stability < 40 || state.resources.budget < -10 || state.stats.unemployment > 0.15) {
        possibleEvents.push({
            id: 'economic_crash',
            name: 'Crisis Económica',
            description: 'Una recesión severa golpea la economía. El PIB cae dramáticamente y el desempleo se dispara.',
            type: 'negative',
            gdpImpact: -0.15,
            unemploymentChange: 0.08,
            stabilityChange: -10,
            duration: 6,
            affectedRegions: state.economy?.regions.map(r => r.id) || []
        });
    }

    // Labor Strike - can happen in any industrial region
    const industrialRegions = state.economy?.regions.filter(r => 
        ['Industry', 'Agriculture', 'Mining'].includes(r.dominantIndustry)
    ) || [];
    
    if (industrialRegions.length > 0 && (state.stats.unemployment > 0.10 || state.stats.popularity < 40)) {
        const targetRegion = industrialRegions[Math.floor(Math.random() * industrialRegions.length)];
        possibleEvents.push({
            id: 'labor_strike',
            name: 'Huelga Laboral Masiva',
            description: `Los trabajadores de ${targetRegion.name} organizan una huelga general, paralizando la producción.`,
            type: 'negative',
            gdpImpact: -0.08,
            unemploymentChange: 0.03,
            stabilityChange: -5,
            duration: 3,
            affectedRegions: [targetRegion.id]
        });
    }

    // Resource Discovery - can happen in any region with Mining or low development
    const resourceRegions = state.economy?.regions.filter(r => 
        r.dominantIndustry === 'Mining' || r.development < 50
    ) || [];
    
    if (resourceRegions.length > 0 && state.resources.stability > 50) {
        const targetRegion = resourceRegions[Math.floor(Math.random() * resourceRegions.length)];
        const resourceTypes = ['petróleo', 'gas natural', 'litio', 'cobre', 'oro'];
        const resource = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
        
        possibleEvents.push({
            id: 'resource_discovery',
            name: 'Descubrimiento de Recursos',
            description: `Se descubrieron vastos depósitos de ${resource} en ${targetRegion.name}, atrayendo inversión extranjera.`,
            type: 'positive',
            gdpImpact: 0.12,
            unemploymentChange: -0.04,
            stabilityChange: 5,
            duration: 12,
            affectedRegions: [targetRegion.id]
        });
    }

    // Tech Boom - requires high research budget and technology level
    const researchBudget = state.economy?.budgetAllocation.Research || 0;
    const techLevel = state.economy?.technologyLevel || 0;
    
    if (researchBudget > 15 && techLevel > 60) {
        possibleEvents.push({
            id: 'tech_boom',
            name: 'Boom Tecnológico',
            description: 'Una serie de innovaciones revolucionarias impulsan el sector tecnológico, creando miles de empleos bien pagados.',
            type: 'positive',
            gdpImpact: 0.10,
            unemploymentChange: -0.05,
            stabilityChange: 8,
            duration: 8,
            affectedRegions: state.economy?.regions.filter(r => r.dominantIndustry === 'Technology').map(r => r.id) || []
        });
    }

    // Trade War - can happen if you have many trade agreements
    const tradeCount = state.economy?.tradeAgreements.length || 0;
    if (tradeCount > 3 && Math.random() > 0.7) {
        possibleEvents.push({
            id: 'trade_war',
            name: 'Guerra Comercial',
            description: 'Tensiones internacionales resultan en aranceles y sanciones comerciales que dañan las exportaciones.',
            type: 'negative',
            gdpImpact: -0.06,
            unemploymentChange: 0.02,
            stabilityChange: -3,
            duration: 4,
            affectedRegions: state.economy?.regions.map(r => r.id) || []
        });
    }

    // Foreign Investment - requires stability and good diplomatic relations
    const goodRelations = state.diplomacy.countries.filter(c => c.relation > 70).length;
    if (goodRelations >= 5 && state.resources.stability > 60) {
        possibleEvents.push({
            id: 'foreign_investment',
            name: 'Inversión Extranjera Masiva',
            description: 'Grandes corporaciones internacionales deciden invertir miles de millones en el país.',
            type: 'positive',
            gdpImpact: 0.08,
            unemploymentChange: -0.03,
            stabilityChange: 6,
            duration: 6,
            affectedRegions: state.economy?.regions.map(r => r.id) || []
        });
    }

    if (possibleEvents.length === 0) return null;

    // Select one event weighted by type (favor negative events slightly to add challenge)
    const weights = possibleEvents.map(e => e.type === 'negative' ? 1.2 : 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < possibleEvents.length; i++) {
        random -= weights[i];
        if (random <= 0) return possibleEvents[i];
    }

    return possibleEvents[possibleEvents.length - 1];
};
