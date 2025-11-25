import { useGame } from '../context/GameContext';
import { TrendingUp, TrendingDown, Activity, ShieldAlert, Zap } from 'lucide-react';

export const SituationsMonitor = () => {
    const { state } = useGame();
    const { events } = state;
    const { situations } = events;

    // Helper to determine color based on severity
    const getSeverityColor = (severity: number) => {
        if (severity >= 80) return 'text-red-500 bg-red-500/10 border-red-500/50';
        if (severity >= 50) return 'text-amber-500 bg-amber-500/10 border-amber-500/50';
        return 'text-blue-400 bg-blue-500/10 border-blue-500/50';
    };

    const getTrendIcon = (trend: number) => {
        if (trend > 0) return <TrendingUp size={16} className="text-red-400" />;
        if (trend < 0) return <TrendingDown size={16} className="text-emerald-400" />;
        return <Activity size={16} className="text-slate-400" />;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Activity size={14} /> Monitor de Situaciones
                </h3>
                <span className="text-xs text-slate-500">{situations.length} Activas</span>
            </div>

            {situations.length === 0 ? (
                <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700 border-dashed flex flex-col items-center justify-center text-slate-500">
                    <ShieldAlert size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">Sin situaciones críticas activas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {situations.map((situation) => (
                        <div
                            key={situation.id}
                            className={`p-4 rounded-xl border ${getSeverityColor(situation.severity)} transition-all`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Zap size={18} />
                                    <h4 className="font-bold">{situation.name}</h4>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-mono bg-slate-900/50 px-2 py-1 rounded">
                                    <span>Tendencia:</span>
                                    {getTrendIcon(situation.trend)}
                                    <span>{Math.abs(situation.trend)}/turno</span>
                                </div>
                            </div>

                            <p className="text-sm opacity-80 mb-3">{situation.description}</p>

                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Severidad / Progreso</span>
                                    <span>{situation.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-900/50 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${situation.severity > 50 ? 'bg-red-500' : 'bg-blue-500'}`}
                                        style={{ width: `${situation.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Mock Data for UI Preview if empty (Remove in production) */}
            {situations.length === 0 && (
                <div className="mt-4 opacity-50 pointer-events-none grayscale">
                    <div className="text-xs text-center mb-2 text-slate-600">Vista Previa (Mockup)</div>
                    <div className="p-4 rounded-xl border text-red-500 bg-red-500/10 border-red-500/50">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <Zap size={18} />
                                <h4 className="font-bold">Alta Inflación</h4>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono bg-slate-900/50 px-2 py-1 rounded">
                                <TrendingUp size={16} className="text-red-400" />
                                <span>2/turno</span>
                            </div>
                        </div>
                        <p className="text-sm opacity-80 mb-3">La inflación anual supera el 10%, causando descontento y pérdida de poder adquisitivo.</p>
                        <div className="w-full bg-slate-900/50 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
