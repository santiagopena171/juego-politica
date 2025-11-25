import { useGame } from '../context/GameContext';
import { Shield, Handshake, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import type { Country } from '../data/countries';

interface DiplomacyPanelProps {
    countries?: Country[];
    selectedCountryId?: string | null;
    onSelectCountry?: (countryId: string | null) => void;
}

export const DiplomacyPanel: React.FC<DiplomacyPanelProps> = ({
    countries: propCountries,
    selectedCountryId,
    onSelectCountry
}) => {
    const { state, dispatch } = useGame();
    const { diplomacy, resources } = state;

    const countries = propCountries || diplomacy.countries;
    const selectedCountry = selectedCountryId ? countries.find(c => c.id === selectedCountryId) : null;

    const handleAction = (countryId: string, action: 'IMPROVE' | 'HARM' | 'TRADE_TREATY' | 'DEFENSE_TREATY') => {
        dispatch({ type: 'DIPLOMACY_ACTION', payload: { countryId, action } });
    };

    if (selectedCountry) {
        return (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                    {onSelectCountry && (
                        <button
                            onClick={() => onSelectCountry(null)}
                            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h2 className="text-xl font-bold text-slate-200">Detalles Diplomáticos</h2>
                </div>

                <div className="flex flex-col items-center mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <span className="text-6xl mb-4">{selectedCountry.flag}</span>
                    <h3 className="text-2xl font-bold text-white mb-1">{selectedCountry.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-600">{selectedCountry.ideology}</span>
                        <span>•</span>
                        <span>{selectedCountry.region}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-900/30 p-3 rounded border border-slate-700/30">
                        <div className="text-xs text-slate-500 mb-1">Relación</div>
                        <div className={`text-xl font-bold ${selectedCountry.relation >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                            {selectedCountry.relation}/100
                        </div>
                    </div>
                    <div className="bg-slate-900/30 p-3 rounded border border-slate-700/30">
                        <div className="text-xs text-slate-500 mb-1">PIB</div>
                        <div className="text-xl font-mono text-blue-300">${selectedCountry.stats.gdp}B</div>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tratados Vigentes</h4>
                    <div className="flex gap-2">
                        {selectedCountry.treaties.trade ? (
                            <span className="px-3 py-1 bg-blue-900/30 text-blue-300 border border-blue-800 rounded text-sm flex items-center gap-2">
                                <TrendingUp size={14} /> Libre Comercio
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-slate-800 text-slate-500 border border-slate-700 rounded text-sm italic">Sin acuerdos comerciales</span>
                        )}

                        {selectedCountry.treaties.defense ? (
                            <span className="px-3 py-1 bg-purple-900/30 text-purple-300 border border-purple-800 rounded text-sm flex items-center gap-2">
                                <Shield size={14} /> Alianza Militar
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-slate-800 text-slate-500 border border-slate-700 rounded text-sm italic">Sin alianzas</span>
                        )}
                    </div>
                </div>

                <div className="mt-auto space-y-3">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Acciones Diplomáticas</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleAction(selectedCountry.id, 'IMPROVE')}
                            className="bg-slate-700 hover:bg-slate-600 p-3 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <Handshake size={16} className="text-green-400" /> Mejorar Relaciones
                        </button>
                        <button
                            onClick={() => handleAction(selectedCountry.id, 'HARM')}
                            className="bg-slate-700 hover:bg-red-900/30 p-3 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <TrendingDown size={16} className="text-red-400" /> Tensar Relaciones
                        </button>
                        <button
                            onClick={() => handleAction(selectedCountry.id, 'TRADE_TREATY')}
                            className={`p-3 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors border ${selectedCountry.treaties.trade
                                ? 'bg-blue-900/20 border-blue-800 text-blue-300 hover:bg-blue-900/40'
                                : 'bg-slate-700 border-transparent hover:bg-slate-600'
                                }`}
                        >
                            <TrendingUp size={16} /> {selectedCountry.treaties.trade ? 'Cancelar TLC' : 'Proponer TLC'}
                        </button>
                        <button
                            onClick={() => handleAction(selectedCountry.id, 'DEFENSE_TREATY')}
                            className={`p-3 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors border ${selectedCountry.treaties.defense
                                ? 'bg-purple-900/20 border-purple-800 text-purple-300 hover:bg-purple-900/40'
                                : 'bg-slate-700 border-transparent hover:bg-slate-600'
                                }`}
                        >
                            <Shield size={16} /> {selectedCountry.treaties.defense ? 'Romper Alianza' : 'Proponer Alianza'}
                        </button>
                    </div>
                    <div className="text-center text-xs text-slate-500 mt-2">
                        Capital Político: <span className="text-amber-500 font-bold">{resources.politicalCapital}</span>
                    </div>
                </div>
            </div>
        );
    }

    // List View (Default)
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-300">Relaciones Internacionales</h2>
                <div className="text-sm text-slate-400">
                    CP: <span className="text-amber-500 font-bold">{resources.politicalCapital}</span>
                </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {countries.map(country => (
                    <div
                        key={country.id}
                        onClick={() => onSelectCountry && onSelectCountry(country.id)}
                        className={`bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-slate-500 transition-all cursor-pointer ${selectedCountryId === country.id ? 'ring-2 ring-blue-500' : ''}`}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{country.flag}</span>
                                <div>
                                    <h3 className="font-bold text-white text-sm">{country.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <div className={`w-2 h-2 rounded-full ${country.relation >= 50 ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span>Rel: {country.relation}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {country.treaties.trade && <TrendingUp size={14} className="text-blue-400" />}
                                {country.treaties.defense && <Shield size={14} className="text-purple-400" />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
