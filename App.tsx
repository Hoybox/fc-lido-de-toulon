import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SiteProvider, useSite } from './hooks/useSite';
import HomePage from './pages/HomePage';
import PlayersPage from './pages/PlayersPage';
import RankingPage from './pages/RankingPage';
import MediaPage from './pages/MediaPage';
import CalendarPage from './pages/CalendarPage';
import ClubPage from './pages/ClubPage';
import PaniniPage from './pages/PaniniPage';
import PenaltyPage from './pages/PenaltyPage';
import Header from './components/Header';
import { Page, Role } from './types';
import LoginPage from './pages/LoginPage';

const ErrorBanner: React.FC = () => {
    const { backendError, setBackendError } = useSite();

    if (!backendError) return null;

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-11/12 max-w-3xl bg-red-800/95 backdrop-blur-sm border-2 border-red-500 text-white p-4 rounded-lg shadow-2xl z-[100] animate-fade-in" role="alert">
            <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400 mr-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-grow">
                    <h3 className="font-bold text-lg text-red-300">[ERREUR DE CONNEXION AU BACKEND]</h3>
                    <p className="text-sm mt-1">Impossible de contacter le serveur backend. Il est probablement éteint.</p>
                    <p className="text-sm mt-3 font-semibold">Pour résoudre ce problème :</p>
                    <ol className="list-decimal list-inside text-sm mt-1 space-y-1">
                        <li>Ouvrez un nouveau terminal.</li>
                        <li>Naviguez jusqu'au dossier racine du projet.</li>
                        <li>Exécutez la commande : <code className="bg-black/50 px-2 py-1 rounded-md text-yellow-300 font-mono">npm start</code></li>
                    </ol>
                </div>
                <button 
                    onClick={() => setBackendError(false)} 
                    className="ml-4 p-1 rounded-full text-red-200 hover:bg-red-700 hover:text-white transition-colors"
                    aria-label="Fermer l'alerte"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

const AppContent: React.FC = () => {
    const { user } = useAuth();
    const [activePage, setActivePage] = useState<Page>(Page.Home);

    useEffect(() => {
        // Redirect non-admin users away from the Panini page
        if (activePage === Page.Panini && user?.role !== Role.Admin) {
            setActivePage(Page.Home);
        }
    }, [activePage, user]);

    if (!user) {
        return <LoginPage />;
    }

    const renderPage = () => {
        switch (activePage) {
            case Page.Home:
                return <HomePage setActivePage={setActivePage} />;
            case Page.Players:
                return <PlayersPage />;
            case Page.Ranking:
                return <RankingPage />;
            case Page.Media:
                return <MediaPage />;
            case Page.Calendar:
                return <CalendarPage />;
            case Page.Club:
                return <ClubPage />;
            case Page.Panini:
                // Double check to prevent rendering while redirecting
                if (user.role !== Role.Admin) {
                    return <HomePage setActivePage={setActivePage} />;
                }
                return <PaniniPage />;
            case Page.Penalty:
                return <PenaltyPage />;
            default:
                return <HomePage setActivePage={setActivePage} />;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Header activePage={activePage} setActivePage={setActivePage} />
            <ErrorBanner />
            <main className="pt-32 pb-16 md:pb-0">
                {renderPage()}
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <SiteProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </SiteProvider>
    );
};

export default App;