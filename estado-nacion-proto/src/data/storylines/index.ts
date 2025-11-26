import { REBELLION_STORYLINE, REBELLION_EVENTS } from './rebellion';
import type { Storyline, GameEvent } from '../events';

/**
 * Todas las storylines disponibles en el juego
 */
export const STORYLINES: Storyline[] = [
    REBELLION_STORYLINE,
    // Agregar más storylines aquí en el futuro
];

/**
 * Todos los eventos de storylines
 */
export const STORYLINE_EVENTS: GameEvent[] = [
    ...REBELLION_EVENTS,
    // Agregar más eventos de storylines aquí
];

/**
 * Busca una storyline por ID
 */
export function getStorylineById(id: string): Storyline | undefined {
    return STORYLINES.find(s => s.id === id);
}

/**
 * Obtiene los eventos de una storyline específica
 */
export function getStorylineEvents(storylineId: string): GameEvent[] {
    return STORYLINE_EVENTS.filter(e => e.storylineId === storylineId);
}

/**
 * Verifica si una storyline puede iniciarse dado el estado actual
 */
export function canStartStoryline(storyline: Storyline, state: any): boolean {
    if (!storyline.requiredConditions) return true;
    
    // Aquí se usaría evaluateCondition del storyteller
    // Por ahora retornamos true para permitir testing
    return true;
}
