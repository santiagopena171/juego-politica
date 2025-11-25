import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { FileText, Hammer, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import type { Policy, Project } from '../types/politics';

export const PoliciesPanel = () => {
    const { state, dispatch: _dispatch } = useGame();
    const { policies, resources } = state;
    const [activeTab, setActiveTab] = useState<'policies' | 'projects'>('policies');

    // Helper to find the active option for a policy
    const getActiveOption = (policy: Policy) => {
        return policy.options.find(o => o.id === policy.activeOptionId);
    };

    const handlePolicyChange = (policyId: string, optionId: string) => {
        // In a real implementation, this might trigger a parliamentary vote
        // For now, we'll just dispatch an action (which needs to be implemented in the reducer)
        console.log(`Changing policy ${policyId} to option ${optionId}`);
        // dispatch({ type: 'CHANGE_POLICY', payload: { policyId, optionId } });
    };

    const handleStartProject = (project: Project) => {
        if (resources.budget >= project.cost) {
            console.log(`Starting project ${project.id}`);
            // dispatch({ type: 'START_PROJECT', payload: { projectId: project.id } });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-100">Gestión de Políticas Públicas</h2>
                    <p className="text-sm text-slate-400">Administra las leyes y proyectos de infraestructura</p>
                </div>
                <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button
                        onClick={() => setActiveTab('policies')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'policies' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <FileText size={16} /> Políticas
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <Hammer size={16} /> Proyectos
                    </button>
                </div>
            </div>

            {activeTab === 'policies' && (
                <div className="grid grid-cols-1 gap-4">
                    {/* Placeholder for when no policies are defined yet */}
                    {(!state.policies.activeProjects /* Using a proxy check since policies list isn't in state yet */ && false) && (
                        <div className="text-center p-8 text-slate-500">
                            No hay políticas disponibles para modificar.
                        </div>
                    )}

                    {/* Example Policies (Hardcoded for UI demo until state is fully populated) */}
                    {[
                        {
                            id: 'tax_system',
                            name: 'Sistema Impositivo',
                            category: 'Economy',
                            description: 'Define la estructura de recaudación fiscal del país.',
                            activeOptionId: 'progressive',
                            options: [
                                { id: 'flat', name: 'Impuesto Plano (Flat Tax)', costPerTurn: 0, effects: [{ target: 'gdp_growth', value: 0.02, mode: 'flat' }] },
                                { id: 'progressive', name: 'Impuesto Progresivo', costPerTurn: 0, effects: [{ target: 'inequality', value: -0.05, mode: 'flat' }] },
                            ]
                        },
                        {
                            id: 'healthcare',
                            name: 'Sistema de Salud',
                            category: 'Social',
                            description: 'Cobertura y financiamiento de la salud pública.',
                            activeOptionId: 'mixed',
                            options: [
                                { id: 'public', name: 'Universal y Gratuita', costPerTurn: 500, effects: [{ target: 'health', value: 5, mode: 'flat' }] },
                                { id: 'mixed', name: 'Sistema Mixto', costPerTurn: 200, effects: [{ target: 'health', value: 2, mode: 'flat' }] },
                                { id: 'private', name: 'Privatizado', costPerTurn: 0, effects: [{ target: 'inequality', value: 0.1, mode: 'flat' }] },
                            ]
                        }
                    ].map((policy: any) => (
                        <div key={policy.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-slate-100">{policy.name}</h3>
                                        <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full border border-slate-600">
                                            {policy.category}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400">{policy.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {policy.options.map((option: any) => {
                                    const isActive = policy.activeOptionId === option.id;
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => handlePolicyChange(policy.id, option.id)}
                                            className={`relative p-4 rounded-lg border-2 text-left transition-all ${isActive
                                                ? 'bg-blue-900/20 border-blue-500 ring-1 ring-blue-500/50'
                                                : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
                                                }`}
                                        >
                                            {isActive && (
                                                <div className="absolute top-3 right-3 text-blue-400">
                                                    <CheckCircle size={18} />
                                                </div>
                                            )}
                                            <div className="font-bold text-slate-200 mb-1">{option.name}</div>
                                            <div className="text-xs text-slate-500 mb-3">
                                                Costo: {option.costPerTurn > 0 ? `$${option.costPerTurn}M/turno` : 'Sin costo directo'}
                                            </div>
                                            <div className="space-y-1">
                                                {option.effects.map((effect: any, idx: number) => (
                                                    <div key={idx} className="text-xs flex items-center gap-1 text-emerald-400">
                                                        <TrendingUp size={12} />
                                                        <span>{effect.target}: {effect.value > 0 ? '+' : ''}{effect.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'projects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active Projects */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-300 flex items-center gap-2">
                            <Clock size={18} /> Proyectos en Curso
                        </h3>
                        {policies.activeProjects.length === 0 ? (
                            <div className="p-8 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed text-center text-slate-500">
                                No hay proyectos activos actualmente.
                            </div>
                        ) : (
                            policies.activeProjects.map(project => (
                                <div key={project.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-200">{project.name}</h4>
                                        <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-300 border border-blue-800 rounded">
                                            {project.status}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-900 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Progreso: {project.progress}%</span>
                                        <span>Restan {project.duration - Math.floor((project.progress / 100) * project.duration)} turnos</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Available Projects */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-300 flex items-center gap-2">
                            <Hammer size={18} /> Proyectos Disponibles
                        </h3>
                        {/* Mock available projects for UI demo */}
                        {[
                            { id: 'p1', name: 'Autopista Nacional', cost: 2000, duration: 12, description: 'Mejora la infraestructura logística.' },
                            { id: 'p2', name: 'Hospital Central', cost: 1500, duration: 8, description: 'Aumenta la capacidad sanitaria.' },
                            { id: 'p3', name: 'Red de Fibra Óptica', cost: 800, duration: 6, description: 'Moderniza las telecomunicaciones.' },
                        ].map(project => (
                            <div key={project.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-200">{project.name}</h4>
                                        <p className="text-xs text-slate-400">{project.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono text-emerald-400 font-bold">${project.cost}M</div>
                                        <div className="text-xs text-slate-500">{project.duration} turnos</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleStartProject(project as any)}
                                    disabled={resources.budget < project.cost}
                                    className={`w-full mt-2 py-1.5 rounded text-sm font-bold transition-colors ${resources.budget >= project.cost
                                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    {resources.budget >= project.cost ? 'Iniciar Proyecto' : 'Fondos Insuficientes'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
