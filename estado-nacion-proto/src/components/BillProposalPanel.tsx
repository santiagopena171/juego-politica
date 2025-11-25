import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { FileText, TrendingUp, TrendingDown, X } from 'lucide-react';
import type { Bill, PolicyArea } from '../types/parliament';
import { ALL_BILL_TEMPLATES, generateBill } from '../data/bills';

const POLICY_AREA_NAMES: Record<PolicyArea, string> = {
    economy: 'Economía',
    social: 'Social',
    security: 'Seguridad',
    education: 'Educación',
    health: 'Salud',
    environment: 'Medio Ambiente',
    infrastructure: 'Infraestructura',
    foreign: 'Relaciones Exteriores'
};

interface BillProposalPanelProps {
    onClose: () => void;
}

export const BillProposalPanel = ({ onClose }: BillProposalPanelProps) => {
    const { state, dispatch } = useGame();
    const [selectedArea, setSelectedArea] = useState<PolicyArea>('economy');
    const [selectedBill, setSelectedBill] = useState<Partial<Bill> | null>(null);

    const billsInArea = ALL_BILL_TEMPLATES.filter(b => b.policyArea === selectedArea);

    const calculatePassageChance = (bill: Partial<Bill>): number => {
        // Simple calculation based on government support
        const baseChance = state.government.parliament.governmentSupport || 50;

        // Adjust based on required majority
        const required = bill.requiredMajority || 50;
        if (baseChance >= required + 10) return 85;
        if (baseChance >= required) return 65;
        if (baseChance >= required - 10) return 45;
        return 25;
    };

    const handlePropose = () => {
        if (!selectedBill) return;

        const PROPOSAL_COST = 10; // Political Capital cost
        if (state.resources.politicalCapital < PROPOSAL_COST) {
            alert('Capital Político insuficiente');
            return;
        }

        const fullBill = generateBill(selectedBill, 'government');
        dispatch({ type: 'PROPOSE_BILL', payload: { bill: fullBill } });

        // Deduct political capital (need to add this action)
        // For now we just dispatch the bill

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-6xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                            Proponer Ley
                        </h2>
                        <p className="text-slate-400">
                            Capital Político disponible: {state.resources.politicalCapital}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Area tabs */}
                <div className="p-6 border-b border-slate-700">
                    <div className="flex gap-2 flex-wrap">
                        {(Object.keys(POLICY_AREA_NAMES) as PolicyArea[]).map(area => (
                            <button
                                key={area}
                                onClick={() => {
                                    setSelectedArea(area);
                                    setSelectedBill(null);
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedArea === area
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                {POLICY_AREA_NAMES[area]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bills list */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 gap-4">
                        {billsInArea.map((bill, index) => {
                            const passageChance = calculatePassageChance(bill);
                            const isSelected = selectedBill === bill;

                            return (
                                <div
                                    key={index}
                                    onClick={() => setSelectedBill(bill)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                                            ? 'bg-blue-900/30 border-blue-500'
                                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FileText className="w-5 h-5 text-blue-400" />
                                                <h3 className="font-bold text-white">{bill.title}</h3>
                                            </div>
                                            <p className="text-sm text-slate-400 mb-3">
                                                {bill.description}
                                            </p>
                                        </div>

                                        {/* Passage chance indicator */}
                                        <div className="flex-shrink-0 ml-4">
                                            <div className={`px-3 py-1 rounded-lg text-sm font-bold ${passageChance >= 70 ? 'bg-green-900/30 text-green-400 border border-green-700' :
                                                    passageChance >= 50 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700' :
                                                        'bg-red-900/30 text-red-400 border border-red-700'
                                                }`}>
                                                {passageChance}% aprobación
                                            </div>
                                        </div>
                                    </div>

                                    {/* Effects preview */}
                                    {bill.effects && (
                                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-700">
                                            {bill.effects.statChanges && Object.entries(bill.effects.statChanges).map(([key, value]) => (
                                                <div key={key} className="flex items-center gap-2 text-sm">
                                                    {value > 0 ? (
                                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                                    ) : (
                                                        <TrendingDown className="w-4 h-4 text-red-400" />
                                                    )}
                                                    <span className="text-slate-300 capitalize">{key}:</span>
                                                    <span className={value > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                                                        {value > 0 ? '+' : ''}{typeof value === 'number' ? value.toFixed(2) : value}
                                                    </span>
                                                </div>
                                            ))}
                                            {bill.effects.resourceChanges && Object.entries(bill.effects.resourceChanges).map(([key, value]) => (
                                                <div key={key} className="flex items-center gap-2 text-sm">
                                                    {value > 0 ? (
                                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                                    ) : (
                                                        <TrendingDown className="w-4 h-4 text-red-400" />
                                                    )}
                                                    <span className="text-slate-300 capitalize">{key}:</span>
                                                    <span className={value > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                                                        {value > 0 ? '+' : ''}{typeof value === 'number' ? value.toLocaleString() : value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bill details */}
                                    <div className="flex gap-4 mt-3 text-xs text-slate-500">
                                        <span>Mayoría requerida: {bill.requiredMajority}%</span>
                                        <span>Urgencia: {bill.urgency}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 flex justify-between items-center">
                    <div className="text-sm text-slate-400">
                        {selectedBill ? (
                            <>
                                <strong className="text-white">{selectedBill.title}</strong> seleccionada
                                <span className="ml-2 text-yellow-400">(Costo: 10 Capital Político)</span>
                            </>
                        ) : (
                            'Selecciona una ley para proponer'
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handlePropose}
                            disabled={!selectedBill || state.resources.politicalCapital < 10}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${selectedBill && state.resources.politicalCapital >= 10
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg'
                                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            Proponer Ley
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
