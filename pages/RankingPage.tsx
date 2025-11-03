import React, { useState } from 'react';
import { mockRanking, mockMatches } from '../data/mockData';
import { TeamStats, Match, Role } from '../types';
import { PencilIcon, TrashIcon, PlusIcon } from '../components/icons/icons';
import { useAuth } from '../hooks/useAuth';

const MatchModal: React.FC<{ match?: Match | null; onSave: (match: Match) => void; onClose: () => void; }> = ({ match, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Match>>(match || { home: true, result: 'W' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Match);
    };

    return (
        <div className="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-lg w-full border border-rose-500" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">{match ? 'Modifier le Match' : 'Ajouter un Match'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="date" name="date" value={formData.date || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded" required />
                    <input type="text" name="opponent" placeholder="Adversaire" value={formData.opponent || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded" required />
                    <input type="text" name="score" placeholder="Score (ex: 3-1)" value={formData.score || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded" required />
                    <select name="result" value={formData.result || 'W'} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded">
                        <option value="W">Victoire (W)</option>
                        <option value="D">Nul (D)</option>
                        <option value="L">Défaite (L)</option>
                    </select>
                    <div className="flex items-center">
                        <input type="checkbox" id="home" name="home" checked={formData.home || false} onChange={handleChange} className="h-4 w-4 text-rose-600 bg-gray-700 border-gray-600 rounded focus:ring-rose-500" />
                        <label htmlFor="home" className="ml-2 block text-sm text-gray-300">Match à domicile</label>
                    </div>
                    <textarea name="summary" placeholder="Résumé du match" value={formData.summary || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded h-24"></textarea>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">Annuler</button>
                        <button type="submit" className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700">Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const RankingPage: React.FC = () => {
    const [ranking] = useState<TeamStats[]>(mockRanking);
    const [matches, setMatches] = useState<Match[]>(mockMatches);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [isAddingMatch, setIsAddingMatch] = useState(false);
    const { user } = useAuth();
    const isAdmin = user?.role === Role.Admin;

    const getResultClass = (result: 'W' | 'D' | 'L') => {
        switch (result) {
            case 'W': return 'bg-green-500/20 text-green-400';
            case 'D': return 'bg-yellow-500/20 text-yellow-400';
            case 'L': return 'bg-red-500/20 text-red-400';
        }
    };

    const handleSaveMatch = (matchToSave: Match) => {
        if(matchToSave.id) {
            setMatches(prev => prev.map(m => m.id === matchToSave.id ? matchToSave : m));
        } else {
            const newMatch = { ...matchToSave, id: Date.now(), scorers: [], photos: [] };
            setMatches(prev => [newMatch, ...prev]);
        }
        setEditingMatch(null);
        setIsAddingMatch(false);
    };

    const handleDeleteMatch = (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce match ?')) {
            setMatches(prev => prev.filter(m => m.id !== id));
        }
    };


    return (
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
            {(isAddingMatch || editingMatch) && <MatchModal match={editingMatch} onSave={handleSaveMatch} onClose={() => { setIsAddingMatch(false); setEditingMatch(null); }} />}

            {/* Ranking Table */}
            <div className="lg:col-span-2 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-[#fd6c9e] mb-6">Classement de la Ligue</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-4 py-3">#</th>
                                <th scope="col" className="px-6 py-3">Équipe</th>
                                <th scope="col" className="px-2 py-3 text-center">J</th>
                                <th scope="col" className="px-2 py-3 text-center">G</th>
                                <th scope="col" className="px-2 py-3 text-center">N</th>
                                <th scope="col" className="px-2 py-3 text-center">P</th>
                                <th scope="col" className="px-2 py-3 text-center">DB</th>
                                <th scope="col" className="px-6 py-3 text-right">Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.map((team) => (
                                <tr key={team.rank} className={`border-b border-gray-700 ${team.name === 'FC LIDO' ? 'bg-rose-500/10' : ''}`}>
                                    <td className="px-4 py-4 font-medium">{team.rank}</td>
                                    <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{team.name}</th>
                                    <td className="px-2 py-4 text-center">{team.played}</td>
                                    <td className="px-2 py-4 text-center">{team.wins}</td>
                                    <td className="px-2 py-4 text-center">{team.draws}</td>
                                    <td className="px-2 py-4 text-center">{team.losses}</td>
                                    <td className="px-2 py-4 text-center">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</td>
                                    <td className="px-6 py-4 text-right font-bold">{team.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Match History */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#fd6c9e]">Derniers Matchs</h2>
                    {isAdmin && <button onClick={() => setIsAddingMatch(true)} className="p-2 rounded-full bg-rose-600 hover:bg-rose-700"><PlusIcon /></button>}
                </div>
                <div className="space-y-4">
                    {matches.map(match => (
                        <div key={match.id} className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-between group">
                            <div onClick={() => setSelectedMatch(match)} className="cursor-pointer flex-grow">
                                <p className="text-xs text-gray-400">{match.date}</p>
                                <p className="font-bold">{match.home ? 'FC LIDO' : match.opponent} vs {match.home ? match.opponent : 'FC LIDO'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-xl">{match.score}</p>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${getResultClass(match.result)}`}>
                                    {match.result}
                                </span>
                                {isAdmin && (
                                    <div className="flex items-center gap-1 ml-2">
                                        <button onClick={() => setEditingMatch(match)} className="p-1.5 text-gray-400 hover:text-blue-400"><PencilIcon /></button>
                                        <button onClick={() => handleDeleteMatch(match.id)} className="p-1.5 text-gray-400 hover:text-red-400"><TrashIcon /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Match Details Modal */}
            {selectedMatch && (
                <div className="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm" onClick={() => setSelectedMatch(null)}>
                    <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 border border-rose-500" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold mb-4">{selectedMatch.home ? 'FC LIDO' : selectedMatch.opponent} vs {selectedMatch.home ? selectedMatch.opponent : 'FC LIDO'}</h3>
                        <p className="text-gray-400 mb-4">{selectedMatch.date} - Score Final: {selectedMatch.score}</p>
                        <div className="mb-4">
                            <h4 className="font-semibold text-rose-400">Buteurs:</h4>
                            <ul className="list-disc list-inside text-gray-300">
                                {selectedMatch.scorers.map((scorer, i) => <li key={i}>{scorer}</li>)}
                            </ul>
                        </div>
                        <div className="mb-6">
                            <h4 className="font-semibold text-rose-400">Résumé:</h4>
                            <p className="text-gray-300">{selectedMatch.summary}</p>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            {selectedMatch.photos.map((photo, i) => (
                                <img key={i} src={photo} alt={`Match photo ${i + 1}`} className="rounded-lg object-cover w-full h-40"/>
                            ))}
                        </div>
                        <button onClick={() => setSelectedMatch(null)} className="mt-6 bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition-colors">Fermer</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RankingPage;