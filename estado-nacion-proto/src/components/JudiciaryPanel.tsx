import { useState } from 'react';
import { Scale, Gavel, AlertTriangle, ShieldCheck, Eye, EyeOff, Shield } from 'lucide-react';
import { useGame } from '../context/GameContext';
import type { Judge } from '../types/judiciary';

export const JudiciaryPanel = () => {
    const { state } = useGame();
    const court = state.judiciary?.supremeCourt || [];
    const constitution = state.judiciary?.constitution;
    const [selected, setSelected] = useState<Judge | null>(court[0] || null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const hasIntel = state.resources.stability > 40; // Heurística simple para mostrar barras detalladas

    const handleAction = (action: string, judge?: Judge) => {
        setActionMessage(`${action} sobre ${judge ? judge.name : 'juez'}. (Conecta aquí tu lógica de backend)`);
        setTimeout(() => setActionMessage(null), 2500);
    };

    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                    <Scale className="w-6 h-6 text-blue-400" />
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Corte Suprema</h2>
                        <p className="text-slate-400 text-sm">Supervisa la constitucionalidad de tus leyes.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {court.map(judge => (
                        <button
                            key={judge.id}
                            onClick={() => setSelected(judge)}
                            className={`p-4 rounded-xl border transition-all text-left ${selected?.id === judge.id
                                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                                : 'border-slate-700 hover:border-slate-600 bg-slate-800'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-200 font-semibold">{judge.name}</p>
                                    <p className="text-xs text-slate-500">{judge.ideology}</p>
                                </div>
                                <Shield className="w-4 h-4 text-slate-500" />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Edad: {judge.age}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="col-span-5 space-y-4">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-sm">
                    <h3 className="text-slate-200 font-bold flex items-center gap-2">
                        <Gavel className="w-4 h-4" /> Detalle del juez
                    </h3>
                    {selected ? (
                        <div className="mt-3 space-y-3">
                            <div className="flex justify-between text-sm text-slate-300">
                                <span>Nombre</span>
                                <span className="font-semibold">{selected.name}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-300">
                                <span>Ideología</span>
                                <span className="font-semibold text-blue-300">{selected.ideology}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-300">
                                <span>Integridad</span>
                                <div className="flex items-center gap-2">
                                    {hasIntel ? (
                                        <div className="w-32 bg-slate-900 h-2 rounded-full overflow-hidden">
                                            <div className="h-2 bg-emerald-500" style={{ width: `${selected.integrity}%` }}></div>
                                        </div>
                                    ) : <EyeOff className="w-4 h-4 text-slate-500" />}
                                    <span>{hasIntel ? `${selected.integrity}%` : '?'}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-300">
                                <span>Lealtad</span>
                                <div className="flex items-center gap-2">
                                    {hasIntel ? (
                                        <div className="w-32 bg-slate-900 h-2 rounded-full overflow-hidden">
                                            <div className="h-2 bg-blue-500" style={{ width: `${selected.loyalty}%` }}></div>
                                        </div>
                                    ) : <Eye className="w-4 h-4 text-slate-500" />}
                                    <span>{hasIntel ? `${selected.loyalty}%` : '?'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-2">
                                <button
                                    onClick={() => handleAction('Sobornar', selected)}
                                    className="text-xs bg-amber-600/80 hover:bg-amber-600 text-white px-3 py-2 rounded-lg"
                                >
                                    Bribe Judge
                                </button>
                                <button
                                    onClick={() => handleAction('Investigar', selected)}
                                    className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-100 px-3 py-2 rounded-lg"
                                >
                                    Investigate
                                </button>
                                <button
                                    onClick={() => handleAction('Presionar renuncia', selected)}
                                    className="text-xs bg-red-700 hover:bg-red-600 text-white px-3 py-2 rounded-lg"
                                >
                                    Pressure to Resign
                                </button>
                            </div>
                            {actionMessage && (
                                <p className="text-xs text-blue-300 mt-1">{actionMessage}</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm mt-2">Selecciona un juez para ver detalles.</p>
                    )}
                </div>

                {constitution && (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-sm">
                        <h3 className="text-slate-200 font-bold flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Constitución
                        </h3>
                        <div className="mt-3 space-y-2 text-sm text-slate-300">
                            <p>Duración del mandato: <span className="font-semibold">{constitution.termLength} años</span></p>
                            <p>Sistema electoral: <span className="font-semibold">{constitution.electionSystem}</span></p>
                            <p>Independencia judicial: <span className="font-semibold text-blue-300">{constitution.judicialIndependence}%</span></p>
                            <div className="pt-2">
                                <p className="text-xs uppercase text-slate-500 mb-1">Derechos</p>
                                <div className="flex gap-2">
                                    {['freeSpeech', 'assembly', 'strike'].map(key => (
                                        <span
                                            key={key}
                                            className={`px-2 py-1 rounded-md text-xs ${constitution.rights[key as keyof typeof constitution.rights]
                                                ? 'bg-emerald-600/30 text-emerald-200'
                                                : 'bg-slate-700 text-slate-400'}`}
                                        >
                                            {key}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
