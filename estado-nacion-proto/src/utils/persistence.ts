type Serializable =
    | null
    | undefined
    | string
    | number
    | boolean
    | Date
    | Record<string, unknown>
    | Array<unknown>
    | Map<unknown, unknown>
    | Set<unknown>;

// Custom replacer to preserve Map, Set, Date
export const customReplacer = (_key: string, value: Serializable) => {
    if (value instanceof Map) {
        return {
            __type: 'Map',
            value: Array.from(value.entries())
        };
    }
    if (value instanceof Set) {
        return {
            __type: 'Set',
            value: Array.from(value.values())
        };
    }
    if (value instanceof Date) {
        return {
            __type: 'Date',
            value: value.toISOString()
        };
    }
    return value;
};

export const customReviver = (_key: string, value: any) => {
    if (value && value.__type === 'Map') {
        return new Map(value.value);
    }
    if (value && value.__type === 'Set') {
        return new Set(value.value);
    }
    if (value && value.__type === 'Date') {
        return new Date(value.value);
    }
    return value;
};

export const saveGameState = (slot: 'autosave_current' | 'autosave_prev' | 'manual_save', state: any) => {
    try {
        const serialized = JSON.stringify(state, customReplacer);
        localStorage.setItem(slot, serialized);
    } catch (err) {
        console.error('Failed to save game state', err);
    }
};

export const loadGameState = (slot: 'autosave_current' | 'autosave_prev' | 'manual_save') => {
    try {
        const serialized = localStorage.getItem(slot);
        if (!serialized) return null;
        return JSON.parse(serialized, customReviver);
    } catch (err) {
        console.error('Failed to load game state', err);
        return null;
    }
};

// Auto-save hook rotating current and previous autosave slots
import { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

export const useAutosave = () => {
    const { state } = useGame();
    const lastTurnRef = useRef<number | undefined>(state.time.turn);

    useEffect(() => {
        if (!state.gameStarted) return;
        if (state.time.turn !== undefined && state.time.turn !== lastTurnRef.current) {
            // Rotate autosaves
            const current = JSON.stringify(state, customReplacer);
            const prev = localStorage.getItem('autosave_current');
            if (prev) {
                localStorage.setItem('autosave_prev', prev);
            }
            localStorage.setItem('autosave_current', current);
            lastTurnRef.current = state.time.turn;
        }
    }, [state]);
};
