import React, { useState, useMemo } from 'react';
import { Player } from '../types';
import { PencilIcon, TrashIcon, SparklesIcon } from './icons/icons';
import { generateFunFact } from '../services/geminiService';
import { useSite } from '../hooks/useSite';

interface PlayerCardProps {
    player: Player;
    isAdmin: boolean;
    onUpdate: (player: Player) => void;
    onEdit: () => void;
    onDelete: () => void;
}

type PlayerStat = 'pac' | 'sho' | 'pas' | 'dri' | 'def' | 'phy';

const StatGauge: React.FC<{ value: number }> = ({ value }) => (
    <div className="stat-gauge-container w-full">
        <div className="relative w-full h-full">
            <div className="stat-gauge-glow-wrapper">
                <div className="stat-gauge-glow" style={{ width: `${value}%` }} />
            </div>
            <div className="stat-gauge-bar" style={{ width: `${value}%` }} />
        </div>
    </div>
);


const StatsEditor: React.FC<{ player: Player, onUpdate: (player: Player) => void, onCancel: () => void }> = ({ player, onUpdate, onCancel }) => {
    const [editedPlayer, setEditedPlayer] = useState<Player>(player);

    const stats: PlayerStat[] = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];

    const totalStats = useMemo(() => {
        return stats.reduce((sum, stat) => sum + editedPlayer[stat], 0);
    }, [editedPlayer]);

    const handleStatChange = (stat: PlayerStat, delta: number) => {
        const currentValue = editedPlayer[stat];
        const newValue = currentValue + delta;
        if (newValue < 1 || newValue > 99) return;

        if (delta > 0) { // Augmentation
            if ((editedPlayer.unassignedPoints || 0) > 0) {
                setEditedPlayer(p => ({ ...p, [stat]: newValue, unassignedPoints: p.unassignedPoints - 1 }));
            } else if (totalStats < 350) {
                setEditedPlayer(p => ({ ...p, [stat]: newValue }));
            }
        } else { // Diminution
            setEditedPlayer(p => {
                const newTotal = totalStats - 1;
                // Si le total était au-dessus de la limite de base (350), la diminution rend un point "non assigné"
                const newUnassigned = newTotal >= 350 ? p.unassignedPoints + 1 : p.unassignedPoints;
                return { ...p, [stat]: newValue, unassignedPoints: newUnassigned };
            });
        }
    };

    return (
        <div className="mt-3 text-xs space-y-2">
            <h4 className="font-bold text-rose-400">Personnaliser les Stats</h4>
            {stats.map(stat => (
                 <div key={stat} className="flex items-center gap-2">
                    <button onClick={() => handleStatChange(stat, -1)} className="w-6 h-6 rounded-full bg-gray-600 hover:bg-red-500">-</button>
                    <div className="flex-grow">
                        <div className="flex justify-between items-center text-gray-300 uppercase font-bold text-xs px-1">
                            <span>{stat}</span>
                            <span>{editedPlayer[stat]}</span>
                        </div>
                        <StatGauge value={editedPlayer[stat]} />
                    </div>
                    <button onClick={() => handleStatChange(stat, 1)} className="w-6 h-6 rounded-full bg-gray-600 hover:bg-green-500">+</button>
                </div>
            ))}
             <div className="text-center font-bold pt-2">
                 <p>Total: <span className={totalStats > 350 ? "text-green-400" : "text-white"}>{totalStats}</span> / 350</p>
                 <p>Points à assigner: <span className="text-yellow-400">{editedPlayer.unassignedPoints}</span></p>
             </div>
             <div className="flex justify-end gap-2 pt-2">
                <button onClick={onCancel} className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-500 text-xs">Annuler</button>
                <button onClick={() => onUpdate(editedPlayer)} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-xs">Sauvegarder</button>
            </div>
        </div>
    );
};

const PlayerCard: React.FC<PlayerCardProps> = ({ player, isAdmin, onUpdate, onEdit, onDelete }) => {
    const [isLoadingFact, setIsLoadingFact] = useState(false);
    const [isEditingStats, setIsEditingStats] = useState(false);
    const { setBackendError } = useSite();

    const handleGenerateFact = async () => {
        setIsLoadingFact(true);
        try {
            const fact = await generateFunFact(player);
            onUpdate({ ...player, anecdote: fact });
        } catch (error) {
            setBackendError(true);
        } finally {
            setIsLoadingFact(false);
        }
    };

    return (
        <div className="card perspective-1000">
            <div className="card-inner relative w-full h-[380px]">
                {/* Front of the card */}
                <div className="card-front absolute w-full h-full bg-slate-900 rounded-xl shadow-lg shadow-rose-900/50 border-2 border-rose-500/30 overflow-hidden flex flex-col text-white">
                    <img src={player.photoUrl || 'https://via.placeholder.com/400x500'} alt={`${player.firstName} ${player.lastName}`} className="w-full h-full object-cover absolute" />
                    
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col justify-end p-4">
                        
                        {/* Player Stats */}
                        <div className="flex justify-between items-center w-full mb-2">
                            <div className="text-center font-impact">
                                <p className="text-2xl">{player.pac}</p>
                                <p className="text-xs tracking-widest opacity-80">PAC</p>
                            </div>
                            <div className="text-center font-impact">
                                <p className="text-2xl">{player.sho}</p>
                                <p className="text-xs tracking-widest opacity-80">SHO</p>
                            </div>
                            <div className="text-center font-impact">
                                <p className="text-2xl">{player.pas}</p>
                                <p className="text-xs tracking-widest opacity-80">PAS</p>
                            </div>
                            <div className="text-center font-impact">
                                <p className="text-2xl">{player.dri}</p>
                                <p className="text-xs tracking-widest opacity-80">DRI</p>
                            </div>
                            <div className="text-center font-impact">
                                <p className="text-2xl">{player.def}</p>
                                <p className="text-xs tracking-widest opacity-80">DEF</p>
                            </div>
                            <div className="text-center font-impact">
                                <p className="text-2xl">{player.phy}</p>
                                <p className="text-xs tracking-widest opacity-80">PHY</p>
                            </div>
                        </div>
                        
                        <div className="w-full border-t border-white/20 pt-2">
                            <p className="text-lg font-teko font-semibold leading-tight">{player.firstName}</p>
                            <h3 className="font-anton text-4xl uppercase leading-none">{player.lastName}</h3>
                            <p className="text-sm font-semibold uppercase text-rose-300 tracking-wider">{player.position}</p>
                        </div>
                    </div>
                </div>

                {/* Back of the card */}
                <div className="card-back absolute w-full h-full bg-gray-800 rounded-xl shadow-lg border-2 border-rose-500/50 p-4 flex flex-col text-sm">
                    <div className="flex-grow overflow-y-auto pr-2">
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between border-b border-gray-700 pb-1"><span className="font-semibold text-gray-400">Surnom:</span> <span className="text-white font-bold">"{player.nickname}"</span></div>
                            <div className="flex justify-between border-b border-gray-700 pb-1"><span className="font-semibold text-gray-400">Âge:</span> <span className="text-white">{player.age} ans</span></div>
                            <div className="flex justify-between border-b border-gray-700 pb-1"><span className="font-semibold text-gray-400">Taille:</span> <span className="text-white">{player.height} cm</span></div>
                            <div className="flex justify-between border-b border-gray-700 pb-1"><span className="font-semibold text-gray-400">Pied Fort:</span> <span className="text-white">{player.strongFoot}</span></div>
                        </div>
                        
                        {isEditingStats ? (
                            <StatsEditor player={player} onUpdate={(p) => { onUpdate(p); setIsEditingStats(false); }} onCancel={() => setIsEditingStats(false)} />
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-2 text-center mt-3">
                                    <div>
                                        <p className="font-teko text-5xl font-bold text-rose-500 tracking-tighter">{player.goals}</p>
                                        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">BUTS</p>
                                    </div>
                                    <div>
                                        <p className="font-teko text-5xl font-bold text-sky-400 tracking-tighter">{player.assists}</p>
                                        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">PASSES D.</p>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <h4 className="font-bold text-rose-400 mb-1">Le Saviez-vous ?</h4>
                                    <p className="text-gray-300 italic text-xs h-12 overflow-y-auto pr-2">
                                        {isLoadingFact ? 'Génération en cours...' : player.anecdote}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-auto pt-2">
                        {isAdmin && (
                            <div className="space-y-2">
                                <button 
                                    onClick={handleGenerateFact} 
                                    disabled={isLoadingFact || isEditingStats} 
                                    className="w-full bg-rose-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-rose-700 flex items-center justify-center gap-2 transition-all disabled:bg-gray-500"
                                >
                                    <SparklesIcon />
                                    {isLoadingFact ? 'Création...' : "Générer Anecdote (IA)"}
                                </button>
                                <div className="flex gap-2">
                                     <button onClick={() => setIsEditingStats(true)} disabled={isEditingStats} className="w-full p-1.5 bg-green-600/80 text-white rounded-md hover:bg-green-500 transition-colors flex items-center justify-center gap-1 text-xs disabled:bg-gray-500 disabled:cursor-not-allowed">
                                        <PencilIcon />
                                        <span>Stats</span>
                                    </button>
                                    <button onClick={onEdit} disabled={isEditingStats} className="w-full p-1.5 bg-blue-600/80 text-white rounded-md hover:bg-blue-500 transition-colors flex items-center justify-center gap-1 text-xs disabled:bg-gray-500 disabled:cursor-not-allowed">
                                        <PencilIcon />
                                        <span>Infos</span>
                                    </button>
                                    <button onClick={onDelete} disabled={isEditingStats} className="w-full p-1.5 bg-red-600/80 text-white rounded-md hover:bg-red-500 transition-colors flex items-center justify-center gap-1 text-xs disabled:bg-gray-500 disabled:cursor-not-allowed">
                                        <TrashIcon />
                                        <span>Suppr.</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerCard;