/**
 * Sistema de Persistencia de Partidas
 * Maneja guardar/cargar partidas en localStorage
 */

import type { GameState } from '../context/GameContext';

export interface SavedGame {
    id: string;
    name: string;
    country: string;
    playerName: string;
    date: Date;
    gameDate: Date;
    stats: {
        gdp: number;
        popularity: number;
        stability: number;
        turnsPlayed: number;
    };
    savedAt: Date;
}

const STORAGE_KEY = 'estado-nacion-saves';
const MAX_SAVES = 10;

/**
 * Obtener lista de partidas guardadas
 */
export const getSavedGames = (): SavedGame[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        
        const saves = JSON.parse(data);
        // Convertir strings de fecha a objetos Date
        return saves.map((save: any) => ({
            ...save,
            date: new Date(save.date),
            gameDate: new Date(save.gameDate),
            savedAt: new Date(save.savedAt)
        }));
    } catch (error) {
        console.error('Error loading saved games:', error);
        return [];
    }
};

/**
 * Guardar partida actual
 */
export const saveGame = (state: GameState, saveName?: string): SavedGame => {
    const saves = getSavedGames();
    
    // Calcular número de turnos jugados (meses desde inicio)
    const startDate = new Date(2024, 0, 1); // Asumimos inicio en enero 2024
    const currentDate = state.time.date;
    const turnsPlayed = Math.floor(
        (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    
    const savedGame: SavedGame = {
        id: state.player.countryId + '-' + Date.now(),
        name: saveName || `${state.player.countryName} - ${formatDate(currentDate)}`,
        country: state.player.countryName,
        playerName: state.player.name,
        date: new Date(),
        gameDate: currentDate,
        stats: {
            gdp: state.stats.gdp,
            popularity: state.stats.popularity,
            stability: state.resources.stability,
            turnsPlayed
        },
        savedAt: new Date()
    };
    
    // Guardar estado completo en una key separada
    const stateKey = `${STORAGE_KEY}-state-${savedGame.id}`;
    localStorage.setItem(stateKey, JSON.stringify(state));
    
    // Agregar a lista de saves (limitar a MAX_SAVES)
    saves.push(savedGame);
    if (saves.length > MAX_SAVES) {
        // Eliminar la partida más antigua
        const oldestSave = saves.shift();
        if (oldestSave) {
            const oldStateKey = `${STORAGE_KEY}-state-${oldestSave.id}`;
            localStorage.removeItem(oldStateKey);
        }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
    
    return savedGame;
};

/**
 * Cargar partida guardada
 */
export const loadGame = (saveId: string): GameState | null => {
    try {
        const stateKey = `${STORAGE_KEY}-state-${saveId}`;
        const data = localStorage.getItem(stateKey);
        
        if (!data) {
            console.error('Save not found:', saveId);
            return null;
        }
        
        const state = JSON.parse(data);
        
        // Reconstruir objetos Date
        state.time.date = new Date(state.time.date);
        state.notifications = state.notifications.map((notif: any) => ({
            ...notif,
            date: new Date(notif.date)
        }));
        
        // Reconstruir fechas en ministers
        if (state.cabinet?.ministers) {
            state.cabinet.ministers = state.cabinet.ministers.map((minister: any) => ({
                ...minister,
                appointmentDate: minister.appointmentDate ? new Date(minister.appointmentDate) : undefined
            }));
        }
        
        // Reconstruir fechas en economy.tradeAgreements
        if (state.economy?.tradeAgreements) {
            state.economy.tradeAgreements = state.economy.tradeAgreements.map((agreement: any) => ({
                ...agreement,
                signedDate: new Date(agreement.signedDate)
            }));
        }
        
        // Reconstruir fechas en activeStorylines
        if (state.activeStorylines) {
            state.activeStorylines = state.activeStorylines.map((storyline: any) => ({
                ...storyline,
                startedAt: new Date(storyline.startedAt)
            }));
        }
        
        return state;
    } catch (error) {
        console.error('Error loading game:', error);
        return null;
    }
};

/**
 * Eliminar partida guardada
 */
export const deleteSave = (saveId: string): void => {
    const saves = getSavedGames();
    const filtered = saves.filter(save => save.id !== saveId);
    
    // Eliminar estado guardado
    const stateKey = `${STORAGE_KEY}-state-${saveId}`;
    localStorage.removeItem(stateKey);
    
    // Actualizar lista
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * Obtener espacio usado en localStorage (en MB)
 */
export const getStorageSize = (): number => {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    return total / (1024 * 1024); // Convert to MB
};

/**
 * Limpiar todas las partidas guardadas
 */
export const clearAllSaves = (): void => {
    const saves = getSavedGames();
    saves.forEach(save => {
        const stateKey = `${STORAGE_KEY}-state-${save.id}`;
        localStorage.removeItem(stateKey);
    });
    localStorage.removeItem(STORAGE_KEY);
};

/**
 * Helper: Formatear fecha
 */
const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
};

/**
 * Auto-guardar partida (para llamar periódicamente)
 */
export const autoSave = (state: GameState): void => {
    if (!state.gameStarted) return;
    
    const AUTO_SAVE_ID = 'autosave-' + state.player.countryId;
    const saves = getSavedGames();
    
    // Buscar si existe un autosave previo
    const existingAutoSave = saves.find(save => save.id === AUTO_SAVE_ID);
    
    if (existingAutoSave) {
        // Actualizar autosave existente
        const stateKey = `${STORAGE_KEY}-state-${AUTO_SAVE_ID}`;
        localStorage.setItem(stateKey, JSON.stringify(state));
        
        // Actualizar metadata
        const updatedSaves = saves.map(save => {
            if (save.id === AUTO_SAVE_ID) {
                return {
                    ...save,
                    gameDate: state.time.date,
                    stats: {
                        gdp: state.stats.gdp,
                        popularity: state.stats.popularity,
                        stability: state.resources.stability,
                        turnsPlayed: existingAutoSave.stats.turnsPlayed + 1
                    },
                    savedAt: new Date()
                };
            }
            return save;
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSaves));
    } else {
        // Crear nuevo autosave
        const turnsPlayed = 0; // Primera vez
        const savedGame: SavedGame = {
            id: AUTO_SAVE_ID,
            name: `[AutoGuardado] ${state.player.countryName}`,
            country: state.player.countryName,
            playerName: state.player.name,
            date: new Date(),
            gameDate: state.time.date,
            stats: {
                gdp: state.stats.gdp,
                popularity: state.stats.popularity,
                stability: state.resources.stability,
                turnsPlayed
            },
            savedAt: new Date()
        };
        
        const stateKey = `${STORAGE_KEY}-state-${AUTO_SAVE_ID}`;
        localStorage.setItem(stateKey, JSON.stringify(state));
        
        saves.push(savedGame);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
    }
};
