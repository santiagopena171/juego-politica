/**
 * UNPanel - Panel de Resoluciones de las Naciones Unidas
 * Permite ver resoluciones activas, votar, y proponer nuevas resoluciones
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
    Vote, 
    X, 
    AlertTriangle, 
    Scale, 
    Globe, 
    Shield, 
    Leaf, 
    HandHeart, 
    Ban,
    Users,
    ThumbsUp,
    ThumbsDown,
    Minus
} from 'lucide-react';

const RESOLUTION_ICONS: Record<string, React.ReactElement> = {
    'condemnation': <Ban className="w-5 h-5" />,
    'sanctions': <AlertTriangle className="w-5 h-5" />,
    'intervention': <Shield className="w-5 h-5" />,
    'climate': <Leaf className="w-5 h-5" />,
    'trade': <Globe className="w-5 h-5" />,
    'human_rights': <HandHeart className="w-5 h-5" />,
    'peacekeeping': <Users className="w-5 h-5" />,
};

const RESOLUTION_COLORS: Record<string, string> = {
    'condemnation': 'from-yellow-600 to-yellow-500',
    'sanctions': 'from-red-600 to-red-500',
    'intervention': 'from-purple-600 to-purple-500',
    'climate': 'from-green-600 to-green-500',
    'trade': 'from-blue-600 to-blue-500',
    'human_rights': 'from-pink-600 to-pink-500',
    'peacekeeping': 'from-teal-600 to-teal-500',
};

export const UNPanel: React.FC = () => {
    const { state, dispatch } = useGame();
    const [selectedTab, setSelectedTab] = useState<'active' | 'propose'>('active');
    const [proposalType, setProposalType] = useState<string>('sanctions');
    const [targetCountry, setTargetCountry] = useState<string>('');

    const { activeResolutions, playerVotingPower } = state.geopolitics.unitedNations;
    const playerCountryId = state.player.countryId;

    const handleVote = (resolutionId: string, vote: 'favor' | 'against' | 'abstain') => {
        dispatch({
            type: 'VOTE_UN_RESOLUTION',
            payload: { resolutionId, vote }
        });
    };

    const handleProposeResolution = () => {
        if (!targetCountry && (proposalType === 'sanctions' || proposalType === 'condemnation' || proposalType === 'intervention')) {
            alert('Debes seleccionar un país objetivo');
            return;
        }

        dispatch({
            type: 'PROPOSE_UN_RESOLUTION',
            payload: {
                resolutionType: proposalType,
                targetCountry: targetCountry || undefined
            }
        });

        // Reset form
        setTargetCountry('');
        setSelectedTab('active');
    };

    const getPlayerVote = (resolution: typeof activeResolutions[0]): 'favor' | 'against' | 'abstain' | null => {
        if (resolution.votesInFavor.includes(playerCountryId)) return 'favor';
        if (resolution.votesAgainst.includes(playerCountryId)) return 'against';
        if (resolution.votesAbstain.includes(playerCountryId)) return 'abstain';
        return null;
    };

    const getVotePercentages = (resolution: typeof activeResolutions[0]) => {
        const total = resolution.votesInFavor.length + resolution.votesAgainst.length + resolution.votesAbstain.length;
        if (total === 0) return { favor: 0, against: 0, abstain: 0 };
        
        return {
            favor: Math.round((resolution.votesInFavor.length / total) * 100),
            against: Math.round((resolution.votesAgainst.length / total) * 100),
            abstain: Math.round((resolution.votesAbstain.length / total) * 100),
        };
    };

    return (
        <div className="bg-slate-800 rounded-xl shadow-2xl p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500 p-3 rounded-lg">
                        <Globe className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Naciones Unidas</h2>
                        <p className="text-slate-400">Consejo de Seguridad y Asamblea General</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-400">Tu Poder de Voto</p>
                    <p className="text-2xl font-bold text-blue-400">{playerVotingPower}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setSelectedTab('active')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                        selectedTab === 'active'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                    <Vote className="w-5 h-5 inline mr-2" />
                    Resoluciones Activas ({activeResolutions.length})
                </button>
                <button
                    onClick={() => setSelectedTab('propose')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                        selectedTab === 'propose'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                    <Scale className="w-5 h-5 inline mr-2" />
                    Proponer Resolución
                </button>
            </div>

            {/* Content */}
            {selectedTab === 'active' ? (
                <div className="space-y-4">
                    {activeResolutions.length === 0 ? (
                        <div className="text-center py-12">
                            <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400 text-lg">No hay resoluciones activas</p>
                            <p className="text-slate-500 text-sm mt-2">
                                Sé el primero en proponer una resolución
                            </p>
                        </div>
                    ) : (
                        activeResolutions.map((resolution) => {
                            const icon = RESOLUTION_ICONS[resolution.type] || <Vote className="w-5 h-5" />;
                            const colorGradient = RESOLUTION_COLORS[resolution.type] || 'from-gray-600 to-gray-500';
                            const playerVote = getPlayerVote(resolution);
                            const percentages = getVotePercentages(resolution);

                            return (
                                <div
                                    key={resolution.id}
                                    className="bg-slate-700 rounded-lg p-5 border-2 border-slate-600 hover:border-blue-500 transition-all"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className={`bg-gradient-to-br ${colorGradient} p-3 rounded-lg`}>
                                                {icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-white">{resolution.title}</h3>
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        resolution.status === 'voting' ? 'bg-yellow-500/20 text-yellow-300' :
                                                        resolution.status === 'passed' ? 'bg-green-500/20 text-green-300' :
                                                        resolution.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                                                        'bg-blue-500/20 text-blue-300'
                                                    }`}>
                                                        {resolution.status === 'voting' ? '🗳️ Votación' :
                                                         resolution.status === 'passed' ? '✅ Aprobada' :
                                                         resolution.status === 'rejected' ? '❌ Rechazada' :
                                                         '📋 Propuesta'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-300 text-sm mb-2">{resolution.description}</p>
                                                <div className="flex gap-4 text-xs text-slate-400">
                                                    <span>👤 Propuesta por: <span className="text-blue-400">{resolution.proposedBy}</span></span>
                                                    {resolution.targetCountry && (
                                                        <span>🎯 Objetivo: <span className="text-red-400">{resolution.targetCountry}</span></span>
                                                    )}
                                                    <span>📅 Vence: {resolution.votingDeadline.month}/{resolution.votingDeadline.year}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Voting Stats */}
                                    <div className="mb-4">
                                        <div className="flex gap-2 h-6 rounded-full overflow-hidden mb-2">
                                            {percentages.favor > 0 && (
                                                <div 
                                                    className="bg-green-500 flex items-center justify-center text-xs font-bold text-white"
                                                    style={{ width: `${percentages.favor}%` }}
                                                >
                                                    {percentages.favor > 15 && `${percentages.favor}%`}
                                                </div>
                                            )}
                                            {percentages.against > 0 && (
                                                <div 
                                                    className="bg-red-500 flex items-center justify-center text-xs font-bold text-white"
                                                    style={{ width: `${percentages.against}%` }}
                                                >
                                                    {percentages.against > 15 && `${percentages.against}%`}
                                                </div>
                                            )}
                                            {percentages.abstain > 0 && (
                                                <div 
                                                    className="bg-gray-500 flex items-center justify-center text-xs font-bold text-white"
                                                    style={{ width: `${percentages.abstain}%` }}
                                                >
                                                    {percentages.abstain > 15 && `${percentages.abstain}%`}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-400">
                                            <span>✅ A Favor: {resolution.votesInFavor.length}</span>
                                            <span>❌ En Contra: {resolution.votesAgainst.length}</span>
                                            <span>⚪ Abstención: {resolution.votesAbstain.length}</span>
                                        </div>
                                    </div>

                                    {/* Voting Buttons */}
                                    {resolution.status === 'voting' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleVote(resolution.id, 'favor')}
                                                disabled={playerVote === 'favor'}
                                                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                                    playerVote === 'favor'
                                                        ? 'bg-green-600 text-white cursor-not-allowed'
                                                        : 'bg-green-500/20 text-green-300 hover:bg-green-500 hover:text-white'
                                                }`}
                                            >
                                                <ThumbsUp className="w-4 h-4" />
                                                {playerVote === 'favor' ? 'Votado a Favor' : 'Votar a Favor'}
                                            </button>
                                            <button
                                                onClick={() => handleVote(resolution.id, 'against')}
                                                disabled={playerVote === 'against'}
                                                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                                    playerVote === 'against'
                                                        ? 'bg-red-600 text-white cursor-not-allowed'
                                                        : 'bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white'
                                                }`}
                                            >
                                                <ThumbsDown className="w-4 h-4" />
                                                {playerVote === 'against' ? 'Votado en Contra' : 'Votar en Contra'}
                                            </button>
                                            <button
                                                onClick={() => handleVote(resolution.id, 'abstain')}
                                                disabled={playerVote === 'abstain'}
                                                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                                    playerVote === 'abstain'
                                                        ? 'bg-gray-600 text-white cursor-not-allowed'
                                                        : 'bg-gray-500/20 text-gray-300 hover:bg-gray-500 hover:text-white'
                                                }`}
                                            >
                                                <Minus className="w-4 h-4" />
                                                {playerVote === 'abstain' ? 'Abstenido' : 'Abstención'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="bg-slate-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Proponer Nueva Resolución</h3>
                    
                    {/* Resolution Type */}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Tipo de Resolución
                        </label>
                        <select
                            value={proposalType}
                            onChange={(e) => setProposalType(e.target.value)}
                            className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                        >
                            <option value="condemnation">Condenación Diplomática</option>
                            <option value="sanctions">Imposición de Sanciones</option>
                            <option value="intervention">Intervención Militar</option>
                            <option value="climate">Acuerdo Climático</option>
                            <option value="trade">Tratado Comercial Global</option>
                            <option value="human_rights">Derechos Humanos</option>
                            <option value="peacekeeping">Misión de Paz</option>
                        </select>
                    </div>

                    {/* Target Country (if applicable) */}
                    {(proposalType === 'sanctions' || proposalType === 'condemnation' || proposalType === 'intervention' || proposalType === 'peacekeeping') && (
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                País Objetivo
                            </label>
                            <select
                                value={targetCountry}
                                onChange={(e) => setTargetCountry(e.target.value)}
                                className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">Seleccionar país...</option>
                                {state.diplomacy.countries.map(country => (
                                    <option key={country.id} value={country.id}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Cost */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-300 font-semibold">Costo de Propuesta</p>
                                <p className="text-xs text-blue-400">Capital político requerido</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-400">
                                {proposalType === 'intervention' ? '30' :
                                 proposalType === 'sanctions' ? '20' :
                                 proposalType === 'climate' ? '25' :
                                 '15'} PC
                            </p>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleProposeResolution}
                        disabled={
                            (proposalType === 'sanctions' || proposalType === 'condemnation' || proposalType === 'intervention') && !targetCountry
                        }
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-bold text-lg transition-all shadow-lg"
                    >
                        📜 Proponer Resolución
                    </button>
                </div>
            )}
        </div>
    );
};
