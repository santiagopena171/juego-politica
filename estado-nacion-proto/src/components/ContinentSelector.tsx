import React from 'react';
import { Globe } from 'lucide-react';

interface ContinentSelectorProps {
    onSelectContinent: (continent: string) => void;
}

const CONTINENTS = [
    {
        id: 'america',
        name: 'América',
        color: 'from-green-600 to-green-700',
        hoverColor: 'hover:from-green-500 hover:to-green-600',
        icon: '🌎'
    },
    {
        id: 'europe',
        name: 'Europa',
        color: 'from-blue-600 to-blue-700',
        hoverColor: 'hover:from-blue-500 hover:to-blue-600',
        icon: '🇪🇺'
    },
    {
        id: 'africa',
        name: 'África',
        color: 'from-yellow-600 to-orange-600',
        hoverColor: 'hover:from-yellow-500 hover:to-orange-500',
        icon: '🌍'
    },
    {
        id: 'asia',
        name: 'Asia',
        color: 'from-red-600 to-red-700',
        hoverColor: 'hover:from-red-500 hover:to-red-600',
        icon: '🌏'
    },
    {
        id: 'oceania',
        name: 'Oceanía',
        color: 'from-cyan-600 to-cyan-700',
        hoverColor: 'hover:from-cyan-500 hover:to-cyan-600',
        icon: '🌊'
    }
];

export const ContinentSelector: React.FC<ContinentSelectorProps> = ({ onSelectContinent }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900">
            <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <Globe className="w-10 h-10 text-blue-400" />
                    <h2 className="text-3xl font-bold text-white">Selecciona un Continente</h2>
                </div>
                <p className="text-slate-400">Elige el continente donde deseas gobernar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
                {CONTINENTS.map((continent) => (
                    <button
                        key={continent.id}
                        onClick={() => onSelectContinent(continent.id)}
                        className={`
                            relative overflow-hidden
                            bg-gradient-to-br ${continent.color} ${continent.hoverColor}
                            rounded-xl p-6 
                            border-2 border-slate-700
                            transform transition-all duration-200
                            hover:scale-105 hover:shadow-2xl
                            active:scale-95
                            group
                        `}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-6xl group-hover:scale-110 transition-transform">
                                {continent.icon}
                            </span>
                            <span className="text-xl font-bold text-white">
                                {continent.name}
                            </span>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </button>
                ))}
            </div>
        </div>
    );
};
