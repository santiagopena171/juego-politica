import type { Minister, Parliament, PoliticalParty, Policy, Project } from '../types/politics';
import { generateFactionsForParty, calculateGovernmentSupport } from './parliamentSystem';

// --- Parliament Logic ---

export const calculateVoteOutcome = (parliament: Parliament, _policy: Policy | Project): { approved: boolean, votesFor: number, votesAgainst: number } => {
    let votesFor = 0;
    let votesAgainst = 0;

    parliament.parties.forEach(party => {
        // Simple logic: 
        // If party supports player (stance > 50), they likely vote YES.
        // Random variance added.
        const supportChance = party.stance / 100;
        const randomFactor = Math.random() * 0.2 - 0.1; // +/- 10%

        if (supportChance + randomFactor > 0.5) {
            votesFor += party.seats;
        } else {
            votesAgainst += party.seats;
        }
    });

    return {
        approved: votesFor > votesAgainst,
        votesFor,
        votesAgainst
    };
};

// --- Cabinet Logic ---

// Re-export from ministerGenerator for backwards compatibility
export { generateMinister, generateMinisterCandidates } from './ministerGenerator';

export const calculateMinistryEffectiveness = (minister: Minister): number => {
    // Effectiveness = Competence * 0.7 + Loyalty * 0.3
    // Penalized by corruption
    let score = (minister.stats.competence * 0.7) + (minister.stats.loyalty * 0.3);
    if (minister.stats.corruption > 50) {
        score -= (minister.stats.corruption - 50);
    }
    return Math.max(0, Math.min(100, score));
};

export const generateParliament = (totalSeats: number = 100): Parliament => {

    // Basic Party Generation
    const parties: PoliticalParty[] = [
        {
            id: 'gov_party',
            name: 'Partido Oficial',
            color: '#3b82f6', // Blue
            ideology: 'Centrist',
            seats: Math.floor(totalSeats * 0.55), // Majority
            isGovernment: true,
            stance: 100,
            factionIds: []
        },
        {
            id: 'opp_party_1',
            name: 'Oposición Conservadora',
            color: '#ef4444', // Red
            ideology: 'Conservative',
            seats: Math.floor(totalSeats * 0.30),
            isGovernment: false,
            stance: 20,
            factionIds: []
        },
        {
            id: 'opp_party_2',
            name: 'Frente Progresista',
            color: '#22c55e', // Green
            ideology: 'Socialist',
            seats: totalSeats - Math.floor(totalSeats * 0.55) - Math.floor(totalSeats * 0.30),
            isGovernment: false,
            stance: 40,
            factionIds: []
        }
    ];

    // Generate factions for each party
    const allFactions: any[] = [];
    parties.forEach(party => {
        const factions = generateFactionsForParty(
            party.id,
            party.name,
            party.ideology,
            party.isGovernment,
            party.seats
        );
        allFactions.push(...factions);
        party.factionIds = factions.map(f => f.id);
    });

    // Calculate government coalition (just main party for now)
    const governmentCoalition = parties.filter(p => p.isGovernment).map(p => p.id);

    // Calculate initial government support
    const governmentSupport = calculateGovernmentSupport(allFactions, totalSeats);

    return {
        totalSeats,
        parties,
        nextElectionDate: Date.now() + (1000 * 60 * 60 * 24 * 365 * 4), // 4 years from now
        factions: allFactions,
        governmentCoalition,
        governmentSupport,
        activeBill: null
    };
};

