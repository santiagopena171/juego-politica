import type { Ideology } from '../types/politics';
import type {
    PartyFaction,
    FactionType,
    FactionStance,
    PolicyArea,
    Bill,
    FactionVote,
    NegotiationOffer,
    NegotiationResult
} from '../types/parliament';

// Nombres de facciones por tipo e ideología
const FACTION_NAMES: Record<FactionType, Record<Ideology, string[]>> = {
    hardliner: {
        Socialist: ['Ala Revolucionaria', 'Izquierda Radical', 'Vanguardia Socialista'],
        Liberal: ['Liberales Puros', 'Ala Progresista Extrema', 'Libertarios'],
        Conservative: ['Ala Dura Conservadora', 'Tradicionalistas', 'Nacionalistas Conservadores'],
        Nationalist: ['Ultra-Nacionalistas', 'Patriotas Radicales', 'Soberanistas Duros'],
        Centrist: ['Centristas de Principios', 'Moderados Firmes', 'Independientes'],
        Authoritarian: ['Línea Dura', 'Sector Autoritario', 'Mano Firme'],
        Capitalist: ['Ultra-Liberales Económicos', 'Laissez-Faire', 'Capitalistas Puros']
    },
    moderate: {
        Socialist: ['Socialdemócratas', 'Centro-Izquierda', 'Reformistas Sociales'],
        Liberal: ['Liberales Moderados', 'Centro Progressista', 'Social-Liberales'],
        Conservative: ['Conservadores Moderados', 'Centro-Derecha', 'Reformistas Conservadores'],
        Nationalist: ['Nacionalistas Moderados', 'Patriotas Pragmáticos', 'Soberanistas'],
        Centrist: ['Centristas', 'Tercer Vía', 'Pragmáticos'],
        Authoritarian: ['Sector Moderado', 'Orden y Progreso', 'Disciplinados'],
        Capitalist: ['Liberales de Mercado', 'Pro-Empresa', 'Centro Económico']
    },
    reformist: {
        Socialist: ['Renovadores Socialistas', 'Nueva Izquierda', 'Socialismo del Siglo XXI'],
        Liberal: ['Neo-Liberales', 'Innovadores', 'Liberales 2.0'],
        Conservative: ['Conservadores Renovadores', 'Nueva Derecha', 'Modernizadores'],
        Nationalist: ['Nacionalistas Reformistas', 'Patriotas Modernos', 'Nueva Soberanía'],
        Centrist: ['Centristas Reformistas', 'Innovadores', 'Nueva Política'],
        Authoritarian: ['Renovadores', 'Reformistas del Orden', 'Modernizadores'],
        Capitalist: ['Capitalismo Responsable', 'Innovadores Económicos', 'Emprendedores']
    },
    pragmatist: {
        Socialist: ['Pragmáticos de Izquierda', 'Realistas Sociales', 'Izquierda Práctica'],
        Liberal: ['Liberales Pragmáticos', 'Realistas', 'Centristas Liberales'],
        Conservative: ['Conservadores Pragmáticos', 'Realistas', 'Derecha Práctica'],
        Nationalist: ['Nacionalistas Pragmáticos', 'Realistas Patrióticos', 'Soberanía Efectiva'],
        Centrist: ['Pragmáticos', 'Realistas', 'Soluciones Prácticas'],
        Authoritarian: ['Pragmáticos del Orden', 'Eficientistas', 'Realistas'],
        Capitalist: ['Capitalistas Pragmáticos', 'Empresarios Realistas', 'Mercado Regulado']
    }
};

// Prioridades de políticas por ideología
const POLICY_PRIORITIES: Record<Ideology, PolicyArea[]> = {
    Socialist: ['social', 'health', 'education', 'economy'],
    Liberal: ['social', 'education', 'environment', 'foreign'],
    Conservative: ['security', 'economy', 'foreign', 'infrastructure'],
    Nationalist: ['security', 'foreign', 'economy', 'infrastructure'],
    Centrist: ['economy', 'education', 'health', 'infrastructure'],
    Authoritarian: ['security', 'economy', 'infrastructure', 'foreign'],
    Capitalist: ['economy', 'infrastructure', 'foreign', 'education']
};

/**
 * Genera facciones para un partido político
 */
export function generateFactionsForParty(
    partyId: string,
    partyName: string,
    partyIdeology: Ideology,
    isGovernment: boolean,
    _totalPartySeats: number
): PartyFaction[] {
    const factions: PartyFaction[] = [];
    const factionCount = Math.random() > 0.7 ? 3 : 2; // 70% tienen 2 facciones, 30% tienen 3

    // Distribución típica de tamaños
    const sizeDistributions = factionCount === 2
        ? [60, 40] // 2 facciones
        : [50, 30, 20]; // 3 facciones

    const types: FactionType[] = factionCount === 2
        ? ['moderate', Math.random() > 0.5 ? 'hardliner' : 'pragmatist']
        : ['moderate', 'hardliner', Math.random() > 0.5 ? 'reformist' : 'pragmatist'];

    for (let i = 0; i < factionCount; i++) {
        const type = types[i];
        const size = sizeDistributions[i];

        const names = FACTION_NAMES[type][partyIdeology];
        const name = `${partyName} - ${names[Math.floor(Math.random() * names.length)]}`;

        // Calcular stance inicial
        let stance: FactionStance;
        if (isGovernment) {
            // Facciones de gobierno tienden a apoyar
            if (type === 'hardliner') {
                stance = Math.random() > 0.3 ? 'supportive' : 'neutral';
            } else if (type === 'moderate') {
                stance = 'supportive';
            } else {
                stance = Math.random() > 0.6 ? 'neutral' : 'supportive';
            }
        } else {
            // Facciones de oposición
            if (type === 'hardliner') {
                stance = 'hostile';
            } else if (type === 'moderate') {
                stance = Math.random() > 0.5 ? 'neutral' : 'hostile';
            } else {
                stance = 'neutral';
            }
        }

        const priorities = POLICY_PRIORITIES[partyIdeology].slice(0, 3);

        factions.push({
            id: `faction-${partyId}-${i}`,
            name,
            partyId,
            type,
            ideology: partyIdeology,
            size,
            influence: 40 + Math.random() * 40, // 40-80
            priorities,
            stance,
            loyaltyToLeader: isGovernment ? 60 + Math.random() * 30 : 40 + Math.random() * 40,
            description: generateFactionDescription(type, partyIdeology, isGovernment)
        });
    }

    return factions;
}

/**
 * Genera descripción de una facción
 */
function generateFactionDescription(type: FactionType, ideology: Ideology, _isGovernment: boolean): string {
    const templates = {
        hardliner: [
            `Sector más radical del partido, defiende posiciones ${ideology.toLowerCase()}s sin concesiones.`,
            `Ala dura que rechaza cualquier moderación de sus principios ${ideology.toLowerCase()}s.`,
            `Grupo intransigente que mantiene la pureza ideológica ${ideology.toLowerCase}.`
        ],
        moderate: [
            `Facción centrista que busca el equilibrio y el consenso.`,
            `Sector moderado dispuesto al diálogo y las medidas graduales.`,
            `Grupo pragmático que prioriza la gobernabilidad sobre la ideología.`
        ],
        reformist: [
            `Facción innovadora que busca modernizar las posturas ${ideology.toLowerCase}s.`,
            `Sector renovador que propone actualizar la agenda del partido.`,
            `Grupo reformista que quiere adaptar el ${ideology.toLowerCase()}ismo al siglo XXI.`
        ],
        pragmatist: [
            `Facción orientada a resultados más que a principios ideológicos.`,
            `Sector práctico que prioriza soluciones efectivas.`,
            `Grupo realista que busca políticas que funcionen.`
        ]
    };

    const options = templates[type];
    return options[Math.floor(Math.random() * options.length)];
}

/**
 * Calcula el apoyo base de una facción a un bill
 */
export function calculateFactionBaseSupport(
    faction: PartyFaction,
    bill: Bill,
    isGovernmentBill: boolean
): number {
    let support = 50; // Base neutro

    // 1. Stance hacia el gobierno
    if (isGovernmentBill) {
        if (faction.stance === 'supportive') support += 30;
        else if (faction.stance === 'hostile') support -= 30;
    } else {
        if (faction.stance === 'hostile') support += 20;
        else if (faction.stance === 'supportive') support -= 20;
    }

    // 2. Prioridades de política
    if (faction.priorities.includes(bill.policyArea)) {
        support += 15;
    }

    // 3. Tipo de facción
    if (bill.type === 'reform') {
        if (faction.type === 'reformist') support += 15;
        else if (faction.type === 'hardliner') support -= 15;
    }

    // 4. Urgencia
    if (bill.urgency === 'crisis') {
        support += 10; // Todos tienden a apoyar en crisis
    }

    // 5. Ideología (simplificado)
    // TO DO en el futuro: lógica más compleja basada en el contenido del bill

    return Math.max(0, Math.min(100, support));
}

/**
 * Simula votación de un bill en el parlamento
 */
export function simulateBillVote(
    bill: Bill,
    factions: PartyFaction[],
    totalSeats: number,
    isGovernmentBill: boolean
): { approved: boolean; votes: { yes: number; no: number; abstain: number }; factionVotes: FactionVote[] } {
    const factionVotes: FactionVote[] = [];
    let totalYes = 0;
    let totalNo = 0;
    let totalAbstain = 0;

    for (const faction of factions) {
        const baseSupport = calculateFactionBaseSupport(faction, bill, isGovernmentBill);

        // Determinar voto basado en baseSupport
        let vote: 'yes' | 'no' | 'abstain';
        if (baseSupport >= 60) {
            vote = 'yes';
        } else if (baseSupport <= 40) {
            vote = 'no';
        } else {
            vote = Math.random() > 0.5 ? 'abstain' : (Math.random() > 0.5 ? 'yes' : 'no');
        }

        // Calcular votos (facción tiene % de escaños del partido)
        // Necesitamos acceso a los escaños del partido - simplificamos por ahora
        const factionSeats = Math.round((faction.size / 100) * (totalSeats * 0.1)); // Estimación

        if (vote === 'yes') totalYes += factionSeats;
        else if (vote === 'no') totalNo += factionSeats;
        else totalAbstain += factionSeats;

        factionVotes.push({
            factionId: faction.id,
            vote,
            reason: generateVoteReason(faction, vote, bill),
            baseSupport,
            influenced: false
        });
    }

    const yesPercentage = (totalYes / totalSeats) * 100;
    const approved = yesPercentage >= bill.requiredMajority;

    return {
        approved,
        votes: { yes: totalYes, no: totalNo, abstain: totalAbstain },
        factionVotes
    };
}

/**
 * Genera razón por la que una facción votó de cierta manera
 */
function generateVoteReason(faction: PartyFaction, vote: 'yes' | 'no' | 'abstain', bill: Bill): string {
    if (vote === 'yes') {
        if (faction.stance === 'supportive') {
            return `${faction.name} apoya al gobierno en esta medida.`;
        } else if (faction.priorities.includes(bill.policyArea)) {
            return `${faction.name} considera prioritaria esta área de política.`;
        } else {
            return `${faction.name} ve beneficios en esta propuesta.`;
        }
    } else if (vote === 'no') {
        if (faction.stance === 'hostile') {
            return `${faction.name} se opone sistemáticamente al gobierno.`;
        } else if (faction.type === 'hardliner') {
            return `${faction.name} rechaza las concesiones ideológicas.`;
        } else {
            return `${faction.name} considera que esta medida es contraproducente.`;
        }
    } else {
        return `${faction.name} se abstiene por falta de consenso interno.`;
    }
}

/**
 * Intenta negociar con una facción
 */
export function negotiateWithFaction(
    faction: PartyFaction,
    offer: NegotiationOffer,
    currentPoliticalCapital: number
): NegotiationResult {
    if (currentPoliticalCapital < offer.politicalCapitalCost) {
        return {
            success: false,
            factionId: faction.id,
            influenceGained: 0,
            message: `No tienes suficiente Capital Político para esta negociación.`,
            costPaid: 0
        };
    }

    const success = Math.random() * 100 < offer.successChance;

    if (success) {
        let newStance = faction.stance;
        let influenceGained = 15 + Math.random() * 20; // 15-35

        if (faction.stance === 'hostile') newStance = 'neutral';
        else if (faction.stance === 'neutral') newStance = 'supportive';

        return {
            success: true,
            factionId: faction.id,
            stanceChange: newStance,
            influenceGained,
            message: `${faction.name} acepta la negociación. Su postura mejora.`,
            costPaid: offer.politicalCapitalCost
        };
    } else {
        return {
            success: false,
            factionId: faction.id,
            influenceGained: 0,
            message: `${faction.name} rechaza la oferta. Pierdes Capital Político sin ganar apoyo.`,
            costPaid: offer.politicalCapitalCost
        };
    }
}

/**
 * Actualiza las posturas de las facciones mensualmente
 */
export function updateFactionStances(
    factions: PartyFaction[],
    governmentPopularity: number,
    failedBillsThisMonth: number
): PartyFaction[] {
    return factions.map(faction => {
        let newStance = faction.stance;

        // Facciones de gobierno
        if (faction.stance === 'supportive') {
            if (governmentPopularity < 30 || failedBillsThisMonth >= 2) {
                // Pueden volverse neutrales si el gobierno va muy mal
                if (Math.random() < 0.3) {
                    newStance = 'neutral';
                }
            }
        }

        // Facciones neutrales
        if (faction.stance === 'neutral') {
            if (governmentPopularity > 60) {
                if (Math.random() < 0.2) newStance = 'supportive';
            } else if (governmentPopularity < 35) {
                if (Math.random() < 0.2) newStance = 'hostile';
            }
        }

        // Facciones hostiles rara vez cambian
        if (faction.stance === 'hostile' && governmentPopularity > 70) {
            if (Math.random() < 0.1) newStance = 'neutral';
        }

        return { ...faction, stance: newStance };
    });
}

/**
 * Calcula el apoyo general del gobierno en el parlamento
 */
export function calculateGovernmentSupport(factions: PartyFaction[], totalSeats: number): number {
    let supportSeats = 0;

    for (const faction of factions) {
        // Estimación de escaños de la facción
        const factionSeats = Math.round((faction.size / 100) * (totalSeats * 0.1));

        if (faction.stance === 'supportive') {
            supportSeats += factionSeats;
        } else if (faction.stance === 'neutral') {
            supportSeats += factionSeats * 0.5; // Neutrales cuentan la mitad
        }
    }

    return Math.round((supportSeats / totalSeats) * 100);
}
