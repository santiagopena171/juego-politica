import { useGame } from '../context/GameContext';
import { AlertTriangle } from 'lucide-react';

export const EventModal = () => {
    const { state, dispatch } = useGame();
    const { activeEvent } = state.events;

    if (!activeEvent) return null;

    const handleChoice = (index: number) => {
        dispatch({ type: 'RESOLVE_EVENT', payload: { choiceIndex: index } });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
                <div className="bg-slate-900 p-6 border-b border-slate-700 flex items-center gap-4">
                    <div className="bg-amber-500/20 p-3 rounded-full">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{activeEvent.title}</h2>
                        <p className="text-slate-400 text-sm uppercase tracking-wider">Decisión Presidencial Requerida</p>
                    </div>
                </div>

                <div className="p-8">
                    <p className="text-lg text-slate-300 leading-relaxed mb-8">
                        {activeEvent.description}
                    </p>

                    <div className="grid gap-4">
                        {activeEvent.choices.map((choice, index) => (
                            <button
                                key={index}
                                onClick={() => handleChoice(index)}
                                className="group text-left bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-amber-500/50 p-4 rounded-lg transition-all"
                            >
                                <div className="font-bold text-white group-hover:text-amber-400 mb-1">
                                    {choice.label}
                                </div>
                                <div className="text-sm text-slate-400">
                                    {choice.description}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
