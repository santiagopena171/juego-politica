import type { GameState } from '../context/GameContext';
import type { Country } from '../data/countries';

export const decayInfluence = (countries: Country[]): Country[] => {
    return countries.map(c => ({
        ...c,
        playerInfluence: Math.max(0, (c.playerInfluence ?? 0) - 0.5)
    }));
};

export const foreignDirectInvestment = (state: GameState, countryId: string, amount: number): GameState => {
    const countries = state.diplomacy.countries.map(c => {
        if (c.id !== countryId) return c;
        const influenceGain = amount / 100; // escala simple
        return {
            ...c,
            playerInfluence: Math.min(100, (c.playerInfluence ?? 0) + influenceGain)
        };
    });

    return {
        ...state,
        diplomacy: { ...state.diplomacy, countries },
        resources: { ...state.resources, budget: Math.max(0, state.resources.budget - amount) },
        logs: [...state.logs, `Inversión directa en ${countryId}. Influencia aumentada.`]
    };
};

export const applyDebtTrap = (state: GameState, countryId: string): GameState => {
    const countries = state.diplomacy.countries.map(c => {
        if (c.id !== countryId) return c;
        const debt = c.debtHeldByPlayer ?? 0;
        if (debt < 0.5) return c;
        return {
            ...c,
            playerInfluence: 100,
            isSatellite: true
        } as Country & { isSatellite: boolean };
    });

    return {
        ...state,
        diplomacy: { ...state.diplomacy, countries },
        logs: [...state.logs, `País ${countryId} convertido en estado satélite via trampa de deuda.`]
    };
};
