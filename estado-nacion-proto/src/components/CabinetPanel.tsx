import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Briefcase, AlertTriangle, Shield, Heart, Book, Truck, Leaf, DollarSign, UserCheck } from 'lucide-react';
import type { Minister, MinistryType } from '../types/politics';
import { calculateMinistryEffectiveness } from '../systems/politics';
import { MinisterSelectionModal } from './MinisterSelectionModal';
import { MINISTER_TRAITS } from '../types/ministerTraits';

const MINISTRY_ICONS: Record<MinistryType, React.ReactNode> = {
    'Economy': <DollarSign size={18} />,
    'Foreign': <Briefcase size={18} />,
    'Interior': <Shield size={18} />,
    'Defense': <Shield size={18} />,
    'Health': <Heart size={18} />,
    'Education': <Book size={18} />,
    'Infrastructure': <Truck size={18} />,
    'Environment': <Leaf size={18} />,
};

const MINISTRY_NAMES: Record<MinistryType, string> = {
    'Economy': 'Economía',
    'Foreign': 'Relaciones Exteriores',
    'Interior': 'Interior',
    'Defense': 'Defensa',
    'Health': 'Salud',
    'Education': 'Educación',
    'Infrastructure': 'Infraestructura',
    'Environment': 'Medio Ambiente',
};

export const CabinetPanel = () => {
    const { state, dispatch } = useGame();
    const { government } = state;
    const [selectedMinistryForReplacement, setSelectedMinistryForReplacement] = useState<Minister | null>(null);

    const getEffectivenessColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 50) return 'text-blue-400';
        if (score >= 30) return 'text-yellow-400';
        return 'text-red-400';
    };

    const handleSelectMinister = (newMinister: Minister) => {
        dispatch({
            type: 'APPOINT_MINISTER',
            payload: { minister: newMinister }
        });
        setSelectedMinistryForReplacement(null);
    };

    // Get country context for candidate generation
    const getCountryContext = () => {
        const country = state.diplomacy.countries.find(c => c.id === state.player.countryId);
        return {
            ideology: state.player.ideology,
            corruption: country?.stats.corruption || 50,
            militarySpending: country?.stats.militarySpending || 2,
            freedom: country?.stats.freedom || 70
        };
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-100">Gabinete de Ministros</h2>
                    <p className="text-sm text-slate-400">Gestión del equipo de gobierno</p>
                </div>
                <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Efectividad Promedio</div>
                    <div className="text-xl font-mono text-blue-300 font-bold">
                        {(government.ministers.reduce((acc, m) => acc + calculateMinistryEffectiveness(m), 0) / government.ministers.length).toFixed(1)}%
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {government.ministers.map((minister) => {
                    const effectiveness = calculateMinistryEffectiveness(minister);
                    return (
                        <div key={minister.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-500 transition-all group relative overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-700 text-blue-400">
                                        {MINISTRY_ICONS[minister.ministry]}
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                                            {MINISTRY_NAMES[minister.ministry]}
                                        </div>
                                        <div className={`text-sm font-bold ${getEffectivenessColor(effectiveness)}`}>
                                            {effectiveness}% efectivo
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Minister Name */}
                            <h3 className="text-lg font-bold text-white mb-1">{minister.name}</h3>
                            <div className="text-xs text-slate-400 mb-3">
                                {minister.age} años, {minister.gender === 'M' ? 'M' : minister.gender === 'F' ? 'F' : 'NB'}
                                {minister.ideology && ` • ${minister.ideology}`}
                            </div>

                            {/* Biography */}
                            <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                                    {minister.biography}
                                </p>
                            </div>

                            {/* Traits */}
                            {minister.traitIds && minister.traitIds.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {minister.traitIds.slice(0, 3).map(traitId => {
                                        const trait = MINISTER_TRAITS[traitId];
                                        if (!trait) return null;
                                        return (
                                            <span
                                                key={traitId}
                                                className="px-2 py-0.5 bg-blue-900/50 text-blue-300 border border-blue-700 rounded text-xs"
                                                title={trait.description}
                                            >
                                                {trait.name}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Competencia</div>
                                    <div className="bg-slate-950 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{ width: `${minister.stats.competence}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Lealtad</div>
                                    <div className="bg-slate-950 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500"
                                            style={{ width: `${minister.stats.loyalty}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Popularidad</div>
                                    <div className="bg-slate-950 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-green-500"
                                            style={{ width: `${minister.stats.popularity}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Corrupción</div>
                                    <div className="bg-slate-950 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-red-500"
                                            style={{ width: `${minister.stats.corruption}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Info */}
                            <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-700/50">
                                <div>
                                    {minister.scandalsCount > 0 && (
                                        <span className="px-1.5 py-0.5 bg-red-900 rounded text-red-300 border border-red-700">
                                            {minister.scandalsCount} escándalos
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedMinistryForReplacement(minister)}
                                    className="flex items-center gap-1 px-3 py-1 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-700 rounded-lg transition-colors"
                                >
                                    <UserCheck className="w-3 h-3" />
                                    Reemplazar
                                </button>
                            </div>

                            {/* Corruption Warning */}
                            {minister.stats.corruption > 60 && (
                                <div className="absolute top-3 right-3 p-1.5 bg-red-900/80 rounded-full">
                                    <AlertTriangle size={14} className="text-red-200" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Minister Selection Modal */}
            {selectedMinistryForReplacement && (
                <MinisterSelectionModal
                    ministry={selectedMinistryForReplacement.ministry}
                    currentMinister={selectedMinistryForReplacement}
                    countryContext={getCountryContext()}
                    onSelect={handleSelectMinister}
                    onClose={() => setSelectedMinistryForReplacement(null)}
                />
            )}
        </div>
    );
};
