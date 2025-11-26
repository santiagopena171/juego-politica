import type { PartyFaction, FactionStance, ParliamentaryEvent } from '../types/parliament';
import type { GameState } from '../context/GameContext';

/**
 * Revisa si hay condiciones para eventos parlamentarios críticos
 */
export function checkParliamentaryEvents(
    state: GameState
): ParliamentaryEvent | null {
    const { government, stats, resources } = state;
    const { parliament } = government;
    const factions = parliament.factions || [];
    const governmentSupport = parliament.governmentSupport || 0;

    // 1. Voto de Censura - Si el apoyo es muy bajo
    if (governmentSupport < 30 && stats.popularity < 35) {
        return createNoConfidenceMotion(factions, governmentSupport);
    }

    // 2. Rebelión Partidaria - Facción con lealtad baja e influencia alta
    const rebelliousFaction = factions.find(
        f => f.loyaltyToLeader < 30 && f.influence > 60 && f.stance === 'hostile'
    );
    if (rebelliousFaction) {
        return createPartyRebellion(rebelliousFaction);
    }

    // 3. Ruptura de Coalición - Partido aliado se va
    const coalitionBreakdown = factions.find(
        f => f.stance === 'supportive' && 
        stats.popularity < 30 && 
        f.loyaltyToLeader < 40
    );
    if (coalitionBreakdown && Math.random() < 0.15) { // 15% chance mensual
        return createCoalitionBreakdown(coalitionBreakdown);
    }

    // 4. Escisión de Facción - Facción se separa del partido
    const splittingFaction = factions.find(
        f => f.loyaltyToLeader < 25 && f.size > 20 && f.type === 'hardliner'
    );
    if (splittingFaction && Math.random() < 0.1) { // 10% chance mensual
        return createFactionSplit(splittingFaction);
    }

    // 5. Elecciones Anticipadas - Crisis extrema
    if (governmentSupport < 20 && resources.stability < 25 && stats.popularity < 25) {
        return createSnapElection(governmentSupport, stats.popularity);
    }

    return null;
}

/**
 * Crea evento de Moción de Censura
 */
function createNoConfidenceMotion(
    _factions: PartyFaction[],
    governmentSupport: number
): ParliamentaryEvent {
    return {
        id: `no_confidence_${Date.now()}`,
        type: 'no_confidence_motion',
        title: '🔥 Moción de Censura',
        description: `La oposición ha presentado una moción de censura. Tu apoyo parlamentario es de solo ${governmentSupport.toFixed(1)}%. Si se aprueba, tu gobierno caerá.`,
        triggerConditions: {
            governmentSupport: 30,
            popularityThreshold: 35
        },
        factionIds: [],
        choices: [
            {
                id: 'negotiate_survival',
                text: 'Negociar con facciones para sobrevivir (-50 Capital Político)',
                requirement: {
                    politicalCapital: 50
                },
                outcome: {
                    success: true,
                    message: 'Has logrado negociar apoyos suficientes. La moción es rechazada por escaso margen.',
                    effects: {
                        resourceChanges: {
                            politicalCapital: -50
                        },
                        statChanges: {
                            popularity: -3,
                            stability: -5
                        }
                    }
                }
            },
            {
                id: 'call_snap_election',
                text: 'Convocar elecciones anticipadas',
                outcome: {
                    success: false,
                    message: 'Has convocado elecciones anticipadas. Tu mandato termina prematuramente.',
                    effects: {
                        statChanges: {
                            popularity: -10,
                            stability: -15
                        }
                    }
                }
            },
            {
                id: 'face_vote',
                text: 'Enfrentar la votación sin negociar',
                outcome: {
                    success: false,
                    message: 'La moción de censura es aprobada. Tu gobierno cae. Game Over.',
                    effects: {
                        statChanges: {
                            popularity: -15,
                            stability: -20
                        }
                    }
                }
            }
        ],
        consequences: {
            statChanges: {
                popularity: -10
            }
        }
    };
}

/**
 * Crea evento de Rebelión Partidaria
 */
function createPartyRebellion(faction: PartyFaction): ParliamentaryEvent {
    return {
        id: `rebellion_${Date.now()}`,
        type: 'party_rebellion',
        title: '⚠️ Rebelión Partidaria',
        description: `${faction.name} se ha rebelado contra el liderazgo. Exigen cambios inmediatos o abandonarán el partido.`,
        triggerConditions: {
            governmentSupport: 40
        },
        factionIds: [faction.id],
        choices: [
            {
                id: 'make_concessions',
                text: 'Hacer concesiones a sus demandas (-30 Capital Político)',
                requirement: {
                    politicalCapital: 30
                },
                outcome: {
                    success: true,
                    message: `${faction.name} acepta las concesiones y se mantiene en el partido, aunque desconfían.`,
                    effects: {
                        resourceChanges: {
                            politicalCapital: -30
                        },
                        statChanges: {
                            popularity: -2
                        }
                    },
                    factionStanceChanges: {
                        [faction.id]: 'neutral'
                    }
                }
            },
            {
                id: 'purge_faction',
                text: 'Expulsar a los rebeldes del partido',
                outcome: {
                    success: false,
                    message: `Has expulsado a ${faction.name}, pero pierdes escaños y apoyo parlamentario.`,
                    effects: {
                        resourceChanges: {
                            politicalCapital: -20
                        },
                        statChanges: {
                            popularity: -5,
                            stability: -8
                        }
                    }
                }
            },
            {
                id: 'ignore_rebellion',
                text: 'Ignorar sus demandas',
                outcome: {
                    success: false,
                    message: `${faction.name} abandona el partido y forma un bloque opositor. Pierdes apoyo crítico.`,
                    effects: {
                        statChanges: {
                            popularity: -7,
                            stability: -10
                        }
                    },
                    factionStanceChanges: {
                        [faction.id]: 'hostile'
                    }
                }
            }
        ],
        consequences: {
            statChanges: {
                popularity: -3
            }
        }
    };
}

/**
 * Crea evento de Ruptura de Coalición
 */
function createCoalitionBreakdown(faction: PartyFaction): ParliamentaryEvent {
    return {
        id: `coalition_breakdown_${Date.now()}`,
        type: 'coalition_breakdown',
        title: '💔 Ruptura de Coalición',
        description: `${faction.name} amenaza con abandonar la coalición de gobierno. Sin su apoyo, perderás la mayoría.`,
        triggerConditions: {
            governmentSupport: 35,
            popularityThreshold: 30
        },
        factionIds: [faction.id],
        choices: [
            {
                id: 'offer_ministries',
                text: 'Ofrecer ministerios clave (-40 Capital Político)',
                requirement: {
                    politicalCapital: 40,
                    ministerSupport: true
                },
                outcome: {
                    success: true,
                    message: `${faction.name} acepta permanecer en la coalición a cambio de mayor poder.`,
                    effects: {
                        resourceChanges: {
                            politicalCapital: -40
                        }
                    },
                    factionStanceChanges: {
                        [faction.id]: 'supportive'
                    }
                }
            },
            {
                id: 'policy_concessions',
                text: 'Ceder en políticas clave',
                outcome: {
                    success: true,
                    message: `Has cedido en tus políticas para mantener la coalición unida.`,
                    effects: {
                        resourceChanges: {
                            politicalCapital: -25
                        },
                        statChanges: {
                            popularity: -4
                        }
                    },
                    factionStanceChanges: {
                        [faction.id]: 'supportive'
                    }
                }
            },
            {
                id: 'let_them_leave',
                text: 'Dejarlos ir y gobernar en minoría',
                outcome: {
                    success: false,
                    message: `${faction.name} abandona la coalición. Ahora gobiernas en minoría.`,
                    effects: {
                        statChanges: {
                            popularity: -8,
                            stability: -12
                        }
                    },
                    factionStanceChanges: {
                        [faction.id]: 'neutral'
                    }
                }
            }
        ],
        consequences: {
            statChanges: {
                stability: -5
            }
        }
    };
}

/**
 * Crea evento de Escisión de Facción
 */
function createFactionSplit(faction: PartyFaction): ParliamentaryEvent {
    return {
        id: `faction_split_${Date.now()}`,
        type: 'faction_split',
        title: '🔀 Escisión Parlamentaria',
        description: `${faction.name} (${faction.size}% del partido) anuncia su separación para formar un nuevo partido político.`,
        triggerConditions: {},
        factionIds: [faction.id],
        choices: [
            {
                id: 'prevent_split',
                text: 'Intentar evitar la escisión (-35 Capital Político)',
                requirement: {
                    politicalCapital: 35
                },
                outcome: {
                    success: true,
                    message: `Has logrado convencer a ${faction.name} de permanecer, pero su lealtad es frágil.`,
                    effects: {
                        resourceChanges: {
                            politicalCapital: -35
                        }
                    }
                }
            },
            {
                id: 'accept_split',
                text: 'Aceptar la escisión',
                outcome: {
                    success: false,
                    message: `${faction.name} se separa. Pierdes escaños pero ganas cohesión interna.`,
                    effects: {
                        resourceChanges: {
                            politicalCapital: 10
                        },
                        statChanges: {
                            popularity: -3,
                            stability: -5
                        }
                    }
                }
            }
        ],
        consequences: {
            statChanges: {
                popularity: -2
            }
        }
    };
}

/**
 * Crea evento de Elecciones Anticipadas
 */
function createSnapElection(
    governmentSupport: number,
    popularity: number
): ParliamentaryEvent {
    return {
        id: `snap_election_${Date.now()}`,
        type: 'snap_election',
        title: '🗳️ Crisis Política Total',
        description: `Con ${governmentSupport.toFixed(1)}% de apoyo parlamentario y ${popularity.toFixed(1)}% de popularidad, la presión por elecciones anticipadas es insostenible.`,
        triggerConditions: {
            governmentSupport: 20,
            popularityThreshold: 25
        },
        factionIds: [],
        choices: [
            {
                id: 'resign',
                text: 'Renunciar dignamente',
                outcome: {
                    success: false,
                    message: 'Has presentado tu renuncia. Tu mandato termina antes de tiempo.',
                    effects: {
                        statChanges: {
                            popularity: 5
                        }
                    }
                }
            },
            {
                id: 'fight_on',
                text: 'Resistir hasta el final',
                outcome: {
                    success: false,
                    message: 'Tu gobierno continúa en medio del caos total. La situación es insostenible.',
                    effects: {
                        statChanges: {
                            popularity: -10,
                            stability: -25
                        }
                    }
                }
            }
        ],
        consequences: {
            statChanges: {
                popularity: -15,
                stability: -20
            }
        }
    };
}

/**
 * Aplica los efectos de un evento parlamentario al estado del juego
 */
export function applyParliamentaryEventEffects(
    state: GameState,
    event: ParliamentaryEvent,
    choiceId: string
): Partial<GameState> {
    const choice = event.choices.find(c => c.id === choiceId);
    if (!choice) return {};

    const updates: Partial<GameState> = {};

    // Aplicar cambios de stats
    if (choice.outcome.effects.statChanges) {
        updates.stats = {
            ...state.stats,
            ...Object.fromEntries(
                Object.entries(choice.outcome.effects.statChanges).map(([key, value]) =>
                    [key, (state.stats as any)[key] + value]
                )
            )
        };
    }

    // Aplicar cambios de recursos
    if (choice.outcome.effects.resourceChanges) {
        updates.resources = {
            ...state.resources,
            ...Object.fromEntries(
                Object.entries(choice.outcome.effects.resourceChanges).map(([key, value]) =>
                    [key, (state.resources as any)[key] + value]
                )
            )
        };
    }

    // Aplicar cambios de stance de facciones
    if (choice.outcome.factionStanceChanges) {
        const updatedFactions = (state.government.parliament.factions || []).map(faction => {
            const newStance = choice.outcome.factionStanceChanges?.[faction.id];
            if (newStance) {
                return { ...faction, stance: newStance as FactionStance };
            }
            return faction;
        });

        updates.government = {
            ...state.government,
            parliament: {
                ...state.government.parliament,
                factions: updatedFactions
            }
        };
    }

    return updates;
}
