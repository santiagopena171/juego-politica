import { useGame } from '../context/GameContext';
import { AlertTriangle, DollarSign, Users, Heart, Zap, X } from 'lucide-react';
import { useState } from 'react';

const DISASTER_INFO = {
    earthquake: {
        icon: '🌍',
        name: 'Terremoto',
        color: 'from-red-900 to-red-700',
        description: 'Emergencia sísmica nacional',
    },
    flood: {
        icon: '🌊',
        name: 'Inundación',
        color: 'from-blue-900 to-blue-700',
        description: 'Inundaciones devastadoras',
    },
    pandemic: {
        icon: '🦠',
        name: 'Pandemia',
        color: 'from-purple-900 to-purple-700',
        description: 'Crisis sanitaria nacional',
    },
    drought: {
        icon: '☀️',
        name: 'Sequía',
        color: 'from-amber-900 to-amber-700',
        description: 'Crisis de agua y agricultura',
    },
};

export const EmergencyModePanel = () => {
    const { state, dispatch } = useGame();
    const { emergencyMode } = state;
    const [allocation, setAllocation] = useState({
        rescue: 25,
        medical: 25,
        infrastructure: 25,
        relief: 25,
    });

    if (!emergencyMode.active || !emergencyMode.type) return null;

    const disasterInfo = DISASTER_INFO[emergencyMode.type];
    const totalAllocation = Object.values(allocation).reduce((sum, val) => sum + val, 0);
    const isValidAllocation = Math.abs(totalAllocation - 100) < 0.1;

    // Calcular efectividad de la asignación
    const calculateEffectiveness = () => {
        const values = [allocation.rescue, allocation.medical, allocation.infrastructure, allocation.relief];
        const mean = 25;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 4;
        return Math.max(0, Math.min(100, 100 - Math.sqrt(variance) * 5));
    };
    
    const effectiveness = calculateEffectiveness();

    const handleAllocationChange = (key: keyof typeof allocation, value: number) => {
        setAllocation(prev => ({
            ...prev,
            [key]: Math.max(0, Math.min(100, value))
        }));
    };

    const handleDeployResponse = () => {
        if (!isValidAllocation) return;
        
        // TODO: Dispatch action para manejar respuesta de emergencia
        // Por ahora solo cerramos el panel
        dispatch({ 
            type: 'EXIT_EMERGENCY_MODE' as any,
            payload: { allocation } 
        });
    };

    const remainingTurns = emergencyMode.turnsRemaining || 3;
    const severity = emergencyMode.severity || 50;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border-2 border-red-500 rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden animate-pulse-border">
                {/* Header */}
                <div className={`bg-gradient-to-r ${disasterInfo.color} p-6 border-b-2 border-red-500`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-6xl">{disasterInfo.icon}</div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
                                    <h2 className="text-3xl font-bold text-white">
                                        MODO EMERGENCIA
                                    </h2>
                                </div>
                                <p className="text-red-200 text-xl font-semibold">
                                    {disasterInfo.name}: {disasterInfo.description}
                                </p>
                                <div className="flex gap-4 mt-2 text-sm">
                                    <span className="text-red-300">
                                        🔥 Severidad: {severity}/100
                                    </span>
                                    <span className="text-red-300">
                                        ⏰ Turnos restantes: {remainingTurns}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <p className="text-red-300 text-center font-semibold">
                            ⚠️ Se requiere respuesta inmediata del gobierno. Asigna el presupuesto de emergencia.
                        </p>
                    </div>

                    {/* Allocation Sliders */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white mb-4">
                            Asignación de Presupuesto de Emergencia (Total: {totalAllocation.toFixed(0)}%)
                        </h3>

                        {/* Rescue Operations */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-400" />
                                    <span className="text-white font-semibold">Operaciones de Rescate</span>
                                </div>
                                <span className="text-blue-400 font-bold">{allocation.rescue}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={allocation.rescue}
                                onChange={(e) => handleAllocationChange('rescue', Number(e.target.value))}
                                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <p className="text-sm text-slate-400">
                                Búsqueda y rescate de víctimas atrapadas
                            </p>
                        </div>

                        {/* Medical Aid */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-red-400" />
                                    <span className="text-white font-semibold">Atención Médica</span>
                                </div>
                                <span className="text-red-400 font-bold">{allocation.medical}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={allocation.medical}
                                onChange={(e) => handleAllocationChange('medical', Number(e.target.value))}
                                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                            <p className="text-sm text-slate-400">
                                Hospitales de campaña y suministros médicos
                            </p>
                        </div>

                        {/* Infrastructure */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    <span className="text-white font-semibold">Infraestructura Crítica</span>
                                </div>
                                <span className="text-yellow-400 font-bold">{allocation.infrastructure}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={allocation.infrastructure}
                                onChange={(e) => handleAllocationChange('infrastructure', Number(e.target.value))}
                                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                            />
                            <p className="text-sm text-slate-400">
                                Restaurar electricidad, agua y comunicaciones
                            </p>
                        </div>

                        {/* Relief Supplies */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-green-400" />
                                    <span className="text-white font-semibold">Ayuda Humanitaria</span>
                                </div>
                                <span className="text-green-400 font-bold">{allocation.relief}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={allocation.relief}
                                onChange={(e) => handleAllocationChange('relief', Number(e.target.value))}
                                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                            />
                            <p className="text-sm text-slate-400">
                                Alimentos, refugios temporales y asistencia
                            </p>
                        </div>
                    </div>

                    {/* Validation */}
                    {!isValidAllocation && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                            <p className="text-amber-400 text-sm text-center">
                                ⚠️ La suma debe ser exactamente 100% (actualmente: {totalAllocation.toFixed(0)}%)
                            </p>
                        </div>
                    )}

                    {/* Effectiveness Preview */}
                    {isValidAllocation && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-blue-300 font-semibold">📊 Efectividad Estimada</span>
                                <span className={`text-2xl font-bold ${
                                    effectiveness >= 80 ? 'text-green-400' :
                                    effectiveness >= 60 ? 'text-blue-400' :
                                    effectiveness >= 40 ? 'text-yellow-400' :
                                    'text-red-400'
                                }`}>
                                    {effectiveness.toFixed(0)}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 ${
                                        effectiveness >= 80 ? 'bg-green-500' :
                                        effectiveness >= 60 ? 'bg-blue-500' :
                                        effectiveness >= 40 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}
                                    style={{ width: `${effectiveness}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2 text-center">
                                {effectiveness >= 80 ? '✅ Distribución óptima - máxima efectividad' :
                                 effectiveness >= 60 ? '👍 Buena distribución' :
                                 effectiveness >= 40 ? '⚠️ Distribución desbalanceada' :
                                 '❌ Distribución muy desbalanceada - baja efectividad'}
                            </p>
                        </div>
                    )}

                    {/* Budget Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-700/50 rounded-lg">
                        <div>
                            <p className="text-slate-400 text-sm">Presupuesto Disponible</p>
                            <p className="text-white text-2xl font-bold">
                                ${state.resources.budget.toFixed(1)}B
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Costo Estimado</p>
                            <p className="text-red-400 text-2xl font-bold">
                                $50-150B
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleDeployResponse}
                            disabled={!isValidAllocation}
                            className={`flex-1 py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                                isValidAllocation
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg hover:shadow-blue-500/50'
                                    : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            🚨 Desplegar Respuesta de Emergencia
                        </button>
                    </div>

                    <p className="text-sm text-slate-500 text-center italic">
                        Tu respuesta afectará popularidad, estabilidad y DDHH según la efectividad de la asignación
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes pulse-border {
                    0%, 100% {
                        border-color: rgb(239, 68, 68);
                    }
                    50% {
                        border-color: rgb(248, 113, 113);
                    }
                }
                .animate-pulse-border {
                    animation: pulse-border 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};
