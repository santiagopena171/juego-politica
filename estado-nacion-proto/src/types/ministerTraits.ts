import type { Ideology } from './politics';

/**
 * Trait definition: represents a personality/background characteristic
 * that modifies a minister's stats and behavior
 */
export interface MinisterTrait {
    id: string;
    name: string;
    description: string;
    // Stat modifiers
    competenceBonus?: number;  // +/- to base competence
    loyaltyBonus?: number;
    corruptionRisk?: number;    // +/- to corruption chance
    popularityBonus?: number;
    ambitionBonus?: number;
    // Behavioral flags
    ideologyBias?: 'left' | 'right' | 'authoritarian' | 'libertarian';
    policyPreferences?: string[]; // IDs of preferred policies
    // Event triggers
    eventModifiers?: {
        scandals: number;       // Multiplier for scandal probability
        effectiveness: number;  // Multiplier for policy success
        resignation: number;    // Multiplier for resignation chance
    };
}

/**
 * Complete trait catalog
 */
export const MINISTER_TRAITS: Record<string, MinisterTrait> = {
    // --- COMPETENCE FOCUSED ---
    tecnocrata: {
        id: 'tecnocrata',
        name: 'Tecnócrata',
        description: 'Formación académica sólida, enfoque basado en evidencia y datos.',
        competenceBonus: 20,
        popularityBonus: -10,
        eventModifiers: { scandals: 0.5, effectiveness: 1.3, resignation: 1.0 }
    },
    incompetente: {
        id: 'incompetente',
        name: 'Incompetente',
        description: 'Falta de experiencia o capacidad técnica en el área.',
        competenceBonus: -25,
        loyaltyBonus: 10, // Subservient
        eventModifiers: { scandals: 1.5, effectiveness: 0.6, resignation: 0.8 }
    },

    // --- LOYALTY/AMBITION ---
    leal: {
        id: 'leal',
        name: 'Leal',
        description: 'Extremadamente fiel al presidente y al partido.',
        loyaltyBonus: 25,
        ambitionBonus: -15,
        eventModifiers: { scandals: 1.0, effectiveness: 1.0, resignation: 0.3 }
    },
    oportunista: {
        id: 'oportunista',
        name: 'Oportunista',
        description: 'Prioriza su carrera política por encima de la lealtad.',
        loyaltyBonus: -20,
        ambitionBonus: 30,
        eventModifiers: { scandals: 1.2, effectiveness: 0.9, resignation: 2.0 }
    },
    ambicioso: {
        id: 'ambicioso',
        name: 'Ambicioso',
        description: 'Busca posicionarse para competir por la presidencia.',
        ambitionBonus: 25,
        popularityBonus: 10,
        loyaltyBonus: -10,
        eventModifiers: { scandals: 1.0, effectiveness: 1.1, resignation: 1.5 }
    },

    // --- CORRUPTION ---
    corrupto: {
        id: 'corrupto',
        name: 'Corrupto',
        description: 'Historiales de negociados turbios y enriquecimiento ilícito.',
        corruptionRisk: 40,
        competenceBonus: -10,
        eventModifiers: { scandals: 3.0, effectiveness: 0.8, resignation: 1.2 }
    },
    integro: {
        id: 'integro',
        name: 'Íntegro',
        description: 'Reputación impecable, rechaza sobornos.',
        corruptionRisk: -30,
        popularityBonus: 15,
        eventModifiers: { scandals: 0.2, effectiveness: 1.1, resignation: 1.0 }
    },

    // --- IDEOLOGY ---
    dogmatico: {
        id: 'dogmatico',
        name: 'Dogmático',
        description: 'Inflexible en sus principios ideológicos.',
        loyaltyBonus: 15,
        competenceBonus: -10,
        eventModifiers: { scandals: 1.0, effectiveness: 0.8, resignation: 0.9 }
    },
    pragmatico: {
        id: 'pragmatico',
        name: 'Pragmático',
        description: 'Dispuesto a negociar y adaptarse según el contexto.',
        competenceBonus: 10,
        popularityBonus: 5,
        eventModifiers: { scandals: 1.0, effectiveness: 1.2, resignation: 1.0 }
    },

    // --- BACKGROUND ---
    militar: {
        id: 'militar',
        name: 'Militar',
        description: 'Carrera en las fuerzas armadas, enfoque jerárquico.',
        ideologyBias: 'authoritarian',
        loyaltyBonus: 15,
        competenceBonus: 5,
        popularityBonus: -5,
        eventModifiers: { scandals: 1.0, effectiveness: 1.1, resignation: 0.7 }
    },
    sindicalista: {
        id: 'sindicalista',
        name: 'Sindicalista',
        description: 'Proviene del movimiento obrero organizado.',
        ideologyBias: 'left',
        popularityBonus: 15,
        competenceBonus: -5,
        eventModifiers: { scandals: 0.8, effectiveness: 1.0, resignation: 1.0 }
    },
    empresario: {
        id: 'empresario',
        name: 'Empresario',
        description: 'Exitosa carrera en el sector privado.',
        ideologyBias: 'right',
        competenceBonus: 15,
        corruptionRisk: 10,
        eventModifiers: { scandals: 1.3, effectiveness: 1.2, resignation: 1.0 }
    },
    academico: {
        id: 'academico',
        name: 'Académico',
        description: 'Profesor universitario, investigador.',
        competenceBonus: 15,
        popularityBonus: -5,
        eventModifiers: { scandals: 0.6, effectiveness: 1.2, resignation: 1.0 }
    },

    // --- PERSONALITY ---
    populista: {
        id: 'populista',
        name: 'Populista',
        description: 'Gran oratoria, conecta emocionalmente con las masas.',
        popularityBonus: 25,
        competenceBonus: -10,
        eventModifiers: { scandals: 1.2, effectiveness: 0.9, resignation: 1.0 }
    },
    carismatico: {
        id: 'carismatico',
        name: 'Carismático',
        description: 'Presencia magnética, liderazgo natural.',
        popularityBonus: 20,
        ambitionBonus: 15,
        eventModifiers: { scandals: 1.0, effectiveness: 1.1, resignation: 1.0 }
    },
    reservado: {
        id: 'reservado',
        name: 'Reservado',
        description: 'Perfil bajo, evita protagonismo mediático.',
        popularityBonus: -15,
        loyaltyBonus: 10,
        eventModifiers: { scandals: 0.7, effectiveness: 1.0, resignation: 0.8 }
    },

    // --- DIPLOMATIC ---
    diplomatico: {
        id: 'diplomatico',
        name: 'Diplomático',
        description: 'Hábil negociador, facilita acuerdos.',
        competenceBonus: 10,
        popularityBonus: 10,
        eventModifiers: { scandals: 0.8, effectiveness: 1.2, resignation: 1.0 }
    },
    confrontacional: {
        id: 'confrontacional',
        name: 'Confrontacional',
        description: 'Estilo agresivo, genera roces constantes.',
        popularityBonus: -10,
        loyaltyBonus: -5,
        eventModifiers: { scandals: 1.3, effectiveness: 0.9, resignation: 1.5 }
    },

    // --- SPECIALIZED ---
    reformista: {
        id: 'reformista',
        name: 'Reformista',
        description: 'Impulsa cambios profundos en el sistema.',
        competenceBonus: 10,
        loyaltyBonus: -10,
        popularityBonus: 5,
        eventModifiers: { scandals: 1.0, effectiveness: 1.3, resignation: 1.2 }
    },
    conservador: {
        id: 'conservador',
        name: 'Conservador',
        description: 'Defiende el status quo, evita riesgos.',
        loyaltyBonus: 15,
        competenceBonus: -5,
        eventModifiers: { scandals: 0.8, effectiveness: 0.9, resignation: 0.7 }
    },
    visionario: {
        id: 'visionario',
        name: 'Visionario',
        description: 'Planificación a largo plazo, proyectos ambiciosos.',
        competenceBonus: 15,
        popularityBonus: 5,
        eventModifiers: { scandals: 1.0, effectiveness: 1.4, resignation: 1.0 }
    },
    improvisador: {
        id: 'improvisador',
        name: 'Improvisador',
        description: 'Decide sobre la marcha, alta capacidad de respuesta.',
        competenceBonus: -5,
        loyaltyBonus: 5,
        eventModifiers: { scandals: 1.2, effectiveness: 0.8, resignation: 1.0 }
    }
};

/**
 * Get random traits for a minister based on country context
 */
export function selectTraitsForMinister(
    countryContext: {
        ideology: Ideology;
        corruption: number;      // 0-100
        militarySpending: number; // % of GDP
        freedom: number;         // 0-100
    },
    count: number = 2
): MinisterTrait[] {
    const traits = Object.values(MINISTER_TRAITS);
    const weights: number[] = [];

    // Calculate weight for each trait based on country context
    traits.forEach(trait => {
        let weight = 1.0; // Base weight

        // Corruption context
        if (countryContext.corruption > 60) {
            if (trait.id === 'corrupto') weight *= 3.0;
            if (trait.id === 'integro') weight *= 0.3;
        } else if (countryContext.corruption < 30) {
            if (trait.id === 'corrupto') weight *= 0.3;
            if (trait.id === 'integro') weight *= 2.0;
        }

        // Military context
        if (countryContext.militarySpending > 3.0) {
            if (trait.id === 'militar') weight *= 2.5;
        }

        // Freedom context
        if (countryContext.freedom < 40) {
            if (trait.ideologyBias === 'authoritarian') weight *= 1.8;
            if (trait.id === 'leal') weight *= 1.5;
        }

        // Ideology context
        if (countryContext.ideology === 'Socialist') {
            if (trait.ideologyBias === 'left') weight *= 1.8;
            if (trait.id === 'sindicalista') weight *= 2.0;
        } else if (countryContext.ideology === 'Capitalist' || countryContext.ideology === 'Liberal') {
            if (trait.ideologyBias === 'right') weight *= 1.8;
            if (trait.id === 'empresario') weight *= 2.0;
        } else if (countryContext.ideology === 'Authoritarian') {
            if (trait.ideologyBias === 'authoritarian') weight *= 2.0;
            if (trait.id === 'militar') weight *= 2.5;
        }

        weights.push(weight);
    });

    // Weighted random selection (without replacement)
    const selected: MinisterTrait[] = [];
    const availableIndices = Array.from({ length: traits.length }, (_, i) => i);

    for (let i = 0; i < Math.min(count, traits.length); i++) {
        const totalWeight = availableIndices.reduce((sum, idx) => sum + weights[idx], 0);
        let random = Math.random() * totalWeight;

        let selectedIdx = 0;
        for (const idx of availableIndices) {
            random -= weights[idx];
            if (random <= 0) {
                selectedIdx = idx;
                break;
            }
        }

        selected.push(traits[selectedIdx]);
        availableIndices.splice(availableIndices.indexOf(selectedIdx), 1);
    }

    return selected;
}
