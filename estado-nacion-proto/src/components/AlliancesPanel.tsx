/**
 * AlliancesPanel - Panel de Gestión de Alianzas y Bloques
 * Permite ver alianzas disponibles, unirse, y gestionar membresías
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
    Shield, 
    Users, 
    DollarSign, 
    TrendingUp, 
    Globe, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    Star,
    Crown,
    Target
} from 'lucide-react';
import { ALLIANCES, getAlliancesForCountry, meetsAllianceRequirements } from '../data/alliances';

const ALLIANCE_TYPE_COLORS = {
    military: 'from-red-600 to-red-500',
    economic: 'from-green-600 to-green-500',
    regional: 'from-blue-600 to-blue-500',
    ideological: 'from-purple-600 to-purple-500',
};

const ALLIANCE_TYPE_ICONS = {
    military: <Shield className="w-5 h-5" />,
    economic: <DollarSign className="w-5 h-5" />,
    regional: <Globe className="w-5 h-5" />,
    ideological: <Star className="w-5 h-5" />,
};

export const AlliancesPanel: React.FC = () => {
    const { state, dispatch } = useGame();
    const [selectedTab, setSelectedTab] = useState<'my-alliances' | 'available'>('my-alliances');
    const [selectedAllianceId, setSelectedAllianceId] = useState<string | null>(null);

    const playerAlliances = ALLIANCES.filter(a => state.geopolitics.playerAlliances.includes(a.id));
    const availableAlliances = ALLIANCES.filter(a => !state.geopolitics.playerAlliances.includes(a.id));
    
    const selectedAlliance = ALLIANCES.find(a => a.id === selectedAllianceId);

    const handleJoinAlliance = (allianceId: string) => {
        dispatch({
            type: 'REQUEST_JOIN_ALLIANCE',
            payload: { allianceId }
        });
    };

    const handleLeaveAlliance = (allianceId: string) => {
        if (confirm('¿Estás seguro de que quieres abandonar esta alianza? Esto puede tener consecuencias diplomáticas.')) {
            dispatch({
                type: 'LEAVE_ALLIANCE',
                payload: { allianceId }
            });
        }
    };

    const checkRequirements = (allianceId: string) => {
        const alliance = ALLIANCES.find(a => a.id === allianceId);
        if (!alliance) return { meets: false, reasons: ['Alianza no encontrada'] };
        
        return meetsAllianceRequirements(alliance, {
            gdp: state.resources.budget, // Using budget as approximation for GDP
            democracy: 70, // Default since politics not in state
            corruption: 30, // Default
            ideology: state.player.ideology
        });
    };

    return (
        <div className="bg-slate-800 rounded-xl shadow-2xl p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500 p-3 rounded-lg">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Alianzas y Bloques</h2>
                        <p className="text-slate-400">Membresías Internacionales</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-400">Tus Alianzas</p>
                    <p className="text-3xl font-bold text-blue-400">{playerAlliances.length}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setSelectedTab('my-alliances')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                        selectedTab === 'my-alliances'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                    <Shield className="w-5 h-5 inline mr-2" />
                    Mis Alianzas ({playerAlliances.length})
                </button>
                <button
                    onClick={() => setSelectedTab('available')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                        selectedTab === 'available'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                    <Globe className="w-5 h-5 inline mr-2" />
                    Alianzas Disponibles ({availableAlliances.length})
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Alliance List */}
                <div className="lg:col-span-1 space-y-3">
                    {(selectedTab === 'my-alliances' ? playerAlliances : availableAlliances).map(alliance => {
                        const isSelected = selectedAllianceId === alliance.id;

                        return (
                            <div
                                key={alliance.id}
                                onClick={() => setSelectedAllianceId(alliance.id)}
                                className={`bg-slate-700 rounded-lg p-4 cursor-pointer transition-all border-2 ${
                                    isSelected 
                                        ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                                        : 'border-slate-600 hover:border-blue-400'
                                }`}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="bg-blue-600 p-2 rounded-lg">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-white font-bold text-lg">{alliance.name}</h3>
                                        <p className="text-slate-400 text-xs">Fundada: {alliance.founded}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="bg-slate-600 text-slate-300 text-xs px-2 py-1 rounded">
                                        👥 {alliance.members.length} miembros
                                    </span>
                                    <span className="bg-slate-600 text-slate-300 text-xs px-2 py-1 rounded">
                                        💪 Poder: {alliance.militaryPower}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Alliance Details */}
                <div className="lg:col-span-2">
                    {selectedAlliance ? (
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-6 text-white">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-white/20 p-3 rounded-lg">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-bold mb-1">{selectedAlliance.name}</h3>
                                            <p className="text-xs opacity-75 mt-1">Fundada: {selectedAlliance.founded}</p>
                                        </div>
                                    </div>
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                                        {selectedAlliance.ideology === 'military' ? '⚔️ Militar' :
                                         selectedAlliance.ideology === 'economic' ? '💰 Económica' :
                                         selectedAlliance.ideology === 'regional' ? '🌍 Regional' :
                                         '💭 Ideológica'}
                                    </span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-700 rounded-lg p-4 text-center">
                                    <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{selectedAlliance.members.length}</p>
                                    <p className="text-slate-400 text-sm">Miembros</p>
                                </div>
                                {selectedAlliance.militaryPower !== undefined && (
                                    <div className="bg-slate-700 rounded-lg p-4 text-center">
                                        <Shield className="w-6 h-6 text-red-400 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-white">{selectedAlliance.militaryPower}</p>
                                        <p className="text-slate-400 text-sm">Poder Militar</p>
                                    </div>
                                )}
                                {selectedAlliance.economicPower !== undefined && (
                                    <div className="bg-slate-700 rounded-lg p-4 text-center">
                                        <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-white">{selectedAlliance.economicPower}</p>
                                        <p className="text-slate-400 text-sm">Poder Económico</p>
                                    </div>
                                )}
                            </div>

                            {/* Members */}
                            <div className="bg-slate-700 rounded-lg p-5">
                                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <Crown className="w-5 h-5 text-yellow-400" />
                                    Países Miembros
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedAlliance.members.map(member => (
                                        <span 
                                            key={member}
                                            className="bg-slate-600 text-slate-200 px-3 py-1 rounded-full text-sm"
                                        >
                                            {member}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="bg-slate-700 rounded-lg p-5">
                                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-400" />
                                    Beneficios
                                </h4>
                                <div className="space-y-2">
                                    {selectedAlliance.benefits.tradeBonus > 0 && (
                                        <div className="flex items-center gap-3 bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                                            <DollarSign className="w-5 h-5 text-green-400" />
                                            <div>
                                                <p className="text-white font-semibold">Bonificación Comercial</p>
                                                <p className="text-green-300 text-sm">+{selectedAlliance.benefits.tradeBonus}% comercio con miembros</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedAlliance.benefits.militaryProtection && (
                                        <div className="flex items-center gap-3 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                                            <Shield className="w-5 h-5 text-red-400" />
                                            <div>
                                                <p className="text-white font-semibold">Protección Militar</p>
                                                <p className="text-red-300 text-sm">Garantía de defensa colectiva</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedAlliance.benefits.diplomaticSupport > 0 && (
                                        <div className="flex items-center gap-3 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                                            <Users className="w-5 h-5 text-blue-400" />
                                            <div>
                                                <p className="text-white font-semibold">Apoyo Diplomático</p>
                                                <p className="text-blue-300 text-sm">+{selectedAlliance.benefits.diplomaticSupport}% influencia internacional</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Obligations */}
                            <div className="bg-slate-700 rounded-lg p-5">
                                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-orange-400" />
                                    Obligaciones
                                </h4>
                                <div className="space-y-2">
                                    {selectedAlliance.obligations.minMilitarySpending > 0 && (
                                        <div className="flex items-center gap-3 bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                                            <AlertTriangle className="w-5 h-5 text-orange-400" />
                                            <div>
                                                <p className="text-white font-semibold">Gasto Militar Mínimo</p>
                                                <p className="text-orange-300 text-sm">{selectedAlliance.obligations.minMilitarySpending}% del PIB</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedAlliance.obligations.votingAlignment && (
                                        <div className="flex items-center gap-3 bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                                            <CheckCircle className="w-5 h-5 text-purple-400" />
                                            <div>
                                                <p className="text-white font-semibold">Alineamiento de Voto</p>
                                                <p className="text-purple-300 text-sm">Coordinar votos en foros internacionales</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedAlliance.obligations.sharedSanctions && (
                                        <div className="flex items-center gap-3 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                                            <XCircle className="w-5 h-5 text-red-400" />
                                            <div>
                                                <p className="text-white font-semibold">Sanciones Compartidas</p>
                                                <p className="text-red-300 text-sm">Debes unirte a sanciones del bloque</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Requirements (for available alliances) */}
                            {!state.geopolitics.playerAlliances.includes(selectedAlliance.id) && (() => {
                                const reqCheck = checkRequirements(selectedAlliance.id);
                                return (
                                    <div className="bg-slate-700 rounded-lg p-5">
                                        <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-blue-400" />
                                            Requisitos de Ingreso
                                        </h4>
                                        <div className="space-y-2">
                                            {selectedAlliance.requirements.minGDP && (
                                                <div className={`flex items-center gap-3 rounded-lg p-3 ${
                                                    state.resources.budget >= selectedAlliance.requirements.minGDP
                                                        ? 'bg-green-900/20 border border-green-500/30'
                                                        : 'bg-red-900/20 border border-red-500/30'
                                                }`}>
                                                    {state.resources.budget >= selectedAlliance.requirements.minGDP ? (
                                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-400" />
                                                    )}
                                                    <div>
                                                        <p className="text-white font-semibold">PIB Mínimo</p>
                                                        <p className={`text-sm ${
                                                            state.resources.budget >= selectedAlliance.requirements.minGDP
                                                                ? 'text-green-300'
                                                                : 'text-red-300'
                                                        }`}>
                                                            Requiere ${selectedAlliance.requirements.minGDP}B (Tienes ${ state.resources.budget.toFixed(0)}B)
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedAlliance.requirements.minDemocracy !== undefined && (
                                                <div className="flex items-center gap-3 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                                                    <CheckCircle className="w-5 h-5 text-blue-400" />
                                                    <div>
                                                        <p className="text-white font-semibold">Índice Democrático</p>
                                                        <p className="text-blue-300 text-sm">
                                                            Requiere {selectedAlliance.requirements.minDemocracy}/100
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {!reqCheck.meets && (
                                                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mt-3">
                                                    <p className="text-red-300 font-semibold mb-2">Razones del rechazo:</p>
                                                    <ul className="text-sm text-red-400 space-y-1">
                                                        {reqCheck.reasons.map((reason, idx) => (
                                                            <li key={idx}>• {reason}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Actions */}
                            {state.geopolitics.playerAlliances.includes(selectedAlliance.id) ? (
                                <button
                                    onClick={() => handleLeaveAlliance(selectedAlliance.id)}
                                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white py-3 px-6 rounded-lg font-bold text-lg transition-all shadow-lg"
                                >
                                    🚪 Abandonar Alianza
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleJoinAlliance(selectedAlliance.id)}
                                    disabled={!checkRequirements(selectedAlliance.id).meets}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-bold text-lg transition-all shadow-lg"
                                >
                                    {checkRequirements(selectedAlliance.id).meets ? '🤝 Solicitar Ingreso' : '🔒 No Cumples Requisitos'}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bg-slate-700 rounded-lg p-12 text-center">
                            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400 text-lg">
                                Selecciona una alianza para ver detalles
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
