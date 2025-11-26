import React, { useState } from 'react';
import { Shield, Flame, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import type { Country } from '../data/countries';
import { useGame } from '../context/GameContext';
import { ALLIANCES, getAlliancesForCountry } from '../data/alliances';

interface WorldMapProps {
    countries: Country[];
    onSelectCountry: (country: Country) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({ countries, onSelectCountry }) => {
    const { state } = useGame();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filterMode, setFilterMode] = useState<'all' | 'alliances' | 'wars' | 'tensions'>('all');

    // Group countries by region
    const byRegion = countries.reduce((acc, country) => {
        const region = country.region || 'Other';
        if (!acc[region]) acc[region] = [];
        acc[region].push(country);
        return acc;
    }, {} as Record<string, Country[]>);

    const getColorFromRelation = (relation: number) => {
        if (relation < 30) return 'bg-red-500';
        if (relation < 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    // Get alliance color for a country
    const getAllianceColor = (countryId: string): string | null => {
        const countryAlliances = getAlliancesForCountry(countryId);
        if (countryAlliances.length === 0) return null;
        
        // Priority colors for major alliances
        const allianceColors: Record<string, string> = {
            'NATO': 'border-blue-500 bg-blue-500/20',
            'EU': 'border-purple-500 bg-purple-500/20',
            'BRICS': 'border-yellow-500 bg-yellow-500/20',
            'ASEAN': 'border-green-500 bg-green-500/20',
            'AU': 'border-orange-500 bg-orange-500/20',
            'OAS': 'border-cyan-500 bg-cyan-500/20',
        };
        
        for (const alliance of countryAlliances) {
            if (allianceColors[alliance.id]) {
                return allianceColors[alliance.id];
            }
        }
        
        return 'border-gray-500 bg-gray-500/20';
    };

    // Check if country is at war
    const isAtWar = (countryId: string): boolean => {
        return state.geopolitics.activeWars.some(
            war => war.aggressorCountry === countryId || war.defenderCountry === countryId
        );
    };

    // Check if country has refugee crisis
    const hasRefugeeCrisis = (countryId: string): boolean => {
        return state.geopolitics.refugeeCrises.some(crisis => crisis.originCountry === countryId);
    };

    // Get tension level for display
    const getTensionLevel = () => {
        const tension = state.geopolitics.globalTension;
        if (tension < 30) return { text: 'Baja', color: 'text-green-400', bgColor: 'bg-green-500/20' };
        if (tension < 60) return { text: 'Media', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
        if (tension < 80) return { text: 'Alta', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
        return { text: 'Crítica', color: 'text-red-400', bgColor: 'bg-red-500/20' };
    };

    const handleCountryClick = (country: Country) => {
        setSelectedId(country.id);
        onSelectCountry(country);
    };

    const tensionLevel = getTensionLevel();

    return (
        <div className="w-full h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative flex flex-col p-6">
            {/* Header with filters and stats */}
            <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-200">Mapa Geopolítico</h2>
                        <p className="text-sm text-slate-400">Vista por regiones - Click para seleccionar</p>
                    </div>
                    
                    {/* Global Tension Indicator */}
                    <div className={`${tensionLevel.bgColor} border-2 border-${tensionLevel.color.replace('text-', '')} rounded-lg p-3`}>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className={`w-5 h-5 ${tensionLevel.color}`} />
                            <div>
                                <p className="text-xs text-slate-400">Tensión Global</p>
                                <p className={`text-lg font-bold ${tensionLevel.color}`}>
                                    {state.geopolitics.globalTension.toFixed(0)}% - {tensionLevel.text}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterMode('all')}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                            filterMode === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        Todos los Países
                    </button>
                    <button
                        onClick={() => setFilterMode('alliances')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                            filterMode === 'alliances'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        <Shield className="w-4 h-4" />
                        Alianzas ({state.geopolitics.playerAlliances.length})
                    </button>
                    <button
                        onClick={() => setFilterMode('wars')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                            filterMode === 'wars'
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        <Flame className="w-4 h-4" />
                        Conflictos ({state.geopolitics.activeWars.length})
                    </button>
                    <button
                        onClick={() => setFilterMode('tensions')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                            filterMode === 'tensions'
                                ? 'bg-orange-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        Crisis Refugiados ({state.geopolitics.refugeeCrises.length})
                    </button>
                </div>

                {/* Legend */}
                <div className="flex gap-4 text-xs text-slate-400 bg-slate-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span>Alianza</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-red-400" />
                        <span>En Guerra</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-orange-400" />
                        <span>Crisis Refugiados</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span>Alta Relación (70+)</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">{Object.entries(byRegion).map(([region, regionCountries]) => (
                    <div key={region}>
                        <h3 className="text-lg font-bold text-blue-400 mb-3">{region}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {regionCountries.map(country => {
                                const allianceColor = getAllianceColor(country.id);
                                const atWar = isAtWar(country.id);
                                const refugeeCrisis = hasRefugeeCrisis(country.id);
                                const countryAlliances = getAlliancesForCountry(country.id);
                                
                                return (
                                    <button
                                        key={country.id}
                                        onClick={() => handleCountryClick(country)}
                                        className={`
                                            relative flex flex-col items-start p-3 rounded-lg border-2 transition-all
                                            ${selectedId === country.id
                                                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                                                : allianceColor && filterMode === 'alliances'
                                                    ? allianceColor
                                                    : 'border-slate-700 hover:border-slate-600 bg-slate-800'
                                            }
                                        `}
                                    >
                                        {/* Status Badges */}
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            {atWar && (
                                                <div className="bg-red-500 rounded-full p-1" title="En Guerra">
                                                    <Flame className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                            {refugeeCrisis && (
                                                <div className="bg-orange-500 rounded-full p-1" title="Crisis de Refugiados">
                                                    <Users className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                            {countryAlliances.length > 0 && filterMode === 'alliances' && (
                                                <div className="bg-purple-500 rounded-full p-1" title={countryAlliances.map(a => a.name).join(', ')}>
                                                    <Shield className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 w-full mb-2">
                                            <span className="text-2xl">{country.flag}</span>
                                            <span className="font-bold text-slate-200 text-sm">{country.name}</span>
                                        </div>

                                        <div className="w-full space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400">PIB:</span>
                                                <span className="text-slate-300">${country.stats.gdp}B</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400">Ideología:</span>
                                                <span className="text-slate-300">{country.ideology}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400">Estabilidad:</span>
                                                <span className={`font-bold ${country.stats.stability > 60 ? 'text-green-400' : country.stats.stability > 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                    {country.stats.stability}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs pt-1 border-t border-slate-700 mt-1">
                                                <span className="text-slate-400">Relación:</span>
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-2 h-2 rounded-full ${getColorFromRelation(country.relation)}`} />
                                                    <span className="text-slate-300">{country.relation}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Alliance membership (if in alliance mode) */}
                                            {filterMode === 'alliances' && countryAlliances.length > 0 && (
                                                <div className="pt-1 border-t border-slate-700 mt-1">
                                                    <p className="text-xs text-purple-400 truncate" title={countryAlliances.map(a => a.name).join(', ')}>
                                                        {countryAlliances[0].id}
                                                        {countryAlliances.length > 1 && ` +${countryAlliances.length - 1}`}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
