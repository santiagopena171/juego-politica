import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Users, AlertTriangle, Megaphone, TrendingUp, TrendingDown, Radio, Shield, Flag, X } from 'lucide-react';
import type { Protest, ProtestAction, InterestGroup } from '../types/social';

export const SocialMonitor = () => {
    const { state, dispatch } = useGame();
    const { social } = state;
    const [selectedProtest, setSelectedProtest] = useState<Protest | null>(null);

    if (!social) return null;

    const { interestGroups, activeProtests, mediaState, campaign, socialTension, humanRights } = social;

    const getGroupIcon = (type: string) => {
        const icons: { [key: string]: string } = {
            Unions: '✊',
            Business: '💼',
            Religious: '✝️',
            Students: '🎓',
            Military: '🪖',
            Rural: '🌾'
        };
        return icons[type] || '👥';
    };

    const getTensionColor = (tension: number) => {
        if (tension < 30) return 'text-green-400';
        if (tension < 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const handleProtestAction = (protest: Protest, action: ProtestAction) => {
        dispatch({
            type: 'RESOLVE_PROTEST',
            payload: { protestId: protest.id, action }
        });
        setSelectedProtest(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-1">Monitor Social</h2>
                <p className="text-sm text-slate-400">Estado de los grupos de interés y movimientos sociales</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 uppercase font-semibold">Tensión Social</span>
                        <AlertTriangle className={`w-4 h-4 ${getTensionColor(socialTension)}`} />
                    </div>
                    <div className={`text-2xl font-bold ${getTensionColor(socialTension)}`}>
                        {socialTension.toFixed(0)}%
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full mt-2">
                        <div 
                            className={`h-full rounded-full transition-all ${
                                socialTension < 30 ? 'bg-green-500' : 
                                socialTension < 60 ? 'bg-yellow-500' : 
                                'bg-red-500'
                            }`}
                            style={{ width: `${socialTension}%` }}
                        />
                    </div>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 uppercase font-semibold">Protestas Activas</span>
                        <Megaphone className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-100">{activeProtests.length}</div>
                    {activeProtests.length > 0 && (
                        <div className="text-xs text-orange-400 mt-1">
                            {activeProtests.reduce((sum, p) => sum + p.participants, 0).toLocaleString()} manifestantes
                        </div>
                    )}
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 uppercase font-semibold">Índice DDHH</span>
                        <Shield className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-100">{humanRights.toFixed(0)}/100</div>
                    <div className="text-xs text-slate-500 mt-1">
                        {humanRights > 80 ? 'Excelente' : humanRights > 60 ? 'Bueno' : humanRights > 40 ? 'Regular' : 'Crítico'}
                    </div>
                </div>
            </div>

            {/* Active Protests Alert */}
            {activeProtests.length > 0 && (
                <div className="bg-red-500/10 border-2 border-red-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="text-red-400" size={24} />
                        <h3 className="text-lg font-bold text-white">¡Protestas en Curso!</h3>
                    </div>
                    <p className="text-slate-300 mb-3">
                        Hay {activeProtests.length} {activeProtests.length === 1 ? 'protesta activa' : 'protestas activas'} que 
                        requieren tu atención inmediata.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {activeProtests.map(protest => (
                            <button
                                key={protest.id}
                                onClick={() => setSelectedProtest(protest)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-medium transition-colors"
                            >
                                Ver {protest.groupName}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Interest Groups */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Users size={20} />
                    Grupos de Interés
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {interestGroups.map(group => {
                        const isProtesting = activeProtests.some(p => p.groupId === group.id);
                        return (
                            <div 
                                key={group.id}
                                className={`bg-slate-800 rounded-xl border-2 p-4 transition-all ${
                                    isProtesting ? 'border-red-500 shadow-lg shadow-red-500/20' : 'border-slate-700'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{getGroupIcon(group.type)}</span>
                                        <div>
                                            <h4 className="font-semibold text-white">{group.name}</h4>
                                            <p className="text-xs text-slate-400">
                                                {group.populationSize.toLocaleString()} personas · {group.ideology}
                                            </p>
                                        </div>
                                    </div>
                                    {isProtesting && (
                                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded font-bold animate-pulse">
                                            PROTESTANDO
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-slate-300 mb-3">{group.description}</p>

                                {/* Approval Bar */}
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-slate-400">Aprobación</span>
                                        <span className={`text-xs font-bold ${
                                            group.approval > 70 ? 'text-green-400' :
                                            group.approval > 40 ? 'text-yellow-400' :
                                            'text-red-400'
                                        }`}>
                                            {group.approval.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all ${
                                                group.approval > 70 ? 'bg-green-500' :
                                                group.approval > 40 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}
                                            style={{ width: `${group.approval}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Power Indicator */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Poder de disrupción:</span>
                                    <span className="font-semibold text-slate-200">{group.power}/100</span>
                                </div>

                                {/* Concerns */}
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {group.concerns.slice(0, 3).map((concern, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                                            {concern}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Media State */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Radio size={20} />
                    Estado de los Medios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">Libertad de Prensa</span>
                            <span className={`font-bold ${
                                mediaState.freedom > 70 ? 'text-green-400' :
                                mediaState.freedom > 40 ? 'text-yellow-400' :
                                'text-red-400'
                            }`}>
                                {mediaState.freedom.toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${
                                    mediaState.freedom > 70 ? 'bg-green-500' :
                                    mediaState.freedom > 40 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }`}
                                style={{ width: `${mediaState.freedom}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">Apoyo Mediático</span>
                            <span className={`font-bold ${
                                mediaState.support > 60 ? 'text-green-400' :
                                mediaState.support > 40 ? 'text-slate-300' :
                                'text-red-400'
                            }`}>
                                {mediaState.support.toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${
                                    mediaState.support > 60 ? 'bg-green-500' :
                                    mediaState.support > 40 ? 'bg-slate-500' :
                                    'bg-red-500'
                                }`}
                                style={{ width: `${mediaState.support}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">Censura</span>
                            <span className={`font-bold ${
                                mediaState.censorship < 20 ? 'text-green-400' :
                                mediaState.censorship < 50 ? 'text-yellow-400' :
                                'text-red-400'
                            }`}>
                                {mediaState.censorship.toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-red-500"
                                style={{ width: `${mediaState.censorship}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => dispatch({ type: 'CENSOR_MEDIA' })}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Censurar Medios
                    </button>
                    <button
                        onClick={() => dispatch({ type: 'FUND_PUBLIC_MEDIA', payload: { amount: 1.0 } })}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Financiar Medios Públicos ($1B)
                    </button>
                </div>
            </div>

            {/* Campaign Status */}
            {campaign && campaign.active && (
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Flag size={20} />
                        Campaña Electoral
                    </h3>
                    <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-2 border-blue-500 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-xl font-bold text-white">
                                    {campaign.monthsUntilElection} {campaign.monthsUntilElection === 1 ? 'mes' : 'meses'} hasta las elecciones
                                </h4>
                                <p className="text-sm text-slate-300">Momentum: {campaign.momentum > 0 ? '+' : ''}{campaign.momentum}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-400">Presupuesto gastado</div>
                                <div className="text-lg font-bold text-white">${campaign.governmentBudget.toFixed(1)}B</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-slate-800/50 p-2 rounded text-center">
                                <div className="text-xs text-slate-400">Mítines</div>
                                <div className="text-lg font-bold text-white">{campaign.ralliesHeld}</div>
                            </div>
                            <div className="bg-slate-800/50 p-2 rounded text-center">
                                <div className="text-xs text-slate-400">Debates</div>
                                <div className="text-lg font-bold text-white">{campaign.debatesScheduled}</div>
                            </div>
                            <div className="bg-slate-800/50 p-2 rounded text-center">
                                <div className="text-xs text-slate-400">Camp. Sucias</div>
                                <div className="text-lg font-bold text-white">{campaign.smearCampaigns}</div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => dispatch({ type: 'CAMPAIGN_RALLY', payload: { targetGroup: 'Unions', budget: 0.5 } })}
                                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-medium transition-colors"
                            >
                                Realizar Mitin ($0.5B)
                            </button>
                            <button
                                onClick={() => dispatch({ type: 'CAMPAIGN_SMEAR' })}
                                className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded text-sm font-medium transition-colors"
                            >
                                Campaña Sucia ($1B)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Protest Modal */}
            {selectedProtest && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-lg border-2 border-red-500 shadow-2xl max-w-2xl w-full">
                        <div className="flex items-start justify-between p-6 border-b border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500/20 rounded-lg">
                                    <Megaphone className="text-red-400" size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedProtest.groupName}</h2>
                                    <span className="text-sm text-red-400">Protesta Activa - Día {selectedProtest.duration}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedProtest(null)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="font-semibold text-white mb-2">Demandas:</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {selectedProtest.demands.map((demand, i) => (
                                        <li key={i} className="text-slate-300">{demand}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-900 p-3 rounded">
                                    <div className="text-xs text-slate-400 mb-1">Participantes</div>
                                    <div className="text-lg font-bold text-white">{selectedProtest.participants.toLocaleString()}</div>
                                </div>
                                <div className="bg-slate-900 p-3 rounded">
                                    <div className="text-xs text-slate-400 mb-1">Intensidad</div>
                                    <div className="text-lg font-bold text-red-400">{selectedProtest.intensity}/100</div>
                                </div>
                                <div className="bg-slate-900 p-3 rounded">
                                    <div className="text-xs text-slate-400 mb-1">Impacto PIB</div>
                                    <div className="text-lg font-bold text-red-400">{(selectedProtest.economicImpact * 100).toFixed(2)}%</div>
                                </div>
                            </div>

                            {selectedProtest.escalating && (
                                <div className="bg-red-500/20 border border-red-500 rounded p-3">
                                    <p className="text-red-300 font-semibold">⚠️ ¡La protesta está escalando! La situación empeora cada día.</p>
                                </div>
                            )}

                            <div>
                                <h3 className="font-semibold text-white mb-3">¿Cómo responder?</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleProtestAction(selectedProtest, 'negotiate')}
                                        className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-left transition-colors"
                                    >
                                        <div className="font-bold mb-1">Negociar</div>
                                        <div className="text-xs opacity-80">Costo: 20 Cap. Político</div>
                                        <div className="text-xs opacity-80">60-90% éxito</div>
                                    </button>
                                    <button
                                        onClick={() => handleProtestAction(selectedProtest, 'concede')}
                                        className="p-4 bg-green-600 hover:bg-green-500 text-white rounded-lg text-left transition-colors"
                                    >
                                        <div className="font-bold mb-1">Ceder</div>
                                        <div className="text-xs opacity-80">Costo: $3-10B</div>
                                        <div className="text-xs opacity-80">Ganas +30 aprobación</div>
                                    </button>
                                    <button
                                        onClick={() => handleProtestAction(selectedProtest, 'suppress')}
                                        className="p-4 bg-red-600 hover:bg-red-500 text-white rounded-lg text-left transition-colors"
                                    >
                                        <div className="font-bold mb-1">Reprimir</div>
                                        <div className="text-xs opacity-80">Pierdes -25 aprobación</div>
                                        <div className="text-xs opacity-80">Daña DDHH</div>
                                    </button>
                                    <button
                                        onClick={() => handleProtestAction(selectedProtest, 'ignore')}
                                        className="p-4 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-left transition-colors"
                                    >
                                        <div className="font-bold mb-1">Ignorar</div>
                                        <div className="text-xs opacity-80">Sin costo</div>
                                        <div className="text-xs opacity-80">Riesgo de escalada</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
