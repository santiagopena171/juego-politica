import React, { useState } from 'react';
import type { Country } from '../data/countries';

interface WorldMapProps {
    countries: Country[];
    onSelectCountry: (country: Country) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({ countries, onSelectCountry }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

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

    const handleCountryClick = (country: Country) => {
        setSelectedId(country.id);
        onSelectCountry(country);
    };

    return (
        <div className="w-full h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative flex flex-col p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-200">Mapa Geopolítico</h2>
                <p className="text-sm text-slate-400">Vista por regiones - Click para seleccionar</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">
                {Object.entries(byRegion).map(([region, regionCountries]) => (
                    <div key={region}>
                        <h3 className="text-lg font-bold text-blue-400 mb-3">{region}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {regionCountries.map(country => (
                                <button
                                    key={country.id}
                                    onClick={() => handleCountryClick(country)}
                                    className={`
                                        flex flex-col items-start p-3 rounded-lg border-2 transition-all
                                        ${selectedId === country.id
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-slate-700 hover:border-slate-600 bg-slate-800'
                                        }
                                    `}
                                >
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
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
