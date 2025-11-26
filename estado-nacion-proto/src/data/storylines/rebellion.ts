import type { Storyline, GameEvent } from '../events';

/**
 * STORYLINE: Insurgencia Rural
 * 
 * Una historia ramificada de 5 etapas sobre una insurgencia en zonas rurales
 * que puede terminar en paz negociada, victoria militar, o guerra civil total.
 * 
 * Variables ocultas:
 * - insurgency_strength: 0-100 (fuerza de la insurgencia)
 * - government_brutality: 0-100 (brutalidad del gobierno)
 * - rural_support: 0-100 (apoyo rural al gobierno)
 * - international_pressure: 0-100 (presión internacional)
 */

export const REBELLION_STORYLINE: Storyline = {
    id: 'rural_insurgency',
    name: 'Insurgencia Rural',
    description: 'Una rebelión armada emerge en las zonas rurales del país. Tus decisiones determinarán si esto se resuelve con diálogo, fuerza, o se convierte en una guerra civil devastadora.',
    requiredConditions: {
        monthsSinceGameStart: 6, // Después de 6 meses de juego
        popularityMax: 55, // Solo si popularidad es baja
        customCheck: (state) => {
            // Requiere que haya descontento rural
            const ruralGroup = state.social.interestGroups.find(g => g.type === 'Rural');
            return ruralGroup ? ruralGroup.approval < 40 : false;
        }
    },
    stages: [
        {
            stage: 1,
            title: 'Primeros Disturbios',
            description: 'Reportes de sabotaje en zonas rurales',
            eventId: 'rebellion_stage_1',
            autoAdvance: true, // Avanza automáticamente después de resolver
        },
        {
            stage: 2,
            title: 'Formación de Milicias',
            description: 'Los rebeldes se organizan',
            eventId: 'rebellion_stage_2',
            advanceCondition: {
                storyVars: { rebellion_stage_1_resolved: true }
            },
        },
        {
            stage: 3,
            title: 'Ataques Coordinados',
            description: 'La insurgencia se fortalece',
            eventId: 'rebellion_stage_3',
            advanceCondition: {
                storyVars: { rebellion_stage_2_resolved: true }
            },
        },
        {
            stage: 4,
            title: 'Punto de Inflexión',
            description: 'Decisión crítica sobre el conflicto',
            eventId: 'rebellion_stage_4',
            advanceCondition: {
                storyVars: { rebellion_stage_3_resolved: true }
            },
        },
        {
            stage: 5,
            title: 'Resolución',
            description: 'El desenlace del conflicto',
            eventId: 'rebellion_stage_5',
            advanceCondition: {
                storyVars: { rebellion_stage_4_resolved: true }
            },
        },
    ],
    possibleEndings: [
        {
            id: 'peace_negotiated',
            name: 'Paz Negociada',
            description: 'Has negociado exitosamente con los rebeldes. El conflicto termina con reformas agrarias y amnistía.',
            requiredVars: {
                rebellion_path: 'diplomatic',
                insurgency_strength: { max: 60 },
                government_brutality: { max: 40 },
            },
            effects: {
                immediate: {
                    popularity: 15,
                    stability: 20,
                },
                approvalModifiers: [
                    { groupId: 'rural', modifier: 30, duration: 24 },
                    { groupId: 'military', modifier: -15, duration: 12 },
                ],
            },
        },
        {
            id: 'military_victory',
            name: 'Victoria Militar',
            description: 'Has aplastado la insurgencia con fuerza militar. La paz vuelve, pero a un costo.',
            requiredVars: {
                rebellion_path: 'military',
                insurgency_strength: { max: 50 },
                government_brutality: { min: 50 },
            },
            effects: {
                immediate: {
                    popularity: -10,
                    stability: 15,
                    humanRights: -20,
                },
                approvalModifiers: [
                    { groupId: 'military', modifier: 25, duration: 18 },
                    { groupId: 'rural', modifier: -40, duration: 36 },
                ],
            },
        },
        {
            id: 'civil_war',
            name: 'Guerra Civil',
            description: 'El conflicto ha escalado a una guerra civil total. El país está destrozado.',
            requiredVars: {
                insurgency_strength: { min: 70 },
                government_brutality: { min: 60 },
            },
            effects: {
                immediate: {
                    popularity: -30,
                    stability: -40,
                    budget: -200,
                },
            },
            isGameEnding: true, // Termina el juego
        },
        {
            id: 'stalemate',
            name: 'Punto Muerto',
            description: 'Ni el gobierno ni los rebeldes pueden ganar. El conflicto de baja intensidad continúa.',
            requiredVars: {
                insurgency_strength: { min: 40, max: 70 },
                government_brutality: { min: 30, max: 60 },
            },
            effects: {
                immediate: {
                    popularity: -15,
                    stability: -10,
                },
                approvalModifiers: [
                    { groupId: 'rural', modifier: -20, duration: 24 },
                ],
            },
        },
    ],
};

// Eventos de la storyline
export const REBELLION_EVENTS: GameEvent[] = [
    // Etapa 1: Primeros Disturbios
    {
        id: 'rebellion_stage_1',
        title: '🔥 Disturbios en el Campo',
        description: 'Campesinos de las zonas rurales han bloqueado carreteras y quemado cosechas. Exigen reforma agraria y mejor acceso a servicios. Los líderes locales advierten que esto es solo el comienzo.',
        category: 'storyline',
        storylineId: 'rural_insurgency',
        storyStage: 1,
        choices: [
            {
                label: 'Enviar mediadores para dialogar',
                description: 'Enfoque diplomático - ganar tiempo y confianza',
                consequences: {
                    immediate: {
                        budget: -5,
                        popularity: 3,
                    },
                    storyVars: {
                        rebellion_stage_1_resolved: true,
                        rebellion_path: 'diplomatic',
                        insurgency_strength: 20,
                        rural_support: 60,
                    },
                    approvalModifiers: [
                        { groupId: 'rural', modifier: 10, duration: 6 },
                        { groupId: 'military', modifier: -5, duration: 3 },
                    ],
                },
            },
            {
                label: 'Desplegar policía antidisturbios',
                description: 'Restaurar el orden con fuerza',
                consequences: {
                    immediate: {
                        budget: -10,
                        popularity: -5,
                        stability: 5,
                    },
                    storyVars: {
                        rebellion_stage_1_resolved: true,
                        rebellion_path: 'military',
                        insurgency_strength: 40,
                        government_brutality: 30,
                        rural_support: 30,
                    },
                    approvalModifiers: [
                        { groupId: 'rural', modifier: -20, duration: 12 },
                        { groupId: 'military', modifier: 10, duration: 6 },
                    ],
                    delayed: {
                        eventId: 'rebellion_stage_2',
                        turnsDelay: 2,
                    },
                },
            },
            {
                label: 'Ignorar - es solo agitación temporal',
                description: 'No intervenir y esperar que se calme',
                consequences: {
                    immediate: {
                        politicalCapital: 5,
                    },
                    storyVars: {
                        rebellion_stage_1_resolved: true,
                        rebellion_path: 'neglect',
                        insurgency_strength: 50,
                        rural_support: 20,
                    },
                    delayed: {
                        eventId: 'rebellion_stage_2',
                        turnsDelay: 1,
                    },
                },
            },
        ],
    },

    // Etapa 2: Formación de Milicias
    {
        id: 'rebellion_stage_2',
        title: '⚔️ Milicias Armadas',
        description: 'Los disturbios han evolucionado. Reportes de inteligencia confirman que grupos armados se están formando en las montañas. Han atacado un puesto policial, robando armas. El líder rebelde "El Comandante" envía un manifiesto exigiendo cambios estructurales.',
        category: 'storyline',
        storylineId: 'rural_insurgency',
        storyStage: 2,
        choices: [
            {
                label: 'Ofrecer amnistía y reformas',
                description: 'Propuesta de paz con concesiones reales',
                requirements: {
                    politicalCapital: 30,
                },
                consequences: {
                    immediate: {
                        politicalCapital: -30,
                        budget: -25,
                        popularity: 5,
                    },
                    storyVars: {
                        rebellion_stage_2_resolved: true,
                        rebellion_path: 'diplomatic',
                        insurgency_strength: 30,
                        rural_support: 75,
                    },
                    approvalModifiers: [
                        { groupId: 'rural', modifier: 20, duration: 12 },
                        { groupId: 'business', modifier: -10, duration: 6 },
                    ],
                    delayed: {
                        eventId: 'rebellion_stage_3',
                        turnsDelay: 3,
                    },
                },
            },
            {
                label: 'Operación militar de contrainsurgencia',
                description: 'Desplegar el ejército para eliminar la amenaza',
                requirements: {
                    budget: 50,
                },
                consequences: {
                    immediate: {
                        budget: -50,
                        popularity: -10,
                        stability: 10,
                    },
                    storyVars: {
                        rebellion_stage_2_resolved: true,
                        rebellion_path: 'military',
                        insurgency_strength: 50,
                        government_brutality: 60,
                        rural_support: 20,
                        international_pressure: 40,
                    },
                    approvalModifiers: [
                        { groupId: 'military', modifier: 20, duration: 12 },
                        { groupId: 'rural', modifier: -30, duration: 18 },
                    ],
                    delayed: {
                        eventId: 'rebellion_stage_3',
                        turnsDelay: 2,
                    },
                },
            },
        ],
    },

    // Etapa 3: Ataques Coordinados
    {
        id: 'rebellion_stage_3',
        title: '💣 Ofensiva Rebelde',
        description: 'Los rebeldes han lanzado ataques coordinados contra infraestructura clave. Han tomado control de dos pueblos rurales. Las imágenes de civiles apoyando a los insurgentes circulan en redes sociales. ONGs internacionales expresan preocupación.',
        category: 'storyline',
        storylineId: 'rural_insurgency',
        storyStage: 3,
        choices: [
            {
                label: 'Negociación con mediación internacional',
                description: 'Buscar solución diplomática con presión externa',
                consequences: {
                    immediate: {
                        popularity: -5,
                        politicalCapital: -20,
                    },
                    storyVars: {
                        rebellion_stage_3_resolved: true,
                        rebellion_path: 'diplomatic',
                        insurgency_strength: 40,
                        international_pressure: 20,
                    },
                    delayed: {
                        eventId: 'rebellion_stage_4',
                        turnsDelay: 2,
                    },
                },
            },
            {
                label: 'Contraofensiva total',
                description: 'Reconquistar territorio con fuerza abrumadora',
                requirements: {
                    budget: 100,
                },
                consequences: {
                    immediate: {
                        budget: -100,
                        popularity: -15,
                        humanRights: -15,
                    },
                    storyVars: {
                        rebellion_stage_3_resolved: true,
                        rebellion_path: 'military',
                        insurgency_strength: 60,
                        government_brutality: 80,
                        international_pressure: 70,
                    },
                    hidden: 'Esto puede escalar a guerra civil',
                    delayed: {
                        eventId: 'rebellion_stage_4',
                        turnsDelay: 1,
                    },
                },
            },
            {
                label: 'Estrategia de "corazones y mentes"',
                description: 'Inversión social en zonas rebeldes + amnistía',
                requirements: {
                    budget: 75,
                    politicalCapital: 25,
                },
                consequences: {
                    immediate: {
                        budget: -75,
                        politicalCapital: -25,
                        popularity: 8,
                    },
                    storyVars: {
                        rebellion_stage_3_resolved: true,
                        rebellion_path: 'hearts_and_minds',
                        insurgency_strength: 25,
                        rural_support: 80,
                    },
                    approvalModifiers: [
                        { groupId: 'rural', modifier: 25, duration: 18 },
                    ],
                    delayed: {
                        eventId: 'rebellion_stage_4',
                        turnsDelay: 3,
                    },
                },
            },
        ],
    },

    // Etapa 4: Punto de Inflexión
    {
        id: 'rebellion_stage_4',
        title: '🎯 Momento Decisivo',
        description: 'La situación ha alcanzado un punto crítico. El Comandante ha aceptado reunirse contigo secretamente, pero tus generales piden permiso para una operación de captura. La decisión de hoy definirá el futuro del conflicto.',
        category: 'storyline',
        storylineId: 'rural_insurgency',
        storyStage: 4,
        choices: [
            {
                label: 'Reunirte personalmente con El Comandante',
                description: 'Arriesgado pero puede terminar el conflicto',
                consequences: {
                    immediate: {
                        popularity: -10,
                        politicalCapital: -30,
                    },
                    storyVars: {
                        rebellion_stage_4_resolved: true,
                        rebellion_ending: 'peace_negotiated',
                        insurgency_strength: 10,
                    },
                    delayed: {
                        eventId: 'rebellion_stage_5_peace',
                        turnsDelay: 1,
                    },
                },
                tooltip: 'Camino hacia la paz negociada',
            },
            {
                label: 'Autorizar la operación de captura',
                description: 'Decapitar el liderazgo rebelde',
                consequences: {
                    immediate: {
                        budget: -40,
                    },
                    storyVars: {
                        rebellion_stage_4_resolved: true,
                        rebellion_ending: 'military_victory',
                        government_brutality: 90,
                    },
                    delayed: {
                        eventId: 'rebellion_stage_5_military',
                        turnsDelay: 1,
                    },
                },
                tooltip: 'Camino hacia la victoria militar',
            },
            {
                label: 'Seguir con la estrategia actual',
                description: 'Mantener el curso sin grandes cambios',
                consequences: {
                    immediate: {
                        stability: -5,
                    },
                    storyVars: {
                        rebellion_stage_4_resolved: true,
                        rebellion_ending: 'stalemate',
                        insurgency_strength: 55,
                    },
                    delayed: {
                        eventId: 'rebellion_stage_5_stalemate',
                        turnsDelay: 2,
                    },
                },
                tooltip: 'Camino hacia el punto muerto',
            },
        ],
    },

    // Etapas 5 (Finales múltiples)
    {
        id: 'rebellion_stage_5_peace',
        title: '🕊️ Acuerdo de Paz',
        description: 'Después de semanas de negociaciones secretas, has firmado un acuerdo de paz con los rebeldes. Incluye reforma agraria, amnistía, y representación política para las comunidades rurales. Es un día histórico para el país.',
        category: 'storyline',
        storylineId: 'rural_insurgency',
        storyStage: 5,
        choices: [
            {
                label: 'Anunciar el acuerdo al país',
                description: 'Final: Paz Negociada',
                consequences: {
                    immediate: {
                        popularity: 20,
                        stability: 25,
                    },
                    approvalModifiers: [
                        { groupId: 'rural', modifier: 35, duration: 36 },
                        { groupId: 'military', modifier: -15, duration: 12 },
                    ],
                    storyVars: {
                        rebellion_completed: true,
                        rebellion_outcome: 'peace',
                    },
                },
            },
        ],
    },
    {
        id: 'rebellion_stage_5_military',
        title: '🎖️ Victoria Militar',
        description: 'La operación fue un éxito. El Comandante ha sido capturado y los rebeldes restantes se han dispersado. Has restaurado el control del gobierno, pero las zonas rurales permanecen tensas y resentidas.',
        category: 'storyline',
        storylineId: 'rural_insurgency',
        storyStage: 5,
        choices: [
            {
                label: 'Declarar victoria y fortalecer presencia militar',
                description: 'Final: Victoria Militar',
                consequences: {
                    immediate: {
                        popularity: -5,
                        stability: 20,
                        humanRights: -25,
                    },
                    approvalModifiers: [
                        { groupId: 'military', modifier: 30, duration: 24 },
                        { groupId: 'rural', modifier: -45, duration: 48 },
                    ],
                    storyVars: {
                        rebellion_completed: true,
                        rebellion_outcome: 'military',
                    },
                },
            },
        ],
    },
    {
        id: 'rebellion_stage_5_stalemate',
        title: '⚖️ Conflicto Congelado',
        description: 'El conflicto continúa en un estado de baja intensidad. Ni tú ni los rebeldes tienen la fuerza para ganar decisivamente. El país aprende a vivir con esta nueva realidad incómoda.',
        category: 'storyline',
        storylineId: 'rural_insurgency',
        storyStage: 5,
        choices: [
            {
                label: 'Aceptar la situación',
                description: 'Final: Punto Muerto',
                consequences: {
                    immediate: {
                        popularity: -12,
                        stability: -5,
                    },
                    approvalModifiers: [
                        { groupId: 'rural', modifier: -25, duration: 36 },
                    ],
                    storyVars: {
                        rebellion_completed: true,
                        rebellion_outcome: 'stalemate',
                    },
                },
            },
        ],
    },
];
