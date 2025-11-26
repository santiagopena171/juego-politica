import type { GameState } from '../context/GameContext';

export type ProjectStatus = 'PLANNED' | 'BUILDING' | 'COMPLETED' | 'PAUSED';

export interface NationalProject {
    id: 'NUCLEAR_PROGRAM' | 'SPACE_AGENCY' | 'HIGH_SPEED_RAIL' | 'NEW_CAPITAL_CITY' | 'OLYMPICS';
    status: ProjectStatus;
    progress: number; // 0-100
    costPerTurn: number;
    requirements?: string[];
    payoffApplied?: boolean;
}

export const processGrandProjects = (state: GameState): { state: GameState; events: string[] } => {
    const events: string[] = [];
    if (!state.nationalProjects) return { state, events };

    const projects = state.nationalProjects.map(project => {
        if (project.status !== 'BUILDING') return project;

        let newProgress = project.progress + 5; // avance base mensual
        let cost = project.costPerTurn;

        // ralentiza si falta presupuesto
        if (state.resources.budget < cost) {
            newProgress -= 2;
            cost = state.resources.budget;
        }

        newProgress = Math.min(100, Math.max(0, newProgress));

        return { ...project, progress: newProgress, status: newProgress >= 100 ? 'COMPLETED' as ProjectStatus : project.status };
    });

    let newState: GameState = {
        ...state,
        nationalProjects: projects,
        resources: {
            ...state.resources,
            budget: Math.max(0, state.resources.budget - projects.reduce((s, p) => s + (p.status === 'BUILDING' ? p.costPerTurn : 0), 0))
        }
    };

    // Aplicar payoffs únicos
    newState.nationalProjects = newState.nationalProjects.map(p => {
        if (p.status === 'COMPLETED' && !p.payoffApplied) {
            if (p.id === 'NUCLEAR_PROGRAM') {
                // Disuade guerras pero atrae sanciones: estabilidad +, relaciones -
                events.push('Programa nuclear completado. Disuasión activa, riesgo de sanciones.');
                newState.resources = { ...newState.resources, stability: Math.min(100, newState.resources.stability + 5) };
            } else if (p.id === 'SPACE_AGENCY') {
                events.push('Agencia espacial completada. +Tecnología.');
                newState.economy = { ...newState.economy, researchPoints: newState.economy.researchPoints + 10 };
            } else if (p.id === 'OLYMPICS') {
                events.push('Olimpiadas exitosas. Economía y diplomacia en auge temporal.');
                newState.stats = { ...newState.stats, popularity: Math.min(100, newState.stats.popularity + 3) };
            }
            return { ...p, payoffApplied: true };
        }
        return p;
    });

    return { state: newState, events };
};
