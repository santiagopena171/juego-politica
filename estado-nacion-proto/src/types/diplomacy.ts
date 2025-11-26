/**
 * Tipos para el Sistema Geopolítico Avanzado - Fase 6
 * Incluye alianzas, bloques, guerras, organismos internacionales, sanciones y migración
 */

// ==================== ALIANZAS Y BLOQUES ====================

export type AllianceIdeology = 
    | 'military' // OTAN, alianzas militares
    | 'economic' // UE, ASEAN
    | 'regional' // Unión Africana, OEA
    | 'ideological' // BRICS, Alianza Bolivariana
    | 'neutral'; // No Alineados

export interface Alliance {
    id: string;
    name: string;
    ideology: AllianceIdeology;
    members: string[]; // Country IDs
    founded: number; // Year
    
    // Poder del bloque
    militaryPower: number; // 0-100
    economicPower: number; // 0-100
    diplomaticInfluence: number; // 0-100
    
    // Requisitos de membresía
    requirements: {
        minGDP?: number;
        minDemocracy?: number;
        maxCorruption?: number;
        ideology?: string[];
        memberVotesRequired?: number; // Votos necesarios para admitir nuevo miembro
    };
    
    // Beneficios
    benefits: {
        tradeBonus: number; // % bonus en comercio con miembros
        militaryProtection: boolean; // Defensa colectiva
        economicAid: number; // Ayuda económica mensual
        diplomaticSupport: number; // Bonus en votaciones internacionales
    };
    
    // Obligaciones
    obligations: {
        minMilitarySpending: number; // % del GDP
        votingAlignment: boolean; // Deben votar alineados en ONU
        sharedSanctions: boolean; // Sanciones se aplican a todos los miembros
        interventionSupport: boolean; // Deben apoyar intervenciones militares del bloque
    };
}

// ==================== RELACIONES DIPLOMÁTICAS ====================

export type RelationStatus = 'Aliado' | 'Socio' | 'Neutral' | 'Rival' | 'Enemigo';

export interface DiplomaticRelation {
    countryId: string;
    relation: number; // 0-100
    status: RelationStatus;
    
    // Estado específico
    hasTradeAgreement: boolean;
    hasNonAggressionPact: boolean;
    isInSameAlliance: boolean;
    
    // Modificadores temporales
    recentEvents: DiplomaticEvent[];
    
    // Tendencias
    trendDirection: 'improving' | 'stable' | 'deteriorating';
    monthlyChange: number;
}

export interface DiplomaticEvent {
    type: 'trade' | 'conflict' | 'alliance' | 'sanction' | 'war' | 'aid';
    description: string;
    relationChange: number;
    date: { month: number; year: number };
}

// ==================== SANCIONES Y EMBARGOS ====================

export type SanctionType = 
    | 'trade' // Restricción comercial parcial
    | 'financial' // Congelación de activos
    | 'technology' // Embargo tecnológico
    | 'diplomatic' // Aislamiento diplomático
    | 'total'; // Embargo total

export interface Sanction {
    id: string;
    type: SanctionType;
    imposedBy: string[]; // Country IDs or Alliance IDs
    targetCountry: string;
    reason: string;
    
    startDate: { month: number; year: number };
    duration?: number; // Meses, undefined = indefinido
    
    // Impacto
    economicImpact: {
        gdpReduction: number; // % por mes
        inflationIncrease: number; // % por mes
        tradeReduction: number; // % de reducción en comercio
    };
    
    // Condiciones para levantar sanciones
    liftConditions?: {
        democraticReforms?: number; // Min democracy index
        humanRightsImprovement?: number; // Min human rights index
        territorialWithdrawal?: string[]; // Territory IDs
        leaderChange?: boolean;
    };
}

// ==================== ORGANISMOS INTERNACIONALES ====================

export type ResolutionType =
    | 'condemnation' // Condenar a un país
    | 'sanctions' // Imponer sanciones
    | 'intervention' // Intervención militar
    | 'climate' // Acuerdo climático
    | 'trade' // Tratado comercial global
    | 'human_rights' // Resolución de derechos humanos
    | 'peacekeeping'; // Misión de paz

export type VoteChoice = 'favor' | 'against' | 'abstain';

export interface Resolution {
    id: string;
    type: ResolutionType;
    title: string;
    description: string;
    
    proposedBy: string; // Country ID
    targetCountry?: string; // Si aplica (condenación, sanciones, etc.)
    
    // Votación
    votesInFavor: string[];
    votesAgainst: string[];
    votesAbstain: string[];
    
    // Estado
    status: 'proposed' | 'voting' | 'passed' | 'rejected';
    votingDeadline: { month: number; year: number };
    
    // Consecuencias si pasa
    consequences: {
        applySanctions?: Sanction;
        militaryIntervention?: boolean;
        economicAid?: { amount: number; recipients: string[] };
        tradePenalty?: { countries: string[]; amount: number };
    };
}

export interface InternationalOrganization {
    id: string;
    name: string;
    type: 'global' | 'regional' | 'economic' | 'military';
    
    members: string[]; // Country IDs
    foundingYear: number;
    
    // Poder de voto
    votingPower: Record<string, number>; // countryId -> voting weight (1.0 = 1 voto)
    
    // Resoluciones activas
    activeResolutions: Resolution[];
    historicalResolutions: Resolution[];
    
    // Funciones
    canProposeSanctions: boolean;
    canAuthorizeWar: boolean;
    providesEconomicAid: boolean;
}

// ==================== GUERRA Y CONFLICTO ====================

export type ConflictState = 
    | 'peace'
    | 'tension' // Relaciones muy tensas
    | 'skirmish' // Escaramuzas fronterizas
    | 'proxy_war' // Guerra por proxy
    | 'limited_war' // Guerra limitada
    | 'total_war'; // Guerra total

export type WarStrategy = 
    | 'defensive' // Minimiza bajas, alto costo de estabilidad
    | 'offensive' // Máximas bajas enemigas, alto costo económico
    | 'air_superiority' // Dominio aéreo, requiere tecnología
    | 'guerrilla' // Guerra de guerrillas, bajo costo pero lenta
    | 'blitzkrieg' // Guerra relámpago, riesgo alto/recompensa alta
    | 'attrition'; // Guerra de desgaste

export interface War {
    id: string;
    name: string;
    state: ConflictState;
    
    // Beligerantes
    aggressorCountry: string;
    defenderCountry: string;
    aggressorAllies: string[];
    defenderAllies: string[];
    
    // Fechas
    startDate: { month: number; year: number };
    endDate?: { month: number; year: number };
    
    // Estrategia actual
    aggressorStrategy: WarStrategy;
    defenderStrategy: WarStrategy;
    
    // Estado del conflicto
    duration: number; // Meses
    intensity: number; // 0-100
    casualties: {
        aggressorTotal: number;
        defenderTotal: number;
    };
    
    // Control territorial
    territoryControl: {
        aggressorControl: number; // % de territorio objetivo controlado
        disputed: number; // % en disputa
    };
    
    // Impacto
    monthlyCost: {
        aggressor: number; // Billones
        defender: number;
    };
    popularityImpact: {
        aggressor: number; // Cambio mensual de popularidad
        defender: number;
    };
    
    // Condiciones de paz
    peaceTerms?: {
        proposedBy: 'aggressor' | 'defender' | 'mediator';
        territorialChanges?: string[]; // Territory IDs to transfer
        reparations?: number; // Cantidad en billones
        demilitarization?: boolean;
        regimeChange?: boolean;
    };
}

// Factores que determinan resultado de guerra
export interface MilitaryCapability {
    countryId: string;
    
    // Recursos
    militaryBudget: number; // % del GDP
    technologyLevel: number; // 0-100
    troopMorale: number; // 0-100
    
    // Capacidades
    groundForces: number; // 0-100
    airPower: number; // 0-100
    navalPower: number; // 0-100
    cyberCapability: number; // 0-100
    
    // Factores externos
    allianceSupport: number; // Boost de aliados
    publicSupport: number; // Apoyo popular (afecta moral)
    economicCapacity: number; // Capacidad de sostener guerra
}

// ==================== MIGRACIÓN Y REFUGIADOS ====================

export type MigrationCause = 
    | 'war' // Guerra en país de origen
    | 'economic_crisis' // Crisis económica
    | 'natural_disaster' // Desastre natural
    | 'persecution' // Persecución política/étnica
    | 'climate_change'; // Cambio climático

export interface RefugeeCrisis {
    id: string;
    cause: MigrationCause;
    originCountry: string;
    affectedCountries: string[]; // Países receptores potenciales
    
    // Magnitud
    totalRefugees: number;
    monthlyFlow: number;
    peakExpected: number; // Pico esperado de refugiados
    
    // Distribución
    refugeeDistribution: Record<string, number>; // countryId -> número de refugiados recibidos
    
    // Duración
    startDate: { month: number; year: number };
    estimatedDuration: number; // Meses
    
    // Estado
    status: 'emerging' | 'active' | 'stabilizing' | 'resolved';
}

export interface MigrationPolicy {
    countryId: string;
    
    // Política general
    openness: 'open' | 'selective' | 'restricted' | 'closed';
    maxMonthlyIntake: number;
    
    // Condiciones de aceptación
    acceptFrom: {
        wars: boolean;
        economicCrises: boolean;
        naturalDisasters: boolean;
        persecution: boolean;
    };
    
    // Beneficios/costos
    integrationCost: number; // Costo mensual por refugiado
    longTermBenefit: number; // Beneficio económico a largo plazo
    socialTensionIncrease: number; // Aumento de tensión social
    
    // Infraestructura
    refugeeCamps: number;
    integrationPrograms: boolean;
    borderSecurity: number; // 0-100, costo de mantener
}

// ==================== IA DIPLOMÁTICA ====================

export interface CountryPersonality {
    countryId: string;
    
    // Ideología y valores
    ideology: 'democratic' | 'authoritarian' | 'socialist' | 'capitalist' | 'theocratic';
    priorities: {
        economicGrowth: number; // 0-100
        militaryPower: number;
        diplomaticInfluence: number;
        territorialExpansion: number;
        ideology: number; // Qué tanto les importa la ideología
    };
    
    // Comportamiento
    aggressiveness: number; // 0-100, probabilidad de conflicto
    trustworthiness: number; // 0-100, cumple acuerdos
    pragmatism: number; // 0-100, vs idealismo
    
    // Relaciones preferidas
    preferredAlliances: string[]; // Alliance IDs
    rivals: string[]; // Country IDs históricos rivales
    
    // Reacción a eventos
    reactionToSanctions: 'defiant' | 'negotiable' | 'compliant';
    reactionToWar: 'interventionist' | 'neutral' | 'pacifist';
    humanRightsConcern: number; // 0-100
}

// ==================== TIPOS DE ACCIONES ====================

export type DiplomaticAction =
    | 'IMPROVE_RELATIONS'
    | 'WORSEN_RELATIONS'
    | 'PROPOSE_TRADE_AGREEMENT'
    | 'CANCEL_TRADE_AGREEMENT'
    | 'REQUEST_JOIN_ALLIANCE'
    | 'LEAVE_ALLIANCE'
    | 'IMPOSE_SANCTIONS'
    | 'LIFT_SANCTIONS'
    | 'DECLARE_WAR'
    | 'PROPOSE_PEACE'
    | 'ACCEPT_PEACE'
    | 'SEND_AID'
    | 'REQUEST_AID'
    | 'PROPOSE_RESOLUTION'
    | 'VOTE_RESOLUTION'
    | 'LOBBY_COUNTRY'
    | 'SET_MIGRATION_POLICY'
    | 'ACCEPT_REFUGEES'
    | 'CLOSE_BORDERS';

// ==================== EVENTOS GEOPOLÍTICOS ====================

export interface GeopoliticalEvent {
    id: string;
    type: 'alliance_formed' | 'war_declared' | 'sanctions_imposed' | 'resolution_passed' | 'refugee_crisis' | 'coup' | 'economic_collapse';
    title: string;
    description: string;
    
    date: { month: number; year: number };
    involvedCountries: string[];
    
    // Consecuencias globales
    globalImpact: {
        economicShock?: number; // % impacto en economía global
        refugeeFlow?: number; // Número de refugiados generados
        tensionIncrease?: { region: string; amount: number }[];
    };
}

// ==================== ESTADO GLOBAL ====================

export interface WorldState {
    currentYear: number;
    currentMonth: number;
    
    // Tensión global
    globalTension: number; // 0-100, riesgo de conflicto mundial
    
    // Alianzas activas
    alliances: Alliance[];
    
    // Guerras activas
    activeWars: War[];
    
    // Sanciones activas
    activeSanctions: Sanction[];
    
    // Crisis de refugiados
    refugeeCrises: RefugeeCrisis[];
    
    // Organismo internacional principal (ONU)
    unitedNations: InternationalOrganization;
    
    // Eventos recientes
    recentEvents: GeopoliticalEvent[];
    
    // Personalidades de países (IA)
    countryPersonalities: Record<string, CountryPersonality>;
}
