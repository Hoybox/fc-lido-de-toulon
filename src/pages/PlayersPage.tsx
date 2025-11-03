import React, { useState, useMemo } from 'react';
import { mockPlayers } from '../data/mockData';
import { Player, Role } from '../types';
import PlayerCard from '../components/PlayerCard.tsx';
import { PlusIcon } from '../components/icons/Icons.tsx';
import { useAuth } from '../hooks/useAuth';

const PlayerFormModal: React.FC<{ player?: Player | null; onSave: (player: Player) => void; onClose: () => void; }> = ({ player, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Player>>(player || { 
        strongFoot: 'Droit', 
        goals: 0, 
        assists: 0, 
        pac: 50, sho: 50, pas: 50, dri: 50, def: 50, phy: 50,
        unassignedPoints: 0,
    });
    const [photoPreview, setPhotoPreview] = useState<string | undefined>(player?.photoUrl);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const photoUrl = URL.createObjectURL(file);
            setPhotoPreview(photoUrl);
            setFormData(prev => ({ ...prev, photoUrl }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Player);
    };

    return (
        <div className="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-lg w-full border border-rose-500">
                <h2 className="text-2xl font-bold mb-6 text-white">{player ? 'Modifier le Joueur' : 'Ajouter un Joueur'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <img src={photoPreview || 'https://via.placeholder.com/100'} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                        <input type="file" name="photoUrl" onChange={handlePhotoChange} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="firstName" placeholder="Prénom" value={formData.firstName || ''} onChange={handleChange} className="bg-gray-700 p-2 rounded" required />
                        <input type="text" name="lastName" placeholder="Nom" value={formData.lastName || ''} onChange={handleChange} className="bg-gray-700 p-2 rounded" required />
                    </div>
                    <input type="text" name="nickname" placeholder="Surnom" value={formData.nickname || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded" />
                    <input type="text" name="position" placeholder="Poste" value={formData.position || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded" required />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="age" placeholder="Âge" value={formData.age || ''} onChange={handleChange} className="bg-gray-700 p-2 rounded" />
                        <input type="number" name="height" placeholder="Taille (cm)" value={formData.height || ''} onChange={handleChange} className="bg-gray-700 p-2 rounded" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="goals" placeholder="Buts" value={formData.goals || ''} onChange={handleChange} className="bg-gray-700 p-2 rounded" />
                        <input type="number" name="assists" placeholder="Passes D." value={formData.assists || ''} onChange={handleChange} className="bg-gray-700 p-2 rounded" />
                    </div>
                    <select name="strongFoot" value={formData.strongFoot || 'Droit'} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded">
                        <option>Droit</option>
                        <option>Gauche</option>
                        <option>Ambidextre</option>
                    </select>
                    <div className="text-center text-gray-400 text-sm">Stats (max 99) - Le total sera géré sur la fiche.</div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">Annuler</button>
                        <button type="submit" className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700">Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PlayersPage: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>(mockPlayers);
    const [searchTerm, setSearchTerm] = useState('');
    const [positionFilter, setPositionFilter] = useState('all');
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const { user } = useAuth();
    const isAdmin = user?.role === Role.Admin;

    const filteredPlayers = useMemo(() => {
        return players
            .filter(player => {
                const nameMatch = `${player.firstName} ${player.lastName} ${player.nickname}`.toLowerCase().includes(searchTerm.toLowerCase());
                const positionMatch = positionFilter === 'all' || player.position === positionFilter;
                return nameMatch && positionMatch;
            });
    }, [players, searchTerm, positionFilter]);

    const positions = useMemo(() => ['all', ...Array.from(new Set(mockPlayers.map(p => p.position)))], []);
    
    const handleSavePlayer = (playerToSave: Player) => {
        if(playerToSave.id) {
            setPlayers(prev => prev.map(p => p.id === playerToSave.id ? playerToSave : p));
        } else {
            const newPlayer = { ...playerToSave, id: Date.now(), awards: [], anecdote: 'Nouvelle recrue !' };
            setPlayers(prev => [...prev, newPlayer as Player]);
        }
        setEditingPlayer(null);
        setIsAdding(false);
    };
    
    const handleDeletePlayer = (id: number) => {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
        setPlayers(prev => prev.filter(p => p.id !== id));
      }
    };

    const handleGiveTrainingPoint = () => {
        setPlayers(prevPlayers => 
            prevPlayers.map(p => ({
                ...p,
                unassignedPoints: (p.unassignedPoints || 0) + 1
            }))
        );
    };

    return (
        <div className="container mx-auto px-4 pb-20">
            {(isAdding || editingPlayer) && (
                <PlayerFormModal 
                    player={editingPlayer} 
                    onSave={handleSavePlayer} 
                    onClose={() => { setIsAdding(false); setEditingPlayer(null); }} 
                />
            )}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-[#fd6c9e]">NOS JOUEURS</h2>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Rechercher un joueur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-rose-500 focus:border-rose-500 w-full sm:w-auto"
                    />
                    <select
                        value={positionFilter}
                        onChange={(e) => setPositionFilter(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-rose-500 focus:border-rose-500 w-full sm:w-auto"
                    >
                        {positions.map(pos => (
                            <option key={pos} value={pos}>{pos === 'all' ? 'Tous les postes' : pos}</option>
                        ))}
                    </select>
                    {isAdmin && (
                        <>
                            <button onClick={handleGiveTrainingPoint} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-2" title="Donner 1 point à tous les joueurs">
                                +1 Entraînement
                            </button>
                            <button onClick={() => setIsAdding(true)} className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 flex items-center justify-center gap-2 transition-transform transform hover:scale-105">
                                <PlusIcon />
                                <span>Ajouter</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {filteredPlayers.map(player => (
                    <PlayerCard 
                        key={player.id} 
                        player={player} 
                        isAdmin={isAdmin} 
                        onEdit={() => setEditingPlayer(player)}
                        onDelete={() => handleDeletePlayer(player.id)}
                        onUpdate={(updatedPlayer) => handleSavePlayer(updatedPlayer)}
                    />
                ))}
            </div>
        </div>
    );
};

export default PlayersPage;