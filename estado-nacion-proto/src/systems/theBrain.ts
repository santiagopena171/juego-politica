import type { GameState } from '../context/GameContext';
import type { PresidentialDecision } from '../types/living_world';
import { executeMinisterMandates } from './mandateAutomation';
import { updatePopSatisfaction } from './sociology';
import { regenPoliticalCapital } from './politicalCapital';
import { handleElectionIfNeeded, isCampaignTurn } from './elections';
import { computeRegionUIFlags, computeMinisterFaces } from './uiSignals';
import { evaluateMinisterBehavior } from './psychology';

export const evaluateTurn = (state: GameState): { newState: GameState; newDecisions: PresidentialDecision[] } => {
    let newState = { ...state };
    const newDecisions: PresidentialDecision[] = [];

    // 1. Mandatos automáticos (ajuste económico por ministros)
    newState = executeMinisterMandates(newState);

    // 2. Reacción social (POPs)
    if (newState.social && newState.social.groups) {
        newState.social = { ...newState.social, groups: updatePopSatisfaction(newState.social.groups, newState) };
    }

    // 3. Capital político (regeneración)
    newState = regenPoliticalCapital(newState);

    // 4. Oportunismo político (decisiones de oposición si PC bajo)
    if (newState.resources.politicalCapital < 20) {
        newDecisions.push({
            id: `opposition_attack_${Date.now()}`,
            source: 'Opposition',
            title: 'Oposición aprovecha debilidad',
            description: 'Con poco capital político, la oposición exige concesiones.',
            urgency: 'High',
            options: [
                {
                    id: 'concede',
                    label: 'Conceder (Popularidad -2, PC +5)',
                    effect: s => ({
                        stats: { ...s.stats, popularity: Math.max(0, s.stats.popularity - 2) },
                        resources: { ...s.resources, politicalCapital: Math.min(100, s.resources.politicalCapital + 5) },
                    }),
                },
                {
                    id: 'resist',
                    label: 'Resistir (Estabilidad -3)',
                    effect: s => ({
                        resources: { ...s.resources, stability: Math.max(0, s.resources.stability - 3) },
                    }),
                },
            ],
        });
    }

    // 5. Ciclo electoral
    const computedTurn = newState.time.turn ?? ((newState.time.date.getMonth() + 1) + (newState.time.date.getFullYear() - 2025) * 12);
    newState.time = { ...newState.time, turn: computedTurn, isCampaignMode: isCampaignTurn(computedTurn) };
    newState = handleElectionIfNeeded(newState);

    // 6. Visual flags para UI
    const regionFlags = computeRegionUIFlags(newState);
    const ministerFaces = computeMinisterFaces(newState);
    newState = { ...newState, uiFlags: { regionFlags, ministerFaces } as any };

    // 7. Psicología (decisiones de ministros)
    if (newState.government && newState.government.ministers) {
        newState.government.ministers.forEach(minister => {
            const decision = evaluateMinisterBehavior(minister, newState);
            if (decision) {
                newDecisions.push(decision);
            }
        });
    }

    return { newState, newDecisions };
};

export const evaluateTurnLogic = evaluateTurn;
