import React, { useState, useRef, useEffect } from 'react';
import { MediaItem, Role } from '../types';
import { PlusIcon, TrashIcon, PencilIcon } from '../components/icons/Icons.tsx';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';

const initialMedia: { [key: string]: MediaItem[] } = {
    'Saison 2023-2024': [
        { id: 1, type: 'photo', url: 'https://picsum.photos/seed/media1/600/400', title: 'Victoire contre AS La Seyne' },
        { id: 2, type: 'photo', url: 'https://picsum.photos/seed/media2/600/400', title: 'Entraînement sous la pluie' },
        { id: 3, type: 'video', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4', title: 'Le but de la saison' },
        { id: 4, type: 'photo', url: 'https://picsum.photos/seed/media4/600/400', title: 'Photo d\'équipe' },
    ],
    'Saison 2022-2023': [
        { id: 5, type: 'photo', url: 'https://picsum.photos/seed/media5/600/400', title: 'Tournoi d\'hiver' },
        { id: 6, type: 'video', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4', title: 'Coulisses du vestiaire' },
    ],
};


const MediaPage: React.FC = () => {
    const [media, setMedia] = useLocalStorage('media_albums', initialMedia);
    const albumNames = Object.keys(media);
    const [filter, setFilter] = useState(albumNames.length > 0 ? albumNames[0] : '');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoFileInputRef = useRef<HTMLInputElement>(null);
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
    const { user } = useAuth();
    const canEdit = user?.role === Role.Admin || user?.role === Role.Editor;

    useEffect(() => {
        if (!albumNames.includes(filter) && albumNames.length > 0) {
            setFilter(albumNames[0]);
        } else if (albumNames.length === 0) {
            setFilter('');
        }
    }, [media, filter, albumNames]);


    const handleAddClick = () => {
        if (!filter) {
            alert("Veuillez d'abord sélectionner ou créer un album.");
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            const newMediaItem: MediaItem = {
                id: Date.now(),
                type: 'photo',
                url: URL.createObjectURL(file),
                title: file.name.split('.').slice(0, -1).join('.') || 'Nouvelle Photo'
            };

            setMedia(prevMedia => ({
                ...prevMedia,
                [filter]: [...(prevMedia[filter] || []), newMediaItem]
            }));
            event.target.value = '';
        }
    };

    const handleAddVideo = () => {
        if (!filter) {
            alert("Veuillez d'abord sélectionner ou créer un album.");
            return;
        }
        videoFileInputRef.current?.click();
    };

    const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            const newVideoItem: MediaItem = {
                id: Date.now(),
                type: 'video',
                url: URL.createObjectURL(file),
                title: file.name.split('.').slice(0, -1).join('.') || 'Nouvelle Vidéo'
            };

            setMedia(prevMedia => ({
                ...prevMedia,
                [filter]: [...(prevMedia[filter] || []), newVideoItem]
            }));
            event.target.value = '';
        }
    };
    
    const handleDelete = (id: number) => {
        if(window.confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) {
            setMedia(prevMedia => ({
                ...prevMedia,
                [filter]: prevMedia[filter].filter(item => item.id !== id)
            }));
        }
    };

    const handleAddAlbum = () => {
        const name = prompt("Entrez le nom du nouvel album :");
        if (name && name.trim()) {
            if (media[name]) {
                alert("Un album avec ce nom existe déjà.");
            } else {
                setMedia(prev => ({...prev, [name]: [] }));
                setFilter(name);
            }
        }
    };
    
    const handleRenameAlbum = () => {
        if (!filter) return;
        const newName = prompt(`Entrez le nouveau nom pour l'album "${filter}":`, filter);
        if (newName && newName.trim() && newName !== filter) {
            if (media[newName]) {
                alert("Un album avec ce nom existe déjà.");
            } else {
                setMedia(prev => {
                    const newState = { ...prev };
                    newState[newName] = newState[filter]; // Copy items
                    delete newState[filter]; // Delete old album
                    return newState;
                });
                setFilter(newName); // Set view to the renamed album
            }
        }
    };

    const handleDeleteAlbum = () => {
        if (!filter) return;
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'album "${filter}" et toutes ses photos ? Cette action est irréversible.`)) {
            setMedia(prev => {
                const newState = {...prev};
                delete newState[filter];
                return newState;
            });
        }
    };

    const handleRenameMedia = (id: number) => {
        const currentItem = media[filter]?.find(item => item.id === id);
        if (!currentItem) return;

        const newTitle = prompt("Entrez le nouveau titre:", currentItem.title);
        if (newTitle && newTitle.trim()) {
            setMedia(prevMedia => ({
                ...prevMedia,
                [filter]: prevMedia[filter].map(item =>
                    item.id === id ? { ...item, title: newTitle.trim() } : item
                )
            }));
        }
    };

    const mediaItems = media[filter] || [];

    return (
        <div className="container mx-auto px-4 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-[#fd6c9e]">MÉDIAS</h2>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-rose-500 focus:border-rose-500"
                    >
                         {albumNames.length > 0 ? (
                            albumNames.map(name => <option key={name} value={name}>{name}</option>)
                        ) : (
                            <option value="" disabled>Aucun album</option>
                        )}
                    </select>
                    {canEdit && (
                        <>
                            <button onClick={handleAddAlbum} className="p-2.5 rounded-md bg-blue-600 hover:bg-blue-700" title="Créer un album"><PlusIcon className="h-5 w-5"/></button>
                            <button onClick={handleRenameAlbum} disabled={!filter} className="p-2.5 rounded-md bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:cursor-not-allowed" title="Renommer l'album"><PencilIcon className="h-5 w-5"/></button>
                            <button onClick={handleDeleteAlbum} disabled={!filter} className="p-2.5 rounded-md bg-red-600 hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed" title="Supprimer l'album"><TrashIcon className="h-5 w-5"/></button>
                            <div className="h-8 w-px bg-gray-600 mx-2 hidden sm:block"></div>
                            <button onClick={handleAddVideo} className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 flex items-center gap-2">
                                <PlusIcon />
                                <span>Ajouter Vidéo</span>
                            </button>
                            <button onClick={handleAddClick} className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 flex items-center gap-2 transition-transform transform hover:scale-105">
                                <PlusIcon />
                                <span>Ajouter Photo</span>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                             <input
                                type="file"
                                ref={videoFileInputRef}
                                onChange={handleVideoFileChange}
                                className="hidden"
                                accept="video/mp4"
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mediaItems.length > 0 ? mediaItems.map(item => (
                    <div key={item.id} className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer" onClick={() => setSelectedMedia(item)}>
                        {item.type === 'video' ? (
                            <video src={item.url} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110" muted playsInline loop autoPlay />
                        ) : (
                            <img src={item.url} alt={item.title} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                            <h3 className="text-white font-semibold text-lg transform transition-transform duration-300 group-hover:-translate-y-2">{item.title}</h3>
                        </div>
                        {item.type === 'video' && (
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                        {canEdit && (
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button onClick={(e) => { e.stopPropagation(); handleRenameMedia(item.id); }} className="p-1.5 bg-blue-600/80 text-white rounded-full hover:bg-blue-500 transition-all backdrop-blur-sm" title="Renommer">
                                    <PencilIcon />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-1.5 bg-red-600/80 text-white rounded-full hover:bg-red-500 transition-all backdrop-blur-sm" title="Supprimer">
                                    <TrashIcon />
                                </button>
                            </div>
                        )}
                    </div>
                )) : (
                     <div className="col-span-full text-center py-16 text-gray-500">
                        <p>{filter ? "Cet album est vide. Ajoutez un média pour commencer !" : "Créez votre premier album pour y ajouter des photos."}</p>
                    </div>
                )}
            </div>

            {selectedMedia && (
                <div className="modal-overlay fixed inset-0 bg-black/80 flex items-center justify-center backdrop-blur-md p-4 animate-fade-in z-50" onClick={() => setSelectedMedia(null)}>
                    <button onClick={() => setSelectedMedia(null)} className="absolute top-4 right-4 bg-white text-black rounded-full h-10 w-10 flex items-center justify-center font-bold text-2xl z-20 hover:scale-110 transition-transform">
                        &times;
                    </button>
                    <div className="relative max-w-5xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
                        {selectedMedia.type === 'video' ? (
                            <video 
                                src={selectedMedia.url}
                                controls
                                autoPlay
                                className="w-full h-auto object-contain rounded-lg max-h-[90vh]" 
                            />
                        ) : (
                             <img 
                                src={selectedMedia.url.startsWith('blob:') ? selectedMedia.url : selectedMedia.url.replace('/600/400', '/1200/800')}
                                alt={selectedMedia.title} 
                                className="w-full h-auto object-contain rounded-lg max-h-[90vh]" 
                            />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 text-center text-white p-3 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                            <h3 className="text-xl font-bold">{selectedMedia.title}</h3>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaPage;