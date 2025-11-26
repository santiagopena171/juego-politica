/**
 * Organización de las Naciones Unidas (ONU) - Organismo Internacional Principal
 * Sistema de resoluciones, votaciones y consecuencias globales
 */

import type { InternationalOrganization, Resolution } from '../types/diplomacy';

// Consejo de Seguridad de la ONU (miembros permanentes con veto)
export const UN_SECURITY_COUNCIL_PERMANENT = ['USA', 'RUS', 'CHN', 'GBR', 'FRA'];

// Miembros no permanentes rotativos (simplificado - en realidad son 10 y rotan cada 2 años)
export const UN_SECURITY_COUNCIL_NON_PERMANENT = [
    'BRA', 'IND', 'JPN', 'DEU', 'MEX', 'NGA', 'EGY', 'SAU', 'AUS', 'ARG'
];

/**
 * Organización de las Naciones Unidas
 */
export const UNITED_NATIONS: InternationalOrganization = {
    id: 'UN',
    name: 'Organización de las Naciones Unidas',
    type: 'global',
    
    // Todos los países son miembros (casi)
    members: [], // Se llenará dinámicamente con todos los países del juego
    
    foundingYear: 1945,
    
    // Poder de voto en el Consejo de Seguridad
    votingPower: {
        // Miembros permanentes tienen veto (peso infinito en práctica)
        'USA': 10,
        'RUS': 10,
        'CHN': 10,
        'GBR': 10,
        'FRA': 10,
        // Miembros no permanentes
        'BRA': 1,
        'IND': 1,
        'JPN': 1,
        'DEU': 1,
        'MEX': 1,
        'NGA': 1,
        'EGY': 1,
        'SAU': 1,
        'AUS': 1,
        'ARG': 1,
    },
    
    activeResolutions: [],
    historicalResolutions: [],
    
    canProposeSanctions: true,
    canAuthorizeWar: true,
    providesEconomicAid: true,
};

/**
 * Templates de resoluciones comunes
 */
export const RESOLUTION_TEMPLATES: Record<string, Omit<Resolution, 'id' | 'proposedBy' | 'targetCountry' | 'votesInFavor' | 'votesAgainst' | 'votesAbstain' | 'status' | 'votingDeadline'>> = {
    CONDEMN_HUMAN_RIGHTS: {
        type: 'human_rights',
        title: 'Condena por Violaciones de Derechos Humanos',
        description: 'Resolución para condenar formalmente las violaciones sistemáticas de derechos humanos',
        consequences: {
            tradePenalty: {
                countries: [], // Se llenarán dinámicamente
                amount: 10, // -10% comercio
            },
        },
    },
    
    IMPOSE_SANCTIONS_AGGRESSION: {
        type: 'sanctions',
        title: 'Sanciones por Agresión Militar',
        description: 'Imposición de sanciones económicas debido a actos de agresión no provocada',
        consequences: {
            applySanctions: {
                id: '',
                type: 'total',
                imposedBy: ['UN'],
                targetCountry: '',
                reason: 'Agresión militar no provocada',
                startDate: { month: 1, year: 2025 },
                economicImpact: {
                    gdpReduction: 3,
                    inflationIncrease: 2,
                    tradeReduction: 60,
                },
            },
        },
    },
    
    AUTHORIZE_INTERVENTION: {
        type: 'intervention',
        title: 'Autorización de Intervención Militar',
        description: 'Autorización para intervención militar humanitaria o de mantenimiento de paz',
        consequences: {
            militaryIntervention: true,
        },
    },
    
    CLIMATE_ACCORD: {
        type: 'climate',
        title: 'Acuerdo Global contra el Cambio Climático',
        description: 'Compromiso vinculante para reducir emisiones de carbono',
        consequences: {
            // Los países que no cumplan reciben penalizaciones comerciales
            tradePenalty: {
                countries: [],
                amount: 15,
            },
        },
    },
    
    PEACEKEEPING_MISSION: {
        type: 'peacekeeping',
        title: 'Misión de Mantenimiento de Paz',
        description: 'Despliegue de fuerzas de paz de la ONU para estabilizar región en conflicto',
        consequences: {
            economicAid: {
                amount: 50, // 50B en ayuda
                recipients: [],
            },
        },
    },
    
    TRADE_AGREEMENT_GLOBAL: {
        type: 'trade',
        title: 'Tratado de Libre Comercio Global',
        description: 'Reducción de barreras comerciales entre naciones miembro',
        consequences: {
            // Los que voten a favor reciben bonus comercial
        },
    },
};

/**
 * Crea una nueva resolución basada en un template
 */
export const createResolution = (
    templateKey: keyof typeof RESOLUTION_TEMPLATES,
    proposedBy: string,
    targetCountry: string | undefined,
    currentDate: { month: number; year: number }
): Resolution => {
    const template = RESOLUTION_TEMPLATES[templateKey];
    
    // Deadline de votación: 1 mes desde propuesta
    const votingDeadline = {
        month: currentDate.month === 12 ? 1 : currentDate.month + 1,
        year: currentDate.month === 12 ? currentDate.year + 1 : currentDate.year,
    };
    
    return {
        id: `RES_${Date.now()}_${templateKey}`,
        ...template,
        proposedBy,
        targetCountry,
        votesInFavor: [],
        votesAgainst: [],
        votesAbstain: [],
        status: 'proposed',
        votingDeadline,
    };
};

/**
 * Calcula si una resolución pasa en el Consejo de Seguridad
 * Requiere mayoría simple + ningún veto de miembros permanentes
 */
export const calculateResolutionResult = (
    resolution: Resolution,
    votingPower: Record<string, number>
): { passed: boolean; reason: string } => {
    // Verificar vetos de miembros permanentes
    for (const permanentMember of UN_SECURITY_COUNCIL_PERMANENT) {
        if (resolution.votesAgainst.includes(permanentMember)) {
            return {
                passed: false,
                reason: `Vetado por ${permanentMember}`,
            };
        }
    }
    
    // Calcular votos ponderados
    let favorPower = 0;
    let againstPower = 0;
    
    resolution.votesInFavor.forEach(countryId => {
        favorPower += votingPower[countryId] || 1;
    });
    
    resolution.votesAgainst.forEach(countryId => {
        againstPower += votingPower[countryId] || 1;
    });
    
    // Requiere mayoría simple (más votos a favor que en contra)
    if (favorPower > againstPower) {
        return {
            passed: true,
            reason: `Aprobado con ${favorPower} votos a favor vs ${againstPower} en contra`,
        };
    } else {
        return {
            passed: false,
            reason: `Rechazado: ${againstPower} votos en contra vs ${favorPower} a favor`,
        };
    }
};

/**
 * Calcula el costo de lobbying para influir en el voto de un país
 * Depende de la relación actual y la alineación ideológica
 */
export const calculateLobbyingCost = (
    targetCountry: string,
    playerRelation: number,
    ideologyAlignment: number, // 0-100, qué tan alineados están ideológicamente
    resolutionType: Resolution['type']
): { cost: number; successChance: number } => {
    // Costo base por tipo de resolución
    const baseCost: Record<Resolution['type'], number> = {
        'condemnation': 10,
        'sanctions': 20,
        'intervention': 30,
        'climate': 15,
        'trade': 10,
        'human_rights': 12,
        'peacekeeping': 18,
    };
    
    const base = baseCost[resolutionType];
    
    // Ajustar por relación (mejor relación = más barato)
    const relationFactor = 2 - (playerRelation / 100); // 2.0 a 1.0
    
    // Ajustar por ideología (más alineados = más barato)
    const ideologyFactor = 1.5 - (ideologyAlignment / 200); // 1.5 a 1.0
    
    const cost = Math.round(base * relationFactor * ideologyFactor);
    
    // Chance de éxito
    const baseChance = 40;
    const relationBonus = playerRelation * 0.4; // +0 a +40
    const ideologyBonus = ideologyAlignment * 0.2; // +0 a +20
    
    const successChance = Math.min(95, baseChance + relationBonus + ideologyBonus);
    
    return { cost, successChance };
};

/**
 * Determina cómo votará un país AI en una resolución
 */
export const determineAIVote = (
    countryPersonality: any, // CountryPersonality
    resolution: Resolution,
    relationWithProposer: number,
    relationWithTarget: number | undefined,
    isInSameAlliance: boolean
): 'favor' | 'against' | 'abstain' => {
    let score = 0;
    
    // Factor 1: Relación con el proponente
    score += (relationWithProposer - 50) * 0.3;
    
    // Factor 2: Relación con el objetivo (si aplica)
    if (relationWithTarget !== undefined) {
        score -= (relationWithTarget - 50) * 0.4;
    }
    
    // Factor 3: Alianzas (votan juntos)
    if (isInSameAlliance) {
        score += 30;
    }
    
    // Factor 4: Tipo de resolución y personalidad
    switch (resolution.type) {
        case 'human_rights':
            score += (countryPersonality.humanRightsConcern - 50) * 0.5;
            break;
        case 'intervention':
            if (countryPersonality.reactionToWar === 'interventionist') {
                score += 25;
            } else if (countryPersonality.reactionToWar === 'pacifist') {
                score -= 25;
            }
            break;
        case 'sanctions':
            if (countryPersonality.aggressiveness > 60) {
                score += 20; // Los países agresivos apoyan sanciones
            }
            break;
        case 'trade':
            score += (countryPersonality.priorities.economicGrowth - 50) * 0.4;
            break;
    }
    
    // Factor 5: Pragmatismo (países pragmáticos se abstienen más)
    const abstainThreshold = countryPersonality.pragmatism * 0.3;
    
    // Decisión final
    if (Math.abs(score) < abstainThreshold) {
        return 'abstain';
    } else if (score > 0) {
        return 'favor';
    } else {
        return 'against';
    }
};
