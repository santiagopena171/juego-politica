import type { Ideology } from './politics';

// Áreas de políticas que las facciones priorizan
export type PolicyArea =
    | 'economy'
    | 'social'
    | 'security'
    | 'environment'
    | 'education'
    | 'health'
    | 'infrastructure'
    | 'foreign';

// Tipo de facción dentro de un partido
export type FactionType =
    | 'hardliner'    // Ala Dura - posiciones extremas
    | 'moderate'     // Moderados - centro del partido
    | 'reformist'    // Reformistas - cambio progresivo
    | 'pragmatist';  // Pragmáticos - resultados sobre ideología

// Postura de una facción hacia el gobierno
export type FactionStance = 'supportive' | 'neutral' | 'hostile';

// Facción interna de un partido político
export interface PartyFaction {
    id: string;
    name: string; // "Ala Dura Conservadora", "Moderados Reformistas"
    partyId: string; // ID del partido al que pertenece
    type: FactionType;
    ideology: Ideology; // Puede diferir ligeramente del partido
    size: number; // % de escaños del partido (0-100)
    influence: number; // Poder dentro del partido (0-100)
    priorities: PolicyArea[]; // 2-3 áreas prioritarias
    stance: FactionStance; // Hacia el gobierno actual
    loyaltyToLeader: number; // Lealtad al líder del partido (0-100)
    description: string; // Breve descripción de la facción
}

// Tipo de ley que se vota
export type BillType =
    | 'policy_change'    // Cambio de política existente
    | 'budget'           // Asignación presupuestaria
    | 'reform'           // Reforma estructural
    | 'crisis_response'  // Respuesta a crisis
    | 'constitutional';  // Cambio constitucional

// Efecto de una política aprobada
export interface PolicyEffect {
    statChanges?: {
        gdp?: number;
        unemployment?: number;
        inflation?: number;
        popularity?: number;
        stability?: number;
    };
    resourceChanges?: {
        budget?: number;
        politicalCapital?: number;
    };
    policyChanges?: {
        [key: string]: number; // ej: "taxRate": 0.05
    };
}

// Ley/Bill que se vota en el parlamento
export interface Bill {
    id: string;
    title: string;
    description: string;
    type: BillType;
    policyArea: PolicyArea;
    effects: PolicyEffect; // Qué cambiará si se aprueba
    proposedBy: 'government' | 'opposition';
    proposerPartyId?: string; // ID del partido que propone
    status: 'pending' | 'in_vote' | 'approved' | 'rejected';
    votes: {
        yes: number;
        no: number;
        abstain: number;
    };
    requiredMajority: number; // % necesario (50, 60, 67, 75)
    urgency: 'low' | 'medium' | 'high' | 'crisis';
    dateProposed: Date;
    factionVotes?: FactionVote[]; // Detalles de cómo votó cada facción
}

// Voto de una facción específica
export interface FactionVote {
    factionId: string;
    vote: 'yes' | 'no' | 'abstain';
    reason: string; // Por qué votaron así
    baseSupport: number; // Apoyo natural (0-100)
    influenced: boolean; // Si fue influenciado por negociación
    influenceAmount?: number; // Cuánto cambió su voto
}

// Tipo de oferta en negociación
export type NegotiationOfferType =
    | 'ministry_position'    // Ofrecer puesto ministerial
    | 'budget_allocation'    // Asignar presupuesto a sus prioridades
    | 'policy_concession'    // Ceder en alguna política
    | 'political_support'    // Apoyo a futuras iniciativas
    | 'committee_position';  // Puesto en comité parlamentario

// Oferta de negociación con facción
export interface NegotiationOffer {
    type: NegotiationOfferType;
    details: string;
    politicalCapitalCost: number;
    successChance: number; // 0-100
    value: any; // Valor específico de la oferta
}

// Resultado de negociación
export interface NegotiationResult {
    success: boolean;
    factionId: string;
    stanceChange?: FactionStance;
    influenceGained: number; // 0-100
    message: string;
    costPaid: number;
}

// Evento parlamentario
export type ParliamentaryEventType =
    | 'party_rebellion'        // Rebelión dentro del partido
    | 'no_confidence_motion'   // Moción de censura
    | 'coalition_breakdown'    // Ruptura de coalición
    | 'snap_election'          // Elecciones anticipadas
    | 'faction_split'          // Escisión de facción
    | 'caucus_revolt';         // Revuelta de bancada

export interface ParliamentaryEvent {
    id: string;
    type: ParliamentaryEventType;
    title: string;
    description: string;
    triggerConditions: {
        governmentSupport?: number; // Debe estar debajo de este %
        failedBills?: number; // N° de leyes rechazadas
        popularityThreshold?: number;
    };
    factionIds: string[]; // Facciones involucradas
    choices: ParliamentaryChoice[];
    consequences: PolicyEffect;
}

export interface ParliamentaryChoice {
    id: string;
    text: string;
    requirement?: {
        politicalCapital?: number;
        ministerSupport?: boolean;
    };
    outcome: {
        success: boolean;
        message: string;
        effects: PolicyEffect;
        factionStanceChanges?: { [factionId: string]: FactionStance };
    };
}
