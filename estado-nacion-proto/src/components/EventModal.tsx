import { useGame } from '../context/GameContext';
import React, { useState } from 'react';
import { 
    AlertTriangle, 
    TrendingDown, 
    TrendingUp, 
    DollarSign, 
    Users, 
    Shield, 
    Globe, 
    CloudRain,
    Newspaper,
    Landmark,
    Lock,
    Clock,
    HelpCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import type { EventCategory, EventChoice } from '../data/events';

// Iconos por categoría
const CATEGORY_ICONS: Record<EventCategory, { icon: typeof AlertTriangle; color: string; bg: string; label: string }> = {
    economic: { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/20', label: 'Económico' },
    political: { icon: Landmark, color: 'text-blue-500', bg: 'bg-blue-500/20', label: 'Político' },
    social: { icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/20', label: 'Social' },
    diplomatic: { icon: Globe, color: 'text-cyan-500', bg: 'bg-cyan-500/20', label: 'Diplomático' },
    disaster: { icon: CloudRain, color: 'text-red-500', bg: 'bg-red-500/20', label: 'Desastre' },
    scandal: { icon: Newspaper, color: 'text-orange-500', bg: 'bg-orange-500/20', label: 'Escándalo' },
    storyline: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/20', label: 'Historia' },
};

export const EventModal = () => {
    const { state, dispatch } = useGame();
    const { activeEvent } = state.events;
    const [expandedChoice, setExpandedChoice] = useState<number | null>(null);

    if (!activeEvent) return null;

    const categoryInfo = CATEGORY_ICONS[activeEvent.category || 'political'];
    const CategoryIcon = categoryInfo.icon;

    const handleChoice = (index: number) => {
        dispatch({ type: 'RESOLVE_EVENT', payload: { choiceIndex: index } });
    };

    const canAffordChoice = (choice: EventChoice): { canAfford: boolean; reasons: string[] } => {
        const reasons: string[] = [];
        
        if ('requirements' in choice && choice.requirements) {
            const req = choice.requirements;
            
            if (req.budget && state.resources.budget < req.budget) {
                reasons.push(`Necesitas $${req.budget}B (tienes $${state.resources.budget.toFixed(1)}B)`);
            }
            if (req.politicalCapital && state.resources.politicalCapital < req.politicalCapital) {
                reasons.push(`Necesitas ${req.politicalCapital} Capital Político (tienes ${state.resources.politicalCapital})`);
            }
            if (req.ministers && req.ministers.length > 0) {
                const hasMinisters = req.ministers.every(mId => 
                    state.government.ministers.some(m => m.id === mId)
                );
                if (!hasMinisters) {
                    reasons.push('Necesitas ministros específicos');
                }
            }
        }
        
        return {
            canAfford: reasons.length === 0,
            reasons
        };
    };

    const renderConsequences = (choice: EventChoice, isExpanded: boolean) => {
        if (!('consequences' in choice) || !choice.consequences) return null;
        
        const cons = choice.consequences;
        const effects: React.ReactElement[] = [];

        // Efectos inmediatos
        if (cons.immediate) {
            const imm = cons.immediate;
            
            if (imm.budget !== undefined) {
                effects.push(
                    <div key="budget" className="flex items-center gap-2">
                        <DollarSign className={`w-4 h-4 ${imm.budget >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                        <span className={imm.budget >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {imm.budget >= 0 ? '+' : ''}{imm.budget}B Presupuesto
                        </span>
                    </div>
                );
            }
            if (imm.popularity !== undefined) {
                effects.push(
                    <div key="popularity" className="flex items-center gap-2">
                        {imm.popularity >= 0 ? 
                            <TrendingUp className="w-4 h-4 text-green-400" /> : 
                            <TrendingDown className="w-4 h-4 text-red-400" />
                        }
                        <span className={imm.popularity >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {imm.popularity >= 0 ? '+' : ''}{imm.popularity}% Popularidad
                        </span>
                    </div>
                );
            }
            if (imm.stability !== undefined) {
                effects.push(
                    <div key="stability" className="flex items-center gap-2">
                        <Shield className={`w-4 h-4 ${imm.stability >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                        <span className={imm.stability >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {imm.stability >= 0 ? '+' : ''}{imm.stability} Estabilidad
                        </span>
                    </div>
                );
            }
            if (imm.politicalCapital !== undefined) {
                effects.push(
                    <div key="pc" className="flex items-center gap-2">
                        <Landmark className={`w-4 h-4 ${imm.politicalCapital >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                        <span className={imm.politicalCapital >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {imm.politicalCapital >= 0 ? '+' : ''}{imm.politicalCapital} Capital Político
                        </span>
                    </div>
                );
            }
            if (imm.humanRights !== undefined) {
                effects.push(
                    <div key="hr" className="flex items-center gap-2">
                        <Users className={`w-4 h-4 ${imm.humanRights >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                        <span className={imm.humanRights >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {imm.humanRights >= 0 ? '+' : ''}{imm.humanRights} DDHH
                        </span>
                    </div>
                );
            }
        }

        // Efectos en grupos de interés
        if (isExpanded && cons.approvalModifiers && cons.approvalModifiers.length > 0) {
            cons.approvalModifiers.forEach((mod, idx) => {
                effects.push(
                    <div key={`group-${idx}`} className="flex items-center gap-2">
                        <Users className={`w-4 h-4 ${(mod.modifier || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                        <span className={(mod.modifier || 0) >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {mod.groupId}: {(mod.modifier || 0) >= 0 ? '+' : ''}{mod.modifier}% ({mod.duration}m)
                        </span>
                    </div>
                );
            });
        }

        // Eventos demorados
        if (cons.delayed) {
            effects.push(
                <div key="delayed" className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400">
                        🔮 Activará evento en {cons.delayed.turnsDelay} {cons.delayed.turnsDelay === 1 ? 'mes' : 'meses'}
                    </span>
                </div>
            );
        }

        // Efectos ocultos
        if (cons.hidden) {
            effects.push(
                <div key="hidden" className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 italic">
                        ❓ {isExpanded ? cons.hidden : 'Consecuencias desconocidas...'}
                    </span>
                </div>
            );
        }

        return effects.length > 0 ? (
            <div className="mt-3 space-y-1.5 text-sm">
                {effects}
            </div>
        ) : null;
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-slate-900 p-6 border-b border-slate-700 flex items-center gap-4">
                    <div className={`${categoryInfo.bg} p-3 rounded-full`}>
                        <CategoryIcon className={`w-8 h-8 ${categoryInfo.color}`} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-white">{activeEvent.title}</h2>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${categoryInfo.bg} ${categoryInfo.color}`}>
                                {categoryInfo.label}
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm uppercase tracking-wider">Decisión Presidencial Requerida</p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto flex-1">
                    <p className="text-lg text-slate-300 leading-relaxed mb-8">
                        {activeEvent.description}
                    </p>

                    {/* Context info */}
                    {activeEvent.chainStage && (
                        <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                            <div className="flex items-center gap-2 text-purple-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-semibold">
                                    Parte {activeEvent.chainStage} de una cadena de eventos
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Choices */}
                    <div className="grid gap-4">
                        {activeEvent.choices.map((choice, index) => {
                            const affordability = canAffordChoice(choice);
                            const isExpanded = expandedChoice === index;
                            const isDisabled = !affordability.canAfford;

                            return (
                                <div 
                                    key={index}
                                    className={`border rounded-lg overflow-hidden transition-all ${
                                        isDisabled 
                                            ? 'bg-slate-800 border-slate-700 opacity-60' 
                                            : 'bg-slate-700 border-slate-600 hover:border-amber-500/50'
                                    }`}
                                >
                                    <button
                                        onClick={() => {
                                            if (!isDisabled) {
                                                handleChoice(index);
                                            }
                                        }}
                                        disabled={isDisabled}
                                        className="w-full text-left p-4 transition-all disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={`font-bold ${isDisabled ? 'text-slate-500' : 'text-white'}`}>
                                                        {choice.label}
                                                    </div>
                                                    {isDisabled && (
                                                        <Lock className="w-4 h-4 text-red-400" />
                                                    )}
                                                </div>
                                                <div className={`text-sm ${isDisabled ? 'text-slate-600' : 'text-slate-400'}`}>
                                                    {choice.description}
                                                </div>
                                                
                                                {/* Requirements warning */}
                                                {!affordability.canAfford && (
                                                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
                                                        <div className="text-xs text-red-400">
                                                            ⚠️ {affordability.reasons.join(', ')}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Tooltip */}
                                                {choice.tooltip && (
                                                    <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded">
                                                        <div className="text-xs text-amber-400">
                                                            💡 {choice.tooltip}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Consequences */}
                                                {renderConsequences(choice, isExpanded)}
                                            </div>

                                            {/* Expand button */}
                                            {'consequences' in choice && choice.consequences && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExpandedChoice(isExpanded ? null : index);
                                                    }}
                                                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-5 h-5 text-slate-400" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
