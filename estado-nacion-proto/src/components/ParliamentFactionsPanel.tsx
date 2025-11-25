import { useGame } from '../context/GameContext';

export const ParliamentFactionsPanel = () => {
    const { state } = useGame();

    const factions = state.government.parliament.factions || [];
    const parties = state.government.parliament.parties || [];

    if (factions.length === 0) {
        return (
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-4">Parlamento</h3>
                <p className="text-slate-400">Cargando información parlamentaria...</p>
            </div>
        );
    }

    const getStanceColor = (stance: string) => {
        switch (stance) {
            case 'supportive': return 'text-green-400 bg-green-900/30 border-green-700';
            case 'neutral': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700';
            case 'hostile': return 'text-red-400 bg-red-900/30 border-red-700';
            default: return 'text-slate-400 bg-slate-900/30 border-slate-700';
        }
    };

    const getStanceText = (stance: string) => {
        switch (stance) {
            case 'supportive': return 'Apoya';
            case 'neutral': return 'Neutral';
            case 'hostile': return 'Opone';
            default: return 'Desconocido';
        }
    };

    return (
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Facciones Parlamentarias</h3>
                <div className="text-sm text-slate-400">
                    Apoyo al Gobierno: <span className="font-bold text-white">{state.government.parliament.governmentSupport || 50}%</span>
                </div>
            </div>

            {/* Partidos y sus facciones */}
            <div className="space-y-6">
                {parties.map(party => {
                    const partyFactions = factions.filter((f: any) => f.partyId === party.id);
                    if (partyFactions.length === 0) return null;

                    return (
                        <div key={party.id} className="space-y-2">
                            {/* Partido header */}
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: party.color }}
                                />
                                <div className="flex-1">
                                    <div className="font-bold text-white">{party.name}</div>
                                    <div className="text-xs text-slate-400">
                                        {party.seats} escaños • {party.ideology}
                                    </div>
                                </div>
                            </div>

                            {/* Facciones del partido */}
                            <div className="ml-7 space-y-2">
                                {partyFactions.map((faction: any) => (
                                    <div
                                        key={faction.id}
                                        className="p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <div className="font-semibold text-slate-200 text-sm">
                                                    {faction.name}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {faction.description}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStanceColor(faction.stance)}`}>
                                                {getStanceText(faction.stance)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mt-3">
                                            <div>
                                                <div className="text-xs text-slate-500">Tamaño</div>
                                                <div className="text-sm font-semibold text-slate-300">
                                                    {faction.size}% del partido
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500">Influencia</div>
                                                <div className="text-sm font-semibold text-slate-300">
                                                    {Math.round(faction.influence)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500">Lealtad</div>
                                                <div className="text-sm font-semibold text-slate-300">
                                                    {Math.round(faction.loyaltyToLeader)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Prioridades */}
                                        {faction.priorities && faction.priorities.length > 0 && (
                                            <div className="mt-2 flex gap-1 flex-wrap">
                                                {faction.priorities.map((priority: string) => (
                                                    <span
                                                        key={priority}
                                                        className="px-2 py-0.5 bg-blue-900/30 text-blue-300 border border-blue-700 rounded text-xs"
                                                    >
                                                        {priority}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Ley activa */}
            {state.government.parliament.activeBill && (
                <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-700">
                    <div className="font-bold text-blue-300 mb-2">
                        📋 Ley en Votación
                    </div>
                    <div className="text-white font-semibold">
                        {state.government.parliament.activeBill.title}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                        {state.government.parliament.activeBill.description}
                    </div>
                    <div className="mt-3 flex gap-2">
                        <span className="px-2 py-1 bg-amber-900/30 text-amber-300 border border-amber-700 rounded text-xs font-semibold">
                            Urgencia: {state.government.parliament.activeBill.urgency}
                        </span>
                        <span className="px-2 py-1 bg-purple-900/30 text-purple-300 border border-purple-700 rounded text-xs font-semibold">
                            Mayoría: {state.government.parliament.activeBill.requiredMajority}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
