import type { Country } from '../data/countries';

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
