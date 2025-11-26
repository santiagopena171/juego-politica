import React, { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react';
import { calculateEconomy } from '../systems/economy';
import { EVENTS, type GameEvent } from '../data/events';
import { type Country } from '../data/countries';
import { loadCountries } from '../data/loader';
import type { Minister, Parliament, Project, Situation } from '../types/politics';
import type { Bill, FactionVote, ParliamentaryEvent } from '../types/parliament';
import type { Region, Industry, BudgetAllocation, TradeAgreement, EconomicEvent } from '../types/economy';
import type { SocialData, ProtestAction, InterestGroupType, ApprovalModifier } from '../types/social';
import { generateMinister, generateParliament } from '../systems/politics';
import { checkEventTriggers, checkSituationUpdates, checkEconomicEvents } from '../systems/events';
import { simulateBillVote, updateFactionStances, calculateGovernmentSupport } from '../systems/parliamentSystem';
import { checkParliamentaryEvents } from '../systems/parliamentEvents';
import { generateRegions, generateIndustries, calculateRegionalEconomy, getDefaultBudgetAllocation } from '../systems/economyRegional';
import { 
    initializeSocialData, 
    calculateWeightedPopularity, 
    applyApprovalModifiers,
    checkForProtests,
    updateProtests,
    resolveProtestAction,
    calculateSocialTension,
    censorMedia,
    fundPublicMedia,
    getMediaMultiplier,
    generateMediaScandal,
    startElectoralCampaign,
    holdRally,
    launchSmearCampaign,
    updateCampaign
} from '../systems/socialSystem';
import {
    selectContextualEvent,
    applyConsequences,
    checkDelayedEvents,
    progressStoryline
} from '../systems/storyteller';
import {
    generateCountryPersonality,
    calculateAIReaction,
    calculateMilitaryCapability,
    simulateWarRound,
    calculateSanctionImpact
} from '../systems/diplomacy';
import { STORYLINES } from '../data/storylines';
import { ALLIANCES, getAlliancesForCountry, meetsAllianceRequirements } from '../data/alliances';
import { UNITED_NATIONS, determineAIVote, calculateResolutionResult } from '../data/unitedNations';

const COUNTRIES = loadCountries();

// --- Types ---
export interface VoteResult {
    bill: Bill;
    approved: boolean;
    votes: { yes: number; no: number; abstain: number };
    factionVotes: FactionVote[];
    timestamp: Date;
}

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
        humanRights: number;
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
    economy: {
        regions: Region[];
        industries: Industry[];
        budgetAllocation: BudgetAllocation;
        tradeAgreements: TradeAgreement[];
        technologyLevel: number;
        researchPoints: number;
        economicEvent: EconomicEvent | null;
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
        parliamentaryEvent: ParliamentaryEvent | null;
    };
    social: SocialData;
    parliament: {
        lastVoteResult: VoteResult | null;
    };
    time: {
        date: Date;
        isPlaying: boolean;
        speed: 0 | 1 | 2 | 3;
    };
    notifications: GameNotification[];
    logs: string[];
    // Fase 5: Sistema de eventos narrativos
    storyVars: { [key: string]: any };
    eventHistory: string[];
    delayedEvents: Array<{ eventId: string; triggersIn: number }>;
    activeStorylines: Array<{
        storylineId: string;
        currentStage: number;
        startedAt: Date;
        storyVars: { [key: string]: any };
    }>;
    emergencyMode: {
        active: boolean;
        type?: 'earthquake' | 'flood' | 'pandemic' | 'drought';
        severity?: number;
        turnsRemaining?: number;
        allocation?: { rescue: number; medical: number; infrastructure: number; relief: number } | null;
    };
    // Aliases para compatibilidad con storyteller
    ministers: Minister[];
    date: { month: number; year: number };
    
    // Fase 6: Sistema Geopolítico Avanzado
    geopolitics: {
        // Relaciones diplomáticas con otros países
        relations: Record<string, {
            relation: number; // 0-100
            hasTradeAgreement: boolean;
            hasNonAggressionPact: boolean;
            recentEvents: Array<{ type: string; description: string; relationChange: number; date: { month: number; year: number } }>;
        }>;
        
        // Alianzas del jugador
        playerAlliances: string[]; // Alliance IDs
        
        // Sanciones activas (contra el jugador o impuestas por el jugador)
        activeSanctions: Array<{
            id: string;
            type: 'trade' | 'financial' | 'technology' | 'diplomatic' | 'total';
            imposedBy: string[];
            targetCountry: string;
            startDate: { month: number; year: number };
            economicImpact: { gdpReduction: number; inflationIncrease: number; tradeReduction: number };
        }>;
        
        // Guerras activas
        activeWars: Array<{
            id: string;
            state: 'peace' | 'tension' | 'skirmish' | 'proxy_war' | 'limited_war' | 'total_war';
            aggressorCountry: string;
            defenderCountry: string;
            playerStrategy?: 'defensive' | 'offensive' | 'air_superiority' | 'guerrilla' | 'blitzkrieg' | 'attrition';
            duration: number;
            casualties: number;
            monthlyCost: number;
        }>;
        
        // Crisis de refugiados
        refugeeCrises: Array<{
            id: string;
            originCountry: string;
            cause: 'war' | 'economic_crisis' | 'natural_disaster' | 'persecution' | 'climate_change';
            monthlyFlow: number;
            refugeesInCountry: number;
            integrationCost: number;
            socialTensionIncrease: number;
        }>;
        
        // Política migratoria del jugador
        migrationPolicy: {
            openness: 'open' | 'selective' | 'restricted' | 'closed';
            maxMonthlyIntake: number;
            acceptFrom: {
                wars: boolean;
                economicCrises: boolean;
                naturalDisasters: boolean;
                persecution: boolean;
            };
        };
        
        // ONU y resoluciones
        unitedNations: {
            activeResolutions: Array<{
                id: string;
                type: 'condemnation' | 'sanctions' | 'intervention' | 'climate' | 'trade' | 'human_rights' | 'peacekeeping';
                title: string;
                description: string;
                proposedBy: string;
                targetCountry?: string;
                votesInFavor: string[];
                votesAgainst: string[];
                votesAbstain: string[];
                status: 'proposed' | 'voting' | 'passed' | 'rejected';
                votingDeadline: { month: number; year: number };
            }>;
            playerVotingPower: number;
        };
        
        // Tensión global
        globalTension: number; // 0-100
        
        // Personalidades de países (IA)
        countryPersonalities: Record<string, {
            ideology: 'democratic' | 'authoritarian' | 'socialist' | 'capitalist' | 'theocratic';
            aggressiveness: number;
            trustworthiness: number;
            humanRightsConcern: number;
        }>;
    };
}

type Action =
    | { type: 'START_GAME'; payload: { presidentName: string; countryId: string; partyName: string; ideology: 'Socialist' | 'Capitalist' | 'Centrist' | 'Authoritarian' } }
    | { type: 'TICK_DAY' }
    | { type: 'TICK_MONTH' }
    | { type: 'SET_SPEED'; payload: 0 | 1 | 2 | 3 }
    | { type: 'TOGGLE_PAUSE' }
    | { type: 'UPDATE_POLICY'; payload: { key: 'taxRate' | 'publicSpending'; value: number } }
    | { type: 'RESOLVE_EVENT'; payload: { choiceIndex: number } }
    | { type: 'RESOLVE_PARLIAMENTARY_EVENT'; payload: { choiceId: string } }
    | { type: 'DIPLOMACY_ACTION'; payload: { countryId: string; action: 'IMPROVE' | 'HARM' | 'TRADE_TREATY' | 'DEFENSE_TREATY' } }
    | { type: 'APPOINT_MINISTER'; payload: { minister: Minister } }
    | { type: 'FIRE_MINISTER'; payload: { ministerId: string } }
    | { type: 'PROPOSE_BILL'; payload: { bill: any } } // any = Bill type from parliament.ts
    | { type: 'VOTE_ON_BILL' }
    | { type: 'NEGOTIATE_WITH_FACTION'; payload: { factionId: string; offerType: string; politicalCapital: number } }
    | { type: 'OPEN_NOTIFICATION'; payload: string }
    | { type: 'DISMISS_NOTIFICATION'; payload: string }
    | { type: 'CLEAR_VOTE_RESULT' }
    | { type: 'UPDATE_BUDGET_ALLOCATION'; payload: { allocation: BudgetAllocation } }
    | { type: 'SUBSIDIZE_INDUSTRY'; payload: { industryType: string; amount: number } }
    | { type: 'TAX_INDUSTRY'; payload: { industryType: string; taxRate: number } }
    | { type: 'SIGN_TRADE_AGREEMENT'; payload: { countryId: string } }
    | { type: 'RESOLVE_PROTEST'; payload: { protestId: string; action: ProtestAction } }
    | { type: 'CENSOR_MEDIA' }
    | { type: 'FUND_PUBLIC_MEDIA'; payload: { amount: number } }
    | { type: 'CAMPAIGN_RALLY'; payload: { targetGroup: InterestGroupType; budget: number } }
    | { type: 'CAMPAIGN_SMEAR' }
    | { type: 'APPLY_APPROVAL_MODIFIERS'; payload: { modifiers: ApprovalModifier[] } }
    | { type: 'ENTER_EMERGENCY_MODE'; payload: { type: 'earthquake' | 'flood' | 'pandemic' | 'drought'; severity: number; turnsRemaining: number } }
    | { type: 'EXIT_EMERGENCY_MODE'; payload: { allocation: { rescue: number; medical: number; infrastructure: number; relief: number } } }
    // Fase 6: Acciones Geopolíticas
    | { type: 'REQUEST_JOIN_ALLIANCE'; payload: { allianceId: string } }
    | { type: 'LEAVE_ALLIANCE'; payload: { allianceId: string } }
    | { type: 'IMPOSE_SANCTIONS'; payload: { targetCountry: string; sanctionType: 'trade' | 'financial' | 'technology' | 'diplomatic' | 'total' } }
    | { type: 'LIFT_SANCTIONS'; payload: { sanctionId: string } }
    | { type: 'PROPOSE_TRADE_AGREEMENT'; payload: { targetCountry: string } }
    | { type: 'CANCEL_TRADE_AGREEMENT'; payload: { targetCountry: string } }
    | { type: 'DECLARE_WAR'; payload: { targetCountry: string; strategy: 'defensive' | 'offensive' | 'air_superiority' | 'guerrilla' | 'blitzkrieg' | 'attrition' } }
    | { type: 'CHANGE_WAR_STRATEGY'; payload: { warId: string; newStrategy: 'defensive' | 'offensive' | 'air_superiority' | 'guerrilla' | 'blitzkrieg' | 'attrition' } }
    | { type: 'PROPOSE_PEACE'; payload: { warId: string; terms: any } }
    | { type: 'ACCEPT_PEACE'; payload: { warId: string } }
    | { type: 'SEND_DIPLOMATIC_AID'; payload: { targetCountry: string; amount: number } }
    | { type: 'PROPOSE_UN_RESOLUTION'; payload: { resolutionType: string; targetCountry?: string } }
    | { type: 'VOTE_UN_RESOLUTION'; payload: { resolutionId: string; vote: 'favor' | 'against' | 'abstain' } }
    | { type: 'LOBBY_COUNTRY'; payload: { targetCountry: string; resolutionId: string; amount: number } }
    | { type: 'SET_MIGRATION_POLICY'; payload: { openness: 'open' | 'selective' | 'restricted' | 'closed'; maxIntake: number } }
    | { type: 'ACCEPT_REFUGEES'; payload: { crisisId: string; amount: number } }
    | { type: 'CLOSE_BORDERS'; payload: { crisisId: string } }
    | { type: 'SIMULATE_WAR_ROUND'; payload: { warId: string } }
    | { type: 'PROCESS_UN_VOTING'; payload: { resolutionId: string } };

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
        humanRights: 80,
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
    economy: {
        regions: [],
        industries: [],
        budgetAllocation: getDefaultBudgetAllocation(),
        tradeAgreements: [],
        technologyLevel: 50,
        researchPoints: 0,
        economicEvent: null
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
        situations: [],
        parliamentaryEvent: null
    },
    social: {
        interestGroups: [],
        activeProtests: [],
        mediaState: {
            freedom: 70,
            support: 50,
            censorship: 10,
            publicMediaFunding: 0.5,
            scandalsExposed: 0
        },
        campaign: null,
        socialTension: 20,
        humanRights: 80
    },
    parliament: {
        lastVoteResult: null
    },
    time: {
        date: START_DATE,
        isPlaying: false,
        speed: 1,
    },
    notifications: [],
    logs: [],
    // Fase 5: Sistema narrativo
    storyVars: {},
    eventHistory: [],
    delayedEvents: [],
    activeStorylines: [],
    emergencyMode: {
        active: false,
    },
    ministers: [], // Alias para storyteller
    date: { month: 1, year: 2025 }, // Alias para storyteller
    
    // Fase 6: Estado geopolítico inicial
    geopolitics: {
        relations: {},
        playerAlliances: [],
        activeSanctions: [],
        activeWars: [],
        refugeeCrises: [],
        migrationPolicy: {
            openness: 'selective',
            maxMonthlyIntake: 5000,
            acceptFrom: {
                wars: true,
                economicCrises: false,
                naturalDisasters: true,
                persecution: true,
            },
        },
        unitedNations: {
            activeResolutions: [],
            playerVotingPower: 1,
        },
        globalTension: 20,
        countryPersonalities: {},
    },
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
                stability: selectedCountry.stats.stability,
                humanRights: 80,
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
            
            // Generar economía regional
            const regions = generateRegions(
                selectedCountry.name,
                selectedCountry.stats.population,
                newStats.gdp
            );
            const industries = generateIndustries(regions);

            // Generar datos sociales
            const playerIdeology: 'Left' | 'Center' | 'Right' = 
                ideology === 'Socialist' ? 'Left' : 
                ideology === 'Capitalist' ? 'Right' : 
                'Center';
            const socialData = initializeSocialData(selectedCountry.stats.population, playerIdeology);

            return {
                ...state,
                gameStarted: true,
                player: { name: presidentName, countryId, countryName: selectedCountry.name, partyName, ideology },
                stats: newStats,
                resources: newResources,
                policies: { ...newPolicies, activeProjects: [] },
                economy: {
                    regions,
                    industries,
                    budgetAllocation: getDefaultBudgetAllocation(),
                    tradeAgreements: [],
                    technologyLevel: 50,
                    researchPoints: 0,
                    economicEvent: null
                },
                diplomacy: { countries: otherCountries },
                government: { ministers: [], parliament }, // Start with empty cabinet
                events: { activeEvent: null, situations: [], parliamentaryEvent: null },
                social: socialData,
                // Fase 5: Inicializar storyteller
                storyVars: {},
                eventHistory: [],
                delayedEvents: [],
                activeStorylines: [],
                emergencyMode: { active: false },
                ministers: [], // Alias
                date: { month: 1, year: 2025 },
                
                // Fase 6: Inicializar sistema geopolítico
                geopolitics: {
                    // Generar relaciones diplomáticas iniciales con todos los países
                    relations: otherCountries.reduce((acc, country) => {
                        // Relación inicial basada en ideología y región
                        let baseRelation = 50;
                        
                        // Bonus por misma región
                        if (country.region === selectedCountry.region) {
                            baseRelation += 15;
                        }
                        
                        // Bonus/penalty por ideología similar
                        const ideologyMap: Record<string, string> = {
                            'Socialist': 'socialist',
                            'Capitalist': 'capitalist',
                            'Centrist': 'democratic',
                            'Authoritarian': 'authoritarian'
                        };
                        
                        const playerIdeologyMapped = ideologyMap[ideology];
                        const countryIdeologyMapped = ideologyMap[country.ideology] || 'democratic';
                        
                        if (playerIdeologyMapped === countryIdeologyMapped) {
                            baseRelation += 20;
                        } else if (
                            (playerIdeologyMapped === 'authoritarian' && countryIdeologyMapped === 'democratic') ||
                            (playerIdeologyMapped === 'democratic' && countryIdeologyMapped === 'authoritarian')
                        ) {
                            baseRelation -= 20;
                        }
                        
                        acc[country.id] = {
                            relation: Math.max(0, Math.min(100, baseRelation + Math.random() * 20 - 10)),
                            hasTradeAgreement: false,
                            hasNonAggressionPact: false,
                            recentEvents: []
                        };
                        return acc;
                    }, {} as Record<string, any>),
                    
                    // Sin alianzas al inicio
                    playerAlliances: [],
                    
                    // Sin sanciones al inicio
                    activeSanctions: [],
                    
                    // Sin guerras al inicio
                    activeWars: [],
                    
                    // Sin crisis de refugiados al inicio
                    refugeeCrises: [],
                    
                    // Política migratoria por defecto
                    migrationPolicy: {
                        openness: 'selective',
                        maxMonthlyIntake: Math.floor(selectedCountry.stats.population * 0.0001), // 0.01% de población
                        acceptFrom: {
                            wars: true,
                            economicCrises: false,
                            naturalDisasters: true,
                            persecution: true,
                        },
                    },
                    
                    // ONU
                    unitedNations: {
                        activeResolutions: [],
                        playerVotingPower: 1, // Todos los países tienen 1 voto en Asamblea General
                    },
                    
                    // Tensión global inicial baja
                    globalTension: 15 + Math.random() * 10,
                    
                    // Generar personalidades de países IA
                    countryPersonalities: otherCountries.reduce((acc, country) => {
                        const personality = generateCountryPersonality(
                            country.id,
                            country.ideology,
                            country.region
                        );
                        acc[country.id] = {
                            ideology: personality.ideology,
                            aggressiveness: personality.aggressiveness,
                            trustworthiness: personality.trustworthiness,
                            humanRightsConcern: personality.humanRightsConcern,
                        };
                        return acc;
                    }, {} as Record<string, any>),
                },
                
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
            // Calcular economía regional
            const regionalEconomyResult = calculateRegionalEconomy(
                state.economy.regions,
                state.economy.industries,
                state.economy.budgetAllocation,
                state.resources.budget,
                state.economy.tradeAgreements
            );
            
            // Apply economic event effects if one is active
            let eventModifiedGdp = regionalEconomyResult.totalGdp;
            let eventModifiedUnemployment = regionalEconomyResult.nationalUnemployment;
            let eventModifiedStability = 0;
            
            if (state.economy.economicEvent && state.economy.economicEvent.remainingDuration! > 0) {
                // Apply GDP impact
                eventModifiedGdp *= (1 + state.economy.economicEvent.gdpImpact);
                // Apply unemployment change
                eventModifiedUnemployment += state.economy.economicEvent.unemploymentChange;
                eventModifiedUnemployment = Math.max(0, Math.min(1, eventModifiedUnemployment));
                // Stability change will be applied later
                eventModifiedStability = state.economy.economicEvent.stabilityChange;
            }
            
            // Calcular presupuesto (ingresos - gastos)
            const totalSpending = state.resources.budget * (
                Object.values(state.economy.budgetAllocation).reduce((sum, val) => sum + val, 0) / 100
            );
            const revenue = eventModifiedGdp * state.policies.taxRate;
            const expenses = totalSpending;
            const budgetSurplus = revenue - expenses;
            const newBudget = state.resources.budget + (budgetSurplus / 12);
            
            // Actualizar tecnología
            let newTechnologyLevel = state.economy.technologyLevel;
            newTechnologyLevel += regionalEconomyResult.budgetEffects.educationBonus / 100;
            newTechnologyLevel = Math.max(0, Math.min(100, newTechnologyLevel));
            
            // Acumular puntos de investigación
            const newResearchPoints = state.economy.researchPoints + regionalEconomyResult.budgetEffects.researchProgress;
            
            // Actualizar estabilidad
            let newStability = state.resources.stability;
            newStability += regionalEconomyResult.budgetEffects.stabilityBonus / 10;
            newStability += eventModifiedStability; // Add economic event stability change
            newStability = Math.max(0, Math.min(100, newStability));

            // Calcular inflación
            let inflation = 0.02 + (regionalEconomyResult.gdpGrowthRate * 0.5);
            const spendingRatio = totalSpending / eventModifiedGdp;
            if (spendingRatio > 0.4) inflation += 0.02;

            // === SOCIAL SYSTEM UPDATES ===
            
            // 1. Aplicar efectos económicos sobre aprobación de grupos
            const economicModifiers: ApprovalModifier[] = [];
            
            // Alto desempleo afecta negativamente a Sindicatos y Estudiantes
            if (eventModifiedUnemployment > 0.12) {
                economicModifiers.push(
                    { groupType: 'Unions', change: -8, reason: 'Alto desempleo' },
                    { groupType: 'Students', change: -6, reason: 'Falta de oportunidades' }
                );
            }
            
            // Alta inflación afecta a todos, especialmente trabajadores y rurales
            if (inflation > 0.08) {
                economicModifiers.push(
                    { groupType: 'Unions', change: -5, reason: 'Alta inflación' },
                    { groupType: 'Rural', change: -4, reason: 'Pérdida de poder adquisitivo' }
                );
            }
            
            // Buen crecimiento económico beneficia a empresarios
            if (regionalEconomyResult.gdpGrowthRate > 0.04) {
                economicModifiers.push(
                    { groupType: 'Business', change: 5, reason: 'Crecimiento económico' }
                );
            }
            
            // 2. Aplicar modificadores
            let updatedGroups = applyApprovalModifiers(state.social.interestGroups, economicModifiers);
            
            // 3. Verificar y generar nuevas protestas
            const updatedProtests = checkForProtests(updatedGroups, state.social.activeProtests, state.time.date);
            
            // 4. Actualizar protestas existentes
            const finalProtests = updateProtests(updatedProtests, updatedGroups);
            
            // 5. Calcular impactos de protestas
            const protestEconomicImpact = finalProtests.reduce((sum, p) => sum + p.economicImpact, 0);
            const protestStabilityImpact = finalProtests.reduce((sum, p) => sum + p.stabilityImpact, 0);
            
            // Aplicar impactos de protestas
            const finalGdp = eventModifiedGdp * (1 + protestEconomicImpact);
            let finalStability = newStability + protestStabilityImpact;
            finalStability = Math.max(0, Math.min(100, finalStability));
            
            // 6. Calcular tensión social
            const newSocialTension = calculateSocialTension(updatedGroups, finalProtests);
            
            // 7. Verificar escándalos mediáticos
            const scandal = generateMediaScandal(state.social.mediaState, state.social.humanRights);
            if (scandal && scandal.exposed) {
                economicModifiers.push({
                    groupType: 'Business',
                    change: scandal.approvalImpact / 2,
                    reason: scandal.scandal
                });
                // Re-aplicar con el escándalo
                updatedGroups = applyApprovalModifiers(updatedGroups, [economicModifiers[economicModifiers.length - 1]]);
            }
            
            // 8. Calcular nueva popularidad ponderada
            const weightedPopularity = calculateWeightedPopularity(updatedGroups);
            
            // 9. Aplicar multiplicador de medios
            const mediaMultiplier = getMediaMultiplier(state.social.mediaState);
            let finalPopularity = weightedPopularity;
            
            // Ajustes adicionales por indicadores
            if (inflation > 0.10) finalPopularity -= 1 * mediaMultiplier;
            if (eventModifiedUnemployment > 0.10) finalPopularity -= 1 * mediaMultiplier;
            if (regionalEconomyResult.gdpGrowthRate > 0.03) finalPopularity += 0.5 * mediaMultiplier;
            
            // Felicidad regional afecta popularidad
            finalPopularity += (regionalEconomyResult.averageHappiness - 60) / 20;
            
            // 10. Actualizar campaña si está activa
            let updatedCampaign = state.social.campaign;
            if (updatedCampaign && updatedCampaign.active) {
                updatedCampaign = updateCampaign(updatedCampaign, 0);
                
                // Si faltan 3 meses para elecciones y no hay campaña, iniciarla
                if (updatedCampaign && updatedCampaign.monthsUntilElection <= 0) {
                    // TODO: Ejecutar elecciones
                    updatedCampaign = null;
                }
            } else {
                // Verificar si debemos iniciar campaña (3 meses antes de elección)
                const monthsUntilElection = state.government.parliament.nextElectionDate ?
                    Math.floor((state.government.parliament.nextElectionDate - state.time.date.getTime()) / (1000 * 60 * 60 * 24 * 30)) : 999;
                
                if (monthsUntilElection <= 3 && monthsUntilElection > 0) {
                    updatedCampaign = startElectoralCampaign(monthsUntilElection);
                }
            }
            
            // === FIN DE SOCIAL SYSTEM UPDATES ===

            // === FASE 5: STORYTELLER INTEGRATION ===
            
            // Actualizar alias para storyteller
            const stateWithAliases = {
                ...state,
                ministers: state.government.ministers,
                date: {
                    month: state.time.date.getMonth() + 1,
                    year: state.time.date.getFullYear()
                },
                stats: {
                    ...state.stats,
                    gdp: finalGdp,
                    inflation,
                    unemployment: eventModifiedUnemployment,
                    popularity: Math.max(0, Math.min(100, finalPopularity))
                },
                resources: {
                    ...state.resources,
                    stability: finalStability
                },
                social: {
                    ...state.social,
                    interestGroups: updatedGroups,
                    protests: finalProtests, // Alias para checkForProtests en storyteller
                    tension: newSocialTension
                }
            };

            // Verificar eventos demorados
            const { triggeredEvent, updatedDelayed } = checkDelayedEvents(stateWithAliases);
            
            // Verificar y avanzar storylines activas
            let updatedStorylines = [...state.activeStorylines];
            for (const activeStoryline of state.activeStorylines) {
                const storylineDefinition = STORYLINES.find(s => s.id === activeStoryline.storylineId);
                if (storylineDefinition) {
                    const { shouldProgress, nextStage } = progressStoryline(
                        activeStoryline,
                        storylineDefinition,
                        stateWithAliases
                    );
                    
                    if (shouldProgress) {
                        // Actualizar el stage de la storyline
                        updatedStorylines = updatedStorylines.map(sl =>
                            sl.storylineId === activeStoryline.storylineId
                                ? { ...sl, currentStage: nextStage }
                                : sl
                        );
                        
                        // Si completó todas las etapas, remover la storyline
                        if (nextStage > storylineDefinition.stages.length) {
                            updatedStorylines = updatedStorylines.filter(
                                sl => sl.storylineId !== activeStoryline.storylineId
                            );
                        }
                    }
                }
            }
            
            // Si no hay evento activo, intentar activar uno contextual
            let newContextualEvent = state.events.activeEvent;
            if (!newContextualEvent && !triggeredEvent) {
                // 15% chance de activar un evento contextual por mes
                if (Math.random() < 0.15) {
                    newContextualEvent = selectContextualEvent(stateWithAliases);
                }
            } else if (triggeredEvent) {
                newContextualEvent = triggeredEvent;
            }

            // === FIN STORYTELLER INTEGRATION ===

            // Update faction stances based on government performance
            const updatedFactions = updateFactionStances(
                state.government.parliament.factions || [],
                Math.max(0, Math.min(100, finalPopularity)),
                0 // failedBillsThisMonth - can track this later
            );

            const newGovernmentSupport = calculateGovernmentSupport(
                updatedFactions,
                state.government.parliament.totalSeats
            );

            // Check for parliamentary events
            let parliamentaryEvent = null;
            if (!state.events.parliamentaryEvent && Math.random() < 0.25) { // 25% chance mensual
                const tempState = {
                    ...state,
                    stats: {
                        ...state.stats,
                        popularity: Math.max(0, Math.min(100, finalPopularity))
                    },
                    government: {
                        ...state.government,
                        parliament: {
                            ...state.government.parliament,
                            factions: updatedFactions,
                            governmentSupport: newGovernmentSupport
                        }
                    }
                };
                parliamentaryEvent = checkParliamentaryEvents(tempState);
            }

            // Check for economic events
            let newEconomicEvent = state.economy.economicEvent;
            if (newEconomicEvent && newEconomicEvent.remainingDuration && newEconomicEvent.remainingDuration > 0) {
                // Decrement remaining duration
                const newDuration = newEconomicEvent.remainingDuration - 1;
                
                // If duration expired, clear the event
                if (newDuration <= 0) {
                    newEconomicEvent = null;
                } else {
                    newEconomicEvent = {
                        ...newEconomicEvent,
                        remainingDuration: newDuration
                    };
                }
            } else if (!newEconomicEvent) {
                // Try to trigger a new economic event
                const triggeredEconomicEvent = checkEconomicEvents(state);
                if (triggeredEconomicEvent) {
                    newEconomicEvent = {
                        ...triggeredEconomicEvent,
                        remainingDuration: triggeredEconomicEvent.duration
                    };
                }
            }

            return {
                ...state,
                resources: { 
                    ...state.resources, 
                    budget: newBudget,
                    stability: finalStability
                },
                stats: {
                    ...state.stats,
                    gdp: finalGdp,
                    inflation,
                    unemployment: eventModifiedUnemployment,
                    popularity: Math.max(0, Math.min(100, finalPopularity)),
                    population: state.economy.regions.reduce((sum, r) => sum + r.population, 0)
                },
                economy: {
                    ...state.economy,
                    regions: regionalEconomyResult.updatedRegions,
                    industries: regionalEconomyResult.updatedIndustries,
                    technologyLevel: newTechnologyLevel,
                    researchPoints: newResearchPoints,
                    economicEvent: newEconomicEvent
                },
                government: {
                    ...state.government,
                    parliament: {
                        ...state.government.parliament,
                        factions: updatedFactions,
                        governmentSupport: newGovernmentSupport
                    }
                },
                events: {
                    ...state.events,
                    activeEvent: newContextualEvent || state.events.activeEvent,
                    parliamentaryEvent: parliamentaryEvent || state.events.parliamentaryEvent
                },
                social: {
                    ...state.social,
                    interestGroups: updatedGroups,
                    activeProtests: finalProtests,
                    mediaState: scandal && scandal.exposed ? {
                        ...state.social.mediaState,
                        scandalsExposed: state.social.mediaState.scandalsExposed + 1
                    } : state.social.mediaState,
                    campaign: updatedCampaign,
                    socialTension: newSocialTension
                },
                // Fase 5: Actualizar campos de storyteller
                delayedEvents: updatedDelayed,
                activeStorylines: updatedStorylines,
                ministers: state.government.ministers, // Mantener alias
                date: {
                    month: state.time.date.getMonth() + 1,
                    year: state.time.date.getFullYear()
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Cierre de mes. Crecimiento ${(regionalEconomyResult.gdpGrowthRate * 100).toFixed(1)}%`],
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
            
            const event = state.events.activeEvent;
            const choice = event.choices[action.payload.choiceIndex];
            
            // Sistema nuevo (Fase 5) - usar consequences
            if ('consequences' in choice) {
                const stateWithAliases = {
                    ...state,
                    ministers: state.government.ministers,
                    date: {
                        month: state.time.date.getMonth() + 1,
                        year: state.time.date.getFullYear()
                    }
                };
                
                const updates = applyConsequences(choice.consequences, stateWithAliases);
                const newNotifications = state.notifications.filter(n => n.eventId !== event.id);

                // Si es un evento de desastre, activar modo emergencia
                let emergencyModeUpdate: Partial<GameState> = {};
                let shouldPause = false;
                if (event.category === 'disaster' && !state.emergencyMode.active) {
                    emergencyModeUpdate = {
                        emergencyMode: {
                            active: true,
                            type: event.id.includes('earthquake') ? 'earthquake' as const :
                                  event.id.includes('flood') ? 'flood' as const :
                                  event.id.includes('pandemic') ? 'pandemic' as const :
                                  'drought' as const,
                            severity: 75,
                            turnsRemaining: 3,
                        },
                    };
                    shouldPause = true;
                }

                return {
                    ...state,
                    ...updates,
                    ...emergencyModeUpdate,
                    events: { ...state.events, activeEvent: null },
                    eventHistory: [...state.eventHistory, event.id],
                    notifications: newNotifications,
                    time: { ...state.time, isPlaying: !shouldPause },
                    logs: [...state.logs, `Evento Resuelto: ${event.title} - ${choice.label}`],
                };
            }
            
            // Sistema viejo (compatibilidad) - usar effect
            if ('effect' in choice && typeof (choice as any).effect === 'function') {
                const effect = (choice as any).effect(state);
                const newResources = { ...state.resources, ...effect.resources };
                const newStats = { ...state.stats, ...effect.stats };
                const newPolicies = { ...state.policies, ...effect.policies };
                const newNotifications = state.notifications.filter(n => n.eventId !== event.id);

                return {
                    ...state,
                    resources: newResources,
                    stats: newStats,
                    policies: newPolicies,
                    events: { ...state.events, activeEvent: null },
                    eventHistory: [...state.eventHistory, event.id],
                    notifications: newNotifications,
                    time: { ...state.time, isPlaying: true },
                    logs: [...state.logs, `Evento Resuelto: ${event.title}`],
                };
            }

            return state;
        }

        case 'RESOLVE_PARLIAMENTARY_EVENT': {
            if (!state.events.parliamentaryEvent) return state;
            
            const { choiceId } = action.payload;
            const event = state.events.parliamentaryEvent;
            const choice = event.choices.find(c => c.id === choiceId);
            
            if (!choice) return state;

            // Aplicar efectos de la elección
            let newState = { ...state };
            
            if (choice.outcome.effects.statChanges) {
                newState.stats = {
                    ...newState.stats,
                    ...Object.fromEntries(
                        Object.entries(choice.outcome.effects.statChanges).map(([key, value]) =>
                            [key, Math.max(0, Math.min(100, (newState.stats as any)[key] + value))]
                        )
                    )
                };
            }

            if (choice.outcome.effects.resourceChanges) {
                newState.resources = {
                    ...newState.resources,
                    ...Object.fromEntries(
                        Object.entries(choice.outcome.effects.resourceChanges).map(([key, value]) =>
                            [key, Math.max(0, (newState.resources as any)[key] + value)]
                        )
                    )
                };
            }

            // Aplicar cambios de stance de facciones
            if (choice.outcome.factionStanceChanges) {
                const updatedFactions = (newState.government.parliament.factions || []).map(faction => {
                    const newStance = choice.outcome.factionStanceChanges?.[faction.id];
                    if (newStance) {
                        return { ...faction, stance: newStance };
                    }
                    return faction;
                });

                newState.government = {
                    ...newState.government,
                    parliament: {
                        ...newState.government.parliament,
                        factions: updatedFactions
                    }
                };
            }

            return {
                ...newState,
                events: {
                    ...newState.events,
                    parliamentaryEvent: null
                },
                logs: [
                    ...newState.logs,
                    `${state.time.date.toISOString().split('T')[0]}: ${event.title} - ${choice.outcome.message}`
                ]
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

            // Store vote result for display
            const voteResult: VoteResult = {
                bill,
                approved: result.approved,
                votes: result.votes,
                factionVotes: result.factionVotes,
                timestamp: state.time.date
            };

            return {
                ...newState,
                government: {
                    ...newState.government,
                    parliament: {
                        ...newState.government.parliament,
                        activeBill: null
                    }
                },
                parliament: {
                    lastVoteResult: voteResult
                },
                logs: [
                    ...newState.logs,
                    `${state.time.date.toISOString().split('T')[0]}: Votación de "${bill.title}": ${result.approved ? 'APROBADA' : 'RECHAZADA'} (${result.votes.yes} a favor, ${result.votes.no} en contra)`
                ]
            };
        }

        case 'CLEAR_VOTE_RESULT': {
            return {
                ...state,
                parliament: {
                    lastVoteResult: null
                }
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

        case 'UPDATE_BUDGET_ALLOCATION': {
            const { allocation } = action.payload;
            
            // Validar que sume 100%
            const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
            if (Math.abs(total - 100) > 0.01) {
                return state; // Rechazar si no suma 100%
            }
            
            return {
                ...state,
                economy: {
                    ...state.economy,
                    budgetAllocation: allocation
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Presupuesto nacional reasignado`]
            };
        }

        case 'SUBSIDIZE_INDUSTRY': {
            const { industryType, amount } = action.payload;
            
            if (state.resources.budget < amount) {
                return state; // No hay suficiente presupuesto
            }
            
            const updatedIndustries = state.economy.industries.map(ind => {
                if (ind.type === industryType) {
                    return {
                        ...ind,
                        subsidyLevel: Math.min(100, ind.subsidyLevel + (amount / state.resources.budget) * 100)
                    };
                }
                return ind;
            });
            
            return {
                ...state,
                economy: {
                    ...state.economy,
                    industries: updatedIndustries
                },
                resources: {
                    ...state.resources,
                    budget: state.resources.budget - amount
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Subsidio a industria ${industryType}`]
            };
        }

        case 'TAX_INDUSTRY': {
            const { industryType, taxRate } = action.payload;
            
            const updatedIndustries = state.economy.industries.map(ind => {
                if (ind.type === industryType) {
                    return {
                        ...ind,
                        taxLevel: Math.max(0, Math.min(100, taxRate))
                    };
                }
                return ind;
            });
            
            return {
                ...state,
                economy: {
                    ...state.economy,
                    industries: updatedIndustries
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Impuesto a industria ${industryType}: ${taxRate}%`]
            };
        }

        case 'SIGN_TRADE_AGREEMENT': {
            const { countryId } = action.payload;
            
            const targetCountry = state.diplomacy.countries.find(c => c.id === countryId);
            if (!targetCountry) return state;
            
            // Requiere buena relación (>60)
            if (targetCountry.relation < 60) {
                return state;
            }
            
            // Verificar si ya existe
            if (state.economy.tradeAgreements.some(ta => ta.countryId === countryId)) {
                return state;
            }
            
            // Crear tratado
            const newAgreement: TradeAgreement = {
                countryId,
                countryName: targetCountry.name,
                signedDate: state.time.date,
                type: 'FreeTradeZone',
                gdpBonus: 0.02 + Math.random() * 0.03, // 2-5% bonus
                industryEffects: {
                    Services: 0.01,
                    Technology: 0.015,
                    Industry: -0.005 // Competencia
                }
            };
            
            return {
                ...state,
                economy: {
                    ...state.economy,
                    tradeAgreements: [...state.economy.tradeAgreements, newAgreement]
                },
                resources: {
                    ...state.resources,
                    politicalCapital: state.resources.politicalCapital - 10
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Tratado comercial firmado con ${targetCountry.name}`]
            };
        }

        case 'RESOLVE_PROTEST': {
            const { protestId, action: protestAction } = action.payload;
            
            const protest = state.social.activeProtests.find(p => p.id === protestId);
            if (!protest) return state;
            
            const group = state.social.interestGroups.find(g => g.id === protest.groupId);
            if (!group) return state;
            
            const resolution = resolveProtestAction(
                protest,
                protestAction,
                group,
                state.resources.budget,
                state.resources.politicalCapital
            );
            
            if (!resolution.success && !resolution.protestEnded) {
                // La acción falló
                return state;
            }
            
            // Aplicar consecuencias
            const updatedGroups = applyApprovalModifiers(
                state.social.interestGroups,
                [{ groupType: group.type, change: resolution.approvalChange, reason: 'Respuesta a protesta' }]
            );
            
            const newProtests = resolution.protestEnded
                ? state.social.activeProtests.filter(p => p.id !== protestId)
                : state.social.activeProtests;
            
            // Calcular nuevo HR
            let newHumanRights = state.social.humanRights;
            if (protestAction === 'suppress') {
                newHumanRights -= 15; // Represión daña DDHH
            }
            
            return {
                ...state,
                resources: {
                    ...state.resources,
                    politicalCapital: state.resources.politicalCapital - resolution.politicalCapitalCost,
                    stability: Math.max(0, Math.min(100, state.resources.stability + resolution.stabilityChange))
                },
                social: {
                    ...state.social,
                    interestGroups: updatedGroups,
                    activeProtests: newProtests,
                    humanRights: Math.max(0, Math.min(100, newHumanRights))
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: ${resolution.consequences.join(', ')}`]
            };
        }

        case 'CENSOR_MEDIA': {
            const { newMediaState, consequences } = censorMedia(state.social.mediaState);
            
            // Censurar también reduce HR y relaciones internacionales
            const newHumanRights = Math.max(0, state.social.humanRights - 10);
            
            return {
                ...state,
                social: {
                    ...state.social,
                    mediaState: newMediaState,
                    humanRights: newHumanRights
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: ${consequences[0]}`]
            };
        }

        case 'FUND_PUBLIC_MEDIA': {
            const { amount } = action.payload;
            
            if (state.resources.budget < amount) {
                return state;
            }
            
            const { newMediaState, consequences } = fundPublicMedia(state.social.mediaState, amount);
            
            return {
                ...state,
                resources: {
                    ...state.resources,
                    budget: state.resources.budget - amount
                },
                social: {
                    ...state.social,
                    mediaState: newMediaState
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: ${consequences[0]}`]
            };
        }

        case 'CAMPAIGN_RALLY': {
            const { targetGroup, budget } = action.payload;
            
            if (!state.social.campaign || !state.social.campaign.active) {
                return state;
            }
            
            const result = holdRally(targetGroup, null, budget);
            
            if (result.cost === 0) {
                return state;
            }
            
            const updatedGroups = applyApprovalModifiers(
                state.social.interestGroups,
                [{ groupType: targetGroup, change: result.approvalChange, reason: 'Mitin de campaña' }]
            );
            
            return {
                ...state,
                resources: {
                    ...state.resources,
                    budget: state.resources.budget - result.cost
                },
                social: {
                    ...state.social,
                    interestGroups: updatedGroups,
                    campaign: {
                        ...state.social.campaign,
                        governmentBudget: state.social.campaign.governmentBudget + result.cost,
                        ralliesHeld: state.social.campaign.ralliesHeld + 1,
                        momentum: state.social.campaign.momentum + result.momentumChange
                    }
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: ${result.consequences[0]}`]
            };
        }

        case 'CAMPAIGN_SMEAR': {
            if (!state.social.campaign || !state.social.campaign.active) {
                return state;
            }
            
            const result = launchSmearCampaign(state.resources.budget, state.resources.politicalCapital);
            
            if (result.cost === 0) {
                return state;
            }
            
            // Si hay contraataque, perder popularidad
            const popularityChange = result.backfireRisk > 0 ? -15 : 0;
            
            return {
                ...state,
                resources: {
                    ...state.resources,
                    budget: state.resources.budget - result.cost,
                    politicalCapital: state.resources.politicalCapital - result.politicalCapitalCost
                },
                stats: {
                    ...state.stats,
                    popularity: Math.max(0, Math.min(100, state.stats.popularity + popularityChange))
                },
                social: {
                    ...state.social,
                    campaign: {
                        ...state.social.campaign,
                        governmentBudget: state.social.campaign.governmentBudget + result.cost,
                        smearCampaigns: state.social.campaign.smearCampaigns + 1,
                        momentum: state.social.campaign.momentum + (result.backfireRisk > 0 ? -10 : 5)
                    }
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: ${result.consequences[0]}`]
            };
        }

        case 'APPLY_APPROVAL_MODIFIERS': {
            const { modifiers } = action.payload;
            
            const updatedGroups = applyApprovalModifiers(state.social.interestGroups, modifiers);
            
            return {
                ...state,
                social: {
                    ...state.social,
                    interestGroups: updatedGroups
                }
            };
        }

        case 'ENTER_EMERGENCY_MODE': {
            const { type, severity, turnsRemaining } = action.payload;
            
            return {
                ...state,
                emergencyMode: {
                    active: true,
                    type,
                    severity,
                    turnsRemaining,
                    allocation: null
                },
                time: { ...state.time, isPlaying: false }
            };
        }

        case 'EXIT_EMERGENCY_MODE': {
            if (!state.emergencyMode.active) return state;
            
            const { allocation } = action.payload;
            const severity = state.emergencyMode.severity || 50;
            
            // Calcular efectividad basada en la distribución del presupuesto
            const values = Object.values(allocation);
            const mean = 25; // 100% / 4 categorías
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 4;
            
            // Efectividad: 100% cuando está perfectamente balanceado (variance=0)
            // Disminuye según aumenta la variance
            // Fórmula ajustada: usar raíz cuadrada para suavizar el castigo
            // sqrt(variance) * 5 permite rangos más razonables
            const effectiveness = Math.max(0, Math.min(100, 100 - Math.sqrt(variance) * 5));
            
            // Calcular impacto en popularidad: base negativo por el desastre, bonificación por buena gestión
            const popularityImpact = -(severity / 5) + (effectiveness / 100) * 15;
            
            // Impacto en estabilidad
            const stabilityImpact = -(severity / 10) + (effectiveness / 100) * 5;
            
            // Costo de presupuesto: base 50B + escala con severidad
            const budgetCost = (severity / 100) * 100 + 50;
            
            return {
                ...state,
                emergencyMode: { active: false },
                stats: {
                    ...state.stats,
                    popularity: Math.max(0, Math.min(100, state.stats.popularity + popularityImpact))
                },
                resources: {
                    ...state.resources,
                    budget: state.resources.budget - budgetCost,
                    stability: Math.max(0, Math.min(100, state.resources.stability + stabilityImpact))
                },
                time: { ...state.time, isPlaying: true },
                logs: [
                    ...state.logs,
                    `Modo Emergencia Finalizado - Efectividad: ${effectiveness.toFixed(0)}% - Costo: ${budgetCost.toFixed(0)}B`
                ]
            };
        }

        // ==================== FASE 6: ACCIONES GEOPOLÍTICAS ====================
        
        case 'REQUEST_JOIN_ALLIANCE': {
            const { allianceId } = action.payload;
            const alliance = ALLIANCES.find(a => a.id === allianceId);
            
            if (!alliance) return state;
            
            // Verificar si ya está en la alianza
            if (state.geopolitics.playerAlliances.includes(allianceId)) {
                return {
                    ...state,
                    logs: [...state.logs, `Ya eres miembro de ${alliance.name}`]
                };
            }
            
            // Verificar requisitos
            const meetsReqs = meetsAllianceRequirements(alliance, {
                gdp: state.stats.gdp,
                democracy: state.resources.humanRights, // Aproximación
                corruption: 100 - state.resources.stability, // Aproximación
                ideology: state.player.ideology
            });
            
            if (!meetsReqs.meets) {
                return {
                    ...state,
                    logs: [...state.logs, `Solicitud rechazada por ${alliance.name}: ${meetsReqs.reasons[0]}`]
                };
            }
            
            // Unirse a la alianza (simplificado - en realidad requeriría votación)
            return {
                ...state,
                geopolitics: {
                    ...state.geopolitics,
                    playerAlliances: [...state.geopolitics.playerAlliances, allianceId]
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Te has unido a ${alliance.name}`]
            };
        }
        
        case 'LEAVE_ALLIANCE': {
            const { allianceId } = action.payload;
            const alliance = ALLIANCES.find(a => a.id === allianceId);
            
            if (!alliance) return state;
            
            return {
                ...state,
                geopolitics: {
                    ...state.geopolitics,
                    playerAlliances: state.geopolitics.playerAlliances.filter(id => id !== allianceId)
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Has abandonado ${alliance.name}`]
            };
        }
        
        case 'IMPOSE_SANCTIONS': {
            const { targetCountry, sanctionType } = action.payload;
            
            const newSanction = {
                id: `SANCTION_${Date.now()}`,
                type: sanctionType,
                imposedBy: [state.player.countryId],
                targetCountry,
                startDate: state.date,
                economicImpact: {
                    gdpReduction: sanctionType === 'total' ? 3 : sanctionType === 'financial' ? 2 : 1,
                    inflationIncrease: sanctionType === 'total' ? 2 : 1,
                    tradeReduction: sanctionType === 'total' ? 60 : sanctionType === 'trade' ? 40 : 20
                }
            };
            
            // Impacto en relaciones
            const currentRelation = state.geopolitics.relations[targetCountry]?.relation || 50;
            const newRelation = Math.max(0, currentRelation - 40);
            
            return {
                ...state,
                geopolitics: {
                    ...state.geopolitics,
                    activeSanctions: [...state.geopolitics.activeSanctions, newSanction],
                    relations: {
                        ...state.geopolitics.relations,
                        [targetCountry]: {
                            ...state.geopolitics.relations[targetCountry],
                            relation: newRelation,
                            recentEvents: [
                                ...state.geopolitics.relations[targetCountry].recentEvents,
                                {
                                    type: 'sanctions',
                                    description: 'Sanciones impuestas',
                                    relationChange: -40,
                                    date: state.date
                                }
                            ]
                        }
                    },
                    globalTension: Math.min(100, state.geopolitics.globalTension + 10)
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Sanciones ${sanctionType} impuestas a ${targetCountry}`]
            };
        }
        
        case 'LIFT_SANCTIONS': {
            const { sanctionId } = action.payload;
            const sanction = state.geopolitics.activeSanctions.find(s => s.id === sanctionId);
            
            if (!sanction) return state;
            
            // Mejorar relaciones ligeramente
            const currentRelation = state.geopolitics.relations[sanction.targetCountry]?.relation || 50;
            
            return {
                ...state,
                geopolitics: {
                    ...state.geopolitics,
                    activeSanctions: state.geopolitics.activeSanctions.filter(s => s.id !== sanctionId),
                    relations: {
                        ...state.geopolitics.relations,
                        [sanction.targetCountry]: {
                            ...state.geopolitics.relations[sanction.targetCountry],
                            relation: Math.min(100, currentRelation + 15)
                        }
                    }
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Sanciones levantadas contra ${sanction.targetCountry}`]
            };
        }
        
        case 'DECLARE_WAR': {
            const { targetCountry, strategy } = action.payload;
            
            const newWar = {
                id: `WAR_${Date.now()}`,
                state: 'limited_war' as const,
                aggressorCountry: state.player.countryId,
                defenderCountry: targetCountry,
                playerStrategy: strategy,
                duration: 0,
                casualties: 0,
                monthlyCost: state.stats.gdp * 0.02 // 2% del GDP por mes
            };
            
            // Relaciones destruidas
            return {
                ...state,
                geopolitics: {
                    ...state.geopolitics,
                    activeWars: [...state.geopolitics.activeWars, newWar],
                    relations: {
                        ...state.geopolitics.relations,
                        [targetCountry]: {
                            ...state.geopolitics.relations[targetCountry],
                            relation: 0,
                            hasTradeAgreement: false,
                            hasNonAggressionPact: false
                        }
                    },
                    globalTension: Math.min(100, state.geopolitics.globalTension + 30)
                },
                resources: {
                    ...state.resources,
                    stability: Math.max(0, state.resources.stability - 15)
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: ¡Guerra declarada contra ${targetCountry}! Estrategia: ${strategy}`]
            };
        }
        
        case 'CHANGE_WAR_STRATEGY': {
            const { warId, newStrategy } = action.payload;
            
            return {
                ...state,
                geopolitics: {
                    ...state.geopolitics,
                    activeWars: state.geopolitics.activeWars.map(war =>
                        war.id === warId ? { ...war, playerStrategy: newStrategy } : war
                    )
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Estrategia de guerra cambiada a ${newStrategy}`]
            };
        }
        
        case 'PROPOSE_TRADE_AGREEMENT': {
            const { targetCountry } = action.payload;
            
            // Verificar relación mínima
            const relation = state.geopolitics.relations[targetCountry]?.relation || 0;
            
            if (relation < 40) {
                return {
                    ...state,
                    logs: [...state.logs, `Relaciones insuficientes con ${targetCountry} para proponer acuerdo comercial`]
                };
            }
            
            return {
                ...state,
                geopolitics: {
                    ...state.geopolitics,
                    relations: {
                        ...state.geopolitics.relations,
                        [targetCountry]: {
                            ...state.geopolitics.relations[targetCountry],
                            hasTradeAgreement: true,
                            relation: Math.min(100, relation + 15)
                        }
                    }
                },
                economy: {
                    ...state.economy,
                    tradeAgreements: [
                        ...state.economy.tradeAgreements,
                        {
                            countryId: targetCountry,
                            countryName: targetCountry,
                            signedDate: state.time.date,
                            type: 'TradePact',
                            gdpBonus: 0.5,
                            industryEffects: {}
                        }
                    ]
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Acuerdo comercial firmado con ${targetCountry}`]
            };
        }
        
        case 'VOTE_UN_RESOLUTION': {
            const { resolutionId, vote } = action.payload;
            
            const resolutionIndex = state.geopolitics.unitedNations.activeResolutions.findIndex(r => r.id === resolutionId);
            if (resolutionIndex === -1) return state;
            
            const resolution = state.geopolitics.unitedNations.activeResolutions[resolutionIndex];
            const updatedResolution = { ...resolution };
            
            // Remover voto previo si existe
            updatedResolution.votesInFavor = updatedResolution.votesInFavor.filter(id => id !== state.player.countryId);
            updatedResolution.votesAgainst = updatedResolution.votesAgainst.filter(id => id !== state.player.countryId);
            updatedResolution.votesAbstain = updatedResolution.votesAbstain.filter(id => id !== state.player.countryId);
            
            // Agregar nuevo voto
            if (vote === 'favor') {
                updatedResolution.votesInFavor.push(state.player.countryId);
            } else if (vote === 'against') {
                updatedResolution.votesAgainst.push(state.player.countryId);
            } else {
                updatedResolution.votesAbstain.push(state.player.countryId);
            }
            
            const newResolutions = [...state.geopolitics.unitedNations.activeResolutions];
            newResolutions[resolutionIndex] = updatedResolution;
            
            return {
                ...state,
                geopolitics: {
                    ...state.geopolitics,
                    unitedNations: {
                        ...state.geopolitics.unitedNations,
                        activeResolutions: newResolutions
                    }
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Voto registrado: ${vote} en "${resolution.title}"`]
            };
        }
        
        case 'SET_MIGRATION_POLICY': {
            const { openness, maxIntake } = action.payload;
            
            return {
                ...state,
                geopolitics: {
                    ...state.geopolitics,
                    migrationPolicy: {
                        ...state.geopolitics.migrationPolicy,
                        openness,
                        maxMonthlyIntake: maxIntake
                    }
                },
                logs: [...state.logs, `${state.time.date.toISOString().split('T')[0]}: Política migratoria actualizada: ${openness}`]
            };
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
