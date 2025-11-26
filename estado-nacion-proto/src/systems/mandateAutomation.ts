import type { GameState } from '../context/GameContext';
import type { Minister } from '../types/politics';
import { POLITICAL_COSTS } from '../types/living_world';

type BudgetKeys = keyof GameState['economy']['budgetAllocation'];

const STRATEGY_TARGETS: Record<string, Partial<Record<BudgetKeys, number>>> = {
    GROWTH: { Research: 15, Infrastructure: 18 },
    AUSTERITY: { SocialWelfare: 10, Defense: 8 },
    WELFARE: { SocialWelfare: 30, Health: 22, Education: 22 },
    GREED: { Defense: 18, Research: 8 }
};

export const executeMinisterMandates = (state: GameState): GameState => {
    const micromanageEnabled = (state.policies as any)?.manualOverrideActive;
    if (micromanageEnabled) return state;

    const economy = { ...state.economy, budgetAllocation: { ...state.economy.budgetAllocation } };

    state.government.ministers.forEach((m: Minister) => {
        const target = m.strategy && STRATEGY_TARGETS[m.strategy];
        if (!target) return;

        const competence = m.stats.competence / 100;
        Object.entries(target).forEach(([key, desired]) => {
            const k = key as BudgetKeys;
            const current = economy.budgetAllocation[k] ?? 0;
            const delta = (desired! - current) * competence * 0.5;
            economy.budgetAllocation[k] = Math.max(0, Math.min(100, current + delta));
        });
    });

    const total = Object.values(economy.budgetAllocation).reduce((s, v) => s + v, 0);
    if (total > 0 && Math.abs(total - 100) > 0.01) {
        Object.keys(economy.budgetAllocation).forEach(k => {
            const key = k as BudgetKeys;
            economy.budgetAllocation[key] = (economy.budgetAllocation[key] / total) * 100;
        });
    }

    return { ...state, economy };
};

export const toggleMicromanagement = (state: GameState, enable: boolean): GameState => {
    if (enable && state.resources.politicalCapital < POLITICAL_COSTS.MANUAL_OVERRIDE) return state;
    return {
        ...state,
        resources: enable
            ? { ...state.resources, politicalCapital: state.resources.politicalCapital - POLITICAL_COSTS.MANUAL_OVERRIDE }
            : state.resources,
        policies: { ...state.policies, manualOverrideActive: enable }
    };
};
