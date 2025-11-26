/**
 * WarRoom - Sala de Guerra para gestión de conflictos militares
 * Muestra guerras activas, estrategias, bajas, y opciones de paz
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
    Swords, 
    Shield, 
    Skull, 
    DollarSign, 
    Flag, 
    Target, 
    TrendingUp, 
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Plane,
    Users,
    Zap,
    Clock,
    HandshakeIcon
} from 'lucide-react';

const STRATEGY_INFO = {
    defensive: {
        name: 'Defensiva',
        icon: <Shield className="w-5 h-5" />,
        description: 'Minimiza bajas, protege territorio',
        color: 'from-blue-600 to-blue-500',
        stats: { offense: 0.5, defense: 1.5, casualties: 0.7 }
    },
    offensive: {
        name: 'Ofensiva Total',
        icon: <Swords className="w-5 h-5" />,
        description: 'Máximo daño al enemigo',
        color: 'from-red-600 to-red-500',
        stats: { offense: 1.5, defense: 0.8, casualties: 1.3 }
    },
    air_superiority: {
        name: 'Superioridad Aérea',
        icon: <Plane className="w-5 h-5" />,
        description: 'Bombardeos estratégicos',
        color: 'from-sky-600 to-sky-500',
        stats: { offense: 1.2, defense: 1.0, casualties: 0.9 }
    },
    guerrilla: {
        name: 'Guerra de Guerrillas',
        icon: <Users className="w-5 h-5" />,
        description: 'Desgaste lento del enemigo',
        color: 'from-green-600 to-green-500',
        stats: { offense: 0.8, defense: 1.2, casualties: 0.6 }
    },
    blitzkrieg: {
        name: 'Guerra Relámpago',
        icon: <Zap className="w-5 h-5" />,
        description: 'Ataque rápido y devastador',
        color: 'from-yellow-600 to-yellow-500',
        stats: { offense: 2.0, defense: 0.5, casualties: 1.5 }
    },
    attrition: {
        name: 'Guerra de Desgaste',
        icon: <Clock className="w-5 h-5" />,
        description: 'Agotar recursos del enemigo',
        color: 'from-purple-600 to-purple-500',
        stats: { offense: 1.0, defense: 1.0, casualties: 1.0 }
    }
};

const WAR_STATE_INFO: Record<string, { name: string; color: string; icon: string }> = {
    'peace': { name: 'Paz', color: 'text-green-400', icon: '🕊️' },
    'tension': { name: 'Tensión', color: 'text-yellow-400', icon: '⚠️' },
    'skirmish': { name: 'Escaramuzas', color: 'text-orange-400', icon: '⚔️' },
    'proxy_war': { name: 'Guerra Proxy', color: 'text-orange-500', icon: '🎭' },
    'limited_war': { name: 'Guerra Limitada', color: 'text-red-400', icon: '💥' },
    'total_war': { name: 'Guerra Total', color: 'text-red-600', icon: '☢️' }
};

export const WarRoom: React.FC = () => {
    const { state, dispatch } = useGame();
    const [selectedWarId, setSelectedWarId] = useState<string | null>(null);
    const [selectedStrategy, setSelectedStrategy] = useState<string>('');

    const activeWars = state.geopolitics.activeWars;
    const selectedWar = activeWars.find(w => w.id === selectedWarId);
    const playerCountryId = state.player.countryId;

    const handleChangeStrategy = (warId: string, strategy: string) => {
        dispatch({
            type: 'CHANGE_WAR_STRATEGY',
            payload: { warId, newStrategy: strategy as 'defensive' | 'offensive' | 'air_superiority' | 'guerrilla' | 'blitzkrieg' | 'attrition' }
        });
        setSelectedStrategy('');
    };

    const handleProposePeace = (warId: string) => {
        dispatch({
            type: 'PROPOSE_PEACE',
            payload: { warId, terms: { territoryChanges: [], reparations: 0 } }
        });
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('es-ES').format(Math.round(num));
    };

    const getTotalCasualties = (war: typeof activeWars[0]) => {
        return war.casualties;
    };

    const getWarIntensity = (war: typeof activeWars[0]) => {
        if (war.state === 'total_war') return 100;
        if (war.state === 'limited_war') return 60;
        if (war.state === 'proxy_war') return 40;
        if (war.state === 'skirmish') return 30;
        if (war.state === 'tension') return 20;
        return 10; // peace
    };

    return (
        <div className="bg-slate-800 rounded-xl shadow-2xl p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="bg-red-600 p-3 rounded-lg">
                        <Swords className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Sala de Guerra</h2>
                        <p className="text-slate-400">Centro de Comando Militar</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-400">Conflictos Activos</p>
                    <p className="text-3xl font-bold text-red-400">{activeWars.length}</p>
                </div>
            </div>

            {activeWars.length === 0 ? (
                <div className="text-center py-16">
                    <Shield className="w-24 h-24 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Tiempo de Paz</h3>
                    <p className="text-slate-400 text-lg">No hay conflictos militares activos</p>
                    <p className="text-slate-500 text-sm mt-2">
                        La diplomacia mantiene la estabilidad mundial
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* War List */}
                    <div className="lg:col-span-1 space-y-3">
                        <h3 className="text-lg font-bold text-white mb-3">Guerras Activas</h3>
                        {activeWars.map(war => {
                            const stateInfo = WAR_STATE_INFO[war.state];
                            const isPlayerInvolved = war.aggressorCountry === playerCountryId || war.defenderCountry === playerCountryId;
                            const isSelected = selectedWarId === war.id;

                            return (
                                <div
                                    key={war.id}
                                    onClick={() => setSelectedWarId(war.id)}
                                    className={`bg-slate-700 rounded-lg p-4 cursor-pointer transition-all border-2 ${
                                        isSelected 
                                            ? 'border-red-500 shadow-lg shadow-red-500/20' 
                                            : 'border-slate-600 hover:border-red-400'
                                    } ${isPlayerInvolved ? 'ring-2 ring-yellow-500/30' : ''}`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-2xl">{stateInfo.icon}</span>
                                                <span className={`text-sm font-bold ${stateInfo.color}`}>
                                                    {stateInfo.name}
                                                </span>
                                            </div>
                                            <p className="text-white font-semibold text-sm">
                                                {war.aggressorCountry} vs {war.defenderCountry}
                                            </p>
                                        </div>
                                        {isPlayerInvolved && (
                                            <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded font-bold">
                                                TÚ
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-3 text-xs text-slate-400 mt-2">
                                        <span>⏱️ {war.duration} meses</span>
                                        <span>💀 {formatNumber(getTotalCasualties(war))} bajas</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* War Details */}
                    <div className="lg:col-span-2">
                        {selectedWar ? (
                            <div className="space-y-4">
                                {/* War Header */}
                                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-2xl font-bold">
                                            {selectedWar.aggressorCountry} ⚔️ {selectedWar.defenderCountry}
                                        </h3>
                                        <span className={`text-lg font-bold ${(WAR_STATE_INFO[selectedWar.state] || WAR_STATE_INFO.peace).color}`}>
                                            {(WAR_STATE_INFO[selectedWar.state] || WAR_STATE_INFO.peace).icon} {(WAR_STATE_INFO[selectedWar.state] || WAR_STATE_INFO.peace).name}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-red-200 text-sm mb-1">Duración</p>
                                            <p className="text-2xl font-bold">⏱️ {selectedWar.duration}</p>
                                            <p className="text-red-200 text-xs">meses</p>
                                        </div>
                                        <div>
                                            <p className="text-red-200 text-sm mb-1">Bajas Totales</p>
                                            <p className="text-2xl font-bold">💀 {formatNumber(getTotalCasualties(selectedWar))}</p>
                                            <p className="text-red-200 text-xs">soldados</p>
                                        </div>
                                        <div>
                                            <p className="text-red-200 text-sm mb-1">Costo Mensual</p>
                                            <p className="text-2xl font-bold">💰 ${formatNumber(selectedWar.monthlyCost)}</p>
                                            <p className="text-red-200 text-xs">millones</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Casualties Total */}
                                <div className="bg-slate-700 rounded-lg p-5">
                                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Skull className="w-5 h-5 text-red-400" />
                                        Bajas Totales del Conflicto
                                    </h4>
                                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
                                        <p className="text-6xl font-bold text-white mb-2">
                                            {formatNumber(selectedWar.casualties)}
                                        </p>
                                        <p className="text-red-300 text-sm">bajas confirmadas (ambos bandos)</p>
                                        <div className="mt-4 flex justify-center gap-8 text-sm">
                                            <div>
                                                <p className="text-red-400 font-semibold">🔴 {selectedWar.aggressorCountry}</p>
                                                <p className="text-slate-300">Agresor</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-400 font-semibold">🔵 {selectedWar.defenderCountry}</p>
                                                <p className="text-slate-300">Defensor</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* War Intensity */}
                                <div className="bg-slate-700 rounded-lg p-5">
                                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Target className="w-5 h-5 text-orange-400" />
                                        Intensidad del Conflicto
                                    </h4>
                                    <div className="relative">
                                        <div className="h-8 bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ${
                                                    getWarIntensity(selectedWar) > 80 ? 'bg-gradient-to-r from-red-600 to-red-500' :
                                                    getWarIntensity(selectedWar) > 50 ? 'bg-gradient-to-r from-orange-600 to-orange-500' :
                                                    'bg-gradient-to-r from-yellow-600 to-yellow-500'
                                                }`}
                                                style={{ width: `${getWarIntensity(selectedWar)}%` }}
                                            />
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-white font-bold text-sm drop-shadow-lg">
                                                {getWarIntensity(selectedWar)}% Intensidad
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Strategy Selection */}
                                {(selectedWar.aggressorCountry === playerCountryId || selectedWar.defenderCountry === playerCountryId) && (
                                    <div className="bg-slate-700 rounded-lg p-5">
                                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-blue-400" />
                                            Tu Estrategia Militar
                                        </h4>
                                        
                                        {/* Current Strategy */}
                                        <div className="mb-4">
                                            {selectedWar.playerStrategy && STRATEGY_INFO[selectedWar.playerStrategy as keyof typeof STRATEGY_INFO] && (
                                                <div className={`bg-gradient-to-r ${STRATEGY_INFO[selectedWar.playerStrategy as keyof typeof STRATEGY_INFO].color} rounded-lg p-4 text-white`}>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        {STRATEGY_INFO[selectedWar.playerStrategy as keyof typeof STRATEGY_INFO].icon}
                                                        <div>
                                                            <p className="font-bold">
                                                                Estrategia Actual: {STRATEGY_INFO[selectedWar.playerStrategy as keyof typeof STRATEGY_INFO].name}
                                                            </p>
                                                            <p className="text-sm opacity-90">
                                                                {STRATEGY_INFO[selectedWar.playerStrategy as keyof typeof STRATEGY_INFO].description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4 text-xs mt-3">
                                                        <span>⚔️ Ataque: {STRATEGY_INFO[selectedWar.playerStrategy as keyof typeof STRATEGY_INFO].stats.offense}x</span>
                                                        <span>🛡️ Defensa: {STRATEGY_INFO[selectedWar.playerStrategy as keyof typeof STRATEGY_INFO].stats.defense}x</span>
                                                        <span>💀 Bajas: {STRATEGY_INFO[selectedWar.playerStrategy as keyof typeof STRATEGY_INFO].stats.casualties}x</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Change Strategy */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                Cambiar Estrategia
                                            </label>
                                            <div className="grid grid-cols-2 gap-2 mb-3">
                                                {Object.entries(STRATEGY_INFO).map(([key, info]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => setSelectedStrategy(key)}
                                                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                                                            selectedStrategy === key
                                                                ? 'border-blue-500 bg-blue-500/20'
                                                                : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {info.icon}
                                                            <span className="text-white text-sm font-bold">{info.name}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-400">{info.description}</p>
                                                    </button>
                                                ))}
                                            </div>
                                            {selectedStrategy && selectedStrategy !== selectedWar.playerStrategy && (
                                                <button
                                                    onClick={() => handleChangeStrategy(selectedWar.id, selectedStrategy)}
                                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-2 px-4 rounded-lg font-bold transition-all"
                                                >
                                                    🔄 Aplicar Nueva Estrategia
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Peace Options */}
                                {selectedWar.state !== 'peace' && (
                                    <div className="bg-green-900/20 border-2 border-green-500/30 rounded-lg p-5">
                                        <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                            <HandshakeIcon className="w-5 h-5 text-green-400" />
                                            Opciones de Paz
                                        </h4>
                                        <p className="text-slate-300 text-sm mb-4">
                                            La guerra tiene un alto costo humano y económico. Considera negociar la paz.
                                        </p>
                                        <button
                                            onClick={() => handleProposePeace(selectedWar.id)}
                                            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-3 px-4 rounded-lg font-bold transition-all"
                                        >
                                            ☮️ Proponer Tratado de Paz
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-slate-700 rounded-lg p-12 text-center">
                                <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400 text-lg">
                                    Selecciona una guerra para ver detalles
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
