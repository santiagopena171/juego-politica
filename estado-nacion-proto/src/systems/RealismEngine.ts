import type { GameState } from '../context/GameContext';
import type { SocialGroup, SocialClass } from '../types/living_world';
import type { Constitution } from '../types/judiciary';
import type { Parliament, PoliticalParty } from '../types/politics';
import { initializeSocialData } from './socialSystem';
import { generateParliament } from './politics';

export interface CountryData {
    id: string;
    name: string;
    region: 'America' | 'Europe' | 'Asia' | 'Africa' | 'Oceania' | 'Other';
    gdp: number;
    gdpPerCapita: number;
    population: number;
    unemployment: number; // 0-1
    inflation: number; // 0-1
    ideology: 'Capitalist' | 'Socialist' | 'Centrist' | 'Authoritarian';
    resources?: { oil?: boolean; gas?: boolean; minerals?: boolean };
}

type NationalSpirit =
    | 'HIGH_INFLATION_CULTURE'
    | 'AGING_POPULATION'
    | 'RESOURCE_CURSE'
    | 'TECHNOLOGICAL_POWER'
    | 'FRAGMENTED_POLITICS';

const REGIONAL_FACTIONS: Record<string, string[]> = {
    Europe: ['Partido Laborista', 'Conservadores', 'Verdes', 'Socialdemócratas'],
    America: ['Peronismo', 'Liberales', 'Nacional Populares', 'Conservadores'],
    Asia: ['Partido Progreso', 'Nacionalistas', 'Reformistas'],
    Africa: ['Renovación', 'Movimiento Popular', 'Frente Progreso'],
    Oceania: ['Laboristas', 'Coalición Liberal', 'Progresistas'],
    Other: ['Reformistas', 'Unidos', 'Patriotas']
};

const pickFactionsForRegion = (region: CountryData['region']): PoliticalParty[] => {
    const names = REGIONAL_FACTIONS[region] || REGIONAL_FACTIONS.Other;
    return names.slice(0, 3).map((name, idx) => ({
        id: `${region}_${idx}`,
        name,
        color: idx === 0 ? '#2563eb' : idx === 1 ? '#ef4444' : '#10b981',
        ideology: idx === 1 ? 'Conservative' : idx === 2 ? 'Liberal' as any : 'Socialist' as any,
        seats: 0,
        isGovernment: idx === 0,
        stance: 55 + idx * 5
    }));
};

const inferConstitution = (country: CountryData): Constitution => {
    const region = country.region;
    if (country.id === 'usa') {
        return {
            termLength: 4,
            electionSystem: 'ELECTORAL_COLLEGE',
            judicialIndependence: 80,
            rights: { freeSpeech: true, assembly: true, strike: true }
        };
    }
    if (region === 'Europe') {
        return {
            termLength: 5,
            electionSystem: 'PROPORTIONAL',
            judicialIndependence: 75,
            rights: { freeSpeech: true, assembly: true, strike: true }
        };
    }
    if (region === 'America') {
        return {
            termLength: 4,
            electionSystem: 'DISTRICTS',
            judicialIndependence: 60,
            rights: { freeSpeech: true, assembly: true, strike: true }
        };
    }
    return {
        termLength: 5,
        electionSystem: 'PROPORTIONAL',
        judicialIndependence: 55,
        rights: { freeSpeech: true, assembly: true, strike: false }
    };
};

const deriveNationalSpirits = (country: CountryData): NationalSpirit[] => {
    const spirits: NationalSpirit[] = [];
    if (country.inflation > 0.06) spirits.push('HIGH_INFLATION_CULTURE');
    if (country.population > 80 && country.gdpPerCapita > 30000 && country.region === 'Europe') spirits.push('AGING_POPULATION');
    if (country.resources?.oil || country.resources?.gas) spirits.push('RESOURCE_CURSE');
    if (country.gdpPerCapita > 50000) spirits.push('TECHNOLOGICAL_POWER');
    if (country.ideology === 'Authoritarian') spirits.push('FRAGMENTED_POLITICS');
    return spirits;
};

const generatePopSlice = (
    type: SocialGroup['type'],
    socialClass: SocialClass,
    population: number,
    satisfaction: number,
    radicalization: number
): SocialGroup => ({
    id: `${type}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    socialClass,
    populationSize: population,
    satisfaction,
    radicalization,
    politicalInfluence: Math.max(1, Math.round(population * 0.1)),
    keyIssues: []
});

const deriveSocialGroups = (country: CountryData): SocialGroup[] => {
    const pops: SocialGroup[] = [];
    const totalPop = country.population;
    const highIncome = country.gdpPerCapita > 40000;
    const midIncome = country.gdpPerCapita > 18000;

    if (highIncome) {
        pops.push(generatePopSlice('Urban_Middle_Class', 'Middle', totalPop * 0.35, 65, 10));
        pops.push(generatePopSlice('Intellectuals', 'Elite', totalPop * 0.18, 70, 12));
        pops.push(generatePopSlice('Business_Elite', 'Elite', totalPop * 0.12, 68, 15));
        pops.push(generatePopSlice('Industrial_Workers', 'Lower', totalPop * 0.2, 50, 25));
        pops.push(generatePopSlice('Rural_Conservatives', 'Lower', totalPop * 0.15, 55, 20));
    } else if (midIncome) {
        pops.push(generatePopSlice('Urban_Middle_Class', 'Middle', totalPop * 0.28, 55, 18));
        pops.push(generatePopSlice('Industrial_Workers', 'Lower', totalPop * 0.3, 48, 30));
        pops.push(generatePopSlice('Rural_Conservatives', 'Lower', totalPop * 0.25, 52, 22));
        pops.push(generatePopSlice('Business_Elite', 'Elite', totalPop * 0.08, 60, 18));
        pops.push(generatePopSlice('Minorities', 'Lower', totalPop * 0.09, 45, 28));
    } else {
        pops.push(generatePopSlice('Industrial_Workers', 'Lower', totalPop * 0.35, 45, 35));
        pops.push(generatePopSlice('Rural_Conservatives', 'Lower', totalPop * 0.32, 50, 28));
        pops.push(generatePopSlice('Urban_Middle_Class', 'Middle', totalPop * 0.15, 48, 22));
        pops.push(generatePopSlice('Minorities', 'Lower', totalPop * 0.1, 40, 35));
        pops.push(generatePopSlice('Army_Loyalists', 'Middle', totalPop * 0.08, 60, 18));
    }
    return pops;
};

export const initializeCountryState = (baseState: GameState, country: CountryData): GameState => {
    const socialData = initializeSocialData(country.population, country.ideology === 'Socialist' ? 'Left' : country.ideology === 'Capitalist' ? 'Right' : 'Center');
    socialData.groups = deriveSocialGroups(country);

    const constitution = inferConstitution(country);
    const factions = pickFactionsForRegion(country.region);
    const parliament: Parliament = {
        ...generateParliament(100),
        parties: factions,
        governmentSupport: 55,
        partyCohesion: 55,
        nextElectionDate: Date.now() + 1000 * 60 * 60 * 24 * 365
    };

    const spirits = deriveNationalSpirits(country);

    return {
        ...baseState,
        gameStarted: true,
        player: {
            ...baseState.player,
            countryId: country.id,
            countryName: country.name,
            ideology: country.ideology
        },
        stats: {
            ...baseState.stats,
            gdp: country.gdp,
            population: country.population,
            inflation: country.inflation,
            unemployment: country.unemployment,
            popularity: 50
        },
        resources: {
            ...baseState.resources,
            budget: country.gdp * 0.25,
            politicalCapital: 50,
            stability: Math.max(30, 80 - spirits.length * 5)
        },
        social: socialData,
        government: {
            ...baseState.government,
            parliament
        },
        judiciary: {
            ...baseState.judiciary,
            constitution
        },
        politicalCompass: {
            x: country.ideology === 'Capitalist' ? 40 : country.ideology === 'Socialist' ? -40 : 0,
            y: country.ideology === 'Authoritarian' ? -40 : 40
        },
        logs: [...baseState.logs, `Inicialización realista para ${country.name}. Espíritus: ${spirits.join(', ') || 'ninguno'}`],
        nationalProjects: baseState.nationalProjects
    };
};
