import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import { useGame, type VoteResult } from '../context/GameContext';

interface VotingResultsModalProps {
    voteResult: VoteResult;
    onClose: () => void;
}

export const VotingResultsModal = ({ voteResult, onClose }: VotingResultsModalProps) => {
    const { state } = useGame();
    const { bill, approved, votes, factionVotes } = voteResult;

    // Auto-close after 8 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 8000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const totalVotes = votes.yes + votes.no + votes.abstain;
    const yesPercentage = totalVotes > 0 ? (votes.yes / totalVotes) * 100 : 0;
    const noPercentage = totalVotes > 0 ? (votes.no / totalVotes) * 100 : 0;
    const abstainPercentage = totalVotes > 0 ? (votes.abstain / totalVotes) * 100 : 0;

    // Group faction votes by party
    const votesByParty = state.government.parliament.parties.map(party => {
        const partyFactionVotes = factionVotes.filter(fv => {
            const faction = state.government.parliament.factions?.find(f => f.id === fv.factionId);
            return faction?.partyId === party.id;
        });
        
        return {
            party,
            factionVotes: partyFactionVotes
        };
    }).filter(pv => pv.factionVotes.length > 0);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className={`p-6 border-b border-slate-700 ${approved ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            {approved ? (
                                <CheckCircle className="w-12 h-12 text-green-400" />
                            ) : (
                                <XCircle className="w-12 h-12 text-red-400" />
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-slate-100">
                                    {approved ? '✅ Ley Aprobada' : '❌ Ley Rechazada'}
                                </h2>
                                <p className="text-slate-300 mt-1">{bill.title}</p>
                                <p className="text-sm text-slate-400 mt-1">{bill.description}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-200 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Vote Results */}
                <div className="p-6 space-y-6">
                    {/* Vote Bar */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-slate-400">DISTRIBUCIÓN DE VOTOS</span>
                            <span className="text-xs text-slate-500">
                                Mayoría requerida: {bill.requiredMajority}%
                            </span>
                        </div>
                        
                        <div className="relative h-12 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                            {/* Majority line */}
                            <div 
                                className="absolute top-0 bottom-0 w-0.5 bg-white/30 z-10 border-l-2 border-dashed border-white/50"
                                style={{ left: `${bill.requiredMajority}%` }}
                            >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white/70 whitespace-nowrap">
                                    {bill.requiredMajority}%
                                </div>
                            </div>

                            {/* Vote bars */}
                            <div className="flex h-full">
                                <div 
                                    className="bg-green-600 flex items-center justify-center text-white font-bold transition-all"
                                    style={{ width: `${yesPercentage}%` }}
                                >
                                    {yesPercentage > 10 && `${votes.yes}`}
                                </div>
                                <div 
                                    className="bg-red-600 flex items-center justify-center text-white font-bold transition-all"
                                    style={{ width: `${noPercentage}%` }}
                                >
                                    {noPercentage > 10 && `${votes.no}`}
                                </div>
                                <div 
                                    className="bg-slate-600 flex items-center justify-center text-white font-bold transition-all"
                                    style={{ width: `${abstainPercentage}%` }}
                                >
                                    {abstainPercentage > 10 && `${votes.abstain}`}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between mt-2 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-600 rounded"></div>
                                <span className="text-slate-300">A Favor: {votes.yes} ({yesPercentage.toFixed(1)}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-600 rounded"></div>
                                <span className="text-slate-300">En Contra: {votes.no} ({noPercentage.toFixed(1)}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-slate-600 rounded"></div>
                                <span className="text-slate-300">Abstenciones: {votes.abstain} ({abstainPercentage.toFixed(1)}%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Effects Applied */}
                    {approved && bill.effects && (
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                            <h3 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                                Efectos Aplicados
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {bill.effects.statChanges && Object.entries(bill.effects.statChanges).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 text-sm">
                                        {key === 'gdp' && <TrendingUp className="w-4 h-4 text-green-400" />}
                                        {key === 'unemployment' && <Users className="w-4 h-4 text-amber-400" />}
                                        {key === 'popularity' && <Users className="w-4 h-4 text-blue-400" />}
                                        {key === 'stability' && <AlertCircle className="w-4 h-4 text-purple-400" />}
                                        <span className="text-slate-400 capitalize">{key}:</span>
                                        <span className={value > 0 ? 'text-green-400' : 'text-red-400'}>
                                            {value > 0 ? '+' : ''}{value}
                                        </span>
                                    </div>
                                ))}
                                {bill.effects.resourceChanges && Object.entries(bill.effects.resourceChanges).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 text-sm">
                                        {key === 'budget' && <DollarSign className="w-4 h-4 text-green-400" />}
                                        {key === 'politicalCapital' && <TrendingUp className="w-4 h-4 text-purple-400" />}
                                        <span className="text-slate-400 capitalize">{key}:</span>
                                        <span className={value > 0 ? 'text-green-400' : 'text-red-400'}>
                                            {value > 0 ? '+' : ''}{value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Votes by Party/Faction */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-100 mb-3">Desglose por Partido</h3>
                        <div className="space-y-3">
                            {votesByParty.map(({ party, factionVotes: pvFactionVotes }) => (
                                <div key={party.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div 
                                            className="w-4 h-4 rounded-full" 
                                            style={{ backgroundColor: party.color }}
                                        ></div>
                                        <span className="font-bold text-slate-100">{party.name}</span>
                                        <span className="text-xs text-slate-400">({party.seats} escaños)</span>
                                    </div>
                                    <div className="space-y-2 ml-7">
                                        {pvFactionVotes.map(fv => {
                                            const faction = state.government.parliament.factions?.find(f => f.id === fv.factionId);
                                            if (!faction) return null;
                                            
                                            return (
                                                <div key={fv.factionId} className="flex items-start justify-between text-sm">
                                                    <div className="flex-1">
                                                        <div className="text-slate-300">{faction.name}</div>
                                                        <div className="text-xs text-slate-500 italic">{fv.reason}</div>
                                                    </div>
                                                    <div className="ml-4">
                                                        {fv.vote === 'yes' && (
                                                            <span className="px-2 py-1 bg-green-900/30 text-green-400 border border-green-800 rounded text-xs font-semibold">
                                                                A FAVOR
                                                            </span>
                                                        )}
                                                        {fv.vote === 'no' && (
                                                            <span className="px-2 py-1 bg-red-900/30 text-red-400 border border-red-800 rounded text-xs font-semibold">
                                                                EN CONTRA
                                                            </span>
                                                        )}
                                                        {fv.vote === 'abstain' && (
                                                            <span className="px-2 py-1 bg-slate-700 text-slate-400 border border-slate-600 rounded text-xs font-semibold">
                                                                ABSTENCIÓN
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Close button */}
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-lg transition-all shadow-lg"
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
