import type { GameState } from '../context/GameContext';
import type { ApprovalModifier } from '../types/social';
import { STORYLINE_EVENTS } from './storylines';

/**
 * Categorías de eventos
 */
export type EventCategory = 
    | 'economic'        // Eventos económicos
    | 'political'       // Eventos políticos
    | 'social'          // Eventos sociales
    | 'diplomatic'      // Crisis internacionales
    | 'disaster'        // Desastres naturales
    | 'scandal'         // Escándalos ministeriales
    | 'storyline';      // Parte de una historia ramificada

/**
 * Consecuencia de una elección
 */
export interface EventConsequence {
    immediate?: {
        budget?: number;
        politicalCapital?: number;
        stability?: number;
        popularity?: number;
        humanRights?: number;
    };
    delayed?: {
        eventId: string;      // Evento que se desbloquea
        turnsDelay: number;   // Turnos hasta que se active
    };
    storyVars?: { [key: string]: any }; // Variables de historia
    approvalModifiers?: ApprovalModifier[]; // Cambios en grupos de interés
    hidden?: string; // Efecto oculto que el jugador descubrirá después
}

/**
 * Elección en un evento
 */
export interface EventChoice {
    label: string;
    description: string;
    requirements?: {
        budget?: number;
        politicalCapital?: number;
        ministers?: string[]; // IDs de ministros requeridos
        storyVars?: { [key: string]: any }; // Variables de historia requeridas
    };
    consequences: EventConsequence;
    tooltip?: string; // Advertencia o hint adicional
}

/**
 * Condiciones complejas para eventos contextuales
 */
export interface EventCondition {
    // Condiciones económicas
    gdpMin?: number;
    gdpMax?: number;
    unemploymentMin?: number;
    unemploymentMax?: number;
    inflationMin?: number;
    inflationMax?: number;
    
    // Condiciones políticas
    popularityMin?: number;
    popularityMax?: number;
    stabilityMin?: number;
    stabilityMax?: number;
    
    // Condiciones de ministros
    hasMinisterWithTrait?: string; // "Corrupt", "Authoritarian", etc.
    ministerCount?: number;
    
    // Condiciones de grupos sociales
    anyProtestActive?: boolean;
    socialTensionMin?: number;
    
    // Condiciones de historia
    storyVars?: { [key: string]: any };
    eventHistoryIncludes?: string[]; // IDs de eventos que deben haber ocurrido
    eventHistoryExcludes?: string[]; // IDs de eventos que NO deben haber ocurrido
    
    // Condiciones temporales
    monthsSinceGameStart?: number;
    
    // Función custom para condiciones complejas
    customCheck?: (state: GameState) => boolean;
}

/**
 * Evento del juego (expandido)
 */
export interface GameEvent {
    id: string;
    title: string;
    description: string;
    category: EventCategory;
    
    // Sistema de triggers contextuales
    condition?: EventCondition;
    trigger?: (state: GameState) => boolean; // Backward compatibility
    
    // Cadenas de eventos
    chainId?: string; // ID de la cadena a la que pertenece
    chainStage?: number; // Etapa dentro de la cadena
    
    // Storylines
    storylineId?: string;
    storyStage?: number;
    
    weight?: number; // Peso de probabilidad
    
    choices: EventChoice[];
    
    // Efectos automáticos al activarse (antes de elegir)
    onActivate?: EventConsequence;
}

/**
 * Historia ramificada
 */
export interface Storyline {
    id: string;
    name: string;
    description: string;
    stages: StorylineStage[];
    requiredConditions?: EventCondition;
    possibleEndings: StorylineEnding[];
}

/**
 * Etapa de una historia
 */
export interface StorylineStage {
    stage: number;
    title: string;
    description: string;
    eventId: string; // Evento que se activa en esta etapa
    advanceCondition?: EventCondition; // Condición para avanzar
    autoAdvance?: boolean; // Si avanza automáticamente después del evento
}

/**
 * Final de una historia
 */
export interface StorylineEnding {
    id: string;
    name: string;
    description: string;
    requiredVars: { [key: string]: any };
    effects: EventConsequence;
    isGameEnding?: boolean; // Si termina el juego
}

/**
 * Estado de una historia activa
 */
export interface ActiveStoryline {
    storylineId: string;
    currentStage: number;
    startedAt: Date;
    storyVars: { [key: string]: any };
}

export const EVENTS: GameEvent[] = [
    // ========== EVENTOS ECONÓMICOS ==========
    {
        id: 'strike_transport',
        title: 'Huelga de Transportistas',
        description: 'Los transportistas han iniciado un paro nacional por el aumento del combustible y los bajos salarios. Las calles están bloqueadas y el comercio paralizado.',
        category: 'economic',
        condition: {
            inflationMin: 0.08,
            popularityMax: 60,
        },
        weight: 1,
        choices: [
            {
                label: 'Negociar con los sindicatos',
                description: 'Costará dinero pero mejorará tu imagen',
                consequences: {
                    immediate: {
                        budget: -10,
                        popularity: 5,
                    },
                    approvalModifiers: [
                        { groupId: 'unions', modifier: 15, duration: 6 },
                        { groupId: 'business', modifier: -5, duration: 3 },
                    ],
                    storyVars: { negotiated_transport_strike: true },
                },
            },
            {
                label: 'Reprimir la huelga',
                description: 'Aumentará la estabilidad pero dañará tu popularidad',
                consequences: {
                    immediate: {
                        popularity: -10,
                        humanRights: -5,
                    },
                    approvalModifiers: [
                        { groupId: 'unions', modifier: -25, duration: 12 },
                        { groupId: 'business', modifier: 10, duration: 3 },
                        { groupId: 'military', modifier: 5, duration: 3 },
                    ],
                    storyVars: { suppressed_transport_strike: true },
                    delayed: {
                        eventId: 'union_revenge',
                        turnsDelay: 3,
                    },
                },
            },
            {
                label: 'Subsidiar el combustible',
                description: 'Muy costoso pero resuelve el problema de raíz',
                requirements: {
                    budget: 30,
                },
                consequences: {
                    immediate: {
                        budget: -30,
                        popularity: 8,
                    },
                    approvalModifiers: [
                        { groupId: 'unions', modifier: 10, duration: 6 },
                        { groupId: 'rural', modifier: 15, duration: 6 },
                    ],
                },
            },
        ],
    },
    {
        id: 'tech_boom',
        title: 'Auge Tecnológico',
        description: 'Una nueva industria tecnológica está emergiendo en el país. Inversores extranjeros están interesados pero necesitan incentivos fiscales.',
        category: 'economic',
        condition: {
            gdpMin: 100,
        },
        weight: 0.3,
        choices: [
            {
                label: 'Subsidiar la industria',
                description: 'Inversión a largo plazo que puede pagar dividendos',
                consequences: {
                    immediate: {
                        budget: -20,
                    },
                    storyVars: { subsidized_tech_sector: true },
                    delayed: {
                        eventId: 'tech_sector_success',
                        turnsDelay: 6,
                    },
                },
            },
            {
                label: 'No intervenir',
                description: 'Dejar al mercado decidir',
                consequences: {
                    storyVars: { tech_sector_organic: true },
                },
            },
        ],
    },
    
    // ========== ESCÁNDALOS MINISTERIALES ==========
    {
        id: 'minister_corruption_scandal',
        title: 'Escándalo de Corrupción',
        description: 'Se han filtrado documentos que prueban que uno de tus ministros ha desviado fondos públicos a cuentas offshore. Los medios están en llamas.',
        category: 'scandal',
        condition: {
            hasMinisterWithTrait: 'Corrupt',
        },
        weight: 0.2,
        onActivate: {
            immediate: {
                popularity: -8,
                stability: -5,
            },
        },
        choices: [
            {
                label: 'Despedir al ministro inmediatamente',
                description: 'Daño controlado - perderás al ministro',
                consequences: {
                    immediate: {
                        popularity: 3,
                    },
                    storyVars: { fired_corrupt_minister: true },
                },
            },
            {
                label: 'Encubrir el escándalo',
                description: 'Arriesgado - si se descubre será peor',
                requirements: {
                    politicalCapital: 20,
                },
                consequences: {
                    immediate: {
                        politicalCapital: -20,
                        popularity: 5,
                    },
                    storyVars: { covered_up_scandal: true },
                    delayed: {
                        eventId: 'corruption_scandal_resurfaces',
                        turnsDelay: 4,
                    },
                    hidden: 'Si se descubre, el daño será catastrófico',
                },
            },
            {
                label: 'Iniciar investigación pública',
                description: 'Transparencia total - puede revelar más corrupción',
                consequences: {
                    immediate: {
                        popularity: -5,
                    },
                    storyVars: { initiated_corruption_investigation: true },
                },
            },
        ],
    },
    
    // ========== CRISIS INTERNACIONALES ==========
    {
        id: 'border_tension',
        title: 'Tensión Fronteriza',
        description: 'Soldados de un país vecino han cruzado la frontera. No está claro si es una provocación deliberada o un error de navegación.',
        category: 'diplomatic',
        condition: {
            stabilityMax: 70,
        },
        weight: 0.4,
        choices: [
            {
                label: 'Movilizar tropas a la frontera',
                description: 'Muestra de fuerza - puede escalar el conflicto',
                consequences: {
                    immediate: {
                        budget: -15,
                        stability: -5,
                    },
                    approvalModifiers: [
                        { groupId: 'military', modifier: 15, duration: 6 },
                    ],
                    storyVars: { militarized_border: true },
                    delayed: {
                        eventId: 'border_conflict_escalates',
                        turnsDelay: 2,
                    },
                },
            },
            {
                label: 'Negociar diplomáticamente',
                description: 'Solución pacífica pero puede verse como debilidad',
                consequences: {
                    immediate: {
                        popularity: -3,
                    },
                    approvalModifiers: [
                        { groupId: 'military', modifier: -10, duration: 3 },
                    ],
                    storyVars: { negotiated_border_crisis: true },
                },
            },
        ],
    },
    
    // ========== DESASTRES NATURALES ==========
    {
        id: 'earthquake',
        title: '🌍 Terremoto Devastador',
        description: 'Un terremoto de magnitud 7.8 ha sacudido la región central. Miles de edificios colapsados, víctimas mortales confirmadas. Se declara emergencia nacional.',
        category: 'disaster',
        weight: 0.1,
        onActivate: {
            immediate: {
                budget: -50,
                popularity: -10,
                stability: -15,
            },
        },
        choices: [
            {
                label: 'Movilizar ayuda de emergencia',
                description: 'Respuesta rápida del gobierno',
                requirements: {
                    budget: 100,
                },
                consequences: {
                    immediate: {
                        budget: -100,
                        popularity: 12,
                    },
                    storyVars: { emergency_response_effective: true },
                },
            },
            {
                label: 'Solicitar ayuda internacional',
                description: 'Aceptar asistencia externa',
                consequences: {
                    immediate: {
                        popularity: -5,
                        budget: 50, // Ayuda externa
                    },
                    storyVars: { accepted_foreign_aid: true },
                },
            },
            {
                label: 'Respuesta mínima',
                description: 'No hay presupuesto para más',
                consequences: {
                    immediate: {
                        popularity: -20,
                        humanRights: -10,
                    },
                    delayed: {
                        eventId: 'earthquake_aftermath_crisis',
                        turnsDelay: 1,
                    },
                },
            },
        ],
    },
    
    // ========== EVENTOS DE CADENA ==========
    {
        id: 'union_revenge',
        title: 'Los Sindicatos Recuerdan',
        description: 'Los sindicatos no han olvidado la represión de la huelga. Han organizado un paro general coordinado que paraliza el país.',
        category: 'social',
        chainId: 'transport_strike_chain',
        chainStage: 2,
        condition: {
            storyVars: { suppressed_transport_strike: true },
        },
        onActivate: {
            immediate: {
                popularity: -15,
                stability: -10,
            },
        },
        choices: [
            {
                label: 'Finalmente negociar',
                description: 'Ceder ante la presión',
                consequences: {
                    immediate: {
                        budget: -25,
                        popularity: 5,
                    },
                    approvalModifiers: [
                        { groupId: 'unions', modifier: 10, duration: 6 },
                    ],
                },
            },
            {
                label: 'Represión total',
                description: 'Línea dura - consecuencias graves',
                consequences: {
                    immediate: {
                        popularity: -25,
                        humanRights: -15,
                        stability: 10,
                    },
                    storyVars: { authoritarian_crackdown: true },
                    delayed: {
                        eventId: 'international_condemnation',
                        turnsDelay: 1,
                    },
                },
            },
        ],
    },
    
    // Mantener eventos viejos por compatibilidad
    {
        id: 'corruption_scandal',
        title: 'Escándalo de Corrupción',
        description: 'Un ministro clave ha sido implicado en un esquema de sobornos.',
        category: 'scandal',
        trigger: (state) => state.resources.stability < 40 && Math.random() < 0.1,
        choices: [
            {
                label: 'Despedir al Ministro',
                description: 'Popularidad +5. Lealtad del Gabinete -10.',
                consequences: {
                    immediate: {
                        popularity: 5,
                    },
                },
            },
            {
                label: 'Encubrir',
                description: 'Costo: 20 Capital Político. Riesgo de filtración futura.',
                consequences: {
                    immediate: {
                        politicalCapital: -20,
                    },
                },
            }
        ]
    },
    {
        id: 'imf_loan',
        title: 'Oferta del FMI',
        description: 'El FMI ofrece un préstamo de emergencia a cambio de medidas de austeridad.',
        category: 'economic',
        trigger: (state) => state.resources.budget < -10, // Budget deficit
        choices: [
            {
                label: 'Aceptar Préstamo',
                description: 'Presupuesto +$50B. Popularidad -15. Gasto Público -20%.',
                consequences: {
                    immediate: {
                        budget: 50,
                        popularity: -15,
                    },
                },
            },
            {
                label: 'Rechazar',
                description: 'Mantener soberanía. Crisis fiscal continúa.',
                consequences: {},
            }
        ]
    },
    
    // ========== STORYLINE EVENTS ==========
    ...STORYLINE_EVENTS,
];

