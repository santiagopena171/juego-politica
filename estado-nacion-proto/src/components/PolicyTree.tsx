import React from 'react';
import { Shield, TrendingUp, Users } from 'lucide-react';

const NODES = [
    { id: 'security_1', title: 'Ley de Orden Público', axis: 'Autoritarismo', icon: <Shield className="w-4 h-4" /> },
    { id: 'security_2', title: 'Vigilancia Masiva', axis: 'Autoritarismo', icon: <Shield className="w-4 h-4" /> },
    { id: 'market_1', title: 'Privatizar Salud', axis: 'Libre Mercado', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'market_2', title: 'Desregulación Financiera', axis: 'Libre Mercado', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'welfare_1', title: 'Renta Básica', axis: 'Planificada', icon: <Users className="w-4 h-4" /> },
    { id: 'welfare_2', title: 'Educación Gratuita', axis: 'Planificada', icon: <Users className="w-4 h-4" /> },
];

export const PolicyTree: React.FC = () => {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-slate-200 font-semibold">Árbol de Reformas</h3>
                    <p className="text-xs text-slate-500">Elige el camino ideológico para resolver crisis.</p>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {NODES.map(node => (
                    <div key={node.id} className="p-3 rounded-lg border border-slate-700 bg-slate-900/60">
                        <div className="flex items-center gap-2 text-slate-200 font-semibold">
                            <span className="text-amber-300">{node.icon}</span>
                            <span className="text-sm">{node.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{node.axis}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
