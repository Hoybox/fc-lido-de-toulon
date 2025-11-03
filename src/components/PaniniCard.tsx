import React from 'react';
import { PaniniCardData } from '../types';

interface PaniniCardProps {
  card: PaniniCardData;
  onClick?: () => void;
}

const PaniniCard: React.FC<PaniniCardProps> = ({ card, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`relative aspect-[3/4] rounded-xl border border-gray-700 overflow-hidden bg-gray-800 cursor-pointer 
        hover:scale-105 transition-transform duration-300 ${onClick ? 'hover:border-rose-500' : ''}`}
    >
      <img
        src={card.generatedImageUrl || `https://picsum.photos/seed/${card.id}/300/400`}
        alt={card.name}
        className="object-cover w-full h-full"
      />

      {/* Bande inférieure avec nom */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent p-2">
        <p className="text-white text-sm font-bold leading-tight">{card.name}</p>
      </div>

      {/* Badge ID */}
      <div className="absolute top-1 left-1 bg-rose-600 text-white text-[10px] px-2 py-[2px] rounded-full font-semibold">
        #{card.id}
      </div>
    </div>
  );
};

export default PaniniCard;
