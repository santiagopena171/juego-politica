import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { 
    Play, Pause, Clock, TrendingUp, Users, Shield, AlertTriangle, 
    Globe2, Briefcase, Scale, Landmark, Building2, Swords, Save, FolderOpen,
    Target, Activity, BarChart3
} from 'lucide-react';
import { DiplomacyPanel } from './DiplomacyPanel';
import { CabinetPanel } from './CabinetPanel';
import { ParliamentPanel } from './ParliamentPanel';
import { PoliciesPanel } from './PoliciesPanel';
import { SituationsMonitor } from './SituationsMonitor';
import { EventModal } from './EventModal';
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

type ViewType = 'command' | 'map' | 'cabinet' | 'parliament' | 'policies' | 'economy' | 'social' | 'un' | 'warroom' | 'alliances' | 'judiciary' | 'projects';

export const Dashboard = () => {
    const { state, dispatch } = useGame();
    const { player, resources, stats, time, events } = state;
    const [view, setView] = useState<ViewType>('command');
    const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
    const [saveMenuOpen, setSaveMenuOpen] = useState(false);
    const [saveMenuMode, setSaveMenuMode] = useState<'save' | 'load'>('save');

    // Auto-save system
    useEffect(() => {
        if (!state.gameStarted) return;
        const interval = setInterval(() => {
            autoSave(state);
            console.log('🎮 Auto-guardado completado');
        }, 3 * 60 * 1000);
        return () => clearInterval(interval);
    }, [state]);

    useEffect(() => {
        if (!state.gameStarted) return;
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
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(amount * 1_000_000_000);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('es-ES', { month: 'short', year: 'numeric' }).format(date);
    };

    const formatPercent = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    const getStatColor = (value: number, threshold: { high: number; low: number }) => {
        if (value >= threshold.high) return 'text-emerald-400';
        if (value <= threshold.low) return 'text-rose-400';
        return 'text-amber-400';
    };

    // Navigation items
    const navItems = [
        { id: 'command' as ViewType, icon: Target, label: 'Centro de Mando', color: 'cyan' },
        { id: 'map' as ViewType, icon: Globe2, label: 'Mapa Mundial', color: 'blue' },
        { id: 'cabinet' as ViewType, icon: Briefcase, label: 'Gabinete', color: 'amber' },
        { id: 'parliament' as ViewType, icon: Landmark, label: 'Parlamento', color: 'purple' },
        { id: 'economy' as ViewType, icon: TrendingUp, label: 'Economía', color: 'green' },
        { id: 'social' as ViewType, icon: Users, label: 'Social', color: 'orange' },
        { id: 'alliances' as ViewType, icon: Shield, label: 'Alianzas', color: 'indigo' },
        { id: 'warroom' as ViewType, icon: Swords, label: 'Sala de Guerra', color: 'red' },
        { id: 'judiciary' as ViewType, icon: Scale, label: 'Justicia', color: 'slate' },
        { id: 'projects' as ViewType, icon: Building2, label: 'Proyectos', color: 'teal' },
    ];

    const activeNav = navItems.find(item => item.id === view);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-navy-900 to-slate-950 text-slate-100 relative overflow-hidden">
            {/* Ambient background effect */}
            <div className="fixed inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-glow" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
            </div>

            {/* Status Bar - Floating HUD */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-status-bar">
                <div className="max-w-screen-2xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left: Nation Identity */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-glow-amber">
                                    <span className="text-3xl">🏛️</span>
                                </div>
                                <div>
                                    <h1 className="font-display text-2xl font-bold text-white leading-none">
                                        {player.countryName}
                                    </h1>
                                    <p className="text-sm text-slate-400 font-medium mt-0.5">
                                        {player.name} • {player.partyName}
                                    </p>
                                </div>
                            </div>

                            {/* Date & Time Control */}
                            <div className="flex items-center gap-3 ml-8 glass-panel-light px-4 py-2">
                                <Clock className="w-5 h-5 text-cyan-400" />
                                <span className="font-mono text-lg font-semibold text-cyan-400">
                                    {formatDate(time.date)}
                                </span>
                                <div className="h-6 w-px bg-white/10" />
                                <button
                                    onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
                                    className={`p-2 rounded-lg transition-all ${
                                        time.isPlaying 
                                            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                                            : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                                    }`}
                                >
                                    {time.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                                <div className="flex bg-slate-900/50 rounded-lg p-1">
                                    {[1, 2, 3].map((speed) => (
                                        <button
                                            key={speed}
                                            onClick={() => dispatch({ type: 'SET_SPEED', payload: speed as 1 | 2 | 3 })}
                                            className={`px-2 py-1 text-xs font-bold font-mono rounded ${
                                                time.speed === speed
                                                    ? 'bg-cyan-500 text-white shadow-glow-cyan'
                                                    : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                        >
                                            {speed}x
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Key Indicators */}
                        <div className="flex items-center gap-4">
                            {/* Popularity */}
                            <div className="glass-panel-light px-4 py-2 min-w-[100px]">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-slate-400" />
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wider">Popularidad</div>
                                        <div className={`text-lg font-mono font-bold ${getStatColor(stats.popularity, { high: 60, low: 40 })}`}>
                                            {formatPercent(stats.popularity)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stability */}
                            <div className="glass-panel-light px-4 py-2 min-w-[100px]">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-slate-400" />
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wider">Estabilidad</div>
                                        <div className={`text-lg font-mono font-bold ${getStatColor(resources.stability, { high: 60, low: 40 })}`}>
                                            {formatPercent(resources.stability)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Budget */}
                            <div className="glass-panel-light px-4 py-2 min-w-[140px]">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-slate-400" />
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wider">Presupuesto</div>
                                        <div className="text-lg font-mono font-bold text-amber-400">
                                            {formatMoney(resources.budget)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Save/Load */}
                            <div className="flex gap-2 ml-2">
                                <button
                                    onClick={() => handleOpenSaveMenu('save')}
                                    className="p-2.5 glass-panel-light hover:bg-blue-500/20 hover:border-blue-400/30 transition-all rounded-lg"
                                    title="Guardar Partida"
                                >
                                    <Save className="w-5 h-5 text-blue-400" />
                                </button>
                                <button
                                    onClick={() => handleOpenSaveMenu('load')}
                                    className="p-2.5 glass-panel-light hover:bg-slate-700/50 transition-all rounded-lg"
                                    title="Cargar Partida"
                                >
                                    <FolderOpen className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <NotificationTray />
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Dock */}
            <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-40">
                <div className="glass-panel p-3 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`nav-dock-item ${view === item.id ? 'active' : ''}`}
                        >
                            <item.icon className={`w-6 h-6 transition-colors ${
                                view === item.id ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                            }`} />
                            <span className="tooltip">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="pt-24 pb-8 px-6 ml-28">
                <div className="max-w-screen-2xl mx-auto">
                    {/* View Header */}
                    <div className="mb-6 animate-slide-up">
                        <h2 className="font-display text-4xl font-bold text-white flex items-center gap-4">
                            {activeNav && <activeNav.icon className="w-10 h-10 text-cyan-400" />}
                            {activeNav?.label}
                        </h2>
                        <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 to-transparent mt-2 rounded-full" />
                    </div>

                    {/* Content */}
                    <div className="animate-fade-in">
                        {view === 'command' && (
                            <div className="space-y-6">
                                {/* Executive Dashboard */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* GDP Card */}
                                    <div className="glass-panel p-6 hover:border-emerald-400/30 transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                                                PIB Nacional
                                            </span>
                                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div className="font-mono text-3xl font-bold text-emerald-400 mb-2">
                                            ${stats.gdp.toFixed(2)}T
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            Inflación: <span className="text-amber-400">{formatPercent(stats.inflation)}</span>
                                        </div>
                                    </div>

                                    {/* Population Card */}
                                    <div className="glass-panel p-6 hover:border-blue-400/30 transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                                                Población
                                            </span>
                                            <Users className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div className="font-mono text-3xl font-bold text-blue-400 mb-2">
                                            {(stats.population / 1_000_000).toFixed(1)}M
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            Desempleo: <span className="text-rose-400">{formatPercent(stats.unemployment)}</span>
                                        </div>
                                    </div>

                                    {/* Political Capital Card */}
                                    <div className="glass-panel p-6 hover:border-purple-400/30 transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                                                Capital Político
                                            </span>
                                            <Landmark className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div className="font-mono text-3xl font-bold text-purple-400 mb-2">
                                            {resources.politicalCapital.toFixed(0)}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            Derechos Humanos: <span className="text-cyan-400">{formatPercent(resources.humanRights)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Situations Monitor */}
                                {events.situations.length > 0 && (
                                    <div className="glass-panel p-6 border-l-4 border-l-rose-500 glow-border-rose">
                                        <div className="classified-header">
                                            <AlertTriangle className="w-4 h-4" />
                                            Situaciones Activas
                                        </div>
                                        <SituationsMonitor />
                                    </div>
                                )}
                            </div>
                        )}

                        {view === 'map' && (
                            <div className="glass-panel p-6">
                                <WorldMap
                                    countries={state.diplomacy.countries}
                                    onSelectCountry={(c) => setSelectedCountryId(c.id)}
                                />
                            </div>
                        )}

                        {view === 'cabinet' && <CabinetPanel />}
                        {view === 'parliament' && <ParliamentPanel />}
                        {view === 'policies' && <PoliciesPanel />}
                        {view === 'economy' && <EconomyPanel />}
                        {view === 'social' && <SocialMonitor />}
                        {view === 'alliances' && <AlliancesPanel />}
                        {view === 'warroom' && <WarRoom />}
                        {view === 'un' && <UNPanel />}
                        {view === 'judiciary' && <JudiciaryPanel />}
                        {view === 'projects' && <GrandProjectsPanel />}
                    </div>
                </div>
            </main>

            {/* Decision Stack Overlay */}
            <DecisionStack />

            {/* Modals */}
            {state.events.activeEvent && (
                <EventModal />
            )}

            {state.parliament.lastVoteResult && (
                <VotingResultsModal
                    voteResult={state.parliament.lastVoteResult}
                    onClose={() => dispatch({ type: 'CLEAR_VOTE_RESULT' })}
                />
            )}

            {state.events.parliamentaryEvent && (
                <ParliamentaryEventModal />
            )}

            {state.economy.economicEvent && state.economy.economicEvent.remainingDuration === state.economy.economicEvent.duration && (
                <EconomicEventModal
                    event={state.economy.economicEvent}
                    onClose={() => {}}
                />
            )}

            <SaveLoadMenu 
                isOpen={saveMenuOpen} 
                onClose={() => setSaveMenuOpen(false)} 
                mode={saveMenuMode} 
            />
        </div>
    );
};
