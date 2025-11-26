import React from 'react';
import { useGame } from '../context/GameContext';

export const PoliticalCompassWidget: React.FC = () => {
    const { state } = useGame();
    const { politicalCompass, government } = state;
    const parties = government.parliament.parties || [];

    const centerX = 70;
    const centerY = 70;
    const scale = 0.3; // convert -100..100 to +-30px

    const toPoint = (x: number, y: number) => ({
        cx: centerX + x * scale,
        cy: centerY - y * scale
    });

    const playerPt = toPoint(politicalCompass.x, politicalCompass.y);

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 w-40 h-40">
            <p className="text-xs text-slate-400 mb-2">Brújula Política</p>
            <svg viewBox="0 0 140 140" className="w-full h-full">
                <rect x="10" y="10" width="120" height="120" fill="none" stroke="#334155" />
                <line x1="70" y1="10" x2="70" y2="130" stroke="#334155" />
                <line x1="10" y1="70" x2="130" y2="70" stroke="#334155" />
                {/* Player */}
                <circle cx={playerPt.cx} cy={playerPt.cy} r="4" fill="#ef4444" />
                {/* Parties */}
                {parties.map((p, idx) => {
                    const pt = toPoint((idx * 30) - 30,  (idx % 2 === 0 ? 20 : -20)); // simple spread if no coords
                    return <circle key={p.id} cx={pt.cx} cy={pt.cy} r="3" fill="#94a3b8" />;
                })}
            </svg>
        </div>
    );
};
