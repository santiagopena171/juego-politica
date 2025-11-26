import type { GameState } from '../context/GameContext';
import type { 
    InterestGroup, 
    InterestGroupType, 
    Protest, 
    MediaState, 
    ApprovalModifier,
    ProtestResolution,
    ProtestAction,
    SocialData 
} from '../types/social';

/**
 * Genera los grupos de interés iniciales para un país
 */
export const generateInterestGroups = (
    totalPopulation: number,
    ideology: 'Left' | 'Center' | 'Right'
): InterestGroup[] => {
    const groups: InterestGroup[] = [
        {
            id: 'unions',
            type: 'Unions',
            name: 'Sindicatos y Trabajadores',
            description: 'Organizaciones laborales que representan a los trabajadores del sector formal',
            populationSize: Math.floor(totalPopulation * 0.25), // 25% de población
            approval: ideology === 'Left' ? 65 : ideology === 'Center' ? 50 : 40,
            power: 75, // Alta capacidad de disrupción (huelgas)
            concerns: ['Salarios', 'Derechos Laborales', 'Desempleo', 'Seguridad Social'],
            ideology: 'Left'
        },
        {
            id: 'business',
            type: 'Business',
            name: 'Empresarios y Sector Privado',
            description: 'Cámaras empresariales, grandes corporaciones y PYMES',
            populationSize: Math.floor(totalPopulation * 0.15), // 15% de población
            approval: ideology === 'Right' ? 70 : ideology === 'Center' ? 50 : 35,
            power: 80, // Muy alta (control económico)
            concerns: ['Impuestos', 'Regulaciones', 'Estabilidad', 'Comercio'],
            ideology: 'Right'
        },
        {
            id: 'religious',
            type: 'Religious',
            name: 'Grupos Religiosos',
            description: 'Iglesias, organizaciones religiosas y fieles practicantes',
            populationSize: Math.floor(totalPopulation * 0.30), // 30% de población
            approval: 55, // Neutral al inicio
            power: 60,
            concerns: ['Valores Morales', 'Educación', 'Familia', 'Libertad Religiosa'],
            ideology: 'Center'
        },
        {
            id: 'students',
            type: 'Students',
            name: 'Estudiantes y Juventud',
            description: 'Estudiantes universitarios y secundarios, movimientos juveniles',
            populationSize: Math.floor(totalPopulation * 0.12), // 12% de población
            approval: ideology === 'Left' ? 60 : 45,
            power: 70, // Alta (movilización rápida)
            concerns: ['Educación', 'Empleo Juvenil', 'Cambio Social', 'Medio Ambiente'],
            ideology: 'Left'
        },
        {
            id: 'military',
            type: 'Military',
            name: 'Fuerzas Armadas',
            description: 'Militares activos, veteranos y familias militares',
            populationSize: Math.floor(totalPopulation * 0.05), // 5% de población
            approval: 60, // Neutral/leal al inicio
            power: 95, // Extremadamente alta (golpe de estado)
            concerns: ['Presupuesto Militar', 'Seguridad Nacional', 'Orden Público'],
            ideology: 'Right'
        },
        {
            id: 'rural',
            type: 'Rural',
            name: 'Sector Rural y Campesinos',
            description: 'Agricultores, campesinos y comunidades rurales',
            populationSize: Math.floor(totalPopulation * 0.13), // 13% de población
            approval: 50,
            power: 55,
            concerns: ['Agricultura', 'Infraestructura Rural', 'Subsidios', 'Tierra'],
            ideology: 'Center'
        }
    ];

    return groups;
};

/**
 * Calcula la popularidad global como promedio ponderado de los grupos
 */
export const calculateWeightedPopularity = (interestGroups: InterestGroup[]): number => {
    const totalPopulation = interestGroups.reduce((sum, group) => sum + group.populationSize, 0);
    
    if (totalPopulation === 0) return 50;

    const weightedApproval = interestGroups.reduce((sum, group) => {
        return sum + (group.approval * group.populationSize);
    }, 0);

    return Math.max(0, Math.min(100, weightedApproval / totalPopulation));
};

/**
 * Aplica modificadores de aprobación a grupos específicos
 */
export const applyApprovalModifiers = (
    groups: InterestGroup[],
    modifiers: ApprovalModifier[]
): InterestGroup[] => {
    return groups.map(group => {
        const relevantModifiers = modifiers.filter(m => m.groupType === group.type);
        const totalChange = relevantModifiers.reduce((sum, m) => sum + (m.change || 0), 0);
        
        return {
            ...group,
            approval: Math.max(0, Math.min(100, group.approval + totalChange))
        };
    });
};

/**
 * Verifica si se deben generar protestas
 */
export const checkForProtests = (
    interestGroups: InterestGroup[],
    currentProtests: Protest[],
    currentDate: Date
): Protest[] => {
    const newProtests: Protest[] = [...currentProtests];

    // Verificar cada grupo
    for (const group of interestGroups) {
        // Si el grupo ya está protestando, continuar
        if (newProtests.some(p => p.groupId === group.id)) continue;

        // Probabilidad de protesta basada en aprobación
        let protestChance = 0;
        if (group.approval < 20) protestChance = 0.8;
        else if (group.approval < 30) protestChance = 0.4;
        else if (group.approval < 40) protestChance = 0.1;

        // Ajustar por poder del grupo
        protestChance *= (group.power / 100);

        if (Math.random() < protestChance) {
            const intensity = Math.max(30, 100 - group.approval);
            const participants = Math.floor(group.populationSize * (intensity / 200));

            newProtests.push({
                id: `protest_${group.id}_${Date.now()}`,
                groupId: group.id,
                groupName: group.name,
                startDate: currentDate,
                duration: 0,
                intensity,
                demands: generateDemands(group),
                participants,
                economicImpact: -(intensity * group.power) / 10000, // -0.1% a -1% PIB
                stabilityImpact: -(intensity * group.power) / 1000, // -1 a -10 puntos
                escalating: false
            });
        }
    }

    return newProtests;
};

/**
 * Genera demandas específicas para un grupo
 */
const generateDemands = (group: InterestGroup): string[] => {
    const demandMap: { [key in InterestGroupType]: string[] } = {
        Unions: [
            'Aumento salarial del 20%',
            'Reducción de jornada laboral',
            'Mejores condiciones de trabajo',
            'Protección contra despidos'
        ],
        Business: [
            'Reducción de impuestos corporativos',
            'Menos regulaciones laborales',
            'Apertura comercial',
            'Subsidios para empresas'
        ],
        Religious: [
            'Prohibición del aborto',
            'Educación religiosa obligatoria',
            'Protección de valores tradicionales',
            'Mayor influencia en políticas públicas'
        ],
        Students: [
            'Educación gratuita y de calidad',
            'Más presupuesto para universidades',
            'Bolsas de trabajo',
            'Reforma educativa'
        ],
        Military: [
            'Aumento del presupuesto militar',
            'Mejores equipamientos',
            'Pensiones dignas',
            'Mano dura contra el crimen'
        ],
        Rural: [
            'Subsidios agrícolas',
            'Mejora de infraestructura rural',
            'Precios justos',
            'Acceso a créditos'
        ]
    };

    const allDemands = demandMap[group.type];
    // Seleccionar 2-3 demandas aleatorias
    const numDemands = Math.floor(Math.random() * 2) + 2;
    const selected: string[] = [];
    
    for (let i = 0; i < numDemands && allDemands.length > 0; i++) {
        const index = Math.floor(Math.random() * allDemands.length);
        selected.push(allDemands[index]);
        allDemands.splice(index, 1);
    }

    return selected;
};

/**
 * Actualiza protestas existentes (duración, escalada)
 */
export const updateProtests = (
    protests: Protest[],
    interestGroups: InterestGroup[]
): Protest[] => {
    return protests.map(protest => {
        const group = interestGroups.find(g => g.id === protest.groupId);
        if (!group) return protest;

        const newDuration = protest.duration + 1;
        
        // Verificar si escala
        let isEscalating = protest.escalating;
        if (!isEscalating && newDuration > 2 && group.approval < 25) {
            isEscalating = Math.random() < 0.3; // 30% chance de escalar
        }

        let newIntensity = protest.intensity;
        if (isEscalating) {
            newIntensity = Math.min(100, newIntensity + 10);
        }

        // Si la aprobación sube mucho, puede terminar naturalmente
        if (group.approval > 60) {
            return { ...protest, duration: newDuration, intensity: Math.max(0, newIntensity - 20) };
        }

        return {
            ...protest,
            duration: newDuration,
            intensity: newIntensity,
            escalating: isEscalating,
            participants: Math.floor(group.populationSize * (newIntensity / 200)),
            economicImpact: -(newIntensity * group.power) / 10000,
            stabilityImpact: -(newIntensity * group.power) / 1000
        };
    }).filter(p => p.intensity > 0); // Eliminar protestas que terminaron naturalmente
};

/**
 * Resuelve una acción del jugador sobre una protesta
 */
export const resolveProtestAction = (
    protest: Protest,
    action: ProtestAction,
    group: InterestGroup,
    availableBudget: number,
    availablePoliticalCapital: number
): ProtestResolution => {
    switch (action) {
        case 'negotiate': {
            // Negociar: cuesta capital político, puede terminar protesta
            const cost = 20;
            if (availablePoliticalCapital < cost) {
                return {
                    success: false,
                    protestEnded: false,
                    approvalChange: 0,
                    stabilityChange: 0,
                    politicalCapitalCost: 0,
                    consequences: ['Capital político insuficiente']
                };
            }

            const successChance = 0.6 + (group.approval / 200); // 60-90% según aprobación
            const success = Math.random() < successChance;

            if (success) {
                return {
                    success: true,
                    protestEnded: true,
                    approvalChange: 15,
                    stabilityChange: 5,
                    politicalCapitalCost: cost,
                    consequences: [
                        'Negociación exitosa',
                        `${group.name} acepta dialogar`,
                        'Prometiste considerar sus demandas'
                    ]
                };
            } else {
                return {
                    success: false,
                    protestEnded: false,
                    approvalChange: -5,
                    stabilityChange: -2,
                    politicalCapitalCost: cost,
                    consequences: [
                        'Negociación fallida',
                        'El grupo rechaza tus propuestas',
                        'La protesta continúa'
                    ]
                };
            }
        }

        case 'suppress': {
            // Reprimir: siempre termina la protesta, pero tiene consecuencias graves
            return {
                success: true,
                protestEnded: true,
                approvalChange: -25, // Pérdida masiva de aprobación
                stabilityChange: -10,
                politicalCapitalCost: 30,
                consequences: [
                    'Represión policial desplegada',
                    `${group.name} dispersado por la fuerza`,
                    'Críticas internacionales por violación de DDHH',
                    'Resentimiento profundo en la población',
                    'Riesgo de violencia futura'
                ]
            };
        }

        case 'concede': {
            // Ceder: termina protesta, gana aprobación, pero cuesta dinero/estabilidad
            const budgetCost = protest.intensity / 10; // 3-10B según intensidad
            
            if (availableBudget < budgetCost) {
                return {
                    success: false,
                    protestEnded: false,
                    approvalChange: 0,
                    stabilityChange: 0,
                    politicalCapitalCost: 0,
                    consequences: ['Presupuesto insuficiente para ceder a las demandas']
                };
            }

            return {
                success: true,
                protestEnded: true,
                approvalChange: 30,
                stabilityChange: 3,
                politicalCapitalCost: 10,
                consequences: [
                    'Gobierno cede a las demandas',
                    `${group.name} celebra la victoria`,
                    'Popularidad aumenta significativamente',
                    `Costo: $${budgetCost.toFixed(1)}B`
                ]
            };
        }

        case 'ignore':
        default: {
            // Ignorar: no cuesta nada, pero la protesta puede escalar
            const escalates = Math.random() < 0.4; // 40% chance de escalar
            
            if (escalates) {
                return {
                    success: false,
                    protestEnded: false,
                    approvalChange: -10,
                    stabilityChange: -5,
                    politicalCapitalCost: 0,
                    consequences: [
                        'Protesta ignorada',
                        'La situación se deteriora',
                        'La protesta se intensifica',
                        'Bloqueos de calles y paralización'
                    ]
                };
            } else {
                return {
                    success: true,
                    protestEnded: false,
                    approvalChange: -3,
                    stabilityChange: -1,
                    politicalCapitalCost: 0,
                    consequences: [
                        'Protesta ignorada',
                        'La situación se mantiene estable por ahora'
                    ]
                };
            }
        }
    }
};

/**
 * Calcula la tensión social general
 */
export const calculateSocialTension = (
    interestGroups: InterestGroup[],
    activeProtests: Protest[]
): number => {
    // Base: promedio inverso de aprobación
    const avgApproval = interestGroups.reduce((sum, g) => sum + g.approval, 0) / interestGroups.length;
    let tension = 100 - avgApproval;

    // Agregar tensión por protestas
    tension += activeProtests.length * 10;
    
    // Agregar tensión por intensidad de protestas
    const protestIntensity = activeProtests.reduce((sum, p) => sum + p.intensity, 0) / 100;
    tension += protestIntensity;

    return Math.max(0, Math.min(100, tension));
};

/**
 * Inicializa el estado social del país
 */
export const initializeSocialData = (
    population: number,
    ideology: 'Left' | 'Center' | 'Right'
): SocialData => {
    return {
        groups: [],
        interestGroups: generateInterestGroups(population, ideology),
        activeProtests: [],
        mediaState: {
            freedom: 70,
            support: 50,
            censorship: 10,
            publicMediaFunding: 0.5,
            scandalsExposed: 0
        },
        campaign: null,
        socialTension: 20, // Empezar con tensión baja
        humanRights: 80 // Empezar con índice alto
    };
};

/**
 * Aplica censura a los medios
 */
export const censorMedia = (mediaState: MediaState): {
    newMediaState: MediaState;
    consequences: string[];
} => {
    const newCensorship = Math.min(100, mediaState.censorship + 15);
    const newFreedom = Math.max(0, mediaState.freedom - 20);
    const newSupport = Math.min(100, mediaState.support + 10); // Apoyo a corto plazo

    return {
        newMediaState: {
            ...mediaState,
            censorship: newCensorship,
            freedom: newFreedom,
            support: newSupport
        },
        consequences: [
            'Censura impuesta a medios de comunicación',
            'Libertad de prensa severamente reducida',
            'Críticas internacionales por autoritarismo',
            'Oposición usa redes sociales para denunciar',
            'Aprobación internacional disminuye'
        ]
    };
};

/**
 * Financia medios públicos
 */
export const fundPublicMedia = (
    mediaState: MediaState,
    amount: number
): {
    newMediaState: MediaState;
    consequences: string[];
} => {
    const newFunding = mediaState.publicMediaFunding + amount;
    const supportIncrease = Math.min(15, amount * 10); // Máx +15 por cada $1.5B
    const newSupport = Math.min(100, mediaState.support + supportIncrease);

    return {
        newMediaState: {
            ...mediaState,
            publicMediaFunding: newFunding,
            support: newSupport
        },
        consequences: [
            `Inversión de $${amount.toFixed(1)}B en medios públicos`,
            'Cobertura gubernamental favorable aumenta',
            'Oposición critica propaganda oficialista',
            'Apoyo mediático se incrementa'
        ]
    };
};

/**
 * Calcula el efecto multiplicador de los medios sobre cambios de popularidad
 */
export const getMediaMultiplier = (mediaState: MediaState): number => {
    // Si los medios te apoyan, los escándalos bajan menos la popularidad
    // y los logros la suben más
    const supportFactor = (mediaState.support - 50) / 100; // -0.5 a +0.5
    return 1 + supportFactor; // 0.5 a 1.5
};

/**
 * Genera un escándalo mediático
 */
export const generateMediaScandal = (
    mediaState: MediaState,
    humanRights: number
): {
    scandal: string;
    approvalImpact: number;
    exposed: boolean;
} | null => {
    // Solo si hay libertad de prensa
    if (mediaState.freedom < 30) return null;
    
    // Probabilidad basada en libertad de prensa y censura
    const exposeProbability = (mediaState.freedom / 100) * (1 - mediaState.censorship / 100);
    
    if (Math.random() > exposeProbability * 0.1) return null; // 10% base

    const scandals = [
        { text: 'Corrupción en contrato público', impact: -15 },
        { text: 'Ministro involucrado en tráfico de influencias', impact: -20 },
        { text: 'Uso indebido de fondos públicos', impact: -12 },
        { text: 'Nepotismo en nombramientos', impact: -10 },
        { text: 'Encubrimiento de violaciones a DDHH', impact: -25 }
    ];

    const scandal = scandals[Math.floor(Math.random() * scandals.length)];
    
    // El impacto se reduce si los medios te apoyan
    const mediaMultiplier = getMediaMultiplier(mediaState);
    const finalImpact = scandal.impact * mediaMultiplier;

    return {
        scandal: scandal.text,
        approvalImpact: finalImpact,
        exposed: true
    };
};

/**
 * Inicia una campaña electoral
 */
export const startElectoralCampaign = (monthsUntilElection: number) => {
    return {
        active: true,
        monthsUntilElection,
        governmentBudget: 0,
        oppositionBudget: Math.random() * 5 + 2, // 2-7B estimado
        ralliesHeld: 0,
        debatesScheduled: 2,
        smearCampaigns: 0,
        momentum: 0
    };
};

/**
 * Realiza un mitin de campaña
 */
export const holdRally = (
    targetGroup: InterestGroupType,
    targetRegion: string | null,
    budget: number
): {
    cost: number;
    approvalChange: number;
    momentumChange: number;
    consequences: string[];
} => {
    const baseCost = 0.5; // $0.5B por mitin
    
    if (budget < baseCost) {
        return {
            cost: 0,
            approvalChange: 0,
            momentumChange: 0,
            consequences: ['Presupuesto insuficiente para el mitin']
        };
    }

    // Efectividad basada en inversión (máximo +10 aprobación)
    const effectiveness = Math.min(10, budget * 5);
    
    return {
        cost: baseCost,
        approvalChange: effectiveness,
        momentumChange: 5,
        consequences: [
            'Mitin exitoso realizado',
            `${targetGroup} muestra mayor apoyo`,
            targetRegion ? `Impacto en región: ${targetRegion}` : 'Impacto nacional',
            'Momentum de campaña aumenta'
        ]
    };
};

/**
 * Lanza una campaña sucia
 */
export const launchSmearCampaign = (
    budget: number,
    politicalCapital: number
): {
    cost: number;
    politicalCapitalCost: number;
    oppositionDamage: number;
    backfireRisk: number;
    consequences: string[];
} => {
    const baseCost = 1.0; // $1B por campaña sucia
    const pcCost = 25; // 25 capital político
    
    if (budget < baseCost || politicalCapital < pcCost) {
        return {
            cost: 0,
            politicalCapitalCost: 0,
            oppositionDamage: 0,
            backfireRisk: 0,
            consequences: ['Recursos insuficientes para campaña sucia']
        };
    }

    // 30% de probabilidad de contraataque
    const backfires = Math.random() < 0.3;
    
    if (backfires) {
        return {
            cost: baseCost,
            politicalCapitalCost: pcCost,
            oppositionDamage: 0,
            backfireRisk: 1,
            consequences: [
                '¡Campaña sucia descubierta!',
                'Oposición expone tus tácticas',
                'Pierdes credibilidad ante el público',
                'Efecto boomerang: -15 popularidad'
            ]
        };
    }

    return {
        cost: baseCost,
        politicalCapitalCost: pcCost,
        oppositionDamage: 10, // Reduce efectividad de oposición
        backfireRisk: 0,
        consequences: [
            'Campaña sucia lanzada exitosamente',
            'Oposición en la defensiva',
            'Medios cuestionan credibilidad de rivales',
            'Ganas ventaja en encuestas'
        ]
    };
};

/**
 * Actualiza el estado de la campaña mensualmente
 */
export const updateCampaign = (campaign: any, newBudgetSpent: number) => {
    if (!campaign || !campaign.active) return campaign;

    return {
        ...campaign,
        monthsUntilElection: campaign.monthsUntilElection - 1,
        governmentBudget: campaign.governmentBudget + newBudgetSpent,
        // Momentum decae con el tiempo si no hay actividad
        momentum: Math.max(-50, campaign.momentum - 2)
    };
};
