import React from 'react';
import { useGame } from '../context/GameContext';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { PresidentialDecision } from '../types/living_world';

const DecisionCard: React.FC<{ decision: PresidentialDecision; onResolve: (id: string, optionId: string) => void }> = ({ decision, onResolve }) => {
    return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-lg mb-4 animate-in slide-in-from-right">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${decision.urgency === 'Critical' ? 'bg-red-900 text-red-200' :
                            decision.urgency === 'High' ? 'bg-orange-900 text-orange-200' :
                                'bg-blue-900 text-blue-200'
                        }`}>
                        {decision.urgency}
                    </span>
                    <span className="ml-2 text-slate-400 text-xs uppercase tracking-wider">{decision.source}</span>
                </div>
                {decision.expiresAt && (
                    <div className="flex items-center text-slate-400 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Expires soon</span>
                    </div>
                )}
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{decision.title}</h3>
            <p className="text-slate-300 text-sm mb-4">{decision.description}</p>

            <div className="space-y-2">
                {decision.options.map(option => (
                    <button
                        key={option.id}
                        onClick={() => onResolve(decision.id, option.id)}
                        className="w-full text-left p-3 rounded bg-slate-700 hover:bg-slate-600 transition-colors border border-slate-600 hover:border-slate-500 group"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-slate-200">{option.label}</span>
                            {option.cost && (
                                <span className="text-xs text-red-400">
                                    {option.cost.budget ? `-$${option.cost.budget}B ` : ''}
                                    {option.cost.politicalCapital ? `-${option.cost.politicalCapital} PC` : ''}
                                </span>
                            )}
                        </div>
                        {option.predictedConsequences && (
                            <div className="mt-1 text-xs text-slate-400 italic">
                                {option.predictedConsequences.join(', ')}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const DecisionStack: React.FC = () => {
    const { state, dispatch } = useGame();
    const decisions = state.decisionStack;

    if (!decisions || decisions.length === 0) return null;

    const handleResolve = (decisionId: string, optionId: string) => {
        // In a real implementation, we would dispatch an action to resolve the decision
        // For now, we'll just remove it to simulate resolution
        // dispatch({ type: 'RESOLVE_DECISION', payload: { decisionId, optionId } });
        console.log(`Resolved decision ${decisionId} with option ${optionId}`);

        // Temporary hack to remove decision from stack until we have a reducer case
        // This requires a new action type in GameContext
    };

    return (
        <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-y-auto z-50 flex flex-col-reverse">
            {decisions.map(decision => (
                <DecisionCard key={decision.id} decision={decision} onResolve={handleResolve} />
            ))}
        </div>
    );
};
