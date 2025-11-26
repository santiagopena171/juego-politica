import type { GameState } from '../context/GameContext';
import type { RegionUIFlags, MinisterFaceState } from '../types/living_world';

export const computeRegionUIFlags = (state: GameState): Record<string, RegionUIFlags> => {
    const flags: Record<string, RegionUIFlags> = {};
    state.economy.regions.forEach(region => {
        flags[region.id] = {
            unrestHigh: region.classStrugglelevel > 50 || region.happiness < 40,
            strike: (region.pops || []).some(pop => pop.radicalization > 80 && pop.satisfaction < 25),
        };
    });
    return flags;
};

export const computeMinisterFaces = (state: GameState): Record<string, MinisterFaceState> => {
    const faces: Record<string, MinisterFaceState> = {};
    state.government.ministers.forEach(m => {
        let mood: MinisterFaceState['mood'] = 'neutral';
        if (m.stats.loyalty < 30) mood = 'angry';
        if ((m.mandate?.lastReport || '').toLowerCase().includes('escandalo')) mood = 'nervous';
        if (m.stats.popularity > 70 && m.stats.loyalty > 60) mood = 'happy';
        faces[m.id] = { mood };
    });
    return faces;
};
