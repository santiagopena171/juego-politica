import type { Region, Industry, IndustryType, BudgetAllocation, BudgetEffects, EconomicData } from '../types/economy';

// Nombres de regiones por tipo
const REGION_NAMES = {
    coastal: ['Costa Norte', 'Litoral Sur', 'Puerto Central', 'Bahía Este', 'Costa Occidental'],
    mountain: ['Sierra Central', 'Montañas del Norte', 'Cordillera Sur', 'Altiplano', 'Valle Alto'],
    plains: ['Llanura Central', 'Pampa Grande', 'Valle Fértil', 'Planicie Norte', 'Campos del Sur'],
    urban: ['Capital Federal', 'Metrópolis Central', 'Gran Ciudad', 'Zona Metropolitana', 'Centro Urbano'],
    rural: ['Provincia Rural', 'Comarca Agrícola', 'Región Interior', 'Distrito Rural', 'Campo Abierto']
};

// Industrias dominantes por tipo de región
const REGION_INDUSTRY_MAP: Record<string, IndustryType[]> = {
    coastal: ['Services', 'Industry', 'Technology'],
    mountain: ['Mining', 'Agriculture', 'Industry'],
    plains: ['Agriculture', 'Industry'],
    urban: ['Services', 'Technology', 'Industry'],
    rural: ['Agriculture', 'Mining']
};

/**
 * Genera regiones para un país al inicio del juego
 */
export function generateRegions(
    countryName: string,
    totalPopulation: number,
    totalGdp: number
): Region[] {
    const regionCount = 3 + Math.floor(Math.random() * 3); // 3-5 regiones
    const regions: Region[] = [];
    
    const regionTypes = ['urban', 'coastal', 'plains', 'mountain', 'rural'];
    const usedTypes: string[] = [];
    
    // Asegurar al menos una región urbana (capital)
    usedTypes.push('urban');
    
    for (let i = 0; i < regionCount; i++) {
        let regionType: string;
        
        if (i === 0) {
            regionType = 'urban'; // Primera región es siempre urbana (capital)
        } else {
            // Seleccionar tipo aleatorio no usado
            const availableTypes = regionTypes.filter(t => !usedTypes.includes(t) || Math.random() > 0.7);
            regionType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            usedTypes.push(regionType);
        }
        
        const names = REGION_NAMES[regionType as keyof typeof REGION_NAMES];
        const regionName = names[Math.floor(Math.random() * names.length)];
        
        // Distribución de población (urban tiene más)
        const populationShare = regionType === 'urban' 
            ? 0.3 + Math.random() * 0.2 // 30-50%
            : 0.1 + Math.random() * 0.15; // 10-25%
        
        const population = Math.floor(totalPopulation * populationShare);
        
        // Distribución de GDP
        const gdpShare = regionType === 'urban'
            ? 0.35 + Math.random() * 0.15 // 35-50%
            : 0.1 + Math.random() * 0.2; // 10-30%
        
        const gdpContribution = totalGdp * gdpShare;
        
        // Seleccionar industria dominante
        const possibleIndustries = REGION_INDUSTRY_MAP[regionType];
        const dominantIndustry = possibleIndustries[Math.floor(Math.random() * possibleIndustries.length)];
        
        // Estadísticas base
        const unemployment = regionType === 'urban'
            ? 0.05 + Math.random() * 0.05 // 5-10%
            : 0.08 + Math.random() * 0.07; // 8-15%
        
        const development = regionType === 'urban'
            ? 70 + Math.random() * 20 // 70-90
            : 40 + Math.random() * 30; // 40-70
        
        const infrastructure = development * (0.8 + Math.random() * 0.2); // 80-100% del desarrollo
        
        const happiness = 50 + (development - 50) * 0.3 + Math.random() * 20; // Correlacionado con desarrollo
        
        regions.push({
            id: `region-${i}`,
            name: regionName,
            population,
            gdpContribution,
            dominantIndustry,
            unemployment,
            happiness: Math.max(30, Math.min(90, happiness)),
            development: Math.round(development),
            infrastructure: Math.round(infrastructure)
        });
    }
    
    // Normalizar para que la suma sea exacta
    const totalPopGen = regions.reduce((sum, r) => sum + r.population, 0);
    const totalGdpGen = regions.reduce((sum, r) => sum + r.gdpContribution, 0);
    
    regions.forEach(r => {
        r.population = Math.floor((r.population / totalPopGen) * totalPopulation);
        r.gdpContribution = (r.gdpContribution / totalGdpGen) * totalGdp;
    });
    
    return regions;
}

/**
 * Genera industrias iniciales basadas en las regiones
 */
export function generateIndustries(regions: Region[]): Industry[] {
    const industryTypes: IndustryType[] = ['Agriculture', 'Industry', 'Services', 'Technology', 'Mining'];
    const industries: Industry[] = [];
    
    // Contar cuántas regiones tienen cada industria como dominante
    const industryCount: Record<IndustryType, number> = {
        Agriculture: 0,
        Industry: 0,
        Services: 0,
        Technology: 0,
        Mining: 0
    };
    
    regions.forEach(r => {
        industryCount[r.dominantIndustry]++;
    });
    
    const totalRegions = regions.length;
    
    industryTypes.forEach(type => {
        const regionalDominance = industryCount[type];
        const baseContribution = regionalDominance / totalRegions;
        
        // Contribución al PIB (suma debe ser ~100%)
        let contribution: number;
        if (type === 'Services') {
            contribution = 40 + Math.random() * 15; // Servicios suele ser el mayor
        } else if (type === 'Industry') {
            contribution = 25 + Math.random() * 10;
        } else {
            contribution = 5 + Math.random() * 15;
        }
        
        industries.push({
            type,
            contribution,
            growth: 0.02 + Math.random() * 0.03, // 2-5% crecimiento anual
            employment: contribution * (0.8 + Math.random() * 0.4), // Empleo correlacionado
            subsidyLevel: 0,
            taxLevel: 0
        });
    });
    
    // Normalizar contribuciones para que sumen 100%
    const totalContribution = industries.reduce((sum, i) => sum + i.contribution, 0);
    industries.forEach(i => {
        i.contribution = (i.contribution / totalContribution) * 100;
        i.employment = Math.min(100, i.employment);
    });
    
    return industries;
}

/**
 * Calcula la economía regional y nacional
 */
export function calculateRegionalEconomy(
    regions: Region[],
    industries: Industry[],
    budgetAllocation: BudgetAllocation,
    totalBudget: number,
    tradeAgreements: any[]
): {
    totalGdp: number;
    gdpGrowthRate: number;
    nationalUnemployment: number;
    averageHappiness: number;
    updatedRegions: Region[];
    updatedIndustries: Industry[];
    budgetEffects: BudgetEffects;
} {
    // Calcular efectos del presupuesto
    const budgetEffects = calculateBudgetEffects(budgetAllocation, totalBudget);
    
    // Calcular crecimiento por industria
    const industryGrowth: Record<IndustryType, number> = {} as any;
    industries.forEach(industry => {
        let growth = industry.growth;
        
        // Subsidios aumentan crecimiento
        if (industry.subsidyLevel > 0) {
            growth += (industry.subsidyLevel / 100) * 0.02; // Hasta +2%
        }
        
        // Impuestos reducen crecimiento
        if (industry.taxLevel > 0) {
            growth -= (industry.taxLevel / 100) * 0.015; // Hasta -1.5%
        }
        
        // Efectos de tratados comerciales
        tradeAgreements.forEach((agreement: any) => {
            if (agreement.industryEffects && agreement.industryEffects[industry.type]) {
                growth += agreement.industryEffects[industry.type];
            }
        });
        
        industryGrowth[industry.type] = growth;
    });
    
    // Actualizar regiones
    const updatedRegions = regions.map(region => {
        const industryGrowthRate = industryGrowth[region.dominantIndustry] || 0.02;
        
        // Crecimiento del PIB regional
        const newGdpContribution = region.gdpContribution * (1 + industryGrowthRate);
        
        // Efectos del presupuesto en la región
        let newUnemployment = region.unemployment;
        let newHappiness = region.happiness;
        let newDevelopment = region.development;
        let newInfrastructure = region.infrastructure;
        
        // Infraestructura del presupuesto
        if (budgetAllocation.Infrastructure > 15) {
            newInfrastructure += ((budgetAllocation.Infrastructure - 15) / 100) * 2;
            newDevelopment += ((budgetAllocation.Infrastructure - 15) / 100) * 1;
        }
        
        // Educación reduce desempleo a largo plazo
        if (budgetAllocation.Education > 15) {
            newUnemployment -= ((budgetAllocation.Education - 15) / 1000);
        }
        
        // Salud aumenta felicidad
        if (budgetAllocation.Health > 15) {
            newHappiness += ((budgetAllocation.Health - 15) / 100) * 2;
        }
        
        // Bienestar social reduce desempleo y aumenta felicidad
        if (budgetAllocation.SocialWelfare > 10) {
            newUnemployment -= ((budgetAllocation.SocialWelfare - 10) / 800);
            newHappiness += ((budgetAllocation.SocialWelfare - 10) / 100) * 1.5;
        }
        
        // Desarrollo afecta felicidad
        newHappiness += (newDevelopment - region.development) * 0.5;
        
        return {
            ...region,
            gdpContribution: newGdpContribution,
            unemployment: Math.max(0.02, Math.min(0.25, newUnemployment)),
            happiness: Math.max(20, Math.min(100, newHappiness)),
            development: Math.max(0, Math.min(100, newDevelopment)),
            infrastructure: Math.max(0, Math.min(100, newInfrastructure))
        };
    });
    
    // Actualizar industrias
    const updatedIndustries = industries.map(industry => {
        const growth = industryGrowth[industry.type];
        
        // Empleo sigue al crecimiento
        let newEmployment = industry.employment;
        if (growth > 0.03) {
            newEmployment += 0.1;
        } else if (growth < 0.01) {
            newEmployment -= 0.15;
        }
        
        return {
            ...industry,
            growth,
            employment: Math.max(0, Math.min(100, newEmployment))
        };
    });
    
    // Calcular totales nacionales
    const totalGdp = updatedRegions.reduce((sum, r) => sum + r.gdpContribution, 0);
    const previousGdp = regions.reduce((sum, r) => sum + r.gdpContribution, 0);
    const gdpGrowthRate = (totalGdp - previousGdp) / previousGdp;
    
    const totalPopulation = updatedRegions.reduce((sum, r) => sum + r.population, 0);
    const weightedUnemployment = updatedRegions.reduce((sum, r) => 
        sum + (r.unemployment * r.population), 0) / totalPopulation;
    
    const averageHappiness = updatedRegions.reduce((sum, r) => 
        sum + (r.happiness * r.population), 0) / totalPopulation;
    
    return {
        totalGdp,
        gdpGrowthRate,
        nationalUnemployment: weightedUnemployment,
        averageHappiness,
        updatedRegions,
        updatedIndustries,
        budgetEffects
    };
}

/**
 * Calcula efectos de la asignación presupuestaria
 */
function calculateBudgetEffects(
    allocation: BudgetAllocation,
    totalBudget: number
): BudgetEffects {
    return {
        healthGrowth: (allocation.Health / 100) * 0.005, // Hasta 0.5% crecimiento poblacional
        educationBonus: (allocation.Education / 100) * 10, // Hasta +10 en tecnología
        stabilityBonus: (allocation.Defense / 100) * 15, // Hasta +15 en estabilidad
        infrastructureBonus: (allocation.Infrastructure / 100) * 8, // Hasta +8 en desarrollo
        researchProgress: (allocation.Research / 100) * totalBudget * 0.001, // Puntos de investigación
        happinessBonus: (allocation.SocialWelfare / 100) * 5 // Hasta +5 en felicidad
    };
}

/**
 * Asignación presupuestaria por defecto
 */
export function getDefaultBudgetAllocation(): BudgetAllocation {
    return {
        Health: 18,
        Education: 20,
        Defense: 12,
        Infrastructure: 15,
        Research: 10,
        SocialWelfare: 25
    };
}

/**
 * Valida que la asignación presupuestaria sume 100%
 */
export function validateBudgetAllocation(allocation: BudgetAllocation): boolean {
    const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
    return Math.abs(total - 100) < 0.01; // Tolerancia de 0.01%
}
