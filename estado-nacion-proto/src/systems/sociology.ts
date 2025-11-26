import type { GameState } from '../context/GameContext';
import type { SocialGroup } from '../types/living_world';

export const calculateClassStruggle = (pops: SocialGroup[]): number => {
    // Simple metric: Variance in satisfaction between classes
    const elite = pops.filter(p => p.socialClass === 'Elite');
    const middle = pops.filter(p => p.socialClass === 'Middle');
    const lower = pops.filter(p => p.socialClass === 'Lower');

    const avgSat = (groups: SocialGroup[]) =>
        groups.length ? groups.reduce((sum, p) => sum + p.satisfaction, 0) / groups.length : 50;

    const eliteSat = avgSat(elite);
    const lowerSat = avgSat(lower);

    // Struggle is the gap between elite and lower class satisfaction
    // If elites are happy (80) and lower class is unhappy (20), struggle is high (60)
    return Math.abs(eliteSat - lowerSat);
};

export const updatePopSatisfaction = (pops: SocialGroup[], state: GameState): SocialGroup[] => {
    return pops.map(pop => {
        let change = 0;

        // 1. Economic Impact
        // If GDP is growing, everyone gets a small boost, elites get more
        if (state.economy.gdpGrowth > 2) {
            change += pop.socialClass === 'Elite' ? 2 : 1;
        } else if (state.economy.gdpGrowth < 0) {
            change -= pop.socialClass === 'Lower' ? 3 : 1;
        }

        // 2. Unemployment
        if (state.economy.unemploymentRate > 10) {
            if (pop.socialClass === 'Lower' || pop.socialClass === 'Middle') {
                change -= 2;
            }
        }

        // 3. Taxes (Simplified check against a hypothetical tax rate in state)
        // Assuming state.economy.taxRate exists or we use a proxy
        // For now, placeholder logic based on budget surplus/deficit
        if (state.economy.budgetSurplus < 0) {
            // Deficit might imply inflation or future cuts
            if (pop.socialClass === 'Elite') change -= 1;
        }

        // 4. Random Fluctuation & Radicalization
        // Radicalization increases if satisfaction is low
        let newRadicalization = pop.radicalization;
        if (pop.satisfaction < 30) {
            newRadicalization += 1;
        } else if (pop.satisfaction > 70) {
            newRadicalization = Math.max(0, newRadicalization - 1);
        }

        return {
            ...pop,
            satisfaction: Math.max(0, Math.min(100, pop.satisfaction + change)),
            radicalization: Math.max(0, Math.min(100, newRadicalization))
        };
    });
};
