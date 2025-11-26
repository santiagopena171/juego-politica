// Tipos económicos para el sistema económico avanzado

/**
 * Tipos de industrias disponibles en el juego
 */
export type IndustryType = 
    | 'Agriculture'
    | 'Industry' 
    | 'Services'
    | 'Technology'
    | 'Mining';

/**
 * Estado de una industria específica
 */
export interface Industry {
    type: IndustryType;
    contribution: number; // % del PIB (0-100)
    growth: number; // % crecimiento anual
    employment: number; // % de la fuerza laboral empleada
    subsidyLevel: number; // % de subsidio (0-100)
    taxLevel: number; // % de impuestos adicionales (0-100)
}

/**
 * Región económica dentro del país
 */
export interface Region {
    id: string;
    name: string;
    population: number; // Población de la región
    gdpContribution: number; // $ contribución al PIB nacional
    dominantIndustry: IndustryType; // Industria principal
    unemployment: number; // % desempleo regional (0-100)
    happiness: number; // Felicidad/satisfacción regional (0-100)
    development: number; // Nivel de desarrollo (0-100)
    infrastructure: number; // Calidad de infraestructura (0-100)
}

/**
 * Categorías del presupuesto nacional
 */
export type BudgetCategory = 
    | 'Health'
    | 'Education'
    | 'Defense'
    | 'Infrastructure'
    | 'Research'
    | 'SocialWelfare';

/**
 * Asignación presupuestaria
 */
export interface BudgetAllocation {
    Health: number; // % del presupuesto
    Education: number;
    Defense: number;
    Infrastructure: number;
    Research: number;
    SocialWelfare: number;
}

/**
 * Efectos de la asignación presupuestaria
 */
export interface BudgetEffects {
    healthGrowth: number; // Crecimiento población
    educationBonus: number; // Bonus a tecnología
    stabilityBonus: number; // Bonus a estabilidad
    infrastructureBonus: number; // Bonus a desarrollo
    researchProgress: number; // Progreso en investigación
    happinessBonus: number; // Bonus a felicidad
}

/**
 * Tratado comercial con otro país
 */
export interface TradeAgreement {
    countryId: string;
    countryName: string;
    signedDate: Date;
    type: 'FreeTradeZone' | 'CustomsUnion' | 'TradePact';
    gdpBonus: number; // % bonus al PIB
    industryEffects: { [key in IndustryType]?: number }; // Efectos por industria
}

/**
 * Datos económicos detallados del país
 */
export interface EconomicData {
    regions: Region[];
    industries: Industry[];
    budgetAllocation: BudgetAllocation;
    tradeAgreements: TradeAgreement[];
    totalGdp: number;
    gdpPerCapita: number;
    gdpGrowthRate: number;
    nationalUnemployment: number;
    averageHappiness: number;
    technologyLevel: number; // 0-100
    researchPoints: number; // Acumulado de investigación
    economicEvent: EconomicEvent | null; // Active economic event
}

/**
 * Evento económico
 */
export interface EconomicEvent {
    id: string;
    name: string;
    description: string;
    type: 'positive' | 'negative';
    gdpImpact: number; // % change in GDP (e.g., -0.15 = -15%)
    unemploymentChange: number; // Change in unemployment rate (e.g., 0.08 = +8%)
    stabilityChange: number; // Change in stability points
    duration: number; // Months the event lasts
    affectedRegions: string[]; // IDs of affected regions
    remainingDuration?: number; // For tracking during active event
}

/**
 * Configuración de política industrial
 */
export interface IndustryPolicy {
    industryType: IndustryType;
    subsidyAmount: number; // $ gastado en subsidios
    taxRate: number; // % impuesto adicional
    regulations: 'Low' | 'Medium' | 'High';
}
