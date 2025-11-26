import type { GameState } from '../context/GameContext';
import type { Bill } from '../types/parliament';
import type { Constitution, Judge, SupremeCourt } from '../types/judiciary';
import { POLITICAL_COSTS } from '../types/living_world';

// Evalúa si una ley es constitucional; devuelve estado actualizado y si fue vetada
export const checkConstitutionality = (
    state: GameState,
    bill: Bill & { ideology?: 'Capitalist' | 'Socialist' | 'Centrist' | 'Authoritarian' }
): { state: GameState; vetoed: boolean } => {
    if (!state.judiciary?.supremeCourt?.length) return { state, vetoed: false };

    const votesFor = state.judiciary.supremeCourt.reduce((acc, judge) => {
        const alignment =
            bill.ideology && judge.ideology === bill.ideology
                ? 1
                : bill.ideology && judge.ideology === 'Centrist'
                    ? 0.6
                    : 0.4;
        const corruptionFactor = 1 - (judge.corruption / 200); // corrupción reduce su resistencia
        const integrityFactor = judge.integrity / 100;
        const voteScore = alignment * corruptionFactor * integrityFactor;
        return acc + (voteScore >= 0.5 ? 1 : 0);
    }, 0);

    const majorityAgainst = votesFor <= Math.floor(state.judiciary.supremeCourt.length / 2);
    if (!majorityAgainst) return { state, vetoed: false };

    // Veto judicial: cuesta capital político
    const politicalCapital = Math.max(0, state.resources.politicalCapital - POLITICAL_COSTS.EMERGENCY_DECREE);
    const updatedState: GameState = {
        ...state,
        resources: { ...state.resources, politicalCapital },
        logs: [...state.logs, `La Corte Suprema vetó la ley ${bill.id}. Capital político reducido.`]
    };
    return { state: updatedState, vetoed: true };
};

export const ageAndRefreshJudiciary = (court: SupremeCourt): { court: SupremeCourt; vacancy: boolean } => {
    const updated: SupremeCourt = [];
    let vacancy = false;
    court.forEach(j => {
        const age = j.age + 1;
        const retires = age >= 80 || Math.random() < 0.02;
        if (retires) {
            vacancy = true;
        } else {
            updated.push({ ...j, age });
        }
    });
    return { court: updated, vacancy };
};

export const packCourt = (state: GameState, newJudges: Judge[]): GameState => {
    const stabilityHit = 10 + newJudges.length * 2;
    return {
        ...state,
        judiciary: {
            ...state.judiciary,
            supremeCourt: [...(state.judiciary?.supremeCourt || []), ...newJudges]
        },
        resources: {
            ...state.resources,
            stability: Math.max(0, state.resources.stability - stabilityHit),
            politicalCapital: Math.max(0, state.resources.politicalCapital - POLITICAL_COSTS.EMERGENCY_DECREE)
        },
        logs: [...state.logs, `Corte ampliada con ${newJudges.length} jueces leales. Estabilidad -${stabilityHit}.`]
    };
};

export const forceRetirement = (state: GameState, judgeId: string): GameState => {
    const court = state.judiciary?.supremeCourt || [];
    const target = court.find(j => j.id === judgeId);
    if (!target) return state;
    const updatedCourt = court.filter(j => j.id !== judgeId);
    return {
        ...state,
        judiciary: { ...state.judiciary, supremeCourt: updatedCourt },
        logs: [...state.logs, `Juez ${target.name} forzado a retirarse.`]
    };
};

export const updateConstitution = (
    state: GameState,
    changes: Partial<Constitution>
): GameState => {
    return {
        ...state,
        judiciary: {
            ...state.judiciary,
            constitution: { ...state.judiciary.constitution, ...changes }
        },
        logs: [...state.logs, `Constitución modificada via referéndum.`]
    };
};
