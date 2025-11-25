import type { Country } from './countries';
import { getFlagEmoji } from '../utils/flagEmoji';

// Import continent-organized JSON
import continentData from '../../countries_by_continent.json';

// Define the shape of the raw JSON data (continent-organized)
interface RawCountry {
    iso3: string;
    country_name: string | null;
    gdp_per_capita_current_usd?: number; // Optional
    population_total?: number;
    inflation_pct?: number; // Optional
    unemployment_pct?: number; // Optional
    corruption_estimate_wgi?: number; // Optional
    freedom_house?: {
        total_score: number;
    };
    military_spending_pct_gdp?: number; // Optional
    public_debt_pct_gdp?: number; // Optional
    external_debt_pct_gni?: number; // Optional
    continent?: string; // Added continent property (optional)
}

export function loadCountries(): Country[] {
    // Flatten the continent-organized JSON into a single array
    const data: RawCountry[] = Object.values(continentData).flat();

    // List of known aggregation/group codes (not real countries)
    const NON_COUNTRY_CODES = new Set([
        'WLD', // World
        'EAS', 'ECS', 'LCN', 'MEA', 'NAC', 'SAS', 'SSF', 'SSA', // Regions
        'EAP', 'ECA', 'LAC', 'MNA', 'SCA', // Regions (alternative codes)
        'HIC', 'LIC', 'LMC', 'MIC', 'UMC', // Income groups
        'OED', 'OSS', 'PSS', 'PST', // Other groups
        'FCS', 'LDC', 'LMY', 'HPC', 'IBD', 'IBT', 'IDA', 'IDB', 'IDX', 'INX', 'LTE', 'MNA', 'OEC', 'PRE', 'TSA', 'TSS', // World Bank classifications
        'ARB', 'CSS', 'EUU', 'CEB', 'EMU', // Other aggregations
        'TEA', 'TEC', 'TMN', 'TLA', 'EAR', 'SST', // Additional regional/demographic groups
        'CHI' // Channel Islands (dependency grouping)
    ]);

    return data
        .filter((c): c is RawCountry & { country_name: string; population_total: number } =>
            !!c.country_name &&
            !!c.iso3 &&
            c.population_total !== undefined &&
            c.population_total > 0 &&
            !NON_COUNTRY_CODES.has(c.iso3) && // Exclude aggregation codes
            c.iso3.length === 3 // Valid ISO3 must be exactly 3 characters
        )
        .map(c => {
            // Calculate Stats with defaults for missing values
            const populationMillions = c.population_total / 1_000_000;
            const gdpPerCapita = c.gdp_per_capita_current_usd || 1000; // Default if missing
            const gdpBillions = (gdpPerCapita * c.population_total) / 1_000_000_000;

            // Stability Calculation (0-100)
            const corruptionRaw = c.corruption_estimate_wgi || 0; // Default if missing
            // WGI is roughly -2.5 to 2.5. Normalize to 0-100 where 100 is BEST (least corrupt).
            // But for our 'corruption' stat, we want 100 to be WORST (most corrupt).
            // So: -2.5 (very corrupt) -> 100, 2.5 (clean) -> 0.
            // Formula: (2.5 - val) / 5 * 100
            const corruptionStat = Math.max(0, Math.min(100, ((2.5 - corruptionRaw) / 5) * 100));

            const freedomScore = c.freedom_house?.total_score || 50;

            // Stability: High freedom + Low corruption = High Stability
            // Stability = (Freedom + (100 - Corruption)) / 2
            const stability = (freedomScore + (100 - corruptionStat)) / 2;

            // Ideology Inference
            let ideology: 'Capitalist' | 'Socialist' | 'Centrist' | 'Authoritarian' = 'Centrist';
            if (freedomScore < 30) ideology = 'Authoritarian';
            else if (freedomScore > 80 && gdpPerCapita > 40000) ideology = 'Capitalist';
            else if (freedomScore > 60 && gdpPerCapita < 15000) ideology = 'Socialist';

            // Use continent from JSON instead of manual mapping
            const region = (c.continent || 'Otros') as Country['region'];

            return {
                id: c.iso3.toLowerCase(),
                name: c.country_name,
                flag: getFlagEmoji(c.iso3),
                region: region,
                stats: {
                    gdp: Math.round(gdpBillions),
                    population: Math.round(populationMillions),
                    gdpPerCapita: Math.round(gdpPerCapita),
                    unemployment: (c.unemployment_pct || 5) / 100,
                    inflation: (c.inflation_pct || 2) / 100,
                    stability: Math.round(stability),
                    publicDebt: c.public_debt_pct_gdp || c.external_debt_pct_gni || 50,
                    militarySpending: c.military_spending_pct_gdp || 1.5,
                    corruption: Math.round(corruptionStat),
                    freedom: Math.round(freedomScore)
                },
                ideology: ideology,
                relation: 50,
                treaties: { trade: false, defense: false }
            };
        })
        .sort((a, b) => b.stats.gdp - a.stats.gdp); // Sort by GDP descending
}
