import type { GameState } from '../context/GameContext';
import type { Minister } from '../types/politics';
import { MinisterAgenda, type MinisterPsychology, type PresidentialDecision } from '../types/living_world';

// Helper to get psychology or default
const getPsychology = (minister: Minister): MinisterPsychology => {
    return minister.psychology || {
        ideology: 'Neutral',
        hiddenAgenda: MinisterAgenda.STATUS_QUO,
        rivalries: {},
        corruptionPressure: 0,
        paranoia: 0
    };
};

export const evaluateMinisterBehavior = (minister: Minister, state: GameState): PresidentialDecision | null => {
    const psych = getPsychology(minister);

    // No generar eventos de ministros en los primeros 3 meses de juego
    const gameStartDate = new Date(2025, 0, 1); // Asumiendo que el juego empieza en enero 2025
    const monthsPlayed = (state.time.date.getFullYear() - gameStartDate.getFullYear()) * 12 + 
                         (state.time.date.getMonth() - gameStartDate.getMonth());
    
    if (monthsPlayed < 3) {
        return null; // No generar eventos de ministros al inicio
    }

    // 1. Check Loyalty & Resignation (solo si la lealtad es muy baja)
    if (minister.stats.loyalty < 15) {
        return {
            id: `resignation_threat_${minister.id}_${Date.now()}`,
            source: minister.name,
            title: 'Amenaza de Renuncia',
            description: `${minister.name} está desilusionado con tu liderazgo y amenaza con renunciar a menos que se satisfagan sus demandas.`,
            urgency: 'High',
            options: [
                {
                    id: 'accept_resignation',
                    label: 'Aceptar Renuncia',
                    effect: (s) => ({
                        // Logic to remove minister would go here
                        // For now, just a placeholder effect
                        government: {
                            ...s.government,
                            ministers: s.government.ministers.filter(m => m.id !== minister.id)
                        }
                    })
                },
                {
                    id: 'bribe',
                    label: 'Ofrecer Bonificación (Presupuesto -100)',
                    cost: { budget: 100 },
                    effect: (s) => {
                        const updatedMinisters = s.government.ministers.map(m =>
                            m.id === minister.id
                                ? { ...m, stats: { ...m.stats, loyalty: m.stats.loyalty + 20 } }
                                : m
                        );
                        return {
                            government: { ...s.government, ministers: updatedMinisters }
                        };
                    }
                }
            ]
        };
    }

    // 2. Check Corruption
    if (psych.corruptionPressure > 70 && minister.stats.corruption > 50) {
        // High chance of embezzlement scandal or request
        return {
            id: `corruption_scheme_${minister.id}_${Date.now()}`,
            source: 'Inteligencia',
            title: 'Actividad Financiera Sospechosa',
            description: `Reportes de inteligencia indican que ${minister.name} podría estar desviando fondos.`,
            urgency: 'Medium',
            options: [
                {
                    id: 'investigate',
                    label: 'Iniciar Investigación',
                    effect: (s) => {
                        // Trigger scandal event logic
                        return {};
                    }
                },
                {
                    id: 'ignore',
                    label: 'Hacer la vista gorda (Lealtad +10)',
                    effect: (s) => {
                        const updatedMinisters = s.government.ministers.map(m =>
                            m.id === minister.id
                                ? { ...m, stats: { ...m.stats, loyalty: m.stats.loyalty + 10 } }
                                : m
                        );
                        return {
                            government: { ...s.government, ministers: updatedMinisters }
                        };
                    }
                }
            ]
        };
    }

    return null;
};

export const updateRivalries = (ministers: Minister[]): Minister[] => {
    // Simple logic: Ministers with opposing ideologies or high ambition develop rivalries
    return ministers.map(minister => {
        const psych = getPsychology(minister);
        const newRivalries = { ...psych.rivalries };

        ministers.forEach(other => {
            if (other.id === minister.id) return;

            // If both are ambitious, rivalry increases
            if (minister.stats.ambition > 60 && other.stats.ambition > 60) {
                const current = newRivalries[other.id] || 0;
                newRivalries[other.id] = Math.min(100, current + 1);
            }
        });

        return {
            ...minister,
            psychology: {
                ...psych,
                rivalries: newRivalries
            }
        };
    });
};
