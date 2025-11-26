import React from 'react';
import { X, TrendingDown, TrendingUp, AlertTriangle, Zap, DollarSign, Users } from 'lucide-react';
import type { EconomicEvent } from '../types/economy';

interface EconomicEventModalProps {
    event: EconomicEvent;
    onClose: () => void;
}

const EconomicEventModal: React.FC<EconomicEventModalProps> = ({ event, onClose }) => {
    const isPositive = event.type === 'positive';
    
    const getIcon = () => {
        if (event.id === 'economic_crash') return <TrendingDown className="text-red-400" size={32} />;
        if (event.id === 'labor_strike') return <Users className="text-orange-400" size={32} />;
        if (event.id === 'resource_discovery') return <Zap className="text-green-400" size={32} />;
        if (event.id === 'tech_boom') return <TrendingUp className="text-blue-400" size={32} />;
        if (event.id === 'trade_war') return <AlertTriangle className="text-red-400" size={32} />;
        if (event.id === 'foreign_investment') return <DollarSign className="text-green-400" size={32} />;
        return <AlertTriangle className="text-yellow-400" size={32} />;
    };

    const getBorderColor = () => {
        if (isPositive) return 'border-green-500';
        return 'border-red-500';
    };

    const getGlowColor = () => {
        if (isPositive) return 'shadow-green-500/20';
        return 'shadow-red-500/20';
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className={`bg-slate-800 rounded-lg border-2 ${getBorderColor()} ${getGlowColor()} shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900 rounded-lg">
                            {getIcon()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{event.name}</h2>
                            <span className={`text-sm px-2 py-1 rounded ${
                                isPositive 
                                    ? 'bg-green-500/20 text-green-300' 
                                    : 'bg-red-500/20 text-red-300'
                            }`}>
                                {isPositive ? 'Evento Positivo' : 'Evento Negativo'}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Description */}
                    <div className="bg-slate-900 rounded-lg p-4">
                        <p className="text-slate-200 text-lg leading-relaxed">{event.description}</p>
                    </div>

                    {/* Impact Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Impacto Económico</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {/* GDP Impact */}
                            <div className="bg-slate-900 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp size={18} className={event.gdpImpact > 0 ? 'text-green-400' : 'text-red-400'} />
                                    <span className="text-slate-400 text-sm">PIB</span>
                                </div>
                                <p className={`text-2xl font-bold ${
                                    event.gdpImpact > 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                    {event.gdpImpact > 0 ? '+' : ''}{(event.gdpImpact * 100).toFixed(1)}%
                                </p>
                            </div>

                            {/* Unemployment Impact */}
                            <div className="bg-slate-900 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users size={18} className={event.unemploymentChange < 0 ? 'text-green-400' : 'text-red-400'} />
                                    <span className="text-slate-400 text-sm">Desempleo</span>
                                </div>
                                <p className={`text-2xl font-bold ${
                                    event.unemploymentChange < 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                    {event.unemploymentChange > 0 ? '+' : ''}{(event.unemploymentChange * 100).toFixed(1)}%
                                </p>
                            </div>

                            {/* Stability Impact */}
                            <div className="bg-slate-900 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={18} className={event.stabilityChange > 0 ? 'text-green-400' : 'text-red-400'} />
                                    <span className="text-slate-400 text-sm">Estabilidad</span>
                                </div>
                                <p className={`text-2xl font-bold ${
                                    event.stabilityChange > 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                    {event.stabilityChange > 0 ? '+' : ''}{event.stabilityChange}
                                </p>
                            </div>

                            {/* Duration */}
                            <div className="bg-slate-900 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap size={18} className="text-blue-400" />
                                    <span className="text-slate-400 text-sm">Duración</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-400">
                                    {event.duration} {event.duration === 1 ? 'mes' : 'meses'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Affected Regions */}
                    {event.affectedRegions && event.affectedRegions.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Regiones Afectadas</h3>
                            <div className="bg-slate-900 rounded-lg p-4">
                                <p className="text-slate-300">
                                    {event.affectedRegions.length === 0 
                                        ? 'Todo el país' 
                                        : event.affectedRegions.length === 1 
                                            ? '1 región específica'
                                            : `${event.affectedRegions.length} regiones`
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className={`rounded-lg p-4 border-l-4 ${
                        isPositive 
                            ? 'bg-green-500/10 border-green-500' 
                            : 'bg-red-500/10 border-red-500'
                    }`}>
                        <p className="text-slate-300">
                            {isPositive 
                                ? 'Este evento beneficiará a tu economía durante los próximos meses. Aprovecha este momento para consolidar tu posición.'
                                : 'Este evento presenta un desafío económico serio. Considera ajustar tu presupuesto y políticas para mitigar el impacto.'
                            }
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EconomicEventModal;
