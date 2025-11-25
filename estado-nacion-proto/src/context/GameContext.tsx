import React, { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react';
import { calculateEconomy } from '../systems/economy';
import { EVENTS, type GameEvent } from '../data/events';
import { type Country } from '../data/countries';
import { loadCountries } from '../data/loader';
import type { Minister, Parliament, Project, Situation } from '../types/politics';
import { generateMinister, generateParliament } from '../systems/politics';
import { checkEventTriggers, checkSituationUpdates } from '../systems/events';
import { simulateBillVote, updateFactionStances, calculateGovernmentSupport } from '../systems/parliamentSystem';

const COUNTRIES = loadCountries();

// --- Types ---
export interface GameNotification {
    id: string;
    type: 'event' | 'info' | 'warning';
    title: string;
    message: string;
    date: Date;
    eventId?: string;
    icon?: string;
    read: boolean;
}

export interface GameState {
    gameStarted: boolean;
    player: {
        name: string;
        countryId: string;
        countryName: string;
        partyName: string;
        ideology: 'Socialist' | 'Capitalist' | 'Centrist' | 'Authoritarian';
    };
    resources: {
        budget: number;
        politicalCapital: number;
        stability: number;
    };
    stats: {
        gdp: number;
        population: number;
        inflation: number;
        unemployment: number;
        popularity: number;
    };
    policies: {
        taxRate: number;
        publicSpending: number;
        activeProjects: Project[];
    };
    diplomacy: {
        countries: Country[];
    };
    government: {
        ministers: Minister[];
        parliament: Parliament;
    };
    events: {
        activeEvent: GameEvent | null;
        situations: Situation[];
    };
    time: {
        date: Date;
        isPlaying: boolean;
        speed: 0 | 1 | 2 | 3;
    };
    notifications: GameNotification[];
    logs: string[];
}

type Action =
    | { type: 'START_GAME'; payload: { presidentName: string; countryId: string; partyName: string; ideology: 'Socialist' | 'Capitalist' | 'Centrist' | 'Authoritarian' } }
    | { type: 'TICK_DAY' }
    | { type: 'TICK_MONTH' }
    | { type: 'SET_SPEED'; payload: 0 | 1 | 2 | 3 }
    | { type: 'TOGGLE_PAUSE' }
    | { type: 'UPDATE_POLICY'; payload: { key: 'taxRate' | 'publicSpending'; value: number } }
    | { type: 'RESOLVE_EVENT'; payload: { choiceIndex: number } }
    | { type: 'DIPLOMACY_ACTION'; payload: { countryId: string; action: 'IMPROVE' | 'HARM' | 'TRADE_TREATY' | 'DEFENSE_TREATY' } }
    | { type: 'APPOINT_MINISTER'; payload: { minister: Minister } }
    | { type: 'FIRE_MINISTER'; payload: { ministerId: string } }
    | { type: 'PROPOSE_BILL'; payload: { bill: any } } // any = Bill type from parliament.ts
    | { type: 'VOTE_ON_BILL' }
    | { type: 'NEGOTIATE_WITH_FACTION'; payload: { factionId: string; offerType: string; politicalCapital: number } }
    | { type: 'OPEN_NOTIFICATION'; payload: string }
    | { type: 'DISMISS_NOTIFICATION'; payload: string };

// --- Initial State ---
const START_DATE = new Date('2025-01-01');

const initialState: GameState = {
    gameStarted: false,
    player: {
        name: 'Presidente',
        countryId: '',
        countryName: 'Nuestra Nación',
        partyName: 'Partido Oficial',
        ideology: 'Centrist',
    },
    resources: {
        budget: 0,
        politicalCapital: 50,
        stability: 50,
    },
    stats: {
        gdp: 0,
        population: 0,
        inflation: 0,
        unemployment: 0,
        popularity: 50,
    },
    policies: {
        taxRate: 0.25,
        publicSpending: 100,
        activeProjects: []
    },
    diplomacy: {
        countries: [],
    },
    government: {
        ministers: [],
        parliament: { totalSeats: 0, parties: [], nextElectionDate: 0 }
    },
    events: {
        activeEvent: null,
        situations: []
    },
    time: {
        date: START_DATE,
        isPlaying: false,
        speed: 1,
    },
    notifications: [],
    logs: [],
};

// --- Reducer ---
const gameReducer = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'START_GAME': {
            const { presidentName, countryId, partyName, ideology } = action.payload;

            const selectedCountry = COUNTRIES.find(c => c.id === countryId);
            if (!selectedCountry) return state;

            let newStats = {
                gdp: selectedCountry.stats.gdp,
                population: selectedCountry.stats.population,
                inflation: selectedCountry.stats.inflation,
                unemployment: selectedCountry.stats.unemployment,
                popularity: 50
            };

            let newResources = {
                budget: selectedCountry.stats.gdp * 0.25,
                politicalCapital: 50,
                stability: selectedCountry.stats.stability
            };

            let newPolicies = {
                taxRate: 0.25,
                publicSpending: selectedCountry.stats.gdp * 0.20
            };

            if (ideology === 'Socialist') {
                newStats.popularity += 10;
                newPolicies.publicSpending *= 1.1;
                newPolicies.taxRate += 0.05;
            } else if (ideology === 'Capitalist') {
                newStats.gdp *= 1.02;
                newPolicies.taxRate -= 0.05;
                newStats.unemployment -= 0.005;
            } else if (ideology === 'Centrist') {
                newResources.stability += 5;
                newResources.politicalCapital += 10;
            } else if (ideology === 'Authoritarian') {
                newResources.stability += 15;
                newStats.popularity -= 5;
                newResources.politicalCapital += 20;
            }

            const otherCountries = COUNTRIES.filter(c => c.id !== countryId);

            const parliament = generateParliament(100);

            return {
                ...state,
                gameStarted: true,
                player: { name: presidentName, countryId, countryName: selectedCountry.name, partyName, ideology },
                stats: newStats,
                resources: newResources,
                policies: { ...newPolicies, activeProjects: [] },
                diplomacy: { countries: otherCountries },
                government: { ministers: [], parliament }, // Start with empty cabinet
                events: { activeEvent: null, situations: [] },
                logs: [`${START_DATE.toISOString().split('T')[0]}: El Presidente ${presidentName} del partido ${partyName} asume el cargo en ${selectedCountry.name}.`],
            };
        }

        case 'TICK_DAY': {
            const newDate = new Date(state.time.date);
            newDate.setDate(newDate.getDate() + 1);

            const newNotifications = [...state.notifications];

            if (state.resources.stability < 30 && !state.notifications.some(n => n.id === 'low_stability')) {
                newNotifications.push({
                    id: 'low_stability',
                    type: 'warning',
                    title: 'Inestabilidad Crítica',
                    message: 'El país está al borde del colapso social.',
                    date: newDate,
                    icon: '🔥',
                    read: false
                });
            }

            const updatedSituations = checkSituationUpdates(state);

            if (!state.events.activeEvent && Math.random() < 0.05) {
                const triggeredEvent = checkEventTriggers(state);
                if (triggeredEvent) {
                    const notifId = `event_${newDate.getTime()}`;
                    newNotifications.push({
                        id: notifId,
                        type: 'event',
                        title: triggeredEvent.title,
                        message: 'Se requiere su atención inmediata.',
                        date: newDate,
                        eventId: triggeredEvent.id,
                        icon: '❗',
                        read: false
                    });
                }
            }

            return {
                ...state,
                time: { ...state.time, date: newDate },
                notifications: newNotifications,
                events: { ...state.events, situations: updatedSituations }
            };
        }

        case 'TICK_MONTH': {
            const eco = calculateEconomy(state.stats.gdp, state.policies.taxRate, state.policies.publicSpending);
            const newBudget = state.resources.budget + (eco.budgetSurplus / 12);

            let newUnemployment = state.stats.unemployment;
            if (eco.growthRate > 0.02) newUnemployment -= 0.001;
            else if (eco.growthRate < 0.01) newUnemployment += 0.001;
            newUnemployment = Math.max(0.01, Math.min(0.30, newUnemployment));

            let newPopularity = state.stats.popularity;
            if (eco.inflation > 0.10) newPopularity -= 1;
            if (newUnemployment > 0.10) newPopularity -= 1;
            if (eco.growthRate > 0.03) newPopularity += 0.5;

            // Update faction stances based on government performance
            const updatedFactions = updateFactionStances(
                state.government.parliament.factions || [],
                Math.max(0, Math.min(100, newPopularity)),
                0 // failedBillsThisMonth - can track this later
            );

            const newGovernmentSupport = calculateGovernmentSupport(
                updatedFactions,
                state.government.parliament.totalSeats
            );

            return {
                ...state,
                resources: { ...state.resources, budget: newBudget },
                stats: {
                    ...state.stats,
                    gdp: eco.newGdp,
                    inflation: eco.inflation,
                    unemployment: newUnemployment,
                    popularity: Math.max(0, Math.min(100, newPopularity)),
                    population: state.stats.population
                },
                government: {
                    ...state.government,
                    parliament: {
                        ...state.government.parliament,
                        factions: updatedFactions,
                        governmentSupport: newGovernmentSupport
                    }
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Cierre de mes. Crecimiento ${(eco.growthRate * 100).toFixed(1)}%`],
            };
        }

        case 'SET_SPEED':
            return { ...state, time: { ...state.time, speed: action.payload, isPlaying: action.payload > 0 } };

        case 'TOGGLE_PAUSE':
            return { ...state, time: { ...state.time, isPlaying: !state.time.isPlaying } };

        case 'OPEN_NOTIFICATION': {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (!notification) return state;

            let newState = { ...state };
            newState.notifications = state.notifications.map(n =>
                n.id === action.payload ? { ...n, read: true } : n
            );

            if (notification.type === 'event' && notification.eventId) {
                const event = EVENTS.find(e => e.id === notification.eventId);
                if (event) {
                    newState.events = { ...state.events, activeEvent: event };
                    newState.time = { ...state.time, isPlaying: false };
                }
            } else {
                newState.notifications = newState.notifications.filter(n => n.id !== action.payload);
            }

            return newState;
        }

        case 'DISMISS_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter(n => n.id !== action.payload),
            };

        case 'RESOLVE_EVENT': {
            if (!state.events.activeEvent) return state;
            const choice = state.events.activeEvent.choices[action.payload.choiceIndex];
            const effect = choice.effect(state);

            const newResources = { ...state.resources, ...effect.resources };
            const newStats = { ...state.stats, ...effect.stats };
            const newPolicies = { ...state.policies, ...effect.policies };
            const newNotifications = state.notifications.filter(n => n.eventId !== state.events.activeEvent?.id);

            return {
                ...state,
                resources: newResources,
                stats: newStats,
                policies: newPolicies,
                events: { ...state.events, activeEvent: null },
                notifications: newNotifications,
                time: { ...state.time, isPlaying: true },
                logs: [...state.logs, `Evento Resuelto: ${state.events.activeEvent.title}`],
            };
        }

        case 'UPDATE_POLICY':
            return {
                ...state,
                policies: { ...state.policies, [action.payload.key]: action.payload.value },
            };

        case 'DIPLOMACY_ACTION': {
            const { countryId, action: dipAction } = action.payload;
            const countries = state.diplomacy.countries.map(c => {
                if (c.id !== countryId) return c;

                let newRelation = c.relation;
                const newTreaties = { ...c.treaties };

                if (dipAction === 'IMPROVE') {
                    newRelation = Math.min(100, c.relation + 5);
                } else if (dipAction === 'HARM') {
                    newRelation = Math.max(0, c.relation - 10);
                } else if (dipAction === 'TRADE_TREATY') {
                    newTreaties.trade = !newTreaties.trade;
                } else if (dipAction === 'DEFENSE_TREATY') {
                    newTreaties.defense = !newTreaties.defense;
                }

                return { ...c, relation: newRelation, treaties: newTreaties };
            });

            return {
                ...state,
                diplomacy: { ...state.diplomacy, countries },
                resources: { ...state.resources, politicalCapital: state.resources.politicalCapital - 5 },
                logs: [...state.logs, `Diplomacia: Acción con ${countryId}`],
            };
        }

        case 'APPOINT_MINISTER': {
            const newMinister = action.payload.minister;
            const ministers = state.government.ministers;

            // Check if a minister for this ministry already exists
            const existingMinisterIndex = ministers.findIndex(m => m.ministry === newMinister.ministry);

            let updatedMinisters: Minister[];
            let replacedMinister: Minister | undefined;

            if (existingMinisterIndex >= 0) {
                // Replace existing minister
                replacedMinister = ministers[existingMinisterIndex];
                updatedMinisters = ministers.map(m =>
                    m.ministry === newMinister.ministry ? { ...newMinister, appointmentDate: state.time.date } : m
                );
            } else {
                // Add new minister to cabinet
                updatedMinisters = [...ministers, { ...newMinister, appointmentDate: state.time.date }];
            }

            const politicalCost = replacedMinister ? Math.floor(replacedMinister.stats.loyalty / 2) : 0;

            return {
                ...state,
                government: { ...state.government, ministers: updatedMinisters },
                resources: { ...state.resources, politicalCapital: state.resources.politicalCapital - politicalCost },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: ${newMinister.name} nombrado como Ministro de ${newMinister.ministry}`]
            };
        }

        case 'FIRE_MINISTER': {
            const ministerId = action.payload.ministerId;
            const firedMinister = state.government.ministers.find(m => m.id === ministerId);

            if (!firedMinister) return state;

            const politicalCost = Math.floor((firedMinister.stats.loyalty + firedMinister.stats.popularity) / 4);

            const countryContext = {
                ideology: state.player.ideology as any,
                corruption: 50,
                militarySpending: 2,
                freedom: 70
            };
            const replacementMinister = generateMinister(firedMinister.ministry, countryContext);

            const updatedMinisters = state.government.ministers.map(m =>
                m.id === ministerId ? replacementMinister : m
            );

            return {
                ...state,
                government: { ...state.government, ministers: updatedMinisters },
                resources: { ...state.resources, politicalCapital: state.resources.politicalCapital - politicalCost },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: ${firedMinister.name} destituido. ${replacementMinister.name} asume el cargo.`]
            };
        }

        case 'PROPOSE_BILL': {
            const bill = action.payload.bill;

            return {
                ...state,
                government: {
                    ...state.government,
                    parliament: {
                        ...state.government.parliament,
                        activeBill: { ...bill, status: 'in_vote' }
                    }
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Propuesta de ley: ${bill.title}`]
            };
        }

        case 'VOTE_ON_BILL': {
            if (!state.government.parliament.activeBill) return state;

            const factions = state.government.parliament.factions || [];
            const result = simulateBillVote(
                state.government.parliament.activeBill,
                factions,
                state.government.parliament.totalSeats,
                state.government.parliament.activeBill.proposedBy === 'government'
            );

            const bill = state.government.parliament.activeBill;

            // Apply effects if approved
            let newState = { ...state };
            if (result.approved && bill.effects) {
                if (bill.effects.statChanges) {
                    newState.stats = {
                        ...newState.stats,
                        ...Object.fromEntries(
                            Object.entries(bill.effects.statChanges).map(([key, value]) =>
                                [key, (newState.stats as any)[key] + value]
                            )
                        )
                    };
                }
                if (bill.effects.resourceChanges) {
                    newState.resources = {
                        ...newState.resources,
                        ...Object.fromEntries(
                            Object.entries(bill.effects.resourceChanges).map(([key, value]) =>
                                [key, (newState.resources as any)[key] + value]
                            )
                        )
                    };
                }
            }

            return {
                ...newState,
                government: {
                    ...newState.government,
                    parliament: {
                        ...newState.government.parliament,
                        activeBill: null
                    }
                },
                logs: [
                    ...newState.logs,
                    `${state.time.date.toISOString().split('T')[0]}: Votación de "${bill.title}": ${result.approved ? 'APROBADA' : 'RECHAZADA'} (${result.votes.yes} a favor, ${result.votes.no} en contra)`
                ]
            };
        }

        case 'NEGOTIATE_WITH_FACTION': {
            const { factionId, offerType: _offerType, politicalCapital } = action.payload;

            if (state.resources.politicalCapital < politicalCapital) {
                return state; // No hay suficiente capital político
            }

            const factions = state.government.parliament.factions || [];
            const faction = factions.find((f: any) => f.id === factionId);

            if (!faction) return state;

            // Simulación simple de negociación
            const success = Math.random() > 0.4; // 60% de éxito

            if (success) {
                const updatedFactions = factions.map((f: any) => {
                    if (f.id === factionId) {
                        let newStance = f.stance;
                        if (f.stance === 'hostile') newStance = 'neutral';
                        else if (f.stance === 'neutral') newStance = 'supportive';
                        return { ...f, stance: newStance };
                    }
                    return f;
                });

                return {
                    ...state,
                    government: {
                        ...state.government,
                        parliament: {
                            ...state.government.parliament,
                            factions: updatedFactions
                        }
                    },
                    resources: {
                        ...state.resources,
                        politicalCapital: state.resources.politicalCapital - politicalCapital
                    },
                    logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Negociación exitosa con ${faction.name}`]
                };
            } else {
                return {
                    ...state,
                    resources: {
                        ...state.resources,
                        politicalCapital: state.resources.politicalCapital - politicalCapital
                    },
                    logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Negociación fallida con ${faction.name}`]
                };
            }
        }


        default:
            return state;
    }
};

// --- Context ---
const GameContext = createContext<{
    state: GameState;
    dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const lastTickRef = useRef<number>(0);

    useEffect(() => {
        let animationFrameId: number;

        const loop = (timestamp: number) => {
            if (!state.time.isPlaying || state.events.activeEvent) {
                lastTickRef.current = timestamp;
                animationFrameId = requestAnimationFrame(loop);
                return;
            }

            const msPerDay = [0, 1000, 500, 200][state.time.speed];

            if (timestamp - lastTickRef.current >= msPerDay) {
                dispatch({ type: 'TICK_DAY' });

                const currentDate = state.time.date;
                const nextDay = new Date(currentDate);
                nextDay.setDate(nextDay.getDate() + 1);

                if (currentDate.getMonth() !== nextDay.getMonth()) {
                    dispatch({ type: 'TICK_MONTH' });
                }

                lastTickRef.current = timestamp;
            }

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [state.time.isPlaying, state.time.speed, state.events.activeEvent, state.time.date]);

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame must be used within a GameProvider');
    return context;
};
