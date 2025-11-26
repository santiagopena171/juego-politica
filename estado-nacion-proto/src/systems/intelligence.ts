import type { IntelOperation, MinisterPsychology } from '../types/living_world';
import type { GameState } from '../context/GameContext';

export const launchIntelOperation = (
    type: IntelOperation['type'],
    targetId: string,
    state: GameState
): IntelOperation => {
    const baseCost = {
        VIGILANCE: 5,
        INFILTRATION: 15,
        FALSE_FLAG: 25,
        ASSASSINATION: 50
    };

    return {
        id: `intel_${Date.now()}`,
        type,
        targetId,
        cost: baseCost[type],
        risk: type === 'ASSASSINATION' ? 90 : (type === 'INFILTRATION' ? 60 : 30),
        progress: 0
    };
};

export const resolveIntelOperation = (
    operation: IntelOperation,
    state: GameState
): { success: boolean; consequences: string[] } => {
    const successChance = 100 - operation.risk;
    const success = Math.random() * 100 < successChance;

    const consequences: string[] = [];

    if (success) {
        if (operation.type === 'VIGILANCE') {
            const minister = state.government.ministers.find(m => m.id === operation.targetId);
            if (minister?.psychology?.hiddenAgenda) {
                consequences.push(`Descubierto: ${minister.name} tiene agenda ${minister.psychology.hiddenAgenda}`);
            }
        }
        // TODO: Implementar otros tipos
    } else {
        consequences.push('Operación de inteligencia descubierta. Escándalo internacional.');
        // Aplicar penalizaciones
    }

    return { success, consequences };
};
