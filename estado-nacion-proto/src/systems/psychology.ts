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

    // 1. Check Loyalty & Resignation
    if (minister.stats.loyalty < 20) {
        return {
            id: `resignation_threat_${minister.id}_${Date.now()}`,
            source: minister.name,
            title: 'Threat of Resignation',
            description: `${minister.name} is disillusioned with your leadership and threatens to resign unless demands are met.`,
            urgency: 'High',
            options: [
                {
                    id: 'accept_resignation',
                    label: 'Accept Resignation',
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
                    label: 'Offer Bonus (Budget -100)',
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
            source: 'Intelligence',
            title: 'Suspicious Financial Activity',
            description: `Intelligence reports indicate ${minister.name} might be diverting funds.`,
            urgency: 'Medium',
            options: [
                {
                    id: 'investigate',
                    label: 'Launch Investigation',
                    effect: (s) => {
                        // Trigger scandal event logic
                        return {};
                    }
                },
                {
                    id: 'ignore',
                    label: 'Look the other way (Loyalty +10)',
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
