import React from 'react';
import { PaniniCardData } from '../types';

interface PaniniCardProps {
    card: PaniniCardData;
    onClick?: () => void;
}

const PaniniCard: React.FC<PaniniCardProps> = ({ card, onClick }) => {
    // Example: first 10 players in the list are golden
    const isGolden = card.id <= 10; 

    const borderColor = isGolden ? 'border-yellow-400' : 'border-blue-300';
    const bgColor = isGolden ? 'bg-gradient-to-br from-yellow-300 to-amber-500' : 'bg-gradient-to-br from-blue-300 to-indigo-500';
    const textColor = isGolden ? 'text-amber-900' : 'text-white';

    return (
        <div
            onClick={onClick}
            className={`relative w-full aspect-[3/4] p-1.5 rounded-lg shadow-lg ${bgColor} ${borderColor} border-4 ${onClick ? 'cursor-pointer transition-transform hover:scale-105' : ''}`}
        >
            <div className="flex flex-col h-full bg-black/20 rounded-sm">
                <div className="flex-grow relative">
                    <img src={card.generatedImageUrl} alt={card.name} className="w-full h-full object-cover rounded-t-sm" />
                </div>
                <div className={`text-center p-1 ${textColor}`}>
                    <p className="font-extrabold text-sm uppercase leading-none truncate px-1">{card.name}</p>
                    <p className="text-xs font-semibold">{card.country}</p>
                </div>
            </div>
        </div>
    );
};

export default PaniniCard;