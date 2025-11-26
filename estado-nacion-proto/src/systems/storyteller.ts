import type { GameState } from '../context/GameContext';
import type { 
    GameEvent, 
    EventCondition, 
    EventConsequence,
    Storyline,
    ActiveStoryline 
} from '../data/events';
import { EVENTS } from '../data/events';

/**
 * Motor de eventos narrativos contextuales
 */

/**
 * Evalúa si una condición se cumple
 */
export function evaluateCondition(
    condition: EventCondition, 
    state: GameState
): boolean {
    // Condiciones económicas
    if (condition.gdpMin !== undefined && state.stats.gdp < condition.gdpMin) {
        return false;
    }
    if (condition.gdpMax !== undefined && state.stats.gdp > condition.gdpMax) {
        return false;
    }
    if (condition.unemploymentMin !== undefined && state.stats.unemployment < condition.unemploymentMin) {
        return false;
    }
    if (condition.unemploymentMax !== undefined && state.stats.unemployment > condition.unemploymentMax) {
        return false;
    }
    if (condition.inflationMin !== undefined && state.stats.inflation < condition.inflationMin) {
        return false;
    }
    if (condition.inflationMax !== undefined && state.stats.inflation > condition.inflationMax) {
        return false;
    }

    // Condiciones políticas
    if (condition.popularityMin !== undefined && state.stats.popularity < condition.popularityMin) {
        return false;
    }
    if (condition.popularityMax !== undefined && state.stats.popularity > condition.popularityMax) {
        return false;
    }
    if (condition.stabilityMin !== undefined && state.resources.stability < condition.stabilityMin) {
        return false;
    }
    if (condition.stabilityMax !== undefined && state.resources.stability > condition.stabilityMax) {
        return false;
    }

    // Condiciones de ministros
    if (condition.hasMinisterWithTrait !== undefined) {
        const hasMinister = state.ministers.some(m => 
            m.traitIds?.includes(condition.hasMinisterWithTrait!)
        );
        if (!hasMinister) return false;
    }
    if (condition.ministerCount !== undefined && state.ministers.length < condition.ministerCount) {
        return false;
    }

    // Condiciones sociales
    if (condition.anyProtestActive !== undefined) {
        const hasProtest = state.social.activeProtests.length > 0;
        if (condition.anyProtestActive !== hasProtest) return false;
    }
    if (condition.socialTensionMin !== undefined && state.social.socialTension < condition.socialTensionMin) {
        return false;
    }

    // Condiciones de historia
    if (condition.storyVars) {
        for (const [key, value] of Object.entries(condition.storyVars)) {
            if (state.storyVars[key] !== value) return false;
        }
    }
    if (condition.eventHistoryIncludes) {
        for (const eventId of condition.eventHistoryIncludes) {
            if (!state.eventHistory.includes(eventId)) return false;
        }
    }
    if (condition.eventHistoryExcludes) {
        for (const eventId of condition.eventHistoryExcludes) {
            if (state.eventHistory.includes(eventId)) return false;
        }
    }

    // Condiciones temporales
    if (condition.monthsSinceGameStart !== undefined) {
        const monthsPassed = state.date.month + (state.date.year - state.date.year) * 12;
        if (monthsPassed < condition.monthsSinceGameStart) return false;
    }

    // Función custom
    if (condition.customCheck) {
        return condition.customCheck(state);
    }

    return true;
}

/**
 * Selecciona eventos que cumplen sus condiciones
 */
export function getEligibleEvents(state: GameState): GameEvent[] {
    return EVENTS.filter(event => {
        // Verificar si el evento ya ocurrió (evitar repetición a menos que sea parte de una cadena)
        if (!event.chainId && state.eventHistory.includes(event.id)) {
            return false;
        }

        // Verificar condición (nuevo sistema)
        if (event.condition && !evaluateCondition(event.condition, state)) {
            return false;
        }

        // Verificar trigger (sistema antiguo, compatibilidad)
        if (event.trigger && !event.trigger(state)) {
            return false;
        }

        return true;
    });
}

/**
 * Selecciona un evento aleatorio basado en pesos
 */
export function selectWeightedEvent(events: GameEvent[]): GameEvent | null {
    if (events.length === 0) return null;

    const totalWeight = events.reduce((sum, event) => sum + (event.weight || 1), 0);
    let random = Math.random() * totalWeight;

    for (const event of events) {
        random -= event.weight || 1;
        if (random <= 0) {
            return event;
        }
    }

    return events[events.length - 1];
}

/**
 * Aplica las consecuencias de una elección de evento
 */
export function applyConsequences(
    consequence: EventConsequence,
    state: GameState
): Partial<GameState> {
    const updates: Partial<GameState> = {};

    // Efectos inmediatos
    if (consequence.immediate) {
        const imm = consequence.immediate;
        
        if (imm.budget !== undefined) {
            updates.resources = {
                ...state.resources,
                budget: state.resources.budget + imm.budget,
            };
        }
        if (imm.politicalCapital !== undefined) {
            const newResources = updates.resources || state.resources;
            updates.resources = {
                ...newResources,
                politicalCapital: newResources.politicalCapital + imm.politicalCapital,
            };
        }
        if (imm.stability !== undefined) {
            const newResources = updates.resources || state.resources;
            updates.resources = {
                ...newResources,
                stability: Math.max(0, Math.min(100, newResources.stability + imm.stability)),
            };
        }
        if (imm.popularity !== undefined) {
            updates.stats = {
                ...state.stats,
                popularity: Math.max(0, Math.min(100, state.stats.popularity + imm.popularity)),
            };
        }
        if (imm.humanRights !== undefined) {
            const newResources = updates.resources || state.resources;
            updates.resources = {
                ...newResources,
                humanRights: Math.max(0, Math.min(100, newResources.humanRights + imm.humanRights)),
            };
        }
    }

    // Variables de historia
    if (consequence.storyVars) {
        updates.storyVars = {
            ...state.storyVars,
            ...consequence.storyVars,
        };
    }

    // Modificadores de aprobación de grupos
    if (consequence.approvalModifiers && consequence.approvalModifiers.length > 0) {
        // Convertir approvalModifiers de Fase 5 al formato del sistema social
        const convertedModifiers = consequence.approvalModifiers.map(mod => ({
            groupType: mod.groupId as any, // Convertir groupId a groupType
            change: mod.modifier || 0,
            reason: `Evento: ${mod.groupId}`,
        }));
        
        // No agregamos directamente a social.approvalModifiers porque ese campo
        // es para modificadores temporales del sistema social.
        // En su lugar, los aplicamos directamente a los grupos de interés.
        // Esto se manejará en el GameContext cuando se apliquen las consecuencias.
    }

    // Eventos demorados
    if (consequence.delayed) {
        const newDelayed = {
            eventId: consequence.delayed.eventId,
            triggersIn: consequence.delayed.turnsDelay,
        };
        updates.delayedEvents = [...state.delayedEvents, newDelayed];
    }

    return updates;
}

/**
 * Genera escándalo ministerial basado en traits
 */
export function generateMinisterialScandal(state: GameState): GameEvent | null {
    // Buscar ministro con trait problemático
    const problematicMinister = state.ministers.find(m => 
        m.traitIds?.includes('Corrupt') || 
        m.traitIds?.includes('Incompetent')
    );

    if (!problematicMinister) return null;

    const isCorrupt = problematicMinister.traitIds?.includes('Corrupt');

    return {
        id: `scandal_${problematicMinister.id}_${Date.now()}`,
        title: isCorrupt ? '💰 Escándalo de Corrupción' : '🤦 Declaración Vergonzosa',
        description: isCorrupt 
            ? `${problematicMinister.name}, tu ${problematicMinister.ministry}, ha sido vinculado a un esquema de desvío de fondos públicos. Los medios exigen explicaciones.`
            : `${problematicMinister.name}, tu ${problematicMinister.ministry}, ha hecho declaraciones públicas completamente desastrosas que dañan la imagen del gobierno.`,
        category: 'scandal',
        choices: [
            {
                label: 'Despedir inmediatamente',
                description: 'Cortar por lo sano',
                consequences: {
                    immediate: {
                        popularity: isCorrupt ? 5 : 3,
                    },
                    storyVars: {
                        [`fired_${problematicMinister.id}`]: true,
                    },
                },
            },
            {
                label: 'Defender al ministro',
                description: 'Mostrar lealtad - arriesgado',
                consequences: {
                    immediate: {
                        popularity: isCorrupt ? -10 : -5,
                        politicalCapital: -15,
                    },
                    storyVars: {
                        [`defended_${problematicMinister.id}`]: true,
                    },
                },
            },
        ],
    };
}

/**
 * Verifica y activa eventos demorados
 */
export function checkDelayedEvents(state: GameState): { 
    triggeredEvent: GameEvent | null;
    updatedDelayed: typeof state.delayedEvents;
} {
    const updatedDelayed = state.delayedEvents.map(de => ({
        ...de,
        triggersIn: de.triggersIn - 1,
    }));

    const readyEvent = updatedDelayed.find(de => de.triggersIn <= 0);
    
    if (readyEvent) {
        const event = EVENTS.find(e => e.id === readyEvent.eventId);
        return {
            triggeredEvent: event || null,
            updatedDelayed: updatedDelayed.filter(de => de.eventId !== readyEvent.eventId),
        };
    }

    return {
        triggeredEvent: null,
        updatedDelayed,
    };
}

/**
 * Sistema principal: selecciona el mejor evento contextual
 */
export function selectContextualEvent(state: GameState): GameEvent | null {
    // 1. Verificar eventos demorados
    const { triggeredEvent, updatedDelayed } = checkDelayedEvents(state);
    if (triggeredEvent) {
        return triggeredEvent;
    }

    // 2. Chance de escándalo ministerial (10% por turno)
    if (Math.random() < 0.1) {
        const scandal = generateMinisterialScandal(state);
        if (scandal) return scandal;
    }

    // 3. Eventos contextuales normales
    const eligible = getEligibleEvents(state);
    return selectWeightedEvent(eligible);
}

/**
 * Progresa una storyline activa
 */
export function progressStoryline(
    storyline: ActiveStoryline,
    storylineDefinition: Storyline,
    state: GameState
): { shouldProgress: boolean; nextStage: number } {
    const currentStage = storylineDefinition.stages.find(s => s.stage === storyline.currentStage);
    
    if (!currentStage) {
        return { shouldProgress: false, nextStage: storyline.currentStage };
    }

    if (currentStage.autoAdvance) {
        return { shouldProgress: true, nextStage: storyline.currentStage + 1 };
    }

    if (currentStage.advanceCondition && evaluateCondition(currentStage.advanceCondition, state)) {
        return { shouldProgress: true, nextStage: storyline.currentStage + 1 };
    }

    return { shouldProgress: false, nextStage: storyline.currentStage };
}
