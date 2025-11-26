import { useMemo, useState, type ReactElement } from 'react';
import { Rocket, Atom, Building2, Trophy, Construction } from 'lucide-react';
import { useGame } from '../context/GameContext';
import type { NationalProject } from '../systems/grandProjects';

const PROJECT_DEFS: Record<string, { title: string; icon: ReactElement; description: string; baseCost: number; benefits: string[] }> = {
    NUCLEAR_PROGRAM: {
        title: 'Programa Nuclear',
        icon: <Atom className="w-5 h-5" />,
        description: 'Disuasión estratégica. Riesgo de sanciones internacionales.',
        baseCost: 120,
        benefits: ['Disuasión militar', 'Estabilidad +', 'Riesgo de sanciones']
    },
    SPACE_AGENCY: {
        title: 'Agencia Espacial',
        icon: <Rocket className="w-5 h-5" />,
        description: 'Prestigio tecnológico y científico.',
        baseCost: 80,
        benefits: ['+10 Puntos de investigación/mes', 'Prestigio global']
    },
    HIGH_SPEED_RAIL: {
        title: 'Tren de Alta Velocidad',
        icon: <Building2 className="w-5 h-5" />,
        description: 'Conecta las principales ciudades, impulsa el PIB.',
        baseCost: 60,
        benefits: ['Productividad regional +', 'Felicidad +']
    },
    NEW_CAPITAL_CITY: {
        title: 'Nueva Capital',
        icon: <Building2 className="w-5 h-5" />,
        description: 'Rediseña el centro político del país.',
        baseCost: 150,
        benefits: ['Estabilidad +', 'Costos políticos -']
    },
    OLYMPICS: {
        title: 'Olimpiadas Nacionales',
        icon: <Trophy className="w-5 h-5" />,
        description: 'Un mega-evento para mostrar poder blando.',
        baseCost: 50,
        benefits: ['Popularidad +', 'Diplomacia +']
    }
};

export const GrandProjectsPanel = () => {
    const { state } = useGame();
    const [actionMsg, setActionMsg] = useState<string | null>(null);

    const projectsById: Record<string, NationalProject> = useMemo(() => {
        const map: Record<string, NationalProject> = {};
        state.nationalProjects?.forEach(p => { map[p.id] = p; });
        return map;
    }, [state.nationalProjects]);

    const handleStart = (id: string) => {
        setActionMsg(`Iniciar ${PROJECT_DEFS[id].title}: conecta con dispatch/reducer para comenzar.`);
        setTimeout(() => setActionMsg(null), 2500);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Construction className="w-6 h-6 text-amber-400" />
                <div>
                    <h2 className="text-xl font-bold text-slate-100">Proyectos Nacionales</h2>
                    <p className="text-sm text-slate-400">Define tu legado histórico y multiplica tu poder blando.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(PROJECT_DEFS).map(([id, def]) => {
                    const proj = projectsById[id];
                    const status = proj?.status || 'PLANNED';
                    const progress = proj?.progress ?? 0;
                    return (
                        <div key={id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-slate-900 text-amber-300">{def.icon}</div>
                                    <div>
                                        <p className="text-slate-200 font-semibold">{def.title}</p>
                                        <p className="text-xs text-slate-400">{def.description}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-md uppercase ${
                                    status === 'COMPLETED' ? 'bg-amber-500/20 text-amber-200 border border-amber-400/50'
                                        : status === 'BUILDING' ? 'bg-blue-500/20 text-blue-200 border border-blue-400/50'
                                            : 'bg-slate-700 text-slate-200 border border-slate-600'
                                }`}>
                                    {status}
                                </span>
                            </div>

                            <div className="text-xs text-slate-300 flex flex-wrap gap-2">
                                {def.benefits.map(b => (
                                    <span key={b} className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700">{b}</span>
                                ))}
                            </div>

                            {status === 'PLANNED' && (
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-slate-300">Costo mensual estimado: <span className="text-amber-300 font-semibold">${def.baseCost}B</span></div>
                                    <button
                                        onClick={() => handleStart(id)}
                                        className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                                    >
                                        Iniciar Proyecto
                                    </button>
                                </div>
                            )}

                            {status === 'BUILDING' && (
                                <div>
                                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                                        <span>Progreso</span>
                                        <span>{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                                        <div className="h-2 bg-blue-500 transition-all" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Costo actual: ${proj?.costPerTurn ?? def.baseCost}B / mes</p>
                                </div>
                            )}

                            {status === 'COMPLETED' && (
                                <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-400/30 rounded-lg p-2">
                                    Beneficios activos aplicados.
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {actionMsg && <p className="text-xs text-blue-300">{actionMsg}</p>}
        </div>
    );
};
