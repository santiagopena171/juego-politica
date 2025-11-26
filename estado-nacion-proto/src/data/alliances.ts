/**
 * Datos de Alianzas y Bloques Geopolíticos
 * Basados en organizaciones reales del mundo
 */

import type { Alliance } from '../types/diplomacy';

export const ALLIANCES: Alliance[] = [
    // ==================== ALIANZAS MILITARES ====================
    {
        id: 'NATO',
        name: 'OTAN (Organización del Tratado del Atlántico Norte)',
        ideology: 'military',
        members: ['USA', 'CAN', 'GBR', 'FRA', 'DEU', 'ITA', 'ESP', 'POL', 'TUR', 'GRC', 'NOR', 'NLD', 'BEL', 'PRT', 'CZE', 'HUN', 'ROU', 'BGR'],
        founded: 1949,
        
        militaryPower: 95,
        economicPower: 85,
        diplomaticInfluence: 90,
        
        requirements: {
            minDemocracy: 60,
            ideology: ['Democratic', 'Liberal'],
            memberVotesRequired: 100, // Unanimidad
        },
        
        benefits: {
            tradeBonus: 15,
            militaryProtection: true,
            economicAid: 5,
            diplomaticSupport: 25,
        },
        
        obligations: {
            minMilitarySpending: 2, // 2% del GDP
            votingAlignment: true,
            sharedSanctions: true,
            interventionSupport: true,
        },
    },
    
    // ==================== ALIANZAS ECONÓMICAS ====================
    {
        id: 'EU',
        name: 'Unión Europea',
        ideology: 'economic',
        members: ['FRA', 'DEU', 'ITA', 'ESP', 'POL', 'NLD', 'BEL', 'GRC', 'PRT', 'CZE', 'HUN', 'SWE', 'AUT', 'DNK', 'FIN', 'IRL', 'SVK', 'HRV', 'SVN', 'LTU', 'LVA', 'EST'],
        founded: 1993,
        
        militaryPower: 60,
        economicPower: 95,
        diplomaticInfluence: 85,
        
        requirements: {
            minGDP: 100,
            minDemocracy: 70,
            maxCorruption: 40,
            ideology: ['Democratic', 'Liberal', 'Socialist'],
            memberVotesRequired: 75, // 75% de aprobación
        },
        
        benefits: {
            tradeBonus: 40, // Mercado único
            militaryProtection: false,
            economicAid: 15,
            diplomaticSupport: 30,
        },
        
        obligations: {
            minMilitarySpending: 0,
            votingAlignment: true,
            sharedSanctions: true,
            interventionSupport: false,
        },
    },
    
    {
        id: 'ASEAN',
        name: 'Asociación de Naciones del Sudeste Asiático',
        ideology: 'economic',
        members: ['IDN', 'THA', 'VNM', 'PHL', 'MYS', 'SGP', 'MMR', 'KHM', 'LAO', 'BRN'],
        founded: 1967,
        
        militaryPower: 45,
        economicPower: 70,
        diplomaticInfluence: 55,
        
        requirements: {
            memberVotesRequired: 100, // Consenso
        },
        
        benefits: {
            tradeBonus: 25,
            militaryProtection: false,
            economicAid: 10,
            diplomaticSupport: 15,
        },
        
        obligations: {
            minMilitarySpending: 0,
            votingAlignment: false,
            sharedSanctions: false,
            interventionSupport: false,
        },
    },
    
    {
        id: 'MERCOSUR',
        name: 'Mercado Común del Sur',
        ideology: 'economic',
        members: ['ARG', 'BRA', 'URY', 'PRY'],
        founded: 1991,
        
        militaryPower: 40,
        economicPower: 60,
        diplomaticInfluence: 45,
        
        requirements: {
            minDemocracy: 50,
            memberVotesRequired: 100,
        },
        
        benefits: {
            tradeBonus: 30,
            militaryProtection: false,
            economicAid: 8,
            diplomaticSupport: 12,
        },
        
        obligations: {
            minMilitarySpending: 0,
            votingAlignment: false,
            sharedSanctions: false,
            interventionSupport: false,
        },
    },
    
    // ==================== ALIANZAS IDEOLÓGICAS ====================
    {
        id: 'BRICS',
        name: 'BRICS (Brasil, Rusia, India, China, Sudáfrica)',
        ideology: 'ideological',
        members: ['BRA', 'RUS', 'IND', 'CHN', 'ZAF', 'IRN', 'EGY', 'ETH', 'SAU', 'ARE'],
        founded: 2009,
        
        militaryPower: 85,
        economicPower: 80,
        diplomaticInfluence: 70,
        
        requirements: {
            minGDP: 200,
            memberVotesRequired: 100,
        },
        
        benefits: {
            tradeBonus: 20,
            militaryProtection: false,
            economicAid: 12,
            diplomaticSupport: 20,
        },
        
        obligations: {
            minMilitarySpending: 0,
            votingAlignment: false,
            sharedSanctions: false,
            interventionSupport: false,
        },
    },
    
    {
        id: 'SCO',
        name: 'Organización de Cooperación de Shanghai',
        ideology: 'ideological',
        members: ['CHN', 'RUS', 'IND', 'PAK', 'KAZ', 'KGZ', 'TJK', 'UZB', 'IRN'],
        founded: 2001,
        
        militaryPower: 80,
        economicPower: 75,
        diplomaticInfluence: 65,
        
        requirements: {
            memberVotesRequired: 100,
        },
        
        benefits: {
            tradeBonus: 18,
            militaryProtection: true,
            economicAid: 10,
            diplomaticSupport: 18,
        },
        
        obligations: {
            minMilitarySpending: 1.5,
            votingAlignment: true,
            sharedSanctions: false,
            interventionSupport: true,
        },
    },
    
    // ==================== ALIANZAS REGIONALES ====================
    {
        id: 'AU',
        name: 'Unión Africana',
        ideology: 'regional',
        members: ['ZAF', 'NGA', 'EGY', 'ETH', 'KEN', 'GHA', 'TZA', 'UGA', 'DZA', 'MAR', 'SEN', 'CIV', 'CMR', 'AGO', 'MOZ'],
        founded: 2002,
        
        militaryPower: 35,
        economicPower: 40,
        diplomaticInfluence: 50,
        
        requirements: {
            memberVotesRequired: 66,
        },
        
        benefits: {
            tradeBonus: 15,
            militaryProtection: false,
            economicAid: 5,
            diplomaticSupport: 15,
        },
        
        obligations: {
            minMilitarySpending: 0,
            votingAlignment: false,
            sharedSanctions: false,
            interventionSupport: false,
        },
    },
    
    {
        id: 'OAS',
        name: 'Organización de Estados Americanos',
        ideology: 'regional',
        members: ['USA', 'CAN', 'MEX', 'ARG', 'BRA', 'CHL', 'COL', 'PER', 'VEN', 'ECU', 'BOL', 'PRY', 'URY', 'CRI', 'PAN', 'DOM', 'CUB'],
        founded: 1948,
        
        militaryPower: 70,
        economicPower: 75,
        diplomaticInfluence: 60,
        
        requirements: {
            memberVotesRequired: 66,
        },
        
        benefits: {
            tradeBonus: 12,
            militaryProtection: false,
            economicAid: 8,
            diplomaticSupport: 12,
        },
        
        obligations: {
            minMilitarySpending: 0,
            votingAlignment: false,
            sharedSanctions: false,
            interventionSupport: false,
        },
    },
    
    {
        id: 'ARAB_LEAGUE',
        name: 'Liga Árabe',
        ideology: 'regional',
        members: ['SAU', 'EGY', 'IRQ', 'SYR', 'JOR', 'ARE', 'KWT', 'OMN', 'QAT', 'BHR', 'LBN', 'LBY', 'TUN', 'DZA', 'MAR', 'SDN', 'YEM'],
        founded: 1945,
        
        militaryPower: 55,
        economicPower: 65,
        diplomaticInfluence: 50,
        
        requirements: {
            memberVotesRequired: 66,
        },
        
        benefits: {
            tradeBonus: 18,
            militaryProtection: false,
            economicAid: 10,
            diplomaticSupport: 15,
        },
        
        obligations: {
            minMilitarySpending: 0,
            votingAlignment: false,
            sharedSanctions: false,
            interventionSupport: false,
        },
    },
    
    // ==================== NO ALINEADOS ====================
    {
        id: 'NAM',
        name: 'Movimiento de Países No Alineados',
        ideology: 'neutral',
        members: ['IND', 'IDN', 'PAK', 'BGD', 'IRN', 'EGY', 'ETH', 'VNM', 'TZA', 'KEN', 'UGA', 'DZA', 'MAR', 'VEN', 'CUB', 'ZWE', 'SRB'],
        founded: 1961,
        
        militaryPower: 50,
        economicPower: 55,
        diplomaticInfluence: 45,
        
        requirements: {
            memberVotesRequired: 50,
        },
        
        benefits: {
            tradeBonus: 8,
            militaryProtection: false,
            economicAid: 3,
            diplomaticSupport: 10,
        },
        
        obligations: {
            minMilitarySpending: 0,
            votingAlignment: false,
            sharedSanctions: false,
            interventionSupport: false,
        },
    },
];

// Función helper para encontrar alianzas de un país
export const getAlliancesForCountry = (countryId: string): Alliance[] => {
    return ALLIANCES.filter(alliance => alliance.members.includes(countryId));
};

// Función para verificar si un país cumple requisitos de alianza
export const meetsAllianceRequirements = (
    alliance: Alliance,
    countryStats: {
        gdp: number;
        democracy: number;
        corruption: number;
        ideology: string;
    }
): { meets: boolean; reasons: string[] } => {
    const reasons: string[] = [];
    let meets = true;
    
    if (alliance.requirements.minGDP && countryStats.gdp < alliance.requirements.minGDP) {
        meets = false;
        reasons.push(`GDP insuficiente (${countryStats.gdp.toFixed(0)}B / ${alliance.requirements.minGDP}B requeridos)`);
    }
    
    if (alliance.requirements.minDemocracy && countryStats.democracy < alliance.requirements.minDemocracy) {
        meets = false;
        reasons.push(`Índice democrático insuficiente (${countryStats.democracy} / ${alliance.requirements.minDemocracy} requerido)`);
    }
    
    if (alliance.requirements.maxCorruption && countryStats.corruption > alliance.requirements.maxCorruption) {
        meets = false;
        reasons.push(`Corrupción demasiado alta (${countryStats.corruption} / ${alliance.requirements.maxCorruption} máximo)`);
    }
    
    if (alliance.requirements.ideology && !alliance.requirements.ideology.includes(countryStats.ideology)) {
        meets = false;
        reasons.push(`Ideología incompatible (${countryStats.ideology})`);
    }
    
    return { meets, reasons };
};

// Calcular poder total de una alianza
export const calculateAlliancePower = (alliance: Alliance): number => {
    return (alliance.militaryPower + alliance.economicPower + alliance.diplomaticInfluence) / 3;
};
