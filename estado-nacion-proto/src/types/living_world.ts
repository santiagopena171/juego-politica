import type { GameState } from '../context/GameContext';

// --- Phase 7: Cabinet & Psychology ---

export const MinisterAgenda = {
    LOYALIST: 'LOYALIST',
    COUP_PLOTTER: 'COUP_PLOTTER',
    WEALTH_ACCUMULATION: 'WEALTH_ACCUMULATION',
    IDEOLOGICAL_ZEALOT: 'IDEOLOGICAL_ZEALOT',
    RIVAL_SABOTAGE: 'RIVAL_SABOTAGE',
    REFORMER: 'REFORMER',
    STATUS_QUO: 'STATUS_QUO'
} as const;

export type MinisterAgenda = typeof MinisterAgenda[keyof typeof MinisterAgenda];

export interface MinisterPsychology {
    ideology: string; // e.g., 'Socialist', 'Liberal'
    hiddenAgenda: MinisterAgenda;
    rivalries: Record<string, number>; // MinisterID -> Hatred Level (0-100)
    corruptionPressure: number; // Current pressure to commit corrupt acts
    paranoia: number; // 0-100, affects false positives in intel
}

export type MinisterStrategy = 'GROWTH' | 'AUSTERITY' | 'WELFARE' | 'GREED';

export const POLITICAL_COSTS = {
    VETO_LAW: 10,
    FIRE_MINISTER: 25,
    MANUAL_OVERRIDE: 5,
    EMERGENCY_DECREE: 50
} as const;

// --- Phase 8: Sociology & POPs ---

export type SocialClass = 'Elite' | 'Middle' | 'Lower';

export type PopType =
    | 'Business_Elite'
    | 'Urban_Middle_Class'
    | 'Industrial_Workers'
    | 'Rural_Conservatives'
    | 'Minorities'
    | 'Intellectuals'
    | 'Army_Loyalists';

export interface SocialGroup {
    id: string;
    type: PopType;
    socialClass: SocialClass;
    populationSize: number;
    satisfaction: number; // 0-100
    radicalization: number; // 0-100
    politicalInfluence: number; // Weight in voting/stability
    keyIssues: string[]; // e.g., ['Unemployment', 'Security']
}

// --- Phase 9: Intelligence & Media ---

export interface IntelOperation {
    id: string;
    type: 'VIGILANCE' | 'INFILTRATION' | 'FALSE_FLAG' | 'ASSASSINATION';
    targetId: string; // MinisterID or PopGroupID
    cost: number;
    risk: number;
    progress: number;
}

export interface MediaOutlet {
    id: string;
    name: string;
    bias: 'ProGov' | 'AntiGov' | 'Neutral';
    trust: number; // 0-100
    loyalty: number; // 0-100 (to player)
    audience: PopType[]; // Who listens to this?
}

export interface MediaState {
    outlets: MediaOutlet[];
    censorshipLevel: number;
    propagandaBudget: number;
}

// --- Phase 10: UX Revolution ---

export type MandateType = 'GROWTH' | 'AUSTERITY' | 'POPULISM' | 'CORRUPTION_PURGE' | 'MAINTENANCE';

export interface MinisterMandate {
    id: string;
    type: MandateType;
    assignedAt: Date;
    progress: number;
    lastReport: string;
}

export interface PresidentialDecision {
    id: string;
    source: string; // Name of Minister, Faction, or 'Intelligence'
    title: string;
    description: string; // "The Minister of Defense demands..."
    urgency: 'Low' | 'Medium' | 'High' | 'Critical';
    options: {
        id: string;
        label: string;
        cost?: { budget?: number; politicalCapital?: number };
        predictedConsequences?: string[]; // "Might anger Unions"
        effect: (state: GameState) => Partial<GameState>;
    }[];
    expiresAt?: Date;
}

// UI feedback helpers
export interface RegionUIFlags {
    unrestHigh?: boolean;
    strike?: boolean;
}

export interface MinisterFaceState {
    mood: 'happy' | 'angry' | 'nervous' | 'neutral';
}
