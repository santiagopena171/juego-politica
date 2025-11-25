import { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { User, Globe, BookOpen, CheckCircle, Flag, Search } from 'lucide-react';
import { loadCountries } from '../data/loader';

const ALL_COUNTRIES = loadCountries();

const IDEOLOGIES = [
    {
        id: 'Socialist',
        name: 'Socialista',
        desc: 'Prioridad en el bienestar social y el estado fuerte.',
        bonuses: 'Popularidad +10, Gasto Público +10%'
    },
    {
        id: 'Capitalist',
        name: 'Capitalista',
        desc: 'Mercado libre y fomento a la inversión privada.',
        bonuses: 'PIB +2%, Impuestos -5%'
    },
    {
        id: 'Centrist',
        name: 'Centrista',
        desc: 'Equilibrio y pragmatismo.',
        bonuses: 'Estabilidad +5, Capital Político +10'
    },
    {
        id: 'Authoritarian',
        name: 'Autoritario',
        desc: 'Orden y control por encima de todo.',
        bonuses: 'Estabilidad +15, Popularidad -5'
    }
];

export const NewGameSetup = () => {
    const { dispatch } = useGame();
    const [name, setName] = useState('');
    const [partyName, setPartyName] = useState('');
    const [ideology, setIdeology] = useState(IDEOLOGIES[2]); // Default Centrist
    const [selectedCountryId, setSelectedCountryId] = useState('arg'); // Default Argentina
    const [searchQuery, setSearchQuery] = useState('');

    const selectedCountry = ALL_COUNTRIES.find(c => c.id === selectedCountryId) || ALL_COUNTRIES[0];

    // Filter countries based on search
    const filteredCountries = useMemo(() => {
        if (!searchQuery.trim()) return ALL_COUNTRIES;
        const query = searchQuery.toLowerCase();
        return ALL_COUNTRIES.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.id.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    // Group countries by continent/region and sort alphabetically
    const countriesByContinent = useMemo(() => {
        const grouped = filteredCountries.reduce((acc, country) => {
            const continent = country.region || 'Otros';
            if (!acc[continent]) acc[continent] = [];
            acc[continent].push(country);
            return acc;
        }, {} as Record<string, typeof filteredCountries>);

        // Sort countries within each continent alphabetically
        Object.keys(grouped).forEach(continent => {
            grouped[continent].sort((a, b) => a.name.localeCompare(b.name, 'es'));
        });

        return grouped;
    }, [filteredCountries]);

    const handleStart = () => {
        if (!name || !partyName) return;
        dispatch({
            type: 'START_GAME',
            payload: {
                presidentName: name,
                countryId: selectedCountryId,
                partyName,
                ideology: ideology.id as any
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-200">
            <div className="max-w-6xl w-full bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col lg:flex-row">

                {/* Left Panel: Country Info */}
                <div className="lg:w-1/3 bg-slate-800 p-8 flex flex-col border-r border-slate-700">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="text-6xl">{selectedCountry.flag}</div>
                        <div>
                            <h2 className="text-3xl font-bold text-white">{selectedCountry.name}</h2>
                            <p className="text-slate-400">{selectedCountry.region}</p>
                        </div>
                    </div>

                    <div className="space-y-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Estadísticas Iniciales</h3>
                        <div className="flex justify-between border-b border-slate-700 pb-2">
                            <span className="text-slate-400">PIB (GDP)</span>
                            <span className="font-mono text-blue-400">${selectedCountry.stats.gdp.toLocaleString()} B</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-700 pb-2">
                            <span className="text-slate-400">Población</span>
                            <span className="font-mono text-white">{selectedCountry.stats.population} M</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-700 pb-2">
                            <span className="text-slate-400">PIB per Cápita</span>
                            <span className="font-mono text-green-400">${selectedCountry.stats.gdpPerCapita.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-700 pb-2">
                            <span className="text-slate-400">Desempleo</span>
                            <span className="font-mono text-orange-400">{(selectedCountry.stats.unemployment * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Estabilidad Base</span>
                            <span className="font-mono text-purple-400">{selectedCountry.stats.stability}%</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-6">
                        <p className="text-xs text-slate-500 italic">
                            "El destino de {selectedCountry.name} ahora depende de su liderazgo."
                        </p>
                    </div>
                </div>

                {/* Right Panel: Form */}
                <div className="lg:w-2/3 p-8 overflow-y-auto">
                    <div className="space-y-8 pb-6">

                        {/* Country Selection */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
                                <Globe className="w-4 h-4" /> Seleccionar Nación ({filteredCountries.length} países)
                            </label>

                            {/* Search Bar */}
                            <div className="mb-4 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar país..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Countries Grouped by Continent */}
                            <div className="max-h-96 overflow-y-auto p-1 border border-slate-800 rounded-lg bg-slate-950/50 space-y-4">
                                {Object.entries(countriesByContinent).map(([continent, countries]) => (
                                    <div key={continent}>
                                        <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 px-2 sticky top-0 bg-slate-950/90 py-1">
                                            {continent} ({countries.length})
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {countries.map((country) => (
                                                <button
                                                    key={country.id}
                                                    onClick={() => setSelectedCountryId(country.id)}
                                                    className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 ${selectedCountryId === country.id
                                                        ? 'bg-blue-900/40 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-900'
                                                        }`}
                                                >
                                                    <span className="text-xl">{country.flag}</span>
                                                    <span className="font-semibold text-sm truncate">{country.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* President Name */}
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Nombre del Presidente
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej. Santiago Peña"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Party Name */}
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2 flex items-center gap-2">
                                    <Flag className="w-4 h-4" /> Nombre del Partido
                                </label>
                                <input
                                    type="text"
                                    value={partyName}
                                    onChange={(e) => setPartyName(e.target.value)}
                                    placeholder="Ej. Partido Colorado"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Ideology Selection */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> Ideología del Partido
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {IDEOLOGIES.map((ideo) => (
                                    <button
                                        key={ideo.id}
                                        onClick={() => setIdeology(ideo)}
                                        className={`p-4 rounded-lg border text-left transition-all ${ideology.id === ideo.id
                                            ? 'bg-amber-900/30 border-amber-500 text-amber-100'
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="font-bold text-base mb-1">{ideo.name}</div>
                                        <div className="text-xs opacity-80 mb-2">{ideo.desc}</div>
                                        <div className="text-xs font-mono text-amber-500/80">{ideo.bonuses}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={handleStart}
                            disabled={!name || !partyName}
                            className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${name && partyName
                                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg transform hover:scale-[1.01]'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            <CheckCircle className="w-5 h-5" /> Asumir el Cargo
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};
