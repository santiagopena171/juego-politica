import type { MinisterPsychology, MinisterMandate } from './living_world';
import type { MinisterStrategy } from './living_world';

export type Ideology = 'Socialist' | 'Liberal' | 'Conservative' | 'Nationalist' | 'Centrist' | 'Authoritarian' | 'Capitalist';

export type MinistryType = 'Economy' | 'Foreign' | 'Interior' | 'Defense' | 'Health' | 'Education' | 'Infrastructure' | 'Environment';

export interface Effect {
    target: string; // e.g., 'gdp_growth', 'stability', 'public_opinion'
    value: number;  // e.g., 0.01, -5
    mode: 'flat' | 'percent'; // Add or Multiply
}

export interface Requirement {
    type: 'budget' | 'political_capital' | 'stability';
    min: number;
}

// --- Cabinet & Ministers ---
export interface Minister {
    id: string;
    name: string;
    age: number;
    gender: 'M' | 'F' | 'NB';
    ministry: MinistryType;
    partyId: string;
    ideology: Ideology;
    stats: {
        competence: number; // 0-100 (affects policy effectiveness)
        loyalty: number;    // 0-100 (affects resignation risk)
        popularity: number; // 0-100 (affects public opinion)
        corruption: number; // 0-100 (risk of scandals)
        ambition: number;   // 0-100 (presidential aspirations)
        internalSupport: number; // 0-100 (support within party)
    };
    traitIds: string[];  // IDs of traits from ministerTraits.ts
    biography: string;   // Generated flavor text
    appointmentDate?: Date; // When they took office
    scandalsCount: number; // Track scandal history
    psychology?: MinisterPsychology;
    mandate?: MinisterMandate;
    strategy?: MinisterStrategy;
}

// --- Parliament & Parties ---
export interface PoliticalParty {
    id: string;
    name: string;
    color: string;
    ideology: Ideology;
    seats: number;
    isGovernment: boolean;
    stance: number; // 0-100: Support for the player
    factionIds?: string[]; // NEW: IDs de facciones dentro del partido
}

export interface Parliament {
    totalSeats: number;
    parties: PoliticalParty[];
    nextElectionDate: number; // Timestamp
    factions?: any[]; // NEW: Array de facciones (tipo importado dinámicamente)
    governmentCoalition?: string[]; // NEW: IDs de partidos en coalición
    governmentSupport?: number; // NEW: % de apoyo al gobierno (0-100)
    activeBill?: any | null; // NEW: Ley actualmente en votacion (tipo Bill)
    partyCohesion?: number; // Cohesion interna del bloque oficialista (0-100)
}

// --- Policies & Projects ---
export interface PolicyOption {
    id: string;
    name: string;
    description: string;
    costPerTurn: number;
    effects: Effect[];
}

export interface Policy {
    id: string;
    name: string;
    category: 'Economy' | 'Social' | 'Rights' | 'Foreign' | 'Security';
    description: string;
    activeOptionId: string;
    options: PolicyOption[];
}

export interface Project {
    id: string;
    name: string;
    description: string;
    cost: number;
    duration: number; // Turns
    progress: number;
    effects: Effect[];
    status: 'Proposed' | 'Active' | 'Completed' | 'Cancelled';
}

// --- Events & Situations ---
export interface EventOption {
    id: string;
    text: string;
    effects: Effect[];
    requirements?: Requirement[];
}

export interface GameEvent {
    id: string;
    title: string;
    description: string;
    image?: string; // Emoji or path
    options: EventOption[];
    triggerCondition?: (state: any) => boolean; // Optional logic hook
}

export interface Situation {
    id: string;
    name: string;
    description: string;
    severity: number; // 0-100
    progress: number; // 0-100
    trend: number; // + or - per turn
    active: boolean;
}


