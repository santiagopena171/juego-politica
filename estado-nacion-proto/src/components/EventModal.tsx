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
    ChevronUp,
    FileText,
    AlertCircle
} from 'lucide-react';
import type { EventCategory, EventChoice } from '../data/events';

// Iconos por categoría con estilo premium
const CATEGORY_ICONS: Record<EventCategory, { icon: typeof AlertTriangle; color: string; glow: string; label: string; priority: string }> = {
    economic: { icon: TrendingUp, color: 'text-emerald-400', glow: 'shadow-glow-cyan', label: 'Económico', priority: 'NORMAL' },
    political: { icon: Landmark, color: 'text-blue-400', glow: 'shadow-glow', label: 'Político', priority: 'ALTA' },
    social: { icon: Users, color: 'text-purple-400', glow: 'shadow-glow', label: 'Social', priority: 'MEDIA' },
    diplomatic: { icon: Globe, color: 'text-cyan-400', glow: 'shadow-glow-cyan', label: 'Diplomático', priority: 'ALTA' },
    disaster: { icon: CloudRain, color: 'text-rose-400', glow: 'shadow-glow-rose', label: 'Desastre', priority: 'CRÍTICA' },
    scandal: { icon: Newspaper, color: 'text-amber-400', glow: 'shadow-glow-amber', label: 'Escándalo', priority: 'ALTA' },
    storyline: { icon: FileText, color: 'text-amber-400', glow: 'shadow-glow-amber', label: 'Historia', priority: 'ESPECIAL' },
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
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fade-in">
            <div className="dossier-panel max-w-4xl w-full max-h-[90vh] flex flex-col animate-slide-up">
                {/* Classified Header */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 border-b border-amber-400/30">
                    <div className="classified-header">
                        <Lock className="w-4 h-4" />
                        <span>CLASIFICADO - {categoryInfo.priority}</span>
                        <div className="flex-1 border-t border-amber-400/20 mx-3" />
                        <span>{categoryInfo.label}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                        <div className={`p-4 rounded-xl ${categoryInfo.glow} bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10`}>
                            <CategoryIcon className={`w-8 h-8 ${categoryInfo.color}`} />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-display text-3xl font-bold text-white mb-1">
                                {activeEvent.title}
                            </h2>
                            <p className="text-sm text-slate-400 font-mono uppercase tracking-wider">
                                Decisión Presidencial Requerida
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto flex-1 space-y-6">
                    {/* Description */}
                    <div className="glass-panel-light p-6 border-l-4 border-l-cyan-400">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <p className="text-lg text-slate-200 leading-relaxed">
                                {activeEvent.description}
                            </p>
                        </div>
                    </div>

                    {/* Context info */}
                    {activeEvent.chainStage && (
                        <div className="glass-panel-light p-4 border-l-4 border-l-purple-400">
                            <div className="flex items-center gap-2 text-purple-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-semibold">
                                    Parte {activeEvent.chainStage} de una cadena de eventos
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Choices - Action Cards */}
                    <div>
                        <h3 className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Opciones Disponibles
                        </h3>
                        <div className="grid gap-3">
                            {activeEvent.choices.map((choice, index) => {
                                const affordability = canAffordChoice(choice);
                                const isExpanded = expandedChoice === index;
                                const isDisabled = !affordability.canAfford;

                                return (
                                    <div 
                                        key={index}
                                        className={`glass-panel-light border-l-4 transition-all ${
                                            isDisabled 
                                                ? 'border-l-slate-600 opacity-50' 
                                                : 'border-l-cyan-400 hover:border-l-amber-400 hover:shadow-glow-amber'
                                        }`}
                                    >
                                        <button
                                            onClick={() => {
                                                if (!isDisabled) {
                                                    handleChoice(index);
                                                }
                                            }}
                                            disabled={isDisabled}
                                            className="w-full text-left p-5 transition-all disabled:cursor-not-allowed"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`font-display text-xl font-bold ${
                                                            isDisabled ? 'text-slate-500' : 'text-white'
                                                        }`}>
                                                            {choice.label}
                                                        </span>
                                                        {isDisabled && (
                                                            <div className="flex items-center gap-1 px-2 py-1 bg-rose-500/20 border border-rose-500/30 rounded">
                                                                <Lock className="w-3 h-3 text-rose-400" />
                                                                <span className="text-xs text-rose-400 font-semibold">BLOQUEADO</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <p className={`text-sm mb-3 ${
                                                        isDisabled ? 'text-slate-600' : 'text-slate-300'
                                                    }`}>
                                                        {choice.description}
                                                    </p>
                                                    
                                                    {/* Requirements warning */}
                                                    {!affordability.canAfford && (
                                                        <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                                                            <div className="flex items-start gap-2">
                                                                <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                                                                <div className="text-xs text-rose-400 space-y-1">
                                                                    {affordability.reasons.map((reason, i) => (
                                                                        <div key={i}>• {reason}</div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Tooltip */}
                                                    {choice.tooltip && (
                                                        <div className="mb-3 p-3 bg-amber-500/10 border border-amber-400/30 rounded-lg">
                                                            <div className="flex items-start gap-2">
                                                                <HelpCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                                                <div className="text-xs text-amber-300">
                                                                    {choice.tooltip}
                                                                </div>
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
                                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
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
        </div>
    );
};
