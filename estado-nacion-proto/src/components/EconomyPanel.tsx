import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TrendingUp, TrendingDown, MapPin, Factory, DollarSign, Users, AlertCircle, Globe2 } from 'lucide-react';
import type { IndustryType, BudgetAllocation } from '../types/economy';

export const EconomyPanel = () => {
    const { state, dispatch } = useGame();
    const { economy, stats, resources } = state;
    const [editingBudget, setEditingBudget] = useState(false);
    const [budgetDraft, setBudgetDraft] = useState(economy.budgetAllocation);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-AR', { 
            style: 'currency', 
            currency: 'USD', 
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(amount * 1_000_000_000);
    };

    const getIndustryIcon = (type: IndustryType) => {
        switch (type) {
            case 'Agriculture': return '🌾';
            case 'Industry': return '🏭';
            case 'Services': return '💼';
            case 'Technology': return '💻';
            case 'Mining': return '⛏️';
        }
    };

    const gdpPerCapita = stats.gdp / stats.population;

    const handleBudgetChange = (category: keyof BudgetAllocation, value: number) => {
        setBudgetDraft({
            ...budgetDraft,
            [category]: Math.max(0, Math.min(100, value))
        });
    };

    const handleSaveBudget = () => {
        const total = Object.values(budgetDraft).reduce((sum, val) => sum + val, 0);
        if (Math.abs(total - 100) < 0.01) {
            dispatch({ type: 'UPDATE_BUDGET_ALLOCATION', payload: { allocation: budgetDraft } });
            setEditingBudget(false);
        }
    };

    const budgetTotal = Object.values(budgetDraft).reduce((sum, val) => sum + val, 0);

    return (
        <div className="space-y-6 p-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-1">Sistema Económico Nacional</h2>
                <p className="text-sm text-slate-400">Gestión avanzada de economía, regiones e industrias</p>
            </div>

            {/* Active Economic Event Banner */}
            {economy.economicEvent && economy.economicEvent.remainingDuration! > 0 && (
                <div className={`rounded-lg border-2 p-4 ${
                    economy.economicEvent.type === 'positive' 
                        ? 'bg-green-500/10 border-green-500' 
                        : 'bg-red-500/10 border-red-500'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className={economy.economicEvent.type === 'positive' ? 'text-green-400' : 'text-red-400'} size={20} />
                                <h3 className="font-bold text-white">{economy.economicEvent.name}</h3>
                            </div>
                            <p className="text-sm text-slate-300">{economy.economicEvent.description}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-400">Duración restante</div>
                            <div className="text-2xl font-bold text-white">
                                {economy.economicEvent.remainingDuration} {economy.economicEvent.remainingDuration === 1 ? 'mes' : 'meses'}
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 flex gap-4 text-sm">
                        <span className={`${economy.economicEvent.gdpImpact > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            PIB: {economy.economicEvent.gdpImpact > 0 ? '+' : ''}{(economy.economicEvent.gdpImpact * 100).toFixed(1)}%
                        </span>
                        <span className={`${economy.economicEvent.unemploymentChange < 0 ? 'text-green-400' : 'text-red-400'}`}>
                            Desempleo: {economy.economicEvent.unemploymentChange > 0 ? '+' : ''}{(economy.economicEvent.unemploymentChange * 100).toFixed(1)}%
                        </span>
                        <span className={`${economy.economicEvent.stabilityChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            Estabilidad: {economy.economicEvent.stabilityChange > 0 ? '+' : ''}{economy.economicEvent.stabilityChange}
                        </span>
                    </div>
                </div>
            )}

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 uppercase font-semibold">PIB Total</span>
                        <DollarSign className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-100">{formatMoney(stats.gdp)}</div>
                    <div className="text-xs text-slate-500 mt-1">Per cápita: {formatMoney(gdpPerCapita / 1_000_000_000)}</div>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 uppercase font-semibold">Desempleo</span>
                        <Users className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-100">{(stats.unemployment * 100).toFixed(1)}%</div>
                    <div className="text-xs text-slate-500 mt-1">Nacional promedio</div>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 uppercase font-semibold">Tecnología</span>
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-100">{economy.technologyLevel.toFixed(0)}</div>
                    <div className="text-xs text-slate-500 mt-1">I+D: {economy.researchPoints.toFixed(0)} pts</div>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 uppercase font-semibold">Tratados</span>
                        <Globe2 className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-100">{economy.tradeAgreements.length}</div>
                    <div className="text-xs text-slate-500 mt-1">Comerciales activos</div>
                </div>
            </div>

            {/* Regiones */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-bold text-slate-100">Regiones Económicas</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {economy.regions.map(region => (
                        <div key={region.id} className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-bold text-slate-100">{region.name}</h4>
                                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                        {getIndustryIcon(region.dominantIndustry)} {region.dominantIndustry}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono text-green-400">{formatMoney(region.gdpContribution)}</div>
                                    <div className="text-xs text-slate-500">{((region.gdpContribution / stats.gdp) * 100).toFixed(1)}%</div>
                                </div>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Población:</span>
                                    <span className="text-slate-200">{(region.population / 1_000_000).toFixed(1)}M</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Desempleo:</span>
                                    <span className={`${region.unemployment > 0.10 ? 'text-red-400' : 'text-green-400'}`}>
                                        {(region.unemployment * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Felicidad:</span>
                                    <span className="text-slate-200">{region.happiness.toFixed(0)}/100</span>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-slate-400">Desarrollo:</span>
                                        <span className="text-slate-200">{region.development}/100</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                                        <div
                                            className="h-1.5 rounded-full bg-blue-500"
                                            style={{ width: `${region.development}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Industrias */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                    <Factory className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-bold text-slate-100">Sectores Industriales</h3>
                </div>

                <div className="space-y-3">
                    {economy.industries.map(industry => (
                        <div key={industry.type} className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{getIndustryIcon(industry.type)}</span>
                                    <div>
                                        <h4 className="font-bold text-slate-100">{industry.type}</h4>
                                        <div className="text-xs text-slate-400">
                                            {industry.contribution.toFixed(1)}% del PIB • {industry.employment.toFixed(1)}% empleo
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {industry.growth > 0.03 ? (
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                    ) : industry.growth < 0.01 ? (
                                        <TrendingDown className="w-4 h-4 text-red-400" />
                                    ) : null}
                                    <span className={`text-sm font-mono ${industry.growth > 0.03 ? 'text-green-400' : industry.growth < 0.01 ? 'text-red-400' : 'text-slate-300'}`}>
                                        {(industry.growth * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-slate-400">Subsidios:</span>
                                        <span className="text-blue-400">{industry.subsidyLevel.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                                        <div
                                            className="h-1.5 rounded-full bg-blue-500"
                                            style={{ width: `${industry.subsidyLevel}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-slate-400">Impuestos:</span>
                                        <span className="text-amber-400">{industry.taxLevel.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                                        <div
                                            className="h-1.5 rounded-full bg-amber-500"
                                            style={{ width: `${industry.taxLevel}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={() => {
                                        const amount = resources.budget * 0.05;
                                        dispatch({ type: 'SUBSIDIZE_INDUSTRY', payload: { industryType: industry.type, amount } });
                                    }}
                                    disabled={resources.budget < resources.budget * 0.05}
                                    className="flex-1 px-3 py-1.5 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-800 rounded text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Subsidiar (+5%)
                                </button>
                                <button
                                    onClick={() => {
                                        dispatch({ type: 'TAX_INDUSTRY', payload: { industryType: industry.type, taxRate: industry.taxLevel + 10 } });
                                    }}
                                    className="flex-1 px-3 py-1.5 bg-amber-900/30 hover:bg-amber-900/50 text-amber-400 border border-amber-800 rounded text-xs font-semibold transition-all"
                                >
                                    Gravar (+10%)
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Presupuesto */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <h3 className="text-lg font-bold text-slate-100">Asignación Presupuestaria</h3>
                    </div>
                    <button
                        onClick={() => {
                            if (editingBudget) {
                                handleSaveBudget();
                            } else {
                                setBudgetDraft(economy.budgetAllocation);
                                setEditingBudget(true);
                            }
                        }}
                        disabled={editingBudget && Math.abs(budgetTotal - 100) > 0.01}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            editingBudget
                                ? 'bg-green-600 hover:bg-green-500 text-white'
                                : 'bg-blue-600 hover:bg-blue-500 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {editingBudget ? 'Guardar' : 'Editar'}
                    </button>
                </div>

                {editingBudget && (
                    <div className="mb-4 bg-slate-900 p-3 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-2 text-sm">
                            {Math.abs(budgetTotal - 100) < 0.01 ? (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-green-400">Total: {budgetTotal.toFixed(1)}% ✓</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-4 h-4 text-amber-400" />
                                    <span className="text-amber-400">Total: {budgetTotal.toFixed(1)}% (debe sumar 100%)</span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {Object.entries(editingBudget ? budgetDraft : economy.budgetAllocation).map(([category, value]) => (
                        <div key={category} className="bg-slate-900 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-slate-100">{category}</span>
                                <div className="flex items-center gap-2">
                                    {editingBudget && (
                                        <>
                                            <button
                                                onClick={() => handleBudgetChange(category as keyof BudgetAllocation, value - 1)}
                                                className="w-6 h-6 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300 font-bold"
                                            >
                                                -
                                            </button>
                                        </>
                                    )}
                                    <span className="text-sm font-mono text-slate-200 w-12 text-center">
                                        {value.toFixed(0)}%
                                    </span>
                                    {editingBudget && (
                                        <button
                                            onClick={() => handleBudgetChange(category as keyof BudgetAllocation, value + 1)}
                                            className="w-6 h-6 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300 font-bold"
                                        >
                                            +
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full bg-gradient-to-r from-green-600 to-green-500"
                                    style={{ width: `${value}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tratados Comerciales */}
            {economy.tradeAgreements.length > 0 && (
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe2 className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-bold text-slate-100">Tratados Comerciales</h3>
                    </div>

                    <div className="space-y-3">
                        {economy.tradeAgreements.map(agreement => (
                            <div key={agreement.countryId} className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-100">{agreement.countryName}</h4>
                                        <div className="text-xs text-slate-400 mt-1">{agreement.type}</div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            Firmado: {new Date(agreement.signedDate).toLocaleDateString('es-ES')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-green-400">
                                            +{(agreement.gdpBonus * 100).toFixed(1)}% PIB
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
