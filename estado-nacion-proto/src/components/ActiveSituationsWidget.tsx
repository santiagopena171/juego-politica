import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const ActiveSituationsWidget: React.FC<{ onOpen?: (id: string) => void }> = ({ onOpen }) => {
    const { state } = useGame();
    const situations = state.activeSituations || [];
    if (!situations.length) return null;

    return (
        <div className="flex items-center gap-2">
            {situations.map(sit => (
                <button
                    key={sit.id}
                    onClick={() => onOpen?.(sit.id)}
                    className="relative p-2 rounded-full bg-red-600/20 border border-red-500/40 hover:bg-red-600/30 transition"
                    title={`${sit.id} | Severidad ${sit.severity.toFixed(0)} | Progreso ${sit.progress.toFixed(0)}%`}
                >
                    <AlertOctagon className="w-4 h-4 text-red-300" />
                    <span className="sr-only">{sit.id}</span>
                </button>
            ))}
        </div>
    );
};
