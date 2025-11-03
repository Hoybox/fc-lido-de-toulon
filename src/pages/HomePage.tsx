import React from 'react';
import { Page, Role } from '../types';
import {
    UsersIcon,
    ChartBarIcon,
    PhotoIcon,
    CalendarIcon,
    BuildingLibraryIcon,
    TicketIcon,
    BoltIcon,
} from '../components/icons/Icons.tsx';
import Logo from '../components/Logo';
import { useAuth } from '../hooks/useAuth';

interface HomePageProps {
    setActivePage: (page: Page) => void;
}

const quickLinks = [
    { page: Page.Players, icon: <UsersIcon />, imageUrl: 'https://i.ibb.co/SD290MH0/Cat-Joueurs.jpg' },
    { page: Page.Ranking, icon: <ChartBarIcon />, imageUrl: 'https://i.ibb.co/67tgNsxY/Cat-Classement.jpg' },
    { page: Page.Media, icon: <PhotoIcon />, imageUrl: 'https://i.ibb.co/mV7k1HNq/Cat-Medias.jpg' },
    { page: Page.Calendar, icon: <CalendarIcon />, imageUrl: 'https://i.ibb.co/gFSSBKND/Cat-Calendrier.jpg' },
    { page: Page.Club, icon: <BuildingLibraryIcon />, imageUrl: 'https://i.ibb.co/4Z6GTBfr/Cat-Club.jpg' },
    { page: Page.Panini, icon: <TicketIcon />, imageUrl: 'https://i.ibb.co/mr8G8qyr/Cat-Panini.jpg' },
    { page: Page.Penalty, icon: <BoltIcon />, imageUrl: 'https://i.ibb.co/LykJMR1/Cat-Penalty.jpg' },
];


const HomePage: React.FC<HomePageProps> = ({ setActivePage }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === Role.Admin;

    const visibleQuickLinks = quickLinks.filter(link => {
        if (link.page === Page.Panini && !isAdmin) {
            return false;
        }
        return true;
    });

    return (
        <div className="text-center flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-8">
            <Logo className="w-48 h-48 sm:w-64 sm-h-64 mx-auto mb-6 drop-shadow-[0_0_1rem_#f43f5e] rounded-3xl" />
            <h1 className="text-4xl sm:text-6xl text-white tracking-wider uppercase font-berlin-sans">
                Football Club Le Lido
            </h1>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-4 sm:gap-x-6 gap-y-8 w-full max-w-6xl mt-12">
                {visibleQuickLinks.map(link => (
                    <div key={link.page} className="flex flex-col items-center justify-start gap-3">
                        <div className="relative group w-full aspect-[300/555] rounded-lg shadow-lg shadow-black/30">
                            <button
                                onClick={() => setActivePage(link.page)}
                                style={{ backgroundImage: `url(${link.imageUrl})` }}
                                className="w-full h-full bg-cover bg-center rounded-lg transition-transform duration-300 transform hover:-translate-y-1"
                                aria-label={`Aller à la page ${link.page}`}
                            >
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300 rounded-lg"></div>
                            </button>
                        </div>
                        <div
                            onClick={() => setActivePage(link.page)}
                            className="flex items-center gap-2 text-gray-200 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                           {React.cloneElement(link.icon, { className: 'h-5 w-5' })}
                           <span className="font-semibold text-sm sm:text-base text-center">{link.page}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;