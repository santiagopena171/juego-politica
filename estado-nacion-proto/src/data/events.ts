import type { GameState } from '../context/GameContext';

export interface GameEvent {
    id: string;
    title: string;
    description: string;
    trigger?: (state: GameState) => boolean; // New: Condition to fire
    weight?: number; // Probability weight if multiple trigger
    choices: {
        label: string;
        effect: (state: GameState) => Partial<GameState>;
        description: string;
    }[];
}

export const EVENTS: GameEvent[] = [
    {
        id: 'strike_transport',
        title: 'Huelga de Transportistas',
        description: 'El sindicato de transporte ha paralizado las carreteras principales exigiendo subsidios al combustible.',
        trigger: (state) => state.stats.inflation > 0.08 && state.stats.popularity < 60,
        choices: [
            {
                label: 'Negociar (Subsidios)',
                description: 'Costo: $2B. Popularidad +5. Inflación +0.5%.',
                effect: (state) => ({
                    resources: { ...state.resources, budget: state.resources.budget - 2 },
                    stats: { ...state.stats, popularity: state.stats.popularity + 5, inflation: state.stats.inflation + 0.005 }
                })
            },
            {
                label: 'Reprimir',
                description: 'Costo: 10 Capital Político. Popularidad -10. Orden restaurado.',
                effect: (state) => ({
                    resources: { ...state.resources, politicalCapital: state.resources.politicalCapital - 10 },
                    stats: { ...state.stats, popularity: state.stats.popularity - 10 }
                })
            }
        ]
    },
    {
        id: 'tech_boom',
        title: 'Boom Tecnológico',
        description: 'Una startup local ha alcanzado estatus de unicornio, atrayendo inversión.',
        trigger: (state) => state.stats.gdp > 100 && Math.random() < 0.05, // Random chance if GDP is decent
        choices: [
            {
                label: 'Incentivar (Bajar Impuestos)',
                description: 'Impuesto Corp -2%. Crecimiento ++.',
                effect: (state) => ({
                    policies: { ...state.policies, taxRate: Math.max(0, state.policies.taxRate - 0.02) }
                })
            },
            {
                label: 'No intervenir',
                description: 'Sin cambios.',
                effect: () => ({})
            }
        ]
    },
    {
        id: 'corruption_scandal',
        title: 'Escándalo de Corrupción',
        description: 'Un ministro clave ha sido implicado en un esquema de sobornos.',
        trigger: (state) => state.resources.stability < 40 && Math.random() < 0.1,
        choices: [
            {
                label: 'Despedir al Ministro',
                description: 'Popularidad +5. Lealtad del Gabinete -10.',
                effect: (state) => ({
                    stats: { ...state.stats, popularity: state.stats.popularity + 5 },
                    // Logic to lower cabinet loyalty would go here
                })
            },
            {
                label: 'Encubrir',
                description: 'Costo: 20 Capital Político. Riesgo de filtración futura.',
                effect: (state) => ({
                    resources: { ...state.resources, politicalCapital: state.resources.politicalCapital - 20 }
                })
            }
        ]
    },
    {
        id: 'imf_loan',
        title: 'Oferta del FMI',
        description: 'El FMI ofrece un préstamo de emergencia a cambio de medidas de austeridad.',
        trigger: (state) => state.resources.budget < -10, // Budget deficit
        choices: [
            {
                label: 'Aceptar Préstamo',
                description: 'Presupuesto +$50B. Popularidad -15. Gasto Público -20%.',
                effect: (state) => ({
                    resources: { ...state.resources, budget: state.resources.budget + 50 },
                    policies: { ...state.policies, publicSpending: state.policies.publicSpending * 0.8 },
                    stats: { ...state.stats, popularity: state.stats.popularity - 15 }
                })
            },
            {
                label: 'Rechazar',
                description: 'Mantener soberanía. Crisis fiscal continúa.',
                effect: () => ({})
            }
        ]
    }
];
