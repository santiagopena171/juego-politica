/**
 * SaveLoadMenu - Menú para guardar y cargar partidas
 */

import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, X, Plus, Download, Clock, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { getSavedGames, saveGame, loadGame, deleteSave, getStorageSize, type SavedGame } from '../utils/saveSystem';
import { useGame } from '../context/GameContext';

interface SaveLoadMenuProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'save' | 'load';
}

export const SaveLoadMenu: React.FC<SaveLoadMenuProps> = ({ isOpen, onClose, mode }) => {
    const { state, dispatch } = useGame();
    const [saves, setSaves] = useState<SavedGame[]>([]);
    const [saveName, setSaveName] = useState('');
    const [selectedSave, setSelectedSave] = useState<string | null>(null);
    const [storageSize, setStorageSize] = useState(0);

    useEffect(() => {
        if (isOpen) {
            loadSaves();
        }
    }, [isOpen]);

    const loadSaves = () => {
        setSaves(getSavedGames());
        setStorageSize(getStorageSize());
    };

    const handleSave = () => {
        if (!state.gameStarted) {
            alert('No hay partida activa para guardar');
            return;
        }

        const name = saveName.trim() || undefined;
        saveGame(state, name);
        setSaveName('');
        loadSaves();
    };

    const handleLoad = (saveId: string) => {
        if (!confirm('¿Cargar esta partida? El progreso actual no guardado se perderá.')) {
            return;
        }

        const loadedState = loadGame(saveId);
        if (loadedState) {
            dispatch({ type: 'LOAD_GAME', payload: loadedState });
            onClose();
        } else {
            alert('Error al cargar la partida');
        }
    };

    const handleDelete = (saveId: string) => {
        if (!confirm('¿Eliminar esta partida guardada? Esta acción no se puede deshacer.')) {
            return;
        }

        deleteSave(saveId);
        loadSaves();
        setSelectedSave(null);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatGameDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-slate-700">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {mode === 'save' ? (
                            <Save className="w-8 h-8 text-white" />
                        ) : (
                            <FolderOpen className="w-8 h-8 text-white" />
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {mode === 'save' ? 'Guardar Partida' : 'Cargar Partida'}
                            </h2>
                            <p className="text-blue-100 text-sm">
                                {saves.length} partida{saves.length !== 1 ? 's' : ''} guardada{saves.length !== 1 ? 's' : ''} • {storageSize.toFixed(2)} MB usados
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Save Section (only in save mode) */}
                    {mode === 'save' && state.gameStarted && (
                        <div className="mb-6 bg-slate-700 rounded-lg p-4 border-2 border-blue-500/30">
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-400" />
                                Nueva Partida Guardada
                            </h3>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder={`${state.player.countryName} - ${formatGameDate(state.time.date)}`}
                                    value={saveName}
                                    onChange={(e) => setSaveName(e.target.value)}
                                    className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                                    maxLength={50}
                                />
                                <button
                                    onClick={handleSave}
                                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    Guardar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* No game started warning */}
                    {mode === 'save' && !state.gameStarted && (
                        <div className="bg-orange-500/20 border-2 border-orange-500/50 rounded-lg p-6 mb-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 text-orange-400" />
                                <div>
                                    <p className="text-orange-300 font-semibold">No hay partida activa</p>
                                    <p className="text-orange-400 text-sm">Inicia una nueva partida para poder guardar el progreso</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Saved Games List */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-300 mb-4">
                            Partidas Guardadas
                        </h3>
                        
                        {saves.length === 0 ? (
                            <div className="text-center py-12">
                                <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400 text-lg">No hay partidas guardadas</p>
                                <p className="text-slate-500 text-sm mt-2">
                                    {mode === 'save' 
                                        ? 'Guarda tu progreso para continuar más tarde'
                                        : 'Comienza una nueva partida o guarda tu progreso actual'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {saves.map((save) => {
                                    const isAutoSave = save.id.startsWith('autosave-');
                                    const isSelected = selectedSave === save.id;
                                    
                                    return (
                                        <div
                                            key={save.id}
                                            onClick={() => setSelectedSave(save.id)}
                                            className={`bg-slate-700 rounded-lg p-4 border-2 transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                                                    : 'border-slate-600 hover:border-slate-500'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="text-lg font-bold text-white">
                                                            {save.name}
                                                        </h4>
                                                        {isAutoSave && (
                                                            <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded font-semibold">
                                                                AUTO
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Users className="w-4 h-4 text-blue-400" />
                                                            <span className="text-slate-300">{save.playerName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="w-4 h-4 text-green-400" />
                                                            <span className="text-slate-300">{save.stats.turnsPlayed} turnos</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-3 mb-3 bg-slate-800/50 rounded-lg p-3">
                                                        <div>
                                                            <p className="text-xs text-slate-500">PIB</p>
                                                            <p className="text-sm font-bold text-green-400">${save.stats.gdp.toFixed(0)}B</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500">Popularidad</p>
                                                            <p className="text-sm font-bold text-blue-400">{save.stats.popularity.toFixed(1)}%</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500">Estabilidad</p>
                                                            <p className="text-sm font-bold text-yellow-400">{save.stats.stability.toFixed(1)}%</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4 text-xs text-slate-400">
                                                        <span>📅 Fecha: {formatGameDate(save.gameDate)}</span>
                                                        <span>💾 Guardado: {formatDate(save.savedAt)}</span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex flex-col gap-2 ml-4">
                                                    {mode === 'load' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleLoad(save.id);
                                                            }}
                                                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            Cargar
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(save.id);
                                                        }}
                                                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-900/50 border-t border-slate-700 p-4 flex justify-between items-center">
                    <p className="text-slate-400 text-sm">
                        💡 Tip: Las partidas se guardan localmente en tu navegador
                    </p>
                    <button
                        onClick={onClose}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
