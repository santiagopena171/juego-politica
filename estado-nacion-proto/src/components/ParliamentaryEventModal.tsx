import { useGame } from '../context/GameContext';
import { AlertTriangle, Users, Shield } from 'lucide-react';

export const ParliamentaryEventModal = () => {
    const { state, dispatch } = useGame();
    const { parliamentaryEvent } = state.events;

    if (!parliamentaryEvent) return null;

    const handleChoice = (choiceId: string) => {
        dispatch({ type: 'RESOLVE_PARLIAMENTARY_EVENT', payload: { choiceId } });
    };

    const getEventIcon = () => {
        switch (parliamentaryEvent.type) {
            case 'no_confidence_motion':
                return <AlertTriangle className="w-8 h-8 text-red-500" />;
            case 'party_rebellion':
                return <Users className="w-8 h-8 text-amber-500" />;
            case 'coalition_breakdown':
                return <Shield className="w-8 h-8 text-orange-500" />;
            case 'faction_split':
                return <Users className="w-8 h-8 text-blue-500" />;
            case 'snap_election':
                return <AlertTriangle className="w-8 h-8 text-red-600" />;
            default:
                return <AlertTriangle className="w-8 h-8 text-amber-500" />;
        }
    };

    const getEventColor = () => {
        switch (parliamentaryEvent.type) {
            case 'no_confidence_motion':
                return 'bg-red-500/20 border-red-500/50';
            case 'party_rebellion':
                return 'bg-amber-500/20 border-amber-500/50';
            case 'coalition_breakdown':
                return 'bg-orange-500/20 border-orange-500/50';
            case 'faction_split':
                return 'bg-blue-500/20 border-blue-500/50';
            case 'snap_election':
                return 'bg-red-600/20 border-red-600/50';
            default:
                return 'bg-amber-500/20 border-amber-500/50';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
                <div className={`p-6 border-b-2 border-slate-700 flex items-start gap-4 ${getEventColor()}`}>
                    <div className="bg-slate-900/50 p-3 rounded-full border-2 border-slate-700">
                        {getEventIcon()}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-1">{parliamentaryEvent.title}</h2>
                        <p className="text-slate-300 text-sm uppercase tracking-wider font-semibold flex items-center gap-2">
                            <Users size={14} /> Crisis Parlamentaria
                        </p>
                    </div>
                </div>

                <div className="p-8">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
                        <p className="text-lg text-slate-200 leading-relaxed">
                            {parliamentaryEvent.description}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                            Opciones Disponibles
                        </h3>
                        {parliamentaryEvent.choices.map((choice) => {
                            const canAfford = !choice.requirement?.politicalCapital || 
                                state.resources.politicalCapital >= choice.requirement.politicalCapital;
                            
                            return (
                                <button
                                    key={choice.id}
                                    onClick={() => canAfford && handleChoice(choice.id)}
                                    disabled={!canAfford}
                                    className={`group w-full text-left border-2 p-5 rounded-xl transition-all ${
                                        canAfford
                                            ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-blue-500/50 cursor-pointer'
                                            : 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`font-bold text-lg ${
                                            canAfford 
                                                ? 'text-white group-hover:text-blue-400' 
                                                : 'text-slate-600'
                                        }`}>
                                            {choice.text}
                                        </div>
                                        {choice.requirement?.politicalCapital && (
                                            <div className={`text-xs px-3 py-1 rounded-full font-bold ${
                                                canAfford
                                                    ? 'bg-purple-900/30 text-purple-400 border border-purple-800'
                                                    : 'bg-slate-800 text-slate-600 border border-slate-700'
                                            }`}>
                                                {choice.requirement.politicalCapital} CP
                                            </div>
                                        )}
                                    </div>

                                    {/* Preview de efectos */}
                                    {choice.outcome.effects && (
                                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                            {choice.outcome.effects.statChanges && 
                                                Object.entries(choice.outcome.effects.statChanges).map(([key, value]) => (
                                                    <span
                                                        key={key}
                                                        className={`px-2 py-1 rounded ${
                                                            value > 0
                                                                ? 'bg-green-900/30 text-green-400 border border-green-800'
                                                                : 'bg-red-900/30 text-red-400 border border-red-800'
                                                        }`}
                                                    >
                                                        {key}: {value > 0 ? '+' : ''}{value}
                                                    </span>
                                                ))
                                            }
                                            {choice.outcome.effects.resourceChanges && 
                                                Object.entries(choice.outcome.effects.resourceChanges).map(([key, value]) => (
                                                    <span
                                                        key={key}
                                                        className={`px-2 py-1 rounded ${
                                                            value > 0
                                                                ? 'bg-green-900/30 text-green-400 border border-green-800'
                                                                : 'bg-red-900/30 text-red-400 border border-red-800'
                                                        }`}
                                                    >
                                                        {key}: {value > 0 ? '+' : ''}{value}
                                                    </span>
                                                ))
                                            }
                                        </div>
                                    )}

                                    {!canAfford && (
                                        <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                                            <AlertTriangle size={12} />
                                            Capital Político Insuficiente
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 bg-amber-900/20 border border-amber-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-200">
                                <span className="font-bold">Advertencia:</span> Esta decisión tendrá consecuencias permanentes en tu gobierno. Evalúa cuidadosamente tus opciones.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
