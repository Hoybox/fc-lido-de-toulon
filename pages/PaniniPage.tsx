import React, { useState, useMemo, useCallback, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { AlbumSlotData, PaniniCardData, TeamSlot, AllCollections, PlayerCollection } from '../types';
import { paniniPlayers } from '../data/paniniPlayers';
import { generatePaniniImage } from '../services/geminiService';
import AlbumSlot from '../components/AlbumSlot.js';
import PaniniCard from '../components/PaniniCard.js';
import { UsersIcon, TicketIcon, SwitchHorizontalIcon } from '../components/icons/Icons.js';
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
                generatedImageUrl: `https://picsum.photos/seed/panini${slot.player.id}/300/400`
            };
            placedCards.push(card);
            return {
                ...slot,
                placedCard: card
            };
        }
        return slot;
    });
    return { ...collection, albumSlots: newSlots, cardInventory: placedCards };
};

const initialAllCollections: AllCollections = {
    'Joueur_Deux': prefillCollection(createInitialCollection(), 1, 20),
    'Joueur_Trois': prefillCollection(createInitialCollection(), 21, 40),
};


// --- SUB-COMPONENTS ---

const PackOpeningView: React.FC<{ 
    cards: PaniniCardData[]; 
    onComplete: () => void;
}> = ({ cards, onComplete }) => {
    const [step, setStep] = useState(0); // 0: show pack, 1: pack opened, 2: cards revealed, 3: done
    const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);

    useEffect(() => {
        if (step === 0) {
            // Trigger pack entrance animation
            setTimeout(() => setStep(1), 500);
        }
    }, [step]);
    
    const handlePackClick = () => {
        if (step === 1) {
            setStep(2);
        }
    };
    
    const handleCardClick = (index: number) => {
        if(step === 2 && !flipped[index]) {
            const newFlipped = [...flipped];
            newFlipped[index] = true;
            setFlipped(newFlipped);
            
            if (newFlipped.every(f => f)) {
                setTimeout(() => setStep(3), 1000);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in">
            <div className="perspective-1000 w-full h-full flex items-center justify-center">
                {/* Step 0 & 1: Show and open the pack */}
                {step < 2 && (
                    <div 
                        className={`card-pack ${step === 1 ? 'animate-pack-shake' : 'animate-pack-show'}`}
                        onClick={handlePackClick}
                    >
                        <span className="text-4xl font-bold text-yellow-300 drop-shadow-lg">PANINI</span>
                    </div>
                )}

                {/* Step 2 & 3: Show the cards */}
                {step >= 2 && (
                    <div className="w-full max-w-3xl flex justify-around items-center">
                        {cards.map((card, index) => (
                            <div 
                                key={card.id} 
                                className={`card-slot-animation animate-card-fly-out-${index + 1}`}
                                style={{ animationFillMode: 'forwards' }} // Keep final state
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
                 {/* Step 3: Show complete button */}
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

const PlayerSelectionModal: React.FC<{
    collectedCards: PaniniCardData[];
    onSelect: (card: PaniniCardData | null) => void;
    onClose: () => void;
}> = ({ collectedCards, onSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredCards = useMemo(() => 
        collectedCards.filter(card => card.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [collectedCards, searchTerm]
    );

    return (
        <div className="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-4xl w-full border border-rose-500 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-white">Sélectionner un joueur</h2>
                <input type="text" placeholder="Rechercher par nom..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-gray-700 p-2 rounded mb-4"/>
                <div className="flex-grow overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 pr-2">
                    {filteredCards.map(card => <PaniniCard key={card.id} card={card} onClick={() => onSelect(card)} />)}
                </div>
                <div className="mt-4 flex justify-end gap-4">
                     <button onClick={() => onSelect(null)} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">Retirer le Joueur</button>
                    <button onClick={onClose} className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700">Fermer</button>
                </div>
            </div>
        </div>
    );
};

const TeamFormationView: React.FC<{ onBack: () => void; collectedCards: PaniniCardData[]; team: TeamSlot[]; setTeam: React.Dispatch<React.SetStateAction<TeamSlot[]>> }> = ({ onBack, collectedCards, team, setTeam }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

    const handleSlotClick = (slotId: string) => {
        setSelectedSlotId(slotId);
        setModalOpen(true);
    };

    const handleSelectPlayer = (card: PaniniCardData | null) => {
        if (selectedSlotId) {
            setTeam(prevTeam => prevTeam.map(slot => slot.id === selectedSlotId ? { ...slot, card } : slot));
        }
        setModalOpen(false);
        setSelectedSlotId(null);
    };

    const playersOnPitch = team.filter(s => s.gridArea);
    const playersOnBench = team.filter(s => !s.gridArea);

    return (
        <div className="container mx-auto px-4 pb-20">
             {modalOpen && <PlayerSelectionModal collectedCards={collectedCards} onSelect={handleSelectPlayer} onClose={() => setModalOpen(false)} />}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-[#fd6c9e]">MON ÉQUIPE TYPE</h2>
                <button onClick={onBack} className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600">Retour</button>
            </div>
            <div className="football-pitch rounded-lg">
                {playersOnPitch.map(slot => (
                    <div key={slot.id} style={{ gridArea: slot.gridArea }} className="z-10">
                        {slot.card ? <PaniniCard card={slot.card} onClick={() => handleSlotClick(slot.id)}/> : (
                            <div onClick={() => handleSlotClick(slot.id)} className="team-slot-empty w-full h-full flex flex-col items-center justify-center text-center text-xs p-1">
                                <span className="font-bold">{slot.label}</span>
                                <span>+</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
             <div className="mt-6">
                <h3 className="text-xl font-bold text-center mb-4">Banc des Remplaçants</h3>
                <div className="bench grid grid-cols-5 gap-4 p-4 rounded-lg">
                    {playersOnBench.map(slot => (
                         <div key={slot.id}>
                            {slot.card ? <PaniniCard card={slot.card} onClick={() => handleSlotClick(slot.id)}/> : (
                                <div onClick={() => handleSlotClick(slot.id)} className="team-slot-empty w-full aspect-[3/4] flex flex-col items-center justify-center text-center text-xs p-1">
                                    <span className="font-bold">{slot.label}</span>
                                    <span>+</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CollectionView: React.FC<{
    onBack: () => void;
    collection: PlayerCollection;
    setCollection: (updater: (prev: PlayerCollection) => PlayerCollection) => void;
}> = ({ onBack, collection, setCollection }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [revealedCards, setRevealedCards] = useState<PaniniCardData[]>([]);
    const [isOpeningPack, setIsOpeningPack] = useState(false);
    const { setBackendError } = useSite();

    const today = new Date().toISOString().split('T')[0];
    const canReveal = useMemo(() => collection.lastReveal !== today, [collection.lastReveal, today]);

    const handleRevealCards = async () => {
        if (!canReveal || isLoading) return;
    
        const uncollectedPlayers = paniniPlayers.filter(p => {
            const slot = collection.albumSlots.find(s => s.player.id === p.id);
            return !slot || !slot.placedCard;
        });
    
        if (uncollectedPlayers.length === 0) {
            alert("Félicitations ! Vous avez complété votre collection !");
            setCollection(prev => ({...prev, lastReveal: today}));
            return;
        }
    
        setIsLoading(true);
        const cardsToReveal = 3;
        const numToGenerate = Math.min(cardsToReveal, uncollectedPlayers.length);
        const shuffledUncollected = [...uncollectedPlayers].sort(() => 0.5 - Math.random());
        const playersToGenerate = shuffledUncollected.slice(0, numToGenerate);
    
        try {
            const cardPromises = playersToGenerate.map(player =>
                generatePaniniImage(player.name).then(imageUrl => ({ ...player, generatedImageUrl: imageUrl }))
            );
            const resolvedCards = await Promise.all(cardPromises);
            setRevealedCards(resolvedCards);
            setIsOpeningPack(true);
        } catch (error) {
            setBackendError(true);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePackOpeningComplete = () => {
        setCollection(prev => {
           const newSlots = [...prev.albumSlots];
           revealedCards.forEach(card => {
               const slotIndex = newSlots.findIndex(s => s.player.id === card.id);
               if (slotIndex !== -1 && !newSlots[slotIndex].placedCard) {
                   newSlots[slotIndex].placedCard = card;
               }
           });
           return { 
               ...prev, 
               albumSlots: newSlots, 
               lastReveal: today,
               cardInventory: [...(prev.cardInventory || []), ...revealedCards] 
           };
       });
       setIsOpeningPack(false);
       setRevealedCards([]); // Clear revealed cards
   };


    const completionPercentage = useMemo(() => {
        const collectedCount = collection.albumSlots.filter(s => s.placedCard !== null).length;
        return (collectedCount / paniniPlayers.length) * 100;
    }, [collection.albumSlots]);
    
    const inventoryCounts = useMemo(() => {
        const counts: { [id: number]: { card: PaniniCardData, count: number } } = {};
        for (const card of collection.cardInventory || []) {
            if (counts[card.id]) {
                counts[card.id].count++;
            } else {
                counts[card.id] = { card, count: 1 };
            }
        }
        return Object.values(counts).sort((a, b) => b.count - a.count);
    }, [collection.cardInventory]);


     const renderAlbumPage = (pageNumber: 0 | 1) => {
        const start = pageNumber * 50;
        const end = start + 50;
        return (
             <div className="album-page p-2 sm:p-4 grid grid-cols-5 gap-2 sm:gap-4 rounded-lg">
                {collection.albumSlots.slice(start, end).map(slot => <AlbumSlot key={slot.player.id} slot={slot}/>)}
            </div>
        );
    };

    return (
        <>
            {isOpeningPack && <PackOpeningView cards={revealedCards} onComplete={handlePackOpeningComplete} />}
            <div className="container mx-auto px-4 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600">Retour</button>
                        <h2 className="text-3xl font-bold text-[#fd6c9e]">MA COLLECTION</h2>
                    </div>
                    <button onClick={handleRevealCards} disabled={!canReveal || isLoading} className="bg-rose-600 text-white px-6 py-3 rounded-md hover:bg-rose-700 flex items-center gap-2 transition-all transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isLoading ? 'Génération en cours...' : (canReveal ? 'Révéler 3 cartes du jour' : 'Revenez demain !')}
                    </button>
                </div>
                <div className="mb-6 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-bold text-center mb-2">Progression: {collection.albumSlots.filter(s => s.placedCard).length} / {paniniPlayers.length} ({completionPercentage.toFixed(1)}%)</h3>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {renderAlbumPage(0)}
                    {renderAlbumPage(1)}
                </div>
                
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-rose-500 mb-4">Mes Cartes Tirées (Doubles inclus)</h3>
                    <div className="draw-pile w-full p-4 rounded-lg flex flex-wrap items-start justify-center gap-4">
                        {inventoryCounts.length === 0 ? (
                            <p className="text-gray-400 w-full text-center">Vous n'avez pas encore de cartes.</p>
                        ) : (
                            inventoryCounts.map(({ card, count }) => (
                                <div key={card.id} className="w-28 relative">
                                    <PaniniCard card={card} />
                                    {count > 1 && (
                                        <div className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-gray-800">
                                            x{count}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const TradeModal: React.FC<{
    offerableCards: PaniniCardData[],
    targetPlayerName: string,
    targetCard: PaniniCardData,
    onConfirm: (offeredCard: PaniniCardData) => void,
    onClose: () => void,
}> = ({ offerableCards, targetPlayerName, targetCard, onConfirm, onClose }) => {
    const [selectedCard, setSelectedCard] = useState<PaniniCardData | null>(null);

    return (
        <div className="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-4xl w-full border border-rose-500 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-white">Proposer un échange</h2>
                <div className="flex flex-col md:flex-row gap-6 mb-4">
                    <div className="flex-1 text-center">
                        <p className="font-semibold">Vous recevez :</p>
                        <div className="w-32 mx-auto mt-2"><PaniniCard card={targetCard} /></div>
                        <p className="font-bold text-lg mt-2">{targetCard.name}</p>
                        <p className="text-sm text-gray-400">de {targetPlayerName}</p>
                    </div>
                     <div className="flex items-center justify-center"><SwitchHorizontalIcon className="h-10 w-10 text-green-400" /></div>
                     <div className="flex-1 text-center">
                        <p className="font-semibold">Vous offrez :</p>
                        {selectedCard ? 
                            <div className="w-32 mx-auto mt-2"><PaniniCard card={selectedCard} /></div>
                            : <div className="w-32 h-44 mx-auto mt-2 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">?</div>}
                        <p className="font-bold text-lg mt-2">{selectedCard?.name || '...'}</p>
                        <p className="text-sm text-gray-400">Choisissez un double ci-dessous</p>
                    </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Vos Doubles (choisissez une carte à offrir)</h3>
                <div className="flex-grow overflow-y-auto grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 p-2 bg-gray-900/50 rounded">
                    {offerableCards.length > 0 ? offerableCards.map(card => (
                        <div key={card.id} className={`p-1 rounded ${selectedCard?.id === card.id ? 'bg-green-500' : ''}`}>
                            <PaniniCard card={card} onClick={() => setSelectedCard(card)} />
                        </div>
                    )) : (
                        <p className="col-span-full text-center text-gray-400 p-4">Vous n'avez pas de cartes en double à échanger.</p>
                    )}
                </div>
                <div className="mt-4 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">Annuler</button>
                    <button onClick={() => selectedCard && onConfirm(selectedCard)} disabled={!selectedCard} className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 disabled:bg-gray-500">Confirmer l'échange</button>
                </div>
            </div>
        </div>
    );
};

const CollectionsTradeView: React.FC<{
    onBack: () => void,
    allCollections: AllCollections,
    setAllCollections: React.Dispatch<React.SetStateAction<AllCollections>>,
    currentUser: string,
}> = ({ onBack, allCollections, setAllCollections, currentUser }) => {
    const [selectedPlayerName, setSelectedPlayerName] = useState(currentUser);
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
    const [tradeTargetCard, setTradeTargetCard] = useState<PaniniCardData | null>(null);

    const playerNames = Object.keys(allCollections);
    const selectedPlayerCollection = allCollections[selectedPlayerName];
    const currentUserCollection = allCollections[currentUser];

    const currentUserDuplicates = useMemo(() => {
        const inventory = currentUserCollection.cardInventory || [];
        const counts: { [id: number]: number } = {};
        inventory.forEach(card => {
            counts[card.id] = (counts[card.id] || 0) + 1;
        });

        const uniqueCards = inventory.filter((card, index, self) =>
            index === self.findIndex(c => c.id === card.id)
        );

        return uniqueCards.filter(card => counts[card.id] > 1);
    }, [currentUserCollection.cardInventory]);


    const handleCardClick = (slot: AlbumSlotData) => {
        if (selectedPlayerName === currentUser || !slot.placedCard) return;

        const currentUserHasCard = currentUserCollection.albumSlots.some(s => s.placedCard?.id === slot.player.id);
        if (!currentUserHasCard) {
            setTradeTargetCard(slot.placedCard);
            setIsTradeModalOpen(true);
        } else {
            alert("Vous possédez déjà cette carte !");
        }
    };

    const handleConfirmTrade = (offeredCard: PaniniCardData) => {
        if (!tradeTargetCard) return;

        setAllCollections(prev => {
            const newCollections = JSON.parse(JSON.stringify(prev)); // Deep copy

            // Get collections
            const currentUserColl = newCollections[currentUser] as PlayerCollection;
            const targetPlayerColl = newCollections[selectedPlayerName] as PlayerCollection;
            
            // --- Current User ---
            const offeredCardIndex = currentUserColl.cardInventory.findIndex(c => c.id === offeredCard.id);
            if (offeredCardIndex > -1) {
                currentUserColl.cardInventory.splice(offeredCardIndex, 1);
            }
            currentUserColl.cardInventory.push(tradeTargetCard);
            const targetSlot = currentUserColl.albumSlots.find(s => s.player.id === tradeTargetCard.id);
            if (targetSlot && !targetSlot.placedCard) {
                targetSlot.placedCard = tradeTargetCard;
            }
            
            // --- Target Player ---
            const targetCardIndex = targetPlayerColl.cardInventory.findIndex(c => c.id === tradeTargetCard.id);
            if (targetCardIndex > -1) {
                targetPlayerColl.cardInventory.splice(targetCardIndex, 1);
            }
            targetPlayerColl.cardInventory.push(offeredCard);
            const offeredSlot = targetPlayerColl.albumSlots.find(s => s.player.id === offeredCard.id);
            if (offeredSlot && !offeredSlot.placedCard) {
                offeredSlot.placedCard = offeredCard;
            }
            
            return newCollections;
        });

        alert(`Échange réussi ! Vous avez obtenu ${tradeTargetCard.name} en échange de ${offeredCard.name}.`);
        setIsTradeModalOpen(false);
        setTradeTargetCard(null);
    };

    return (
        <div className="container mx-auto px-4 pb-20">
            {isTradeModalOpen && tradeTargetCard && (
                <TradeModal
                    offerableCards={currentUserDuplicates}
                    targetPlayerName={selectedPlayerName}
                    targetCard={tradeTargetCard}
                    onConfirm={handleConfirmTrade}
                    onClose={() => setIsTradeModalOpen(false)}
                />
            )}
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-[#fd6c9e]">COLLECTIONS & ÉCHANGES</h2>
                <button onClick={onBack} className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600">Retour</button>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/4">
                    <h3 className="text-xl font-bold mb-4">Joueurs</h3>
                    <div className="space-y-2">
                        {playerNames.map(name => (
                            <button key={name} onClick={() => setSelectedPlayerName(name)} className={`w-full text-left p-3 rounded-md transition-colors ${selectedPlayerName === name ? 'bg-rose-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}>
                                {name} {name === currentUser && '(Vous)'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="md:w-3/4">
                    <h3 className="text-xl font-bold mb-4">Album de <span className="text-rose-400">{selectedPlayerName}</span></h3>
                    {selectedPlayerName !== currentUser && <p className="text-sm text-yellow-300 mb-4">Cliquez sur une carte que vous n'avez pas pour proposer un échange avec vos doubles.</p>}
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2">
                        {selectedPlayerCollection.albumSlots.map(slot => (
                            <div key={slot.player.id} onClick={() => handleCardClick(slot)} className={selectedPlayerName !== currentUser && slot.placedCard ? 'cursor-pointer' : ''}>
                                <AlbumSlot slot={slot} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
const initialTeamSlots: TeamSlot[] = [
    { id: 'gk', label: 'Gardien', gridArea: '17 / 5 / span 3 / span 2', card: null },
    { id: 'lb', label: 'Déf. Gauche', gridArea: '13 / 2 / span 3 / span 2', card: null },
    { id: 'lcb', label: 'Déf. Central', gridArea: '13 / 4 / span 3 / span 2', card: null },
    { id: 'rcb', label: 'Déf. Central', gridArea: '13 / 6 / span 3 / span 2', card: null },
    { id: 'rb', label: 'Déf. Droit', gridArea: '13 / 8 / span 3 / span 2', card: null },
    { id: 'lm', label: 'Mil. Gauche', gridArea: '8 / 2 / span 3 / span 2', card: null },
    { id: 'lcm', label: 'Mil. Central', gridArea: '8 / 4 / span 3 / span 2', card: null },
    { id: 'rcm', label: 'Mil. Central', gridArea: '8 / 6 / span 3 / span 2', card: null },
    { id: 'rm', label: 'Mil. Droit', gridArea: '8 / 8 / span 3 / span 2', card: null },
    { id: 'lst', label: 'Attaquant', gridArea: '3 / 4 / span 3 / span 2', card: null },
    { id: 'rst', label: 'Attaquant', gridArea: '3 / 6 / span 3 / span 2', card: null },
    { id: 'sub1', label: 'REM', gridArea: '', card: null }, { id: 'sub2', label: 'REM', gridArea: '', card: null },
    { id: 'sub3', label: 'REM', gridArea: '', card: null }, { id: 'sub4', label: 'REM', gridArea: '', card: null },
    { id: 'sub5', label: 'REM', gridArea: '', card: null },
];

const PaniniPage: React.FC = () => {
    const currentUser = 'Mon Album';
    const [view, setView] = useState<'landing' | 'team' | 'collection' | 'trade'>('landing');
    
    const [allCollections, setAllCollections] = useLocalStorage<AllCollections>('panini_all_collections_v3', initialAllCollections);
    const [team, setTeam] = useLocalStorage<TeamSlot[]>(`panini_team_${currentUser}`, initialTeamSlots);

    useEffect(() => {
        if (!allCollections[currentUser]) {
            setAllCollections(prev => ({ ...prev, [currentUser]: createInitialCollection() }));
        }
    }, [currentUser, allCollections, setAllCollections]);

    const currentUserCollection = allCollections[currentUser] || createInitialCollection();
    
    const setcurrentUserCollection = (updater: (prev: PlayerCollection) => PlayerCollection) => {
        setAllCollections(prev => ({
            ...prev,
            [currentUser]: updater(prev[currentUser] || createInitialCollection()),
        }));
    };
    
    const collectedCards = useMemo(() => {
        return (currentUserCollection.albumSlots || []).filter(s => s.placedCard).map(s => s.placedCard as PaniniCardData);
    }, [currentUserCollection]);

    if (view === 'trade') {
        return <CollectionsTradeView onBack={() => setView('landing')} allCollections={allCollections} setAllCollections={setAllCollections} currentUser={currentUser} />;
    }

    if (view === 'team') {
        return <TeamFormationView onBack={() => setView('landing')} collectedCards={collectedCards} team={team} setTeam={setTeam} />;
    }

    if (view === 'collection') {
        return <CollectionView 
            onBack={() => setView('landing')}
            collection={currentUserCollection}
            setCollection={setcurrentUserCollection}
        />;
    }

    return (
        <div className="container mx-auto px-4 pb-20 flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
            <h2 className="text-4xl font-bold text-[#fd6c9e] mb-12 text-center">PANINI UNIVERSE</h2>
            <div className="flex flex-col md:flex-row justify-center gap-8 w-full max-w-6xl">
                <button onClick={() => setView('team')} className="panini-landing-button flex-1 relative aspect-video bg-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center border-4 border-blue-500/50 shadow-2xl shadow-blue-500/20">
                    <UsersIcon className="h-16 w-16 text-blue-400 mb-4"/>
                    <h3 className="text-3xl font-bold text-white">Mon Équipe Type</h3>
                    <p className="text-blue-200">Composez votre onze de légende.</p>
                </button>
                 <button onClick={() => setView('collection')} className="panini-landing-button flex-1 relative aspect-video bg-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center border-4 border-amber-500/50 shadow-2xl shadow-amber-500/20">
                    <TicketIcon className="h-16 w-16 text-amber-400 mb-4"/>
                    <h3 className="text-3xl font-bold text-white">Ma Collection</h3>
                    <p className="text-amber-200">Découvrez et collectionnez les 100 icônes.</p>
                </button>
                <button onClick={() => setView('trade')} className="panini-landing-button flex-1 relative aspect-video bg-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center border-4 border-green-500/50 shadow-2xl shadow-green-500/20">
                    <SwitchHorizontalIcon className="h-16 w-16 text-green-400 mb-4"/>
                    <h3 className="text-3xl font-bold text-white">Collections & Échanges</h3>
                    <p className="text-green-200">Échangez avec d'autres joueurs.</p>
                </button>
            </div>
        </div>
    );
};

export default PaniniPage;