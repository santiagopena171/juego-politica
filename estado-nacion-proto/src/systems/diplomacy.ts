import type { Country } from '../data/countries';
import type { 
    CountryPersonality, 
    DiplomaticRelation, 
    Alliance, 
    Sanction,
    War,
    MilitaryCapability 
} from '../types/diplomacy';

// Extended Country interface for internal use if needed, 
// but we'll try to work with the existing one + new properties
// For now, we assume the Country type in data/countries.ts will be updated or we cast it.

export const CONTINENTS = ['América', 'Europa', 'Asia', 'África', 'Oceanía', 'Otros'] as const;

export type DiplomaticAction =
    | 'improve_relations'
    | 'worsen_relations'
    | 'trade_agreement'
    | 'alliance'
    | 'embargo';

export const calculateRelationChange = (
    currentRelation: number,
    action: DiplomaticAction,
    targetIdeology: string,
    playerIdeology: string
): number => {
    let change = 0;
    const ideologyMatch = targetIdeology === playerIdeology;

    switch (action) {
        case 'improve_relations':
            change = ideologyMatch ? 10 : 5;
            break;
        case 'worsen_relations':
            change = -15;
            break;
        case 'trade_agreement':
            change = 15;
            break;
        case 'alliance':
            change = 25;
            break;
        case 'embargo':
            change = -50;
            break;
    }

    // Cap relations between 0 and 100
    const newRelation = Math.max(0, Math.min(100, currentRelation + change));
    return newRelation;
};

export const getCountriesByRegion = (countries: Country[]) => {
    const grouped: Record<string, Country[]> = {};

    countries.forEach(country => {
        const region = country.region || 'Otros';
        if (!grouped[region]) {
            grouped[region] = [];
        }
        grouped[region].push(country);
    });

    return grouped;
};

export const getRelationStatus = (relation: number): 'Aliado' | 'Socio' | 'Neutral' | 'Rival' | 'Enemigo' => {
    if (relation >= 90) return 'Aliado';
    if (relation >= 60) return 'Socio';
    if (relation >= 40) return 'Neutral';
    if (relation >= 20) return 'Rival';
    return 'Enemigo';
};

// ==================== IA DIPLOMÁTICA ====================

/**
 * Genera personalidad para un país basada en su ideología y características
 */
export const generateCountryPersonality = (
    countryId: string,
    ideology: string,
    region: string
): CountryPersonality => {
    // Mapeo de ideologías
    let personalityType: CountryPersonality['ideology'] = 'democratic';
    let aggressiveness = 30;
    let trustworthiness = 70;
    let humanRightsConcern = 70;
    
    switch (ideology.toLowerCase()) {
        case 'authoritarian':
        case 'fascist':
            personalityType = 'authoritarian';
            aggressiveness = 65;
            trustworthiness = 40;
            humanRightsConcern = 20;
            break;
        case 'socialist':
        case 'communist':
            personalityType = 'socialist';
            aggressiveness = 45;
            trustworthiness = 60;
            humanRightsConcern = 50;
            break;
        case 'theocratic':
            personalityType = 'theocratic';
            aggressiveness = 50;
            trustworthiness = 55;
            humanRightsConcern = 30;
            break;
        case 'capitalist':
        case 'conservative':
            personalityType = 'capitalist';
            aggressiveness = 40;
            trustworthiness = 65;
            humanRightsConcern = 60;
            break;
        default: // Democratic, Liberal
            personalityType = 'democratic';
            aggressiveness = 25;
            trustworthiness = 80;
            humanRightsConcern = 85;
    }
    
    // Ajustes regionales
    if (region === 'Middle East' || region === 'África') {
        aggressiveness += 10;
    }
    
    return {
        countryId,
        ideology: personalityType,
        priorities: {
            economicGrowth: 70 + Math.random() * 20,
            militaryPower: aggressiveness + Math.random() * 20,
            diplomaticInfluence: 50 + Math.random() * 30,
            territorialExpansion: aggressiveness - 10 + Math.random() * 20,
            ideology: personalityType === 'democratic' ? 40 : 70,
        },
        aggressiveness: Math.max(0, Math.min(100, aggressiveness + Math.random() * 20 - 10)),
        trustworthiness: Math.max(0, Math.min(100, trustworthiness + Math.random() * 20 - 10)),
        pragmatism: 50 + Math.random() * 40,
        preferredAlliances: determinePreferredAlliances(personalityType, region),
        rivals: [],
        reactionToSanctions: aggressiveness > 60 ? 'defiant' : aggressiveness > 40 ? 'negotiable' : 'compliant',
        reactionToWar: aggressiveness > 60 ? 'interventionist' : aggressiveness > 30 ? 'neutral' : 'pacifist',
        humanRightsConcern,
    };
};

const determinePreferredAlliances = (
    ideology: CountryPersonality['ideology'],
    region: string
): string[] => {
    const preferences: string[] = [];
    
    switch (ideology) {
        case 'democratic':
            preferences.push('NATO', 'EU', 'OAS');
            break;
        case 'authoritarian':
            preferences.push('SCO', 'BRICS');
            break;
        case 'socialist':
            preferences.push('BRICS', 'NAM');
            break;
        case 'capitalist':
            preferences.push('NATO', 'EU', 'ASEAN');
            break;
        case 'theocratic':
            preferences.push('ARAB_LEAGUE', 'NAM');
            break;
    }
    
    // Agregar alianzas regionales
    if (region === 'América') preferences.push('OAS', 'MERCOSUR');
    if (region === 'Europa') preferences.push('EU', 'NATO');
    if (region === 'Asia') preferences.push('ASEAN', 'SCO');
    if (region === 'África') preferences.push('AU');
    if (region === 'Middle East') preferences.push('ARAB_LEAGUE');
    
    return preferences;
};

/**
 * Decide cómo reacciona un país a una acción del jugador
 */
export const calculateAIReaction = (
    personality: CountryPersonality,
    playerAction: string,
    playerIdeology: string,
    currentRelation: number
): { relationChange: number; willRetaliate: boolean; retaliationType?: string } => {
    let relationChange = 0;
    let willRetaliate = false;
    let retaliationType: string | undefined;
    
    const ideologyMatch = personality.ideology === playerIdeology.toLowerCase();
    const pragmaticFactor = personality.pragmatism / 100;
    
    switch (playerAction) {
        case 'TRADE_AGREEMENT':
            relationChange = 15 + (ideologyMatch ? 10 : 0);
            break;
            
        case 'SANCTIONS':
            relationChange = -40;
            willRetaliate = personality.reactionToSanctions === 'defiant';
            if (willRetaliate) {
                retaliationType = currentRelation > 50 ? 'counter_sanctions' : 'military_posturing';
            }
            break;
            
        case 'MILITARY_AGGRESSION':
            relationChange = -60;
            willRetaliate = personality.aggressiveness > 50 || currentRelation < 30;
            if (willRetaliate) {
                retaliationType = 'declare_war';
            }
            break;
            
        case 'AID':
            relationChange = 20 * (1 + pragmaticFactor);
            break;
            
        case 'HUMAN_RIGHTS_CRITICISM':
            if (personality.ideology === 'authoritarian') {
                relationChange = -25;
                willRetaliate = personality.humanRightsConcern < 30;
                retaliationType = 'diplomatic_expulsion';
            } else {
                relationChange = -5;
            }
            break;
            
        case 'ALLIANCE_INVITATION':
            if (ideologyMatch) {
                relationChange = 25;
            } else {
                relationChange = personality.pragmatism > 60 ? 10 : -10;
            }
            break;
    }
    
    // Factor de confianza afecta reacciones
    const trustFactor = personality.trustworthiness / 100;
    relationChange *= (0.5 + trustFactor * 0.5);
    
    return {
        relationChange: Math.round(relationChange),
        willRetaliate,
        retaliationType,
    };
};

/**
 * Calcula si un país IA quiere unirse a una alianza
 */
export const wouldJoinAlliance = (
    personality: CountryPersonality,
    alliance: Alliance,
    currentAlliances: string[]
): { wants: boolean; reason: string } => {
    // Ya está en la alianza
    if (currentAlliances.includes(alliance.id)) {
        return { wants: false, reason: 'Ya es miembro' };
    }
    
    // Revisar si es una alianza preferida
    const isPreferred = personality.preferredAlliances.includes(alliance.id);
    if (!isPreferred && personality.pragmatism < 50) {
        return { wants: false, reason: 'No alineado con intereses nacionales' };
    }
    
    // Evaluar beneficios vs obligaciones
    const benefitScore = 
        alliance.benefits.tradeBonus * (personality.priorities.economicGrowth / 100) +
        (alliance.benefits.militaryProtection ? 30 : 0) * (personality.priorities.militaryPower / 100) +
        alliance.benefits.diplomaticSupport * (personality.priorities.diplomaticInfluence / 100);
    
    const obligationCost =
        alliance.obligations.minMilitarySpending * 10 +
        (alliance.obligations.votingAlignment ? 20 : 0) * (1 - personality.pragmatism / 100) +
        (alliance.obligations.interventionSupport ? 25 : 0) * (1 - personality.aggressiveness / 100);
    
    const netBenefit = benefitScore - obligationCost;
    
    if (netBenefit > 20) {
        return { wants: true, reason: 'Beneficios superan obligaciones' };
    } else if (netBenefit > 0 && isPreferred) {
        return { wants: true, reason: 'Alineación ideológica' };
    } else {
        return { wants: false, reason: 'Obligaciones demasiado onerosas' };
    }
};

/**
 * Calcula capacidad militar de un país
 */
export const calculateMilitaryCapability = (
    countryId: string,
    stats: {
        gdp: number;
        population: number;
        militarySpending: number; // % del GDP
        technology: number; // 0-100
        stability: number; // 0-100
        popularity: number; // 0-100
    },
    alliances: Alliance[]
): MilitaryCapability => {
    // Cálculo del presupuesto militar total
    const militaryBudget = (stats.gdp * stats.militarySpending) / 100;
    
    // Capacidades base (dependen de presupuesto y tecnología)
    const budgetFactor = Math.min(militaryBudget / 50, 1); // Normalizado a 50B como referencia
    const techFactor = stats.technology / 100;
    
    const groundForces = Math.min(100, (budgetFactor * 60 + techFactor * 40));
    const airPower = Math.min(100, (budgetFactor * 40 + techFactor * 60));
    const navalPower = Math.min(100, (budgetFactor * 50 + techFactor * 50) * 0.8); // Más costoso
    const cyberCapability = Math.min(100, techFactor * 90 + budgetFactor * 10);
    
    // Moral de tropas
    const troopMorale = (stats.stability * 0.6 + stats.popularity * 0.4);
    
    // Apoyo de alianzas
    const allianceSupport = alliances.reduce((sum, alliance) => {
        if (alliance.benefits.militaryProtection) {
            return sum + alliance.militaryPower * 0.3; // 30% del poder de la alianza
        }
        return sum;
    }, 0);
    
    return {
        countryId,
        militaryBudget: stats.militarySpending,
        technologyLevel: stats.technology,
        troopMorale,
        groundForces,
        airPower,
        navalPower,
        cyberCapability,
        allianceSupport,
        publicSupport: stats.popularity,
        economicCapacity: stats.gdp / 100, // Capacidad de sostener guerra
    };
};

/**
 * Simula un round de combate en una guerra
 */
export const simulateWarRound = (
    aggressor: MilitaryCapability,
    defender: MilitaryCapability,
    aggressorStrategy: War['aggressorStrategy'],
    defenderStrategy: War['defenderStrategy'],
    currentIntensity: number
): {
    aggressorCasualties: number;
    defenderCasualties: number;
    territoryChange: number; // Positive = aggressor gains, negative = defender gains
    intensityChange: number;
    economicCost: { aggressor: number; defender: number };
} => {
    // Factores de estrategia
    const strategyMatrix: Record<string, { offensive: number; defensive: number; casualties: number; cost: number }> = {
        defensive: { offensive: 0.5, defensive: 1.5, casualties: 0.7, cost: 0.8 },
        offensive: { offensive: 1.5, defensive: 0.8, casualties: 1.3, cost: 1.2 },
        air_superiority: { offensive: 1.3, defensive: 1.0, casualties: 0.9, cost: 1.5 },
        guerrilla: { offensive: 0.8, defensive: 1.2, casualties: 0.5, cost: 0.6 },
        blitzkrieg: { offensive: 2.0, defensive: 0.5, casualties: 1.5, cost: 1.8 },
        attrition: { offensive: 1.0, defensive: 1.3, casualties: 1.2, cost: 1.0 },
    };
    
    const aggStrat = strategyMatrix[aggressorStrategy];
    const defStrat = strategyMatrix[defenderStrategy];
    
    // Calcular poder de combate efectivo
    const aggPower = 
        (aggressor.groundForces * 0.4 + aggressor.airPower * 0.3 + aggressor.navalPower * 0.2 + aggressor.cyberCapability * 0.1) *
        (aggressor.troopMorale / 100) *
        aggStrat.offensive *
        (1 + aggressor.allianceSupport / 200);
    
    const defPower = 
        (defender.groundForces * 0.4 + defender.airPower * 0.3 + defender.navalPower * 0.2 + defender.cyberCapability * 0.1) *
        (defender.troopMorale / 100) *
        defStrat.defensive *
        (1 + defender.allianceSupport / 200);
    
    // Cálculo de bajas (basado en poder relativo e intensidad)
    const powerRatio = aggPower / (defPower + 1);
    const intensityFactor = currentIntensity / 100;
    
    const aggressorCasualties = Math.round(
        (1000 + Math.random() * 500) * 
        intensityFactor * 
        defStrat.offensive * 
        aggStrat.casualties *
        (1 / powerRatio)
    );
    
    const defenderCasualties = Math.round(
        (1000 + Math.random() * 500) * 
        intensityFactor * 
        aggStrat.offensive * 
        defStrat.casualties *
        powerRatio
    );
    
    // Cambio territorial
    const territoryChange = (powerRatio - 1) * intensityFactor * 2;
    
    // Cambio de intensidad (las guerras pueden escalar o desescalar)
    const intensityChange = (Math.random() - 0.5) * 10;
    
    // Costo económico (% del GDP)
    const economicCost = {
        aggressor: aggressor.militaryBudget * aggStrat.cost * intensityFactor * 0.5,
        defender: defender.militaryBudget * defStrat.cost * intensityFactor * 0.4, // Defensa es ligeramente más barata
    };
    
    return {
        aggressorCasualties,
        defenderCasualties,
        territoryChange: Math.max(-5, Math.min(5, territoryChange)),
        intensityChange,
        economicCost,
    };
};

/**
 * Calcula el impacto económico de las sanciones
 */
export const calculateSanctionImpact = (
    sanction: Sanction,
    targetEconomy: {
        gdp: number;
        tradeOpenness: number; // % del GDP que es comercio
        diversification: number; // 0-100, qué tan diversificada es la economía
    },
    imposersPower: number // Poder económico combinado de los que imponen
): {
    gdpImpact: number;
    inflationImpact: number;
    unemploymentImpact: number;
} => {
    let severity = 1;
    
    switch (sanction.type) {
        case 'trade':
            severity = 0.3;
            break;
        case 'financial':
            severity = 0.5;
            break;
        case 'technology':
            severity = 0.4;
            break;
        case 'diplomatic':
            severity = 0.2;
            break;
        case 'total':
            severity = 1.0;
            break;
    }
    
    // El impacto depende de:
    // 1. Qué tan abierta es la economía al comercio
    // 2. Qué tan diversificada está
    // 3. El poder de quien impone las sanciones
    
    const opennessFactor = targetEconomy.tradeOpenness / 100;
    const diversificationFactor = 1 - (targetEconomy.diversification / 100) * 0.5;
    const powerFactor = imposersPower / 100;
    
    const baseImpact = severity * opennessFactor * diversificationFactor * powerFactor;
    
    return {
        gdpImpact: baseImpact * -5, // -5% GDP máximo por mes
        inflationImpact: baseImpact * 3, // +3% inflación máximo por mes
        unemploymentImpact: baseImpact * 2, // +2% desempleo máximo por mes
    };
};
