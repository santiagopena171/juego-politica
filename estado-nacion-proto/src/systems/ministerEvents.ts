import type { Minister } from '../types/politics';
import type { GameState } from '../context/GameContext';
import { MINISTER_TRAITS } from '../types/ministerTraits';

/**
 * Check for minister scandals each month
 * Returns array of scandal events to be added to notifications
 */
export function checkMinisterScandals(ministers: Minister[]): Array<{
    ministerId: string;
    ministerName: string;
    ministry: string;
    severity: 'minor' | 'major' | 'critical';
}> {
    const scandals: Array<{
        ministerId: string;
        ministerName: string;
        ministry: string;
        severity: 'minor' | 'major' | 'critical';
    }> = [];

    ministers.forEach(minister => {
        // Base scandal chance from corruption stat (0-1% per month)
        let scandalChance = minister.stats.corruption / 10000;

        // Get trait multipliers
        minister.traitIds.forEach(traitId => {
            const trait = MINISTER_TRAITS[traitId];
            if (trait?.eventModifiers?.scandals) {
                scandalChance *= trait.eventModifiers.scandals;
            }
        });

        // Roll for scandal
        if (Math.random() < scandalChance) {
            // Determine severity based on corruption level
            let severity: 'minor' | 'major' | 'critical';
            const roll = Math.random();

            if (minister.stats.corruption > 70) {
                severity = roll < 0.5 ? 'critical' : 'major';
            } else if (minister.stats.corruption > 40) {
                severity = roll < 0.3 ? 'major' : 'minor';
            } else {
                severity = 'minor';
            }

            scandals.push({
                ministerId: minister.id,
                ministerName: minister.name,
                ministry: minister.ministry,
                severity
            });
        }
    });

    return scandals;
}

/**
 * Check for minister resignations each month
 * Low loyalty + failures/scandals → resignation risk
 */
export function checkMinisterResignations(
    ministers: Minister[],
    state: GameState
): Array<{
    ministerId: string;
    ministerName: string;
    ministry: string;
    reason: 'disloyalty' | 'scandal_pressure' | 'ambition';
}> {
    const resignations: Array<{
        ministerId: string;
        ministerName: string;
        ministry: string;
        reason: 'disloyalty' | 'scandal_pressure' | 'ambition';
    }> = [];

    ministers.forEach(minister => {
        let resignationChance = 0;

        // Base chance from low loyalty (inverse: 100 loyalty = 0%, 0 loyalty = 5%)
        resignationChance += (100 - minister.stats.loyalty) / 2000;

        // Scandal pressure (each scandal increases chance)
        if (minister.scandalsCount > 0) {
            resignationChance += minister.scandalsCount * 0.02; // +2% per scandal
        }

        // Low approval increases chance
        if (state.stats.popularity < 30) {
            resignationChance += 0.01;
        }

        // Trait modifiers
        minister.traitIds.forEach(traitId => {
            const trait = MINISTER_TRAITS[traitId];
            if (trait?.eventModifiers?.resignation) {
                resignationChance *= trait.eventModifiers.resignation;
            }
        });

        // Ambition-based departures (setting up rival campaign)
        let ambitionDepartureChance = 0;
        if (minister.stats.ambition > 70 && minister.stats.internalSupport > 60) {
            ambitionDepartureChance = 0.005; // 0.5% per month
        }

        // Roll for resignation
        if (Math.random() < resignationChance) {
            const reason = minister.scandalsCount > 2 ? 'scandal_pressure' : 'disloyalty';
            resignations.push({
                ministerId: minister.id,
                ministerName: minister.name,
                ministry: minister.ministry,
                reason
            });
        } else if (Math.random() < ambitionDepartureChance) {
            resignations.push({
                ministerId: minister.id,
                ministerName: minister.name,
                ministry: minister.ministry,
                reason: 'ambition'
            });
        }
    });

    return resignations;
}

/**
 * Calculate impact of minister scandals on game state
 */
export function applyScandalEffects(
    state: GameState,
    scandal: { severity: 'minor' | 'major' | 'critical' }
): Partial<GameState> {
    const approvalLoss = scandal.severity === 'critical' ? 10 : scandal.severity === 'major' ? 5 : 2;
    const stabilityLoss = scandal.severity === 'critical' ? 5 : scandal.severity === 'major' ? 3 : 1;

    return {
        stats: {
            ...state.stats,
            popularity: Math.max(0, state.stats.popularity - approvalLoss)
        },
        resources: {
            ...state.resources,
            stability: Math.max(0, state.resources.stability - stabilityLoss),
            politicalCapital: Math.max(0, state.resources.politicalCapital - 10)
        }
    };
}

/**
 * Generate scandal event notification
 */
export function generateScandalNotification(scandal: {
    ministerName: string;
    ministry: string;
    severity: 'minor' | 'major' | 'critical';
}): {
    id: string;
    type: 'warning';
    title: string;
    message: string;
    icon: string;
    date: Date;
} {
    const scandalTypes = {
        minor: [
            'acusado de nepotismo',
            'involucrado en licitación dudosa',
            'cuestionado por gastos excesivos'
        ],
        major: [
            'denunciado por corrupción',
            'acusado de malversación de fondos',
            'investigado por lavado de dinero'
        ],
        critical: [
            'arrestado por corrupción grave',
            'vinculado a red de narcotráfico',
            'acusado de traición y espionaje'
        ]
    };

    const descriptions = scandalTypes[scandal.severity];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    return {
        id: `scandal_${Date.now()}_${Math.random()}`,
        type: 'warning',
        title: `Escándalo: ${scandal.ministry}`,
        message: `${scandal.ministerName} ${description}`,
        icon: '💥',
        date: new Date()
    };
}

/**
 * Generate resignation event notification
 */
export function generateResignationNotification(resignation: {
    ministerName: string;
    ministry: string;
    reason: 'disloyalty' | 'scandal_pressure' | 'ambition';
}): {
    id: string;
    type: 'warning';
    title: string;
    message: string;
    icon: string;
    date: Date;
} {
    const messages = {
        disloyalty: `${resignation.ministerName} renunció por desacuerdos con el gobierno`,
        scandal_pressure: `${resignation.ministerName} renunció bajo presión por escándalos`,
        ambition: `${resignation.ministerName} renunció para lanzar su propia candidatura presidencial`
    };

    return {
        id: `resignation_${Date.now()}_${Math.random()}`,
        type: 'warning',
        title: `Renuncia: ${resignation.ministry}`,
        message: messages[resignation.reason],
        icon: '📤',
        date: new Date()
    };
}
