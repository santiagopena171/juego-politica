import { useState } from 'react';
import { Play, FolderOpen, Trash2, Calendar, Users, TrendingUp } from 'lucide-react';
import { getSavedGames, loadGame, deleteSave } from '../utils/saveSystem';
import { useGame } from '../context/GameContext';
import type { SavedGame } from '../utils/saveSystem';

interface MainMenuProps {
    onNewGame: () => void;
}

export const MainMenu = ({ onNewGame }: MainMenuProps) => {
    const { dispatch } = useGame();
    const [saves, setSaves] = useState<SavedGame[]>(getSavedGames());
    const [selectedSave, setSelectedSave] = useState<string | null>(null);

    const refreshSaves = () => {
        setSaves(getSavedGames());
    };

    const handleLoadGame = (saveId: string) => {
        const gameState = loadGame(saveId);
        if (gameState) {
            dispatch({ type: 'LOAD_GAME', payload: gameState });
        }
    };

    const handleDeleteSave = (saveId: string, saveName: string) => {
        if (confirm(`¿Estás seguro de eliminar la partida "${saveName}"?`)) {
            deleteSave(saveId);
            refreshSaves();
            if (selectedSave === saveId) {
                setSelectedSave(null);
            }
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
            <div className="max-w-6xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                            <span className="text-4xl">🏛️</span>
                        </div>
                        <h1 className="text-6xl font-bold text-white">Estado Nación</h1>
                    </div>
                    <p className="text-xl text-slate-300">Simulador de Gobierno y Política</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Nueva Partida */}
                    <div className="bg-slate-800/90 backdrop-blur rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6">
                            <div className="flex items-center gap-3">
                                <Play size={28} className="text-white" />
                                <h2 className="text-2xl font-bold text-white">Nueva Partida</h2>
                            </div>
                        </div>
                        
                        <div className="p-8">
                            <p className="text-slate-300 mb-6 leading-relaxed">
                                Comienza una nueva campaña como líder de una nación. Toma decisiones políticas, 
                                económicas y sociales que afectarán el destino de tu país.
                            </p>
                            
                            <button
                                onClick={onNewGame}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                            >
                                <Play size={24} />
                                Crear Nueva Partida
                            </button>

                            <div className="mt-6 pt-6 border-t border-slate-700">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                    Características:
                                </h3>
                                <ul className="space-y-2 text-sm text-slate-300">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400 mt-0.5">✓</span>
                                        <span>Elige tu país y personaliza tu gobierno</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400 mt-0.5">✓</span>
                                        <span>Gestiona economía, diplomacia y asuntos sociales</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400 mt-0.5">✓</span>
                                        <span>Nombra ministros y forma tu gabinete</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400 mt-0.5">✓</span>
                                        <span>Navega crisis y eventos políticos</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Cargar Partida */}
                    <div className="bg-slate-800/90 backdrop-blur rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FolderOpen size={28} className="text-white" />
                                    <h2 className="text-2xl font-bold text-white">Partidas Guardadas</h2>
                                </div>
                                <span className="bg-slate-800 px-3 py-1 rounded-full text-sm font-semibold text-slate-300">
                                    {saves.length} {saves.length === 1 ? 'partida' : 'partidas'}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 max-h-[500px] overflow-y-auto">
                            {saves.length === 0 ? (
                                <div className="text-center py-12">
                                    <FolderOpen size={64} className="text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400 text-lg mb-2">No hay partidas guardadas</p>
                                    <p className="text-slate-500 text-sm">
                                        Crea una nueva partida para comenzar a jugar
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {saves.map((save) => (
                                        <div
                                            key={save.id}
                                            className={`bg-slate-900/50 border rounded-xl p-4 transition-all hover:border-blue-500 cursor-pointer ${
                                                selectedSave === save.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-700'
                                            }`}
                                            onClick={() => setSelectedSave(save.id)}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-white text-lg">{save.name}</h3>
                                                        {save.id.startsWith('autosave') && (
                                                            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                                                                AUTO
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-400 text-sm">{save.country} • {save.playerName}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 mb-3">
                                                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                                                    <div className="text-xs text-slate-400 mb-1">PIB</div>
                                                    <div className="text-sm font-bold text-green-400">
                                                        ${save.stats.gdp.toFixed(1)}T
                                                    </div>
                                                </div>
                                                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                                                    <div className="text-xs text-slate-400 mb-1">Popularidad</div>
                                                    <div className={`text-sm font-bold ${
                                                        save.stats.popularity >= 60 ? 'text-green-400' :
                                                        save.stats.popularity >= 40 ? 'text-yellow-400' : 'text-red-400'
                                                    }`}>
                                                        {save.stats.popularity.toFixed(0)}%
                                                    </div>
                                                </div>
                                                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                                                    <div className="text-xs text-slate-400 mb-1">Estabilidad</div>
                                                    <div className={`text-sm font-bold ${
                                                        save.stats.stability >= 60 ? 'text-green-400' :
                                                        save.stats.stability >= 40 ? 'text-yellow-400' : 'text-red-400'
                                                    }`}>
                                                        {save.stats.stability.toFixed(0)}%
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(save.gameDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp size={12} />
                                                    {save.stats.turnsPlayed} turnos
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    💾 {formatDate(save.savedAt)}
                                                </span>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLoadGame(save.id);
                                                    }}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                                                >
                                                    Cargar
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSave(save.id, save.name);
                                                    }}
                                                    className="bg-red-600/20 hover:bg-red-600/30 text-red-400 p-2 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-slate-400 text-sm">
                    <p>Las partidas se guardan automáticamente cada 5 minutos</p>
                    <p className="mt-1">© 2025 Estado Nación - Simulador Político</p>
                </div>
            </div>
        </div>
    );
};
