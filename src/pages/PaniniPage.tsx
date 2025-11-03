import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AlbumSlotData, PaniniCardData, AllCollections, PlayerCollection, TeamSlot } from '../types';
import { paniniPlayers } from '../data/paniniPlayers';
import { generatePaniniImage } from '../services/geminiService';
import AlbumSlot from '../components/AlbumSlot.tsx';
import PaniniCard from '../components/PaniniCard';
import { UsersIcon, TicketIcon, SwitchHorizontalIcon } from '../components/icons/Icons.tsx';
import { useSite } from '../hooks/useSite';

// --- MOCK DATA & HELPERS ---
const createInitialCollection = (): PlayerCollection => ({
  albumSlots: paniniPlayers.map(p => ({ player: p, placedCard: null })),
  lastReveal: '',
  cardInventory: [],
});

const prefillCollection = (collection: PlayerCollection, startId: number, endId: number): PlayerCollection => {
  const placedCards: PaniniCardData[] = [];
  const newSlots = collection.albumSlots.map(slot => {
    if (slot.player.id >= startId && slot.player.id <= endId) {
      const card = {
        ...slot.player,
        generatedImageUrl: `https://picsum.photos/seed/panini${slot.player.id}/300/400`,
      };
      placedCards.push(card);
      return { ...slot, placedCard: card };
    }
    return slot;
  });
  return { ...collection, albumSlots: newSlots, cardInventory: placedCards };
};

const initialAllCollections: AllCollections = {
  'Joueur_Deux': prefillCollection(createInitialCollection(), 1, 20),
  'Joueur_Trois': prefillCollection(createInitialCollection(), 21, 40),
};

// --- PACK OPENING VIEW ---
const PackOpeningView: React.FC<{ cards: PaniniCardData[]; onComplete: () => void }> = ({ cards, onComplete }) => {
  const [step, setStep] = useState(0);
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    if (step === 0) setTimeout(() => setStep(1), 500);
  }, [step]);

  const handlePackClick = () => {
    if (step === 1) setStep(2);
  };

  const handleCardClick = (index: number) => {
    if (step === 2 && !flipped[index]) {
      const newFlipped = [...flipped];
      newFlipped[index] = true;
      setFlipped(newFlipped);
      if (newFlipped.every(f => f)) setTimeout(() => setStep(3), 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in">
      <div className="perspective-1000 w-full h-full flex items-center justify-center">
        {step < 2 && (
          <div className={`card-pack ${step === 1 ? 'animate-pack-shake' : 'animate-pack-show'}`} onClick={handlePackClick}>
            <span className="text-4xl font-bold text-yellow-300 drop-shadow-lg">PANINI</span>
          </div>
        )}
        {step >= 2 && (
          <div className="w-full max-w-3xl flex justify-around items-center">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={`card-slot-animation animate-card-fly-out-${index + 1}`}
                style={{ animationFillMode: 'forwards' }}
                onClick={() => handleCardClick(index)}
              >
                <div className={`card-animation-inner h-full ${flipped[index] ? 'is-flipped' : ''}`}>
                  <div className="card-animation-face card-animation-back h-full">
                    <PaniniCard card={card} />
                  </div>
                  <div className="card-animation-face card-animation-front h-full" />
                </div>
              </div>
            ))}
          </div>
        )}
        {step === 3 && (
          <button
            onClick={onComplete}
            className="absolute bottom-12 bg-rose-600 text-white px-8 py-3 rounded-lg font-bold text-xl animate-fade-in"
          >
            Retourner à la collection
          </button>
        )}
      </div>
    </div>
  );
};

// --- PLAYER SELECTION MODAL ---
const PlayerSelectionModal: React.FC<{
  collectedCards: PaniniCardData[];
  onSelect: (card: PaniniCardData | null) => void;
  onClose: () => void;
}> = ({ collectedCards, onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredCards = useMemo(
    () => collectedCards.filter(card => card.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [collectedCards, searchTerm]
  );

  return (
    <div className="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-4xl w-full border border-rose-500 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Sélectionner un joueur</h2>
        <input
          type="text"
          placeholder="Rechercher par nom..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-gray-700 p-2 rounded mb-4"
        />
        <div className="flex-grow overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 pr-2">
          {filteredCards.map(card => <PaniniCard key={card.id} card={card} onClick={() => onSelect(card)} />)}
        </div>
        <div className="mt-4 flex justify-end gap-4">
          <button onClick={() => onSelect(null)} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">
            Retirer le joueur
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
// --- TEAM FORMATION VIEW ---
const TeamFormationView: React.FC<{
  collection: PlayerCollection;
  onSlotClick: (slot: TeamSlot) => void;
}> = ({ collection, onSlotClick }) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
      {collection.albumSlots.map(slot => (
        <div
          key={slot.player.id}
          className={`relative cursor-pointer border border-gray-700 hover:border-rose-500 transition-all rounded-lg p-1 ${
            slot.placedCard ? 'bg-gray-800' : 'bg-gray-900'
          }`}
          onClick={() => onSlotClick(slot)}
        >
          <AlbumSlot slot={slot} />
        </div>
      ))}
    </div>
  );
};

// --- COLLECTION VIEW ---
const CollectionView: React.FC<{
  collection: PlayerCollection;
  onSlotClick: (slot: TeamSlot) => void;
}> = ({ collection, onSlotClick }) => (
  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
    {collection.albumSlots.map(slot => (
      <div
        key={slot.player.id}
        className={`relative cursor-pointer border border-gray-700 hover:border-rose-500 transition-all rounded-lg p-1 ${
          slot.placedCard ? 'bg-gray-800' : 'bg-gray-900'
        }`}
        onClick={() => onSlotClick(slot)}
      >
        <AlbumSlot slot={slot} />
      </div>
    ))}
  </div>
);

// --- COLLECTIONS TRADE VIEW ---
const CollectionsTradeView: React.FC<{
  allCollections: AllCollections;
  onTrade: (from: string, to: string, card: PaniniCardData) => void;
}> = ({ allCollections, onTrade }) => {
  const playerNames = Object.keys(allCollections);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      {playerNames.map(player => {
        const collection = allCollections[player];
        return (
          <div key={player} className="bg-gray-800 rounded-xl p-4 border border-gray-600">
            <h3 className="text-xl font-semibold text-rose-400 mb-4">{player}</h3>
            <div className="grid grid-cols-5 gap-2">
              {collection.cardInventory.slice(0, 10).map(card => (
                <div
                  key={card.id}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {
                    const target = playerNames.find(p => p !== player);
                    if (target) onTrade(player, target, card);
                  }}
                >
                  <PaniniCard card={card} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- MAIN PAGE ---
const PaniniPage: React.FC = () => {
  const [collections, setCollections] = useLocalStorage<AllCollections>('panini_collections', initialAllCollections);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('Joueur_Deux');
  const [selectedSlot, setSelectedSlot] = useState<TeamSlot | null>(null);
  const [packCards, setPackCards] = useState<PaniniCardData[] | null>(null);
  const [view, setView] = useState<'collection' | 'trade' | 'pack'>('collection');
  const { setBackendError } = useSite();

  const handleSlotClick = (slot: TeamSlot) => setSelectedSlot(slot);

  const handleCardSelect = (card: PaniniCardData | null) => {
    if (!selectedSlot) return;

    const updated = { ...collections };
    const playerCollection = { ...updated[selectedPlayer] };
    const updatedSlots = playerCollection.albumSlots.map(s =>
      s.player.id === selectedSlot.player.id ? { ...s, placedCard: card } : s
    );

    playerCollection.albumSlots = updatedSlots;
    updated[selectedPlayer] = playerCollection;

    setCollections(updated);
    setSelectedSlot(null);
  };

  const handleOpenPack = async () => {
    try {
      const newCards = await generatePaniniImage();
      setPackCards(newCards);
      setView('pack');
    } catch (err) {
      console.error('Erreur lors de la génération du pack :', err);
      setBackendError(true);
    }
  };

  const handlePackComplete = () => {
    if (!packCards) return;
    const updated = { ...collections };
    updated[selectedPlayer].cardInventory.push(...packCards);
    setCollections(updated);
    setPackCards(null);
    setView('collection');
  };

  const handleTrade = (from: string, to: string, card: PaniniCardData) => {
    const updated = { ...collections };
    updated[from].cardInventory = updated[from].cardInventory.filter(c => c.id !== card.id);
    updated[to].cardInventory.push(card);
    setCollections(updated);
  };

  const currentCollection = collections[selectedPlayer];

  return (
    <div className="p-6 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-rose-400">⚽ Collection Panini</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setView('collection')}
            className={`px-4 py-2 rounded ${view === 'collection' ? 'bg-rose-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <UsersIcon className="inline w-5 h-5 mr-2" />
            Collection
          </button>
          <button
            onClick={() => setView('trade')}
            className={`px-4 py-2 rounded ${view === 'trade' ? 'bg-rose-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <SwitchHorizontalIcon className="inline w-5 h-5 mr-2" />
            Échanges
          </button>
          <button
            onClick={handleOpenPack}
            className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
          >
            <TicketIcon className="inline w-5 h-5 mr-2" />
            Ouvrir un pack
          </button>
        </div>
      </div>

      {view === 'collection' && <CollectionView collection={currentCollection} onSlotClick={handleSlotClick} />}
      {view === 'trade' && <CollectionsTradeView allCollections={collections} onTrade={handleTrade} />}
      {view === 'pack' && packCards && <PackOpeningView cards={packCards} onComplete={handlePackComplete} />}
      {selectedSlot && (
        <PlayerSelectionModal
          collectedCards={currentCollection.cardInventory}
          onSelect={handleCardSelect}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
};

export default PaniniPage;
