import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Vote, Calendar, AlertCircle, Plus } from 'lucide-react';
import { ParliamentFactionsPanel } from './ParliamentFactionsPanel';
import { BillProposalPanel } from './BillProposalPanel';

export const ParliamentPanel = () => {
    const { state } = useGame();
    const { government } = state;
    const { parliament } = government;
    const [showBillProposal, setShowBillProposal] = useState(false);

    const totalSeats = parliament.totalSeats;
    const governmentSeats = parliament.parties.filter(p => p.isGovernment).reduce((acc, p) => acc + p.seats, 0);
    const oppositionSeats = totalSeats - governmentSeats;
    const majorityThreshold = Math.floor(totalSeats / 2) + 1;
    const hasMajority = governmentSeats >= majorityThreshold;

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-100">Parlamento Nacional</h2>
                    <p className="text-sm text-slate-400">Distribución de escaños y fuerzas políticas</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Próxima Elección</div>
                        <div className="text-sm font-mono text-slate-300 flex items-center gap-2 justify-end">
                            <Calendar size={14} />
                            {formatDate(parliament.nextElectionDate)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hemicycle / Distribution Bar */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex justify-between items-end mb-2 text-sm">
                    <div className="text-blue-400 font-bold">Gobierno: {governmentSeats}</div>
                    <div className="text-slate-500 text-xs">Mayoría necesaria: {majorityThreshold}</div>
                    <div className="text-red-400 font-bold">Oposición: {oppositionSeats}</div>
                </div>

                <div className="h-8 w-full bg-slate-900 rounded-full flex overflow-hidden border border-slate-700 relative">
                    {/* Majority Marker */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-white/20 z-10 left-1/2 -translate-x-1/2 border-l border-dashed border-white/50"></div>

                    {parliament.parties.map((party) => (
                        <div
                            key={party.id}
                            style={{ width: `${(party.seats / totalSeats) * 100}%`, backgroundColor: party.color }}
                            className="h-full hover:opacity-90 transition-opacity relative group"
                        >
                            <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded border border-slate-600 whitespace-nowrap z-20 pointer-events-none">
                                {party.name}: {party.seats} escaños
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center justify-center gap-2">
                    {hasMajority ? (
                        <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800 rounded text-sm flex items-center gap-2">
                            <Vote size={16} /> Mayoría Parlamentaria Asegurada
                        </span>
                    ) : (
                        <span className="px-3 py-1 bg-amber-900/30 text-amber-400 border border-amber-800 rounded text-sm flex items-center gap-2">
                            <AlertCircle size={16} /> Gobierno en Minoría
                        </span>
                    )}
                </div>
            </div>

            {/* Parties List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parliament.parties.map((party) => (
                    <div key={party.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-500 transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: party.color }}></div>
                                <div>
                                    <h3 className="font-bold text-slate-100">{party.name}</h3>
                                    <div className="text-xs text-slate-400">{party.ideology}</div>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-slate-200">{party.seats}</div>
                        </div>

                        <div className="space-y-2">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-500">Afinidad con el Gobierno</span>
                                    <span className={`${party.stance >= 50 ? 'text-green-400' : 'text-red-400'}`}>{party.stance}%</span>
                                </div>
                                <div className="w-full bg-slate-900 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full ${party.stance >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                                        style={{ width: `${party.stance}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-2">
                                {party.isGovernment && (
                                    <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-300 border border-blue-800 rounded">
                                        Oficialismo
                                    </span>
                                )}
                                {!party.isGovernment && (
                                    <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 border border-slate-600 rounded">
                                        ```
                                        import {useState} from 'react';
                                        import {useGame} from '../context/GameContext';
                                        import {Vote, Calendar, AlertCircle, Plus} from 'lucide-react';
                                        import {ParliamentFactionsPanel} from './ParliamentFactionsPanel';
                                        import {BillProposalPanel} from './BillProposalPanel';

export const ParliamentPanel = () => {
    const {state} = useGame();
                                        const {government} = state;
                                        const {parliament} = government;
                                        const [showBillProposal, setShowBillProposal] = useState(false);

                                        const totalSeats = parliament.totalSeats;
    const governmentSeats = parliament.parties.filter(p => p.isGovernment).reduce((acc, p) => acc + p.seats, 0);
                                        const oppositionSeats = totalSeats - governmentSeats;
                                        const majorityThreshold = Math.floor(totalSeats / 2) + 1;
    const hasMajority = governmentSeats >= majorityThreshold;

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('es-ES', {day: 'numeric', month: 'long', year: 'numeric' });
    };

                                        return (
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h2 className="text-xl font-bold text-slate-100">Parlamento Nacional</h2>
                                                    <p className="text-sm text-slate-400">Distribución de escaños y fuerzas políticas</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Próxima Elección</div>
                                                        <div className="text-sm font-mono text-slate-300 flex items-center gap-2 justify-end">
                                                            <Calendar size={14} />
                                                            {formatDate(parliament.nextElectionDate)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hemicycle / Distribution Bar */}
                                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                                <div className="flex justify-between items-end mb-2 text-sm">
                                                    <div className="text-blue-400 font-bold">Gobierno: {governmentSeats}</div>
                                                    <div className="text-slate-500 text-xs">Mayoría necesaria: {majorityThreshold}</div>
                                                    <div className="text-red-400 font-bold">Oposición: {oppositionSeats}</div>
                                                </div>

                                                <div className="h-8 w-full bg-slate-900 rounded-full flex overflow-hidden border border-slate-700 relative">
                                                    {/* Majority Marker */}
                                                    <div className="absolute top-0 bottom-0 w-0.5 bg-white/20 z-10 left-1/2 -translate-x-1/2 border-l border-dashed border-white/50"></div>

                                                    {parliament.parties.map((party) => (
                                                        <div
                                                            key={party.id}
                                                            style={{ width: `${(party.seats / totalSeats) * 100}%`, backgroundColor: party.color }}
                                                            className="h-full hover:opacity-90 transition-opacity relative group"
                                                        >
                                                            <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded border border-slate-600 whitespace-nowrap z-20 pointer-events-none">
                                                                {party.name}: {party.seats} escaños
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-4 flex items-center justify-center gap-2">
                                                    {hasMajority ? (
                                                        <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800 rounded text-sm flex items-center gap-2">
                                                            <Vote size={16} /> Mayoría Parlamentaria Asegurada
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-amber-900/30 text-amber-400 border border-amber-800 rounded text-sm flex items-center gap-2">
                                                            <AlertCircle size={16} /> Gobierno en Minoría
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Parties List */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {parliament.parties.map((party) => (
                                                    <div key={party.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-500 transition-all">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: party.color }}></div>
                                                                <div>
                                                                    <h3 className="font-bold text-slate-100">{party.name}</h3>
                                                                    <div className="text-xs text-slate-400">{party.ideology}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-2xl font-bold text-slate-200">{party.seats}</div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div>
                                                                <div className="flex justify-between text-xs mb-1">
                                                                    <span className="text-slate-500">Afinidad con el Gobierno</span>
                                                                    <span className={`${party.stance >= 50 ? 'text-green-400' : 'text-red-400'}`}>{party.stance}%</span>
                                                                </div>
                                                                <div className="w-full bg-slate-900 rounded-full h-1.5">
                                                                    <div
                                                                        className={`h-1.5 rounded-full ${party.stance >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                                                                        style={{ width: `${party.stance}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>

                                                            <div className="pt-2 flex gap-2">
                                                                {party.isGovernment && (
                                                                    <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-300 border border-blue-800 rounded">
                                                                        Oficialismo
                                                                    </span>
                                                                )}
                                                                {!party.isGovernment && (
                                                                    <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 border border-slate-600 rounded">
                                                                        Oposición
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Propose Bill Button */}
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => setShowBillProposal(true)}
                                                    disabled={!!parliament.activeBill}
                                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${parliament.activeBill
                                                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg'
                                                        }`}
                                                >
                                                    <Plus className="w-5 h-5" />
                                                    Proponer Ley
                                                </button>
                                            </div>

                                            {/* Factions Panel */}
                                            <ParliamentFactionsPanel />

                                            {/* Bill Proposal Modal */}
                                            {showBillProposal && (
                                                <BillProposalPanel onClose={() => setShowBillProposal(false)} />
                                            )}
                                        </div>
                                        );
};
                                        ```
