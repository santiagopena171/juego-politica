import type { MinistryType } from '../types/politics';
import type { MinisterMandate, MandateType } from '../types/living_world';
import type { GameState } from '../context/GameContext';

export interface MandateDefinition {
    id: string;
    name: string;
    description: string;
    ministry: MinistryType;
    type: MandateType;
    politicalCapitalCost: number; // Cost to enact
    monthlyCost: number; // Budget cost per month ($B)
    effects: {
        popularity?: number;
        gdpGrowth?: number;
        publicOrder?: number;
        corruption?: number;
        liberty?: number;
    };
}

export const AVAILABLE_MANDATES: MandateDefinition[] = [
    // ECONOMY
    {
        id: 'eco_austerity',
        name: 'Austeridad Fiscal',
        description: 'Recortar gastos para reducir el déficit. Impopular pero necesario.',
        ministry: 'Economy',
        type: 'AUSTERITY',
        politicalCapitalCost: 10,
        monthlyCost: -2, // Saves money
        effects: {
            popularity: -0.5,
            gdpGrowth: -0.1,
            corruption: -0.1
        }
    },
    {
        id: 'eco_growth',
        name: 'Estímulo Económico',
        description: 'Invertir agresivamente para fomentar el crecimiento.',
        ministry: 'Economy',
        type: 'GROWTH',
        politicalCapitalCost: 15,
        monthlyCost: 5,
        effects: {
            popularity: 0.2,
            gdpGrowth: 0.3,
            corruption: 0.1
        }
    },

    // INTERIOR (Security)
    {
        id: 'sec_law_order',
        name: 'Mano Dura',
        description: 'Priorizar el orden público sobre las libertades civiles.',
        ministry: 'Interior',
        type: 'AUSTERITY', // Using Austerity as proxy for strictness/order
        politicalCapitalCost: 20,
        monthlyCost: 3,
        effects: {
            publicOrder: 0.5,
            liberty: -0.5,
            popularity: 0.1
        }
    },
    {
        id: 'sec_community',
        name: 'Policía Comunitaria',
        description: 'Enfoque preventivo y cercano a la comunidad.',
        ministry: 'Interior',
        type: 'POPULISM',
        politicalCapitalCost: 10,
        monthlyCost: 2,
        effects: {
            publicOrder: 0.2,
            liberty: 0.1,
            popularity: 0.3
        }
    },

    // FOREIGN (Diplomacy)
    {
        id: 'dip_isolation',
        name: 'Soberanía Nacional',
        description: 'Priorizar intereses nacionales, reduciendo cooperación internacional.',
        ministry: 'Foreign',
        type: 'MAINTENANCE',
        politicalCapitalCost: 15,
        monthlyCost: 0,
        effects: {
            gdpGrowth: -0.1,
            popularity: 0.2
        }
    },
    {
        id: 'dip_globalist',
        name: 'Integración Global',
        description: 'Buscar acuerdos y alianzas internacionales.',
        ministry: 'Foreign',
        type: 'GROWTH',
        politicalCapitalCost: 10,
        monthlyCost: 1,
        effects: {
            gdpGrowth: 0.2,
            popularity: -0.1
        }
    }
];

export const getMandateById = (id: string): MandateDefinition | undefined => {
    return AVAILABLE_MANDATES.find(m => m.id === id);
};

export const calculateMandateEffects = (state: GameState): Partial<GameState> => {
    let popularityChange = 0;
    let gdpGrowthChange = 0;
    let budgetChange = 0;
    let stabilityChange = 0;

    state.government.ministers.forEach(minister => {
        if (minister.mandate) {
            const mandateDef = getMandateById(minister.mandate.id);
            if (mandateDef) {
                // Apply effects scaled by minister competence
                const competenceFactor = 0.5 + (minister.stats.competence / 100);

                if (mandateDef.effects.popularity) popularityChange += mandateDef.effects.popularity * competenceFactor;
                if (mandateDef.effects.gdpGrowth) gdpGrowthChange += mandateDef.effects.gdpGrowth * competenceFactor;
                if (mandateDef.effects.publicOrder) stabilityChange += mandateDef.effects.publicOrder * competenceFactor;

                // Budget cost is inversely affected by competence (better ministers save money)
                budgetChange += mandateDef.monthlyCost * (1.5 - (minister.stats.competence / 200));
            }
        }
    });

    return {
        stats: {
            ...state.stats,
            popularity: Math.max(0, Math.min(100, state.stats.popularity + popularityChange))
        },
        resources: {
            ...state.resources,
            stability: Math.max(0, Math.min(100, state.resources.stability + stabilityChange))
        },
        economy: {
            ...state.economy,
            gdpGrowthRate: state.economy.gdpGrowthRate + gdpGrowthChange,
            budgetSurplus: state.economy.budgetSurplus - budgetChange
        }
    };
};
