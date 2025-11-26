import type { GameState } from '../context/GameContext';
import type { PresidentialDecision } from '../types/living_world';
import { evaluateMinisterBehavior } from './psychology';
import { updatePopSatisfaction } from './sociology';

export const evaluateTurnLogic = (state: GameState): { newState: GameState; newDecisions: PresidentialDecision[] } => {
    let newState = { ...state };
    const newDecisions: PresidentialDecision[] = [];

    // 1. Economy Tick (Placeholder for now, assuming it's handled in TICK_MONTH reducer before this)
    // In future, move economy logic here or call it here.

    // 2. Sociology Tick
    if (newState.social && newState.social.groups) {
        newState.social.groups = updatePopSatisfaction(newState.social.groups, newState);
    }

    // 3. Psychology Tick
    if (newState.government && newState.government.ministers) {
        newState.government.ministers.forEach(minister => {
            const decision = evaluateMinisterBehavior(minister, newState);
            if (decision) {
                newDecisions.push(decision);
            }
        });
    }

    // 4. Intel/Media Tick (Placeholder)

    // 5. General Decision Generation
    // Example: High Unemployment
    const unemploymentRate = newState.economy.unemploymentRate ?? 0;
    if (unemploymentRate > 0.2) {
        newDecisions.push({
            id: `unemployment_crisis_${Date.now()}`,
            source: 'Labor Ministry',
            title: 'Unemployment Crisis',
            description: 'Unemployment has reached critical levels. Immediate action is required.',
            urgency: 'Critical',
            options: [
                {
                    id: 'public_works',
                    label: 'Launch Public Works Program (Budget -500)',
                    cost: { budget: 500 },
                    effect: (s) => ({
                        economy: {
                            ...s.economy,
                            unemploymentRate: Math.max(0, s.economy.unemploymentRate - 0.02),
                            budgetSurplus: s.economy.budgetSurplus - 500
                        }
                    })
                },
                {
                    id: 'ignore',
                    label: 'Do Nothing (Stability -10)',
                    effect: (s) => ({
                        resources: {
                            ...s.resources,
                            stability: Math.max(0, s.resources.stability - 10)
                        }
                    })
                }
            ]
        });
    }

    return { newState, newDecisions };
};
