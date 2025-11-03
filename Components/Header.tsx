import React, { useState, useEffect, useRef } from 'react';
import Logo from './Logo';
import { Page, EventType, Role } from '../types';
import { 
    UsersIcon, 
    ChartBarIcon, 
    PhotoIcon, 
    CalendarIcon, 
    BuildingLibraryIcon, 
    HomeIcon, 
    TicketIcon, 
    BoltIcon, 
    ShareIcon, 
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    MegaphoneIcon,
    TrophyIcon,
    PauseIcon,
    SparklesIcon,
    LogoutIcon
} from './icons/icons';
import { mockCalendarEvents } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';

const EventIcon: React.FC<{type: EventType, className?: string}> = ({ type, className = "h-5 w-5 mr-3 shrink-0 inline-block" }) => {
    switch(type) {
        case EventType.Match: return <CalendarIcon className={className} />;
        case EventType.Training: return <BoltIcon className={className} />;
        case EventType.Tournament: return <TrophyIcon className={className} />;
        case EventType.Break: return <PauseIcon className={className} />;
        case EventType.Extra: return <SparklesIcon className={className} />;
        default: return <MegaphoneIcon className={className} />;
    }
};

interface HeaderProps {
    activePage: Page;
    setActivePage: (page: Page) => void;
}

const navLinks = [
    { page: Page.Home, icon: <HomeIcon /> },
    { page: Page.Players, icon: <UsersIcon /> },
    { page: Page.Ranking, icon: <ChartBarIcon /> },
    { page: Page.Media, icon: <PhotoIcon /> },
    { page: Page.Calendar, icon: <CalendarIcon /> },
    { page: Page.Club, icon: <BuildingLibraryIcon /> },
    { page: Page.Panini, icon: <TicketIcon /> },
    { page: Page.Penalty, icon: <BoltIcon /> },
];

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage }) => {
    const [currentDate, setCurrentDate] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user, logout } = useAuth();
    const isAdmin = user?.role === Role.Admin;

    const visibleNavLinks = navLinks.filter(link => {
        if (link.page === Page.Panini && !isAdmin) {
            return false;
        }
        return true;
    });

    useEffect(() => {
        const date = new Date();
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = new Intl.DateTimeFormat('fr-FR', options).format(date);
        setCurrentDate(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1));
    }, []);

    const upcomingEvents = mockCalendarEvents
        .filter(event => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return event.date >= today;
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());


    const handleShare = async () => {
        const shareData = {
            title: 'FC LIDO de Toulon',
            text: `Découvrez l'application du FC LIDO de Toulon ! Suivez nos joueurs, notre classement, et les dernières actualités du club.`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                // Cette fonction fonctionnera parfaitement une fois l'application déployée sur une URL publique.
                await navigator.share(shareData);
            } catch (err) {
                // L'erreur est levée si l'utilisateur annule le partage, nous pouvons donc l'ignorer.
                if ((err as Error).name !== 'AbortError') {
                    console.error('Share failed:', err);
                }
            }
        } else {
            // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
            alert(`La fonction de partage n'est pas supportée. Vous pouvez copier le lien suivant :\n\n${shareData.url}`);
        }
    };
    
    const blobUrlToBase64 = async (blobUrl: string): Promise<string> => {
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleSaveData = async () => {
        const keysToBackup = [
            'media_albums',
            'penalty_highscore',
            'penalty_leaderboard',
            'penalty_playername',
            'fclido_logo_url',
            'panini_all_collections_v3',
        ];
        const appDynamicKeyPrefix = 'panini_team_';
        
        const backupData: { [key: string]: any } = {};

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (keysToBackup.includes(key) || key.startsWith(appDynamicKeyPrefix))) {
                try {
                    const value = localStorage.getItem(key);
                    if (value) {
                        backupData[key] = JSON.parse(value);
                    }
                } catch (e) {
                    console.warn(`Could not parse localStorage item ${key}:`, e);
                    backupData[key] = localStorage.getItem(key);
                }
            }
        }

        if (backupData['media_albums']) {
            const mediaAlbums = backupData['media_albums'];
            for (const albumName in mediaAlbums) {
                if (Object.prototype.hasOwnProperty.call(mediaAlbums, albumName)) {
                    const album = mediaAlbums[albumName];
                    if (Array.isArray(album)) {
                        const conversionPromises = album.map(async (item) => {
                             if (item && item.url && typeof item.url === 'string' && item.url.startsWith('blob:')) {
                                try {
                                    const base64Url = await blobUrlToBase64(item.url);
                                    return { ...item, url: base64Url };
                                } catch (error) {
                                    console.error(`Could not convert blob URL to Base64 for item in album ${albumName}:`, item, error);
                                    return item; // Return original item on error
                                }
                            }
                            return item;
                        });
                        mediaAlbums[albumName] = await Promise.all(conversionPromises);
                    }
                }
            }
        }

        if (Object.keys(backupData).length > 0) {
            try {
                const jsonString = JSON.stringify(backupData, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                const date = new Date().toISOString().split('T')[0];
                link.href = url;
                link.download = `fclido_data_${date}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Failed to create backup file:", error);
                alert("Une erreur est survenue lors de la création de la sauvegarde.");
            }
        } else {
            alert("Aucune donnée à sauvegarder.");
        }
    };

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("Le fichier n'a pas pu être lu.");
                const data = JSON.parse(text);

                Object.keys(data).forEach(key => {
                    const value = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
                    localStorage.setItem(key, value);
                });
                
                alert("Données chargées avec succès ! L'application va se rafraîchir.");
                window.location.reload();

            } catch (error) {
                console.error("Échec du chargement des données :", error);
                alert("Erreur lors du chargement du fichier. Assurez-vous que c'est un fichier de sauvegarde valide.");
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Permet de recharger le même fichier
    };

    if (!user) return null;

    return (
        <>
            <header className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-b border-gray-700 z-50">
                <div className="container mx-auto px-4 h-20 flex justify-between items-center">
                    <button onClick={() => setActivePage(Page.Home)} className="flex items-center gap-3">
                        <Logo className="w-12 h-12 rounded-lg" />
                        <span className="hidden sm:block text-2xl font-bold text-white tracking-wide">FC LIDO</span>
                    </button>

                    <nav className="hidden md:flex items-center gap-2">
                        {visibleNavLinks.map(link => (
                            <button 
                                key={link.page} 
                                onClick={() => setActivePage(link.page)}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activePage === link.page ? 'bg-rose-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            >
                                {link.page}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        <div className="hidden lg:block text-right">
                           <span className="font-bold text-white">Bienvenue, {user.username}</span>
                           <p className="text-xs text-gray-400">{currentDate}</p>
                        </div>
                        {user.role === Role.Admin && (
                            <>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                                <button
                                    onClick={handleLoadClick}
                                    title="Charger les données depuis un fichier"
                                    className="bg-gray-700 hover:bg-green-600 text-white p-2 rounded-md transition-colors"
                                    aria-label="Charger les données"
                                >
                                    <ArrowUpTrayIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={handleSaveData}
                                    title="Sauvegarder les données locales"
                                    className="bg-gray-700 hover:bg-blue-600 text-white p-2 rounded-md transition-colors"
                                    aria-label="Sauvegarder les données"
                                >
                                    <ArrowDownTrayIcon className="h-5 w-5" />
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleShare}
                            title="Partager un lien vers l'application"
                            className="bg-gray-700 hover:bg-rose-600 text-white p-2 rounded-md transition-colors"
                            aria-label="Partager l'application"
                        >
                            <ShareIcon className="h-5 w-5" />
                        </button>
                         <button
                            onClick={logout}
                            title="Se déconnecter"
                            className="bg-gray-700 hover:bg-red-600 text-white p-2 rounded-md transition-colors"
                            aria-label="Se déconnecter"
                        >
                            <LogoutIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            {upcomingEvents.length > 0 && (
                <div className="led-banner fixed top-20 left-0 right-0 ticker-container w-full overflow-hidden whitespace-nowrap">
                    <div className="ticker-content">
                        {/* Render items twice for seamless loop */}
                        {[...upcomingEvents, ...upcomingEvents].map((event, index) => (
                            <span key={`${event.id}-${index}`} className="mx-8 inline-flex items-center">
                                 <EventIcon type={event.type} />
                                 <span>{event.type}: {event.title} ({event.date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })})</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Mobile Navigation Spacer */}
            <div className="md:hidden h-16" />
            {/* Mobile Navigation Bar */}
            <nav className="md:hidden flex justify-around items-center bg-gray-800 border-t border-gray-700 fixed bottom-0 left-0 right-0 h-16 z-50">
                {visibleNavLinks.map(link => (
                    <button
                        key={link.page}
                        onClick={() => setActivePage(link.page)}
                        className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activePage === link.page ? 'text-rose-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        {React.cloneElement(link.icon, { className: 'h-6 w-6 mb-1' })}
                        <span className="text-xs">{link.page}</span>
                    </button>
                ))}
            </nav>
        </>
    );
};

export default Header;