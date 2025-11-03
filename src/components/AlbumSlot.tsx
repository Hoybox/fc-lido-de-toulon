import React from 'react';
import { AlbumSlotData } from '../types';
import PaniniCard from './PaniniCard';

interface AlbumSlotProps {
  slot: AlbumSlotData;
}

const AlbumSlot: React.FC<AlbumSlotProps> = ({ slot }) => {
  return (
    <div
      className={`relative border rounded-lg aspect-[3/4] flex items-center justify-center overflow-hidden transition-all 
        ${slot.placedCard ? 'border-rose-500 bg-gray-800 shadow-lg' : 'border-gray-600 bg-gray-900/50'}`}
    >
      {slot.placedCard ? (
        <PaniniCard card={slot.placedCard} />
      ) : (
        <div className="text-gray-500 text-xs text-center p-1 select-none">
          <p className="font-bold text-sm text-rose-400">{slot.player.name}</p>
          <p>ID #{slot.player.id}</p>
        </div>
      )}
    </div>
  );
};

export default AlbumSlot;
