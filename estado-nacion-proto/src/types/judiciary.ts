export interface Judge {
    id: string;
    name: string;
    ideology: 'Capitalist' | 'Socialist' | 'Centrist' | 'Authoritarian';
    age: number;
    loyalty: number; // 0-100
    corruption: number; // 0-100
    integrity: number; // 0-100
}

export type SupremeCourt = Judge[];

export type TermLength = 4 | 5 | 6 | 'INDEFINITE';
export type ElectionSystem = 'PROPORTIONAL' | 'DISTRICTS' | 'ELECTORAL_COLLEGE';

export interface Constitution {
    termLength: TermLength;
    electionSystem: ElectionSystem;
    judicialIndependence: number; // 0-100
    rights: {
        freeSpeech: boolean;
        assembly: boolean;
        strike: boolean;
    };
}
