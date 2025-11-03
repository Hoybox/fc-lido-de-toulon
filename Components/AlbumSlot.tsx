import React from 'react';
import { AlbumSlotData } from '../types';
import PaniniCard from './PaniniCard';

interface AlbumSlotProps {
    slot: AlbumSlotData;
}

const AlbumSlot: React.FC<AlbumSlotProps> = ({ slot }) => {
    const { player, placedCard } = slot;

    return (
        <div className={`relative w-full aspect-[3/4] rounded-lg flex items-center justify-center p-1`}>
            {placedCard ? (
                <PaniniCard card={placedCard} />
            ) : (
                <div className={`album-slot-empty w-full h-full rounded-md flex flex-col items-center justify-center text-center text-gray-500`}>
                    <p className="font-bold text-[10px] sm:text-xs leading-tight px-1">{player.name}</p>
                    <p className="text-[9px] sm:text-[10px]">{player.country}</p>
                    <p className="absolute bottom-1 right-2 text-sm sm:text-lg font-black opacity-20">#{player.id}</p>
                </div>
            )}
        </div>
    );
};

export default AlbumSlot;