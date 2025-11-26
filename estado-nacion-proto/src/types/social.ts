import type { SocialGroup } from './living_world';

/**
 * Tipos de grupos de interés en la sociedad
 */
export type InterestGroupType =
    | 'Unions'        // Sindicatos - trabajadores organizados
    | 'Business'      // Empresarios - sector privado
    | 'Religious'     // Religiosos - instituciones religiosas
    | 'Students'      // Estudiantes - juventud y educación
    | 'Military'      // Militares - fuerzas armadas
    | 'Rural';        // Rurales - sector agrícola y campo

/**
 * Grupo de interés con agenda propia
 */
export interface InterestGroup {
    id: string;
    type: InterestGroupType;
    name: string;
    description: string;
    populationSize: number; // Cantidad de población representada
    approval: number; // Aprobación del gobierno (0-100)
    power: number; // Capacidad de disrupción (0-100)
    concerns: string[]; // Temas que les importan
    ideology: 'Left' | 'Center' | 'Right'; // Tendencia política
}

/**
 * Protesta activa de un grupo de interés
 */
export interface Protest {
    id: string;
    groupId: string;
    groupName: string;
    startDate: Date;
    duration: number; // Meses que lleva activa
    intensity: number; // Nivel de intensidad (0-100)
    demands: string[]; // Demandas específicas
    participants: number; // Cantidad de manifestantes
    economicImpact: number; // Impacto en PIB (% negativo)
    stabilityImpact: number; // Impacto en estabilidad (puntos negativos)
    escalating: boolean; // Si está escalando o no
}

/**
 * Acciones disponibles para manejar protestas
 */
export type ProtestAction =
    | 'negotiate'  // Negociar y prometer cambios
    | 'suppress'   // Reprimir con policía
    | 'ignore'     // Ignorar (riesgo de escalada)
    | 'concede';   // Ceder a demandas

/**
 * Estado de los medios de comunicación
 */
export interface MediaState {
    freedom: number; // Libertad de prensa (0-100)
    support: number; // Apoyo mediático al gobierno (0-100)
    censorship: number; // Nivel de censura (0-100)
    publicMediaFunding: number; // Financiamiento a medios públicos ($B)
    scandalsExposed: number; // Escándalos expuestos este año
}

/**
 * Campaña electoral
 */
export interface ElectoralCampaign {
    active: boolean;
    monthsUntilElection: number;
    governmentBudget: number; // $ gastado por gobierno
    oppositionBudget: number; // $ estimado de oposición
    ralliesHeld: number; // Mítines realizados
    debatesScheduled: number; // Debates programados
    smearCampaigns: number; // Campañas sucias lanzadas
    momentum: number; // Momentum de campaña (-100 a 100)
}

/**
 * Tipo de evento de campaña
 */
export type CampaignEventType =
    | 'rally'          // Mitin público
    | 'smear'          // Campaña sucia
    | 'debate'         // Debate político
    | 'scandal'        // Escándalo revelado
    | 'endorsement';   // Endorso de figura pública

/**
 * Evento de campaña electoral
 */
export interface CampaignEvent {
    id: string;
    type: CampaignEventType;
    title: string;
    description: string;
    targetGroup?: InterestGroupType; // Grupo objetivo
    targetRegion?: string; // Región objetivo
    cost: number; // Costo en $B
    politicalCapitalCost: number; // Costo en capital político
    effects: {
        approvalChange?: { [key in InterestGroupType]?: number };
        popularityChange?: number;
        stabilityChange?: number;
        mediaFreedomChange?: number;
    };
    choices?: CampaignChoice[]; // Opciones para eventos interactivos
}

/**
 * Opción en evento de campaña
 */
export interface CampaignChoice {
    id: string;
    text: string;
    requirements?: {
        budget?: number;
        politicalCapital?: number;
    };
    effects: {
        approvalChange?: { [key in InterestGroupType]?: number };
        popularityChange?: number;
        mediaSupport?: number;
        momentum?: number;
    };
    risk?: string; // Descripción del riesgo
}

/**
 * Datos sociales del país
 */
export interface SocialData {
    groups: SocialGroup[]; // New POPs system
    interestGroups: InterestGroup[]; // Legacy system (to be deprecated or integrated)
    activeProtests: Protest[];
    mediaState: MediaState;
    campaign: ElectoralCampaign | null;
    socialTension: number; // Tensión social general (0-100)
    humanRights: number; // Índice de derechos humanos (0-100)
}

/**
 * Modificador de aprobación para grupos de interés
 */
export interface ApprovalModifier {
    groupId?: string; // ID específico del grupo (para eventos Fase 5)
    groupType?: InterestGroupType; // Tipo de grupo (sistema viejo)
    modifier?: number; // Fase 5
    change?: number; // Sistema viejo
    duration?: number; // Duración en meses (Fase 5)
    reason?: string; // Razón del cambio
}

/**
 * Resultado de acción sobre protesta
 */
export interface ProtestResolution {
    success: boolean;
    protestEnded: boolean;
    approvalChange: number;
    stabilityChange: number;
    politicalCapitalCost: number;
    consequences: string[];
}
