export interface Country {
    id: string;
    name: string;
    flag: string;
    region: 'América' | 'Europa' | 'Asia' | 'África' | 'Oceanía' | 'Otros';
    stats: {
        gdp: number; // Billions USD
        population: number; // Millions
        gdpPerCapita: number; // USD
        unemployment: number; // 0.0 - 1.0
        inflation: number; // 0.0 - 1.0
        stability: number; // 0 - 100
        publicDebt: number; // % of GDP
        militarySpending: number; // % of GDP
        corruption: number; // 0 - 100 (Higher is worse)
        freedom: number; // 0 - 100 (Higher is better)
    };
    ideology: 'Capitalist' | 'Socialist' | 'Centrist' | 'Authoritarian'; // Default/Ruling ideology
    relation: number; // 0-100 (Player relation)
    treaties: {
        trade: boolean;
        defense: boolean;
    };
}

export const COUNTRIES: Country[] = [
    // North America
    {
        id: 'usa', name: 'Estados Unidos', flag: '🇺🇸', region: 'América',
        stats: { gdp: 26900, population: 334, gdpPerCapita: 80000, unemployment: 0.038, inflation: 0.035, stability: 70, publicDebt: 120, militarySpending: 3.5, corruption: 20, freedom: 85 },
        ideology: 'Capitalist', relation: 50, treaties: { trade: false, defense: false }
    },
    {
        id: 'can', name: 'Canadá', flag: '🇨🇦', region: 'América',
        stats: { gdp: 2100, population: 40, gdpPerCapita: 52000, unemployment: 0.055, inflation: 0.03, stability: 85, publicDebt: 70, militarySpending: 1.3, corruption: 15, freedom: 95 },
        ideology: 'Centrist', relation: 50, treaties: { trade: false, defense: false }
    },
    {
        id: 'mex', name: 'México', flag: '🇲🇽', region: 'América',
        stats: { gdp: 1600, population: 128, gdpPerCapita: 12000, unemployment: 0.028, inflation: 0.045, stability: 60, publicDebt: 50, militarySpending: 0.6, corruption: 65, freedom: 60 },
        ideology: 'Centrist', relation: 50, treaties: { trade: false, defense: false }
    },

    // South America
    {
        id: 'bra', name: 'Brasil', flag: '🇧🇷', region: 'América',
        stats: { gdp: 2080, population: 216, gdpPerCapita: 9600, unemployment: 0.08, inflation: 0.045, stability: 65, publicDebt: 75, militarySpending: 1.2, corruption: 60, freedom: 70 },
        ideology: 'Centrist', relation: 50, treaties: { trade: false, defense: false }
    },
    {
        id: 'arg', name: 'Argentina', flag: '🇦🇷', region: 'América',
        stats: { gdp: 640, population: 46, gdpPerCapita: 13000, unemployment: 0.07, inflation: 1.40, stability: 40, publicDebt: 85, militarySpending: 0.8, corruption: 55, freedom: 80 },
        ideology: 'Capitalist', relation: 50, treaties: { trade: false, defense: false }
    },
    {
        id: 'col', name: 'Colombia', flag: '🇨🇴', region: 'América',
        stats: { gdp: 360, population: 52, gdpPerCapita: 6900, unemployment: 0.10, inflation: 0.06, stability: 50, publicDebt: 60, militarySpending: 3.0, corruption: 60, freedom: 65 },
        ideology: 'Socialist', relation: 50, treaties: { trade: false, defense: false }
    },
    {
        id: 'chl', name: 'Chile', flag: '🇨🇱', region: 'América',
        stats: { gdp: 350, population: 19, gdpPerCapita: 18000, unemployment: 0.085, inflation: 0.04, stability: 70, publicDebt: 38, militarySpending: 1.8, corruption: 30, freedom: 90 },
        ideology: 'Socialist', relation: 50, treaties: { trade: false, defense: false }
    },

    // Europe
    {
        id: 'deu', name: 'Alemania', flag: '🇩🇪', region: 'Europa',
        stats: { gdp: 4400, population: 84, gdpPerCapita: 52000, unemployment: 0.057, inflation: 0.03, stability: 80, publicDebt: 65, militarySpending: 1.5, corruption: 10, freedom: 95 },
        ideology: 'Centrist', relation: 50, treaties: { trade: false, defense: false }
    },
    {
        id: 'fra', name: 'Francia', flag: '🇫🇷', region: 'Europa',
        stats: { gdp: 3000, population: 68, gdpPerCapita: 44000, unemployment: 0.072, inflation: 0.035, stability: 65, publicDebt: 110, militarySpending: 1.9, corruption: 20, freedom: 90 },
        ideology: 'Centrist', relation: 50, treaties: { trade: false, defense: false }
    },
    {
        id: 'gbr', name: 'Reino Unido', flag: '🇬🇧', region: 'Europa',
        stats: { gdp: 3100, population: 67, gdpPerCapita: 46000, unemployment: 0.042, inflation: 0.04, stability: 75, publicDebt: 100, militarySpending: 2.2, corruption: 15, freedom: 90 },
        ideology: 'Capitalist', relation: 50, treaties: { trade: false, defense: false }
    },
    {
        id: 'esp', name: 'España', flag: '🇪🇸', region: 'Europa',
        stats: { gdp: 1580, population: 48, gdpPerCapita: 33000, unemployment: 0.11, inflation: 0.03, stability: 70, publicDebt: 110, militarySpending: 1.2, corruption: 30, freedom: 90 },
        ideology: 'Socialist', relation: 50, treaties: { trade: false, defense: false }
    },
    {
        id: 'rus', name: 'Rusia', flag: '🇷🇺', region: 'Europa',
        stats: { gdp: 1860, population: 144, gdpPerCapita: 13000, unemployment: 0.03, inflation: 0.07, stability: 55, publicDebt: 20, militarySpending: 4.5, corruption: 80, freedom: 10 },
        ideology: 'Authoritarian', relation: 50, treaties: { trade: false, defense: false }
    },

    // Asia
    {
        id: 'chn', name: 'China', flag: '🇨🇳', region: 'Asia',
        stats: { gdp: 19300, population: 1425, gdpPerCapita: 13500, unemployment: 0.05, inflation: 0.01, stability: 80, publicDebt: 70, militarySpending: 1.7, corruption: 50, freedom: 10 },
        ideology: 'Authoritarian', relation: 50, treaties: { trade: false, defense: false }
    },
    {
        id: 'jpn', name: 'Japón', flag: '🇯🇵', region: 'Asia',
        stats: { gdp: 4400, population: 123, gdpPerCapita: 35000, unemployment: 0.026, inflation: 0.02, stability: 90, publicDebt: 250, militarySpending: 1.1, corruption: 15, freedom: 95 },
        ideology: 'Capitalist', relation: 50, treaties: { trade: false, defense: false }
    },
    {
        id: 'ind', name: 'India', flag: '🇮🇳', region: 'Asia',
        stats: { gdp: 3700, population: 1428, gdpPerCapita: 2600, unemployment: 0.07, inflation: 0.05, stability: 60, publicDebt: 80, militarySpending: 2.5, corruption: 60, freedom: 60 },
        ideology: 'Centrist', relation: 50, treaties: { trade: false, defense: false }
    },

    // Others
    {
        id: 'aus', name: 'Australia', flag: '🇦🇺', region: 'Oceanía',
        stats: { gdp: 1700, population: 26, gdpPerCapita: 65000, unemployment: 0.037, inflation: 0.04, stability: 85, publicDebt: 40, militarySpending: 2.0, corruption: 10, freedom: 95 },
        ideology: 'Capitalist', relation: 50, treaties: { trade: false, defense: false }
    },
    {
        id: 'zaf', name: 'Sudáfrica', flag: '🇿🇦', region: 'África',
        stats: { gdp: 380, population: 60, gdpPerCapita: 6300, unemployment: 0.32, inflation: 0.06, stability: 45, publicDebt: 70, militarySpending: 1.0, corruption: 60, freedom: 75 },
        ideology: 'Centrist', relation: 50, treaties: { trade: false, defense: false }
    },
];
