import type { GameState } from '../context/GameContext';
import type { Parliament } from '../types/politics';

export interface PoliticalCompass {
    x: number; // -100 planned, 100 free market
    y: number; // -100 authoritarian, 100 liberal
}

const clamp = (v: number) => Math.max(-100, Math.min(100, v));

export const shiftCompass = (state: GameState, delta: Partial<PoliticalCompass>): GameState => {
    const x = clamp(state.politicalCompass.x + (delta.x ?? 0));
    const y = clamp(state.politicalCompass.y + (delta.y ?? 0));
    return { ...state, politicalCompass: { x, y } };
};

export const driftCompassFromEconomy = (state: GameState): GameState => {
    // Simple heuristic: growth pushes to market, high stability pushes authoritarian
    const growth = state.economy.gdpGrowthRate ?? 0;
    const stability = state.resources.stability;
    return shiftCompass(state, {
        x: growth > 0.02 ? 1 : growth < 0 ? -1 : 0,
        y: stability < 40 ? -1 : stability > 70 ? 1 : 0
    });
};

export const updatePartyNames = (compass: PoliticalCompass, parties: Parliament['parties']) => {
    return parties.map(party => {
        let name = party.name;
        if (compass.x < -50 && party.ideology === 'Conservative') name = 'Frente Reaccionario';
        if (compass.x > 50 && party.ideology === 'Socialist') name = 'Socialismo Renovado';
        if (compass.y < -50 && party.ideology === 'Liberal') name = 'Orden Nacional';
        if (compass.y > 50 && party.ideology === 'Nationalist') name = 'Renovación Democrática';
        return { ...party, name };
    });
};
