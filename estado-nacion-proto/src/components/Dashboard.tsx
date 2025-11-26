import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Play, Pause, DollarSign, Users, Activity, AlertTriangle, Vote, Globe, Briefcase, TrendingUp, Shield, Swords, Save, FolderOpen } from 'lucide-react';
import { DiplomacyPanel } from './DiplomacyPanel';
import { CabinetPanel } from './CabinetPanel';
import { ParliamentPanel } from './ParliamentPanel';
import { PoliciesPanel } from './PoliciesPanel';
import { SituationsMonitor } from './SituationsMonitor';
import { EventModal } from './EventModal';
import { EmergencyModePanel } from './EmergencyModePanel';
import { NotificationTray } from './NotificationTray';
import { WorldMap } from './WorldMap';
import { VotingResultsModal } from './VotingResultsModal';
import { ParliamentaryEventModal } from './ParliamentaryEventModal';
import { DecisionStack } from './DecisionStack';
import { EconomyPanel } from './EconomyPanel';
import EconomicEventModal from './EconomicEventModal';
import { SocialMonitor } from './SocialMonitor';
import { UNPanel } from './UNPanel';
import { WarRoom } from './WarRoom';
import { AlliancesPanel } from './AlliancesPanel';
import { SaveLoadMenu } from './SaveLoadMenu';
import { autoSave } from '../utils/saveSystem';
import { JudiciaryPanel } from './JudiciaryPanel';
import { GrandProjectsPanel } from './GrandProjectsPanel';

export const Dashboard = () => {
    const { state, dispatch } = useGame();
    const { player, resources, stats, time, diplomacy, parliament, economy } = state;
    const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
    const [view, setView] = useState<'office' | 'map' | 'cabinet' | 'parliament' | 'policies' | 'economy' | 'social' | 'un' | 'warroom' | 'alliances' | 'judiciary' | 'projects'>('office');
    const [saveMenuOpen, setSaveMenuOpen] = useState(false);
    const [saveMenuMode, setSaveMenuMode] = useState<'save' | 'load'>('save');

    // Auto-save every 3 minutes and when important actions happen
    useEffect(() => {
        if (!state.gameStarted) return;

        const interval = setInterval(() => {
            autoSave(state);
            console.log('��ī Auto-guardado completado');
        }, 3 * 60 * 1000); // 3 minutos

        return () => clearInterval(interval);
    }, [state]);

    // Auto-save on critical state changes
    useEffect(() => {
        if (!state.gameStarted) return;
        
        // Save when time advances significantly (every 3 turns)
        const currentTurn = state.time.date.getMonth() + (state.time.date.getFullYear() - 2025) * 12;
        if (currentTurn % 3 === 0 && state.time.isPlaying) {
            autoSave(state);
        }
    }, [state.time.date, state.gameStarted, state.time.isPlaying]);

    const handleOpenSaveMenu = (mode: 'save' | 'load') => {
        setSaveMenuMode(mode);
        setSaveMenuOpen(true);
    };

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', notation: 'compact' }).format(amount * 1_000_000_000);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
            {/* Top Bar */}
            <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-20 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-blue-500/20 shadow-lg">
                                <span className="text-2xl">�������</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-lg leading-tight">{player.countryName}</h1>
                                <div className="text-xs text-slate-400 flex items-center gap-2">
                                    <span className="font-medium text-blue-400">{player.name}</span>
                                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                    <span>{player.partyName} ({player.ideology})</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex flex-wrap gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-700/50">
                            {[
                                { key: 'office', label: 'Oficina', icon: <Briefcase size={16} /> },
                                { key: 'cabinet', label: 'Gabinete', icon: <Users size={16} /> },
                                { key: 'parliament', label: 'Parlamento', icon: <Vote size={16} /> },
                                { key: 'judiciary', label: 'Justicia', icon: <Shield size={16} /> },
                                { key: 'policies', label: 'Gestion', icon: <Briefcase size={16} /> },
                                { key: 'economy', label: 'Economia', icon: <TrendingUp size={16} /> },
                                { key: 'projects', label: 'Proyectos', icon: <Activity size={16} /> },
                                { key: 'social', label: 'Social', icon: <Users size={16} /> },
                                { key: 'map', label: 'Mapa Mundi', icon: <Globe size={16} /> },
                                { key: 'alliances', label: 'Alianzas', icon: <Shield size={16} /> },
                                { key: 'un', label: 'ONU', icon: <Globe size={16} /> },
                                { key: 'warroom', label: 'Guerra', icon: <Swords size={16} /> },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setView(tab.key as any)}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === tab.key
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Save/Load Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleOpenSaveMenu('save')}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg"
                                title="Guardar Partida"
                            >
                                <Save size={18} />
                                <span className="hidden sm:inline">Guardar</span>
                            </button>
                            <button
                                onClick={() => handleOpenSaveMenu('load')}
                                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                                title="Cargar Partida"
                            >
                                <FolderOpen size={18} />
                                <span className="hidden sm:inline">Cargar</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50">
                            <div className="text-right">
                                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Fecha</div>
                                <div className="font-mono font-medium text-blue-200">{formatDate(time.date)}</div>
                            </div>
                            <div className="h-8 w-px bg-slate-700"></div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
                                    className={`p-2 rounded-full hover:bg-slate-700 transition-colors ${!time.isPlaying ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-300'}`}
                                >
                                    {time.isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                </button>
                                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                                    {[1, 2, 3].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => dispatch({ type: 'SET_SPEED', payload: s as 1 | 2 | 3 })}
                                            className={`px-2 py-1 text-xs font-bold rounded ${time.speed === s ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {s}x
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <NotificationTray />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6">
                {view === 'office' ? (
                    <div className="grid grid-cols-12 gap-6">
                        {/* Left Column: Stats & Resources */}
                        <div className="col-span-3 space-y-6">
                            {/* Resources Card */}
                            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-sm">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Recursos Estatales</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-400 flex items-center gap-2"><DollarSign size={14} /> Presupuesto</span>
                                            <span className="font-mono text-emerald-400">{formatMoney(resources.budget)}</span>
                                        </div>
                                        <div className="w-full bg-slate-900 rounded-full h-1.5">
                                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-400 flex items-center gap-2"><Activity size={14} /> Capital Pol+�tico</span>
                                            <span className="font-mono text-blue-400">{resources.politicalCapital} pts</span>
                                        </div>
                                        <div className="w-full bg-slate-900 rounded-full h-1.5">
                                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${resources.politicalCapital}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-400 flex items-center gap-2"><AlertTriangle size={14} /> Estabilidad</span>
                                            <span className="font-mono text-amber-400">{resources.stability}%</span>
                                        </div>
                                        <div className="w-full bg-slate-900 rounded-full h-1.5">
                                            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${resources.stability}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Card */}
                            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-sm">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Indicadores Nacionales</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                        <div className="text-slate-500 text-xs mb-1">PIB Total</div>
                                        <div className="font-mono text-lg text-slate-200">{formatMoney(stats.gdp)}</div>
                                    </div>
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                        <div className="text-slate-500 text-xs mb-1">Poblaci+�n</div>
                                        <div className="font-mono text-lg text-slate-200">{stats.population}M</div>
                                    </div>
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                        <div className="text-slate-500 text-xs mb-1">Desempleo</div>
                                        <div className="font-mono text-lg text-rose-400">{(stats.unemployment * 100).toFixed(1)}%</div>
                                    </div>
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                        <div className="text-slate-500 text-xs mb-1">Inflaci+�n</div>
                                        <div className="font-mono text-lg text-rose-400">{(stats.inflation * 100).toFixed(1)}%</div>
                                    </div>
                                    <div className="col-span-2 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-slate-500 text-xs">Aprobaci+�n Presidencial</div>
                                            <div className="font-bold text-blue-400">{stats.popularity.toFixed(1)}%</div>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${stats.popularity > 50 ? 'bg-blue-500' : 'bg-rose-500'}`}
                                                style={{ width: `${stats.popularity}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center Column: Main Action Area */}
                        <div className="col-span-6 space-y-6">
                            <SituationsMonitor />
                        </div>

                        {/* Right Column: Diplomacy/Advisors */}
                        <div className="col-span-3 space-y-6">
                            <DiplomacyPanel
                                countries={diplomacy.countries}
                                onSelectCountry={setSelectedCountryId}
                                selectedCountryId={selectedCountryId}
                            />
                        </div>
                    </div>
                ) : view === 'cabinet' ? (
                    <CabinetPanel />
                ) : view === 'parliament' ? (
                    <ParliamentPanel />
                ) : view === 'policies' ? (
                    <PoliciesPanel />
                ) : view === 'economy' ? (
                    <EconomyPanel />
                ) : view === 'projects' ? (
                    <div className="p-4">
                        <GrandProjectsPanel />
                    </div>
                ) : view === 'judiciary' ? (
                    <div className="p-4">
                        <JudiciaryPanel />
                    </div>
                ) : view === 'social' ? (
                    <SocialMonitor />
                ) : view === 'alliances' ? (
                    <div className="p-6">
                        <AlliancesPanel />
                    </div>
                ) : view === 'un' ? (
                    <div className="p-6">
                        <UNPanel />
                    </div>
                ) : view === 'warroom' ? (
                    <div className="p-6">
                        <WarRoom />
                    </div>
                ) : (
                    /* Map View */
                    <div className="h-[calc(100vh-8rem)]">
                        <WorldMap
                            countries={diplomacy.countries}
                            onSelectCountry={(c) => setSelectedCountryId(c.id)}
                        />
                        {selectedCountryId && (
                            <div className="fixed right-6 top-24 w-80 z-30 shadow-2xl">
                                <DiplomacyPanel
                                    countries={diplomacy.countries}
                                    onSelectCountry={setSelectedCountryId}
                                    selectedCountryId={selectedCountryId}
                                />
                            </div>
                        )}
                    </div>
                )}
            </main>

            <DecisionStack />

            <EventModal />
            <EmergencyModePanel />
            <ParliamentaryEventModal />
            
            {/* Voting Results Modal */}
            {parliament.lastVoteResult && (
                <VotingResultsModal
                    voteResult={parliament.lastVoteResult}
                    onClose={() => dispatch({ type: 'CLEAR_VOTE_RESULT' })}
                />
            )}

            {/* Economic Event Modal */}
            {economy.economicEvent && economy.economicEvent.remainingDuration === economy.economicEvent.duration && (
                <EconomicEventModal
                    event={economy.economicEvent}
                    onClose={() => {}} // Auto closes - modal shows once at event start
                />
            )}

            {/* Save/Load Menu */}
            <SaveLoadMenu 
                isOpen={saveMenuOpen} 
                onClose={() => setSaveMenuOpen(false)} 
                mode={saveMenuMode} 
            />
        </div>
    );
};



