import React, { useState, useMemo } from 'react';
import { X, Search, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react';
import type { Minister, MinistryType } from '../types/politics';
import { MINISTER_TRAITS } from '../types/ministerTraits';
import { generateMinisterCandidates } from '../systems/ministerGenerator';

interface MinisterSelectionModalProps {
    ministry: MinistryType;
    currentMinister: Minister;
    countryContext: {
        ideology: 'Socialist' | 'Capitalist' | 'Centrist' | 'Authoritarian';
        corruption: number;
        militarySpending: number;
        freedom: number;
    };
    onSelect: (minister: Minister) => void;
    onClose: () => void;
}

const MINISTRY_NAMES: Record<MinistryType, string> = {
    'Economy': 'Economía',
    'Foreign': 'Relaciones Exteriores',
    'Interior': 'Interior',
    'Defense': 'Defensa',
    'Health': 'Salud',
    'Education': 'Educación',
    'Infrastructure': 'Infraestructura',
    'Environment': 'Medio Ambiente'
};

export const MinisterSelectionModal: React.FC<MinisterSelectionModalProps> = ({
    ministry,
    currentMinister,
    countryContext,
    onSelect,
    onClose
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState<Minister | null>(null);
    const [sortBy, setSortBy] = useState<'competence' | 'loyalty' | 'popularity'>('competence');

    // Generate 25 candidates
    const candidates = useMemo(() => {
        return generateMinisterCandidates(ministry, 25, countryContext);
    }, [ministry, countryContext]);

    // Filter and sort candidates
    const displayedCandidates = useMemo(() => {
        let filtered = candidates;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.biography.toLowerCase().includes(query) ||
                c.traitIds.some(tid => MINISTER_TRAITS[tid]?.name.toLowerCase().includes(query))
            );
        }

        // Sort
        return filtered.sort((a, b) => b.stats[sortBy] - a.stats[sortBy]);
    }, [candidates, searchQuery, sortBy]);

    const getStatColor = (value: number) => {
        if (value >= 75) return 'text-green-400';
        if (value >= 50) return 'text-blue-400';
        if (value >= 25) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getStatBg = (value: number) => {
        if (value >= 75) return 'bg-green-500';
        if (value >= 50) return 'bg-blue-500';
        if (value >= 25) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-7xl w-full max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                            Seleccionar Ministro de {MINISTRY_NAMES[ministry]}
                        </h2>
                        <p className="text-slate-400">
                            Ministro actual: {currentMinister.name} (Competencia: {currentMinister.stats.competence})
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Controls */}
                <div className="p-6 border-b border-slate-700 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nombre, biografía o rasgos..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Sort buttons */}
                    <div className="flex gap-2">
                        <span className="text-sm text-slate-400 flex items-center">Ordenar por:</span>
                        <button
                            onClick={() => setSortBy('competence')}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${sortBy === 'competence' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            Competencia
                        </button>
                        <button
                            onClick={() => setSortBy('loyalty')}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${sortBy === 'loyalty' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            Lealtad
                        </button>
                        <button
                            onClick={() => setSortBy('popularity')}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${sortBy === 'popularity' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            Popularidad
                        </button>
                        <span className="ml-auto text-sm text-slate-400">
                            {displayedCandidates.length} candidatos
                        </span>
                    </div>
                </div>

                {/* Candidates List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 gap-4">
                        {displayedCandidates.map((candidate) => {
                            const isSelected = selectedCandidate?.id === candidate.id;
                            return (
                                <div
                                    key={candidate.id}
                                    onClick={() => setSelectedCandidate(candidate)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                                        ? 'bg-blue-900/30 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        {/* Left: Basic Info */}
                                        <div className="flex-shrink-0 w-48">
                                            <h3 className="font-bold text-lg text-white mb-1">{candidate.name}</h3>
                                            <p className="text-sm text-slate-400 mb-2">
                                                {candidate.age} años, {candidate.gender === 'M' ? 'Masculino' : candidate.gender === 'F' ? 'Femenino' : 'No binario'}
                                            </p>
                                            <p className="text-xs text-slate-500 mb-2">
                                                Ideología: {candidate.ideology}
                                            </p>

                                            {/* Traits */}
                                            <div className="flex flex-wrap gap-1">
                                                {candidate.traitIds.map(traitId => {
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
                                        </div>

                                        {/* Middle: Stats */}
                                        <div className="flex-1 grid grid-cols-3 gap-3">
                                            <div>
                                                <div className="text-xs text-slate-400 mb-1">Competencia</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full ${getStatBg(candidate.stats.competence)}`}
                                                            style={{ width: `${candidate.stats.competence}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-sm font-bold ${getStatColor(candidate.stats.competence)}`}>
                                                        {candidate.stats.competence}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400 mb-1">Lealtad</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full ${getStatBg(candidate.stats.loyalty)}`}
                                                            style={{ width: `${candidate.stats.loyalty}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-sm font-bold ${getStatColor(candidate.stats.loyalty)}`}>
                                                        {candidate.stats.loyalty}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400 mb-1">Popularidad</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full ${getStatBg(candidate.stats.popularity)}`}
                                                            style={{ width: `${candidate.stats.popularity}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-sm font-bold ${getStatColor(candidate.stats.popularity)}`}>
                                                        {candidate.stats.popularity}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400 mb-1">Corrupción</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="h-full bg-red-500"
                                                            style={{ width: `${candidate.stats.corruption}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-bold text-red-400">
                                                        {candidate.stats.corruption}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400 mb-1">Ambición</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full ${getStatBg(candidate.stats.ambition)}`}
                                                            style={{ width: `${candidate.stats.ambition}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-sm font-bold ${getStatColor(candidate.stats.ambition)}`}>
                                                        {candidate.stats.ambition}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400 mb-1">Apoyo Interno</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full ${getStatBg(candidate.stats.internalSupport)}`}
                                                            style={{ width: `${candidate.stats.internalSupport}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-sm font-bold ${getStatColor(candidate.stats.internalSupport)}`}>
                                                        {candidate.stats.internalSupport}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Comparison indicators */}
                                        <div className="flex-shrink-0 w-24 flex flex-col items-center justify-center gap-2">
                                            {candidate.stats.competence > currentMinister.stats.competence ? (
                                                <div className="flex items-center gap-1 text-green-400">
                                                    <TrendingUp className="w-4 h-4" />
                                                    <span className="text-xs font-bold">+{candidate.stats.competence - currentMinister.stats.competence}</span>
                                                </div>
                                            ) : candidate.stats.competence < currentMinister.stats.competence ? (
                                                <div className="flex items-center gap-1 text-red-400">
                                                    <TrendingDown className="w-4 h-4" />
                                                    <span className="text-xs font-bold">{candidate.stats.competence - currentMinister.stats.competence}</span>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-500">Sin cambio</div>
                                            )}

                                            {candidate.stats.competence >= 80 && (
                                                <Award className="w-5 h-5 text-yellow-400" />
                                            )}
                                            {candidate.stats.corruption >= 60 && (
                                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Biography */}
                                    <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            {candidate.biography}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 flex justify-between items-center">
                    <div className="text-sm text-slate-400">
                        {selectedCandidate ? (
                            <>
                                <strong className="text-white">{selectedCandidate.name}</strong> seleccionado
                                {selectedCandidate.id !== currentMinister.id && (
                                    <span className="ml-2 text-yellow-400">
                                        (Costo: {Math.floor(currentMinister.stats.loyalty / 2)} Capital Político)
                                    </span>
                                )}
                            </>
                        ) : (
                            'Selecciona un candidato para continuar'
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => selectedCandidate && onSelect(selectedCandidate)}
                            disabled={!selectedCandidate}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${selectedCandidate
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            Nombrar Ministro
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
