import type { MediaState, PopType } from '../types/living_world';

export const applyPropaganda = (budget: number, mediaState: MediaState): MediaState => {
    const effectiveness = Math.min(20, budget / 10);
    return {
        ...mediaState,
        propagandaBudget: mediaState.propagandaBudget + budget,
        outlets: mediaState.outlets.map(outlet => ({
            ...outlet,
            loyalty: Math.min(100, outlet.loyalty + effectiveness),
            trust: Math.min(100, outlet.trust + effectiveness / 2)
        }))
    };
};

export const censureOutlet = (outletId: string, mediaState: MediaState): MediaState => {
    return {
        ...mediaState,
        censorshipLevel: Math.min(100, mediaState.censorshipLevel + 10),
        outlets: mediaState.outlets.map(outlet =>
            outlet.id === outletId
                ? { ...outlet, loyalty: Math.min(100, outlet.loyalty + 30), trust: Math.max(0, outlet.trust - 25) }
                : outlet
        )
    };
};

export const generateMediaCampaign = (message: string, targetGroup: PopType): void => {
    console.log(`Campaña mediática lanzada: "${message}" dirigida a ${targetGroup}`);
};
