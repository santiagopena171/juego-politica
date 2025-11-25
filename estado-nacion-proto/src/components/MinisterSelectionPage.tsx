import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Search, Award, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import type { Minister, MinistryType } from '../types/politics';
import { MINISTER_TRAITS } from '../types/ministerTraits';
import { generateMinisterCandidates } from '../systems/ministerGenerator';

const MINISTRY_ORDER: MinistryType[] = [
    'Economy',
    'Foreign',
    'Interior',
    'Defense',
    'Health',
    'Education',
    'Infrastructure',
    'Environment'
];

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

const MINISTRY_DESCRIPTIONS: Record<MinistryType, string> = {
    'Economy': 'Responsable de la política fiscal, monetaria y el desarrollo económico del país.',
    'Foreign': 'Maneja las relaciones diplomáticas y representa al país en el ámbito internacional.',
    'Interior': 'Garantiza la seguridad interna, el orden público y la gobernabilidad.',
    'Defense': 'Dirige las Fuerzas Armadas y la defensa nacional.',
    'Health': 'Administra el sistema de salud pública y las políticas sanitarias.',
    'Education': 'Define la política educativa y supervisa el sistema de enseñanza.',
    'Infrastructure': 'Planifica y ejecuta obras de infraestructura y desarrollo territorial.',
    'Environment': 'Protege el medio ambiente y promueve el desarrollo sostenible.',
};

export const MinisterSelectionPage = () => {
    const { state, dispatch } = useGame();
    const [currentMinistryIndex, setCurrentMinistryIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState<Minister | null>(null);
    const [sortBy, setSortBy] = useState<'competence' | 'loyalty' | 'popularity'>('competence');

    const currentMinistry = MINISTRY_ORDER[currentMinistryIndex];
    const selectedMinisters = state.government.ministers;

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

    // Generate 25 candidates for current ministry
    const candidates = useMemo(() => {
        return generateMinisterCandidates(currentMinistry, 25, getCountryContext());
    }, [currentMinistry]);

    // Filter and sort candidates
    const displayedCandidates = useMemo(() => {
        let filtered = candidates;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.biography.toLowerCase().includes(query) ||
                c.traitIds.some(tid => MINISTER_TRAITS[tid]?.name.toLowerCase().includes(query))
            );
        }

        return filtered.sort((a, b) => b.stats[sortBy] - a.stats[sortBy]);
    }, [candidates, searchQuery, sortBy]);

    const handleAppointMinister = () => {
        if (!selectedCandidate) return;

        dispatch({
            type: 'APPOINT_MINISTER',
            payload: { minister: selectedCandidate }
        });

        // Reset for next ministry
        setSelectedCandidate(null);
        setSearchQuery('');

        // Move to next ministry (component will unmount when 8 ministers are selected)
        if (currentMinistryIndex < MINISTRY_ORDER.length - 1) {
            setCurrentMinistryIndex(currentMinistryIndex + 1);
        }
        // If this was the last ministry, the App.tsx will detect 8 ministers
        // and automatically transition to Dashboard on next render
    };

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

    const isLastMinistry = currentMinistryIndex === MINISTRY_ORDER.length - 1;

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Formar Gabinete - {state.player.countryName}
                            </h1>
                            <p className="text-slate-400">
                                Seleccione a su equipo de gobierno para comenzar su administración
                            </p>
                        </div>
                        <div className="bg-slate-800 px-6 py-3 rounded-lg border border-slate-700">
                            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Progreso</div>
                            <div className="text-2xl font-bold text-blue-400">
                                {selectedMinisters.length} / {MINISTRY_ORDER.length}
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                            style={{ width: `${(selectedMinisters.length / MINISTRY_ORDER.length) * 100}%` }}
                        />
                    </div>

                    {/* Ministry Progress Indicators */}
                    <div className="flex gap-2 mt-4 flex-wrap">
                        {MINISTRY_ORDER.map((ministry, idx) => {
                            const isSelected = selectedMinisters.some(m => m.ministry === ministry);
                            const isCurrent = idx === currentMinistryIndex;
                            return (
                                <div
                                    key={ministry}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isSelected
                                        ? 'bg-green-900/50 text-green-300 border border-green-700'
                                        : isCurrent
                                            ? 'bg-blue-900/50 text-blue-300 border border-blue-500 ring-2 ring-blue-500/50'
                                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                                        }`}
                                >
                                    {isSelected && <CheckCircle className="w-3 h-3 inline mr-1" />}
                                    {MINISTRY_NAMES[ministry]}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Current Ministry Info */}
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-700/50 mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Ministro de {MINISTRY_NAMES[currentMinistry]}
                    </h2>
                    <p className="text-slate-300">
                        {MINISTRY_DESCRIPTIONS[currentMinistry]}
                    </p>
                </div>

                {/* Controls */}
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por nombre, biografía o rasgos..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>

                        {/* Sort buttons */}
                        <div className="flex gap-2 items-center">
                            <span className="text-sm text-slate-400 whitespace-nowrap">Ordenar por:</span>
                            <button
                                onClick={() => setSortBy('competence')}
                                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${sortBy === 'competence'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                Competencia
                            </button>
                            <button
                                onClick={() => setSortBy('loyalty')}
                                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${sortBy === 'loyalty'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                Lealtad
                            </button>
                            <button
                                onClick={() => setSortBy('popularity')}
                                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${sortBy === 'popularity'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                Popularidad
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 text-sm text-slate-400">
                        Mostrando {displayedCandidates.length} de 25 candidatos
                    </div>
                </div>

                {/* Candidates Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {displayedCandidates.map((candidate) => {
                        const isSelected = selectedCandidate?.id === candidate.id;
                        return (
                            <div
                                key={candidate.id}
                                onClick={() => setSelectedCandidate(candidate)}
                                className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                    ? 'bg-blue-900/30 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-[1.02]'
                                    : 'bg-slate-900 border-slate-700 hover:border-slate-600 hover:bg-slate-800/80'
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-xl text-white mb-1">{candidate.name}</h3>
                                        <p className="text-sm text-slate-400">
                                            {candidate.age} años • {candidate.gender === 'M' ? 'Masculino' : candidate.gender === 'F' ? 'Femenino' : 'No binario'}
                                            {candidate.ideology && ` • ${candidate.ideology}`}
                                        </p>
                                    </div>

                                    {/* Indicators */}
                                    <div className="flex flex-col gap-1 items-end">
                                        {candidate.stats.competence >= 80 && (
                                            <Award className="w-5 h-5 text-yellow-400" />
                                        )}
                                        {candidate.stats.corruption >= 60 && (
                                            <AlertTriangle className="w-5 h-5 text-red-400" />
                                        )}
                                    </div>
                                </div>

                                {/* Biography */}
                                <div className="mb-4 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        {candidate.biography}
                                    </p>
                                </div>

                                {/* Traits */}
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {candidate.traitIds.map(traitId => {
                                        const trait = MINISTER_TRAITS[traitId];
                                        if (!trait) return null;
                                        return (
                                            <span
                                                key={traitId}
                                                className="px-2 py-1 bg-blue-900/50 text-blue-300 border border-blue-700 rounded text-xs font-semibold"
                                                title={trait.description}
                                            >
                                                {trait.name}
                                            </span>
                                        );
                                    })}
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-3">
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
                            </div>
                        );
                    })}
                </div>

                {/* Footer - Appointment Button */}
                <div className="sticky bottom-0 bg-slate-950/95 backdrop-blur-sm border-t border-slate-800 p-6 -mx-6">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="text-slate-400">
                            {selectedCandidate ? (
                                <>
                                    <strong className="text-white text-lg">{selectedCandidate.name}</strong> seleccionado
                                    <span className="block text-sm mt-1">
                                        Competencia: {selectedCandidate.stats.competence} •
                                        Lealtad: {selectedCandidate.stats.loyalty} •
                                        Popularidad: {selectedCandidate.stats.popularity}
                                    </span>
                                </>
                            ) : (
                                'Selecciona un candidato para continuar'
                            )}
                        </div>
                        <button
                            onClick={handleAppointMinister}
                            disabled={!selectedCandidate}
                            className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all ${selectedCandidate
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/50 transform hover:scale-105'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            {isLastMinistry ? (
                                <>
                                    <CheckCircle className="w-6 h-6" />
                                    Completar Gabinete
                                </>
                            ) : (
                                <>
                                    Nombrar y Continuar
                                    <ArrowRight className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
