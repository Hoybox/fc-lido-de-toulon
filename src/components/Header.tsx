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
  LogoutIcon,
} from './icons/Icons.tsx';
import { mockCalendarEvents } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';

const EventIcon: React.FC<{ type: EventType; className?: string }> = ({
  type,
  className = 'h-5 w-5 mr-3 shrink-0 inline-block',
}) => {
  switch (type) {
    case EventType.Match:
      return <CalendarIcon className={className} />;
    case EventType.Training:
      return <BoltIcon className={className} />;
    case EventType.Tournament:
      return <TrophyIcon className={className} />;
    case EventType.Break:
      return <PauseIcon className={className} />;
    case EventType.Extra:
      return <SparklesIcon className={className} />;
    default:
      return <MegaphoneIcon className={className} />;
  }
};

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const baseNavLinks = [
  { page: Page.Home, icon: <HomeIcon /> },
  { page: Page.Players, icon: <UsersIcon /> },
  { page: Page.Ranking, icon: <ChartBarIcon /> },
  { page: Page.Media, icon: <PhotoIcon /> },
  { page: Page.Calendar, icon: <CalendarIcon /> },
  { page: Page.Club, icon: <BuildingLibraryIcon /> },
  { page: Page.Panini, icon: <TicketIcon /> },
  { page: Page.Penalty, icon: <BoltIcon /> },
  { page: Page.Settings, icon: <SparklesIcon /> }, // ✅ Lien vers la page Paramètres
];

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage }) => {
  const [currentDate, setCurrentDate] = useState('');
  const [upcomingEvents, setUpcomingEvents] = useState<typeof mockCalendarEvents>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, logout } = useAuth();
  const isAdmin = user?.role === Role.Admin;

  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const formattedDate = new Intl.DateTimeFormat('fr-FR', options).format(date);
    setCurrentDate(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = mockCalendarEvents
      .filter(event => event.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    setUpcomingEvents(upcoming);
  }, []);

  const visibleLinks = baseNavLinks.filter(link => {
    if (!isAdmin && (link.page === Page.Panini || link.page === Page.Settings)) return false;
    return true;
  });

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
            {visibleLinks.map(link => (
              <button
                key={link.page}
                onClick={() => setActivePage(link.page)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePage === link.page
                    ? 'bg-rose-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
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

            <button onClick={logout} className="bg-gray-700 hover:bg-red-600 text-white p-2 rounded-md">
              <LogoutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Marquee événements */}
      {upcomingEvents.length > 0 && (
        <div className="fixed top-20 left-0 right-0 w-full overflow-hidden whitespace-nowrap bg-gray-800">
          <div className="animate-marquee inline-block">
            {[...upcomingEvents, ...upcomingEvents].map((event, index) => (
              <span key={`${event.id}-${index}`} className="mx-8 inline-flex items-center text-gray-300">
                <EventIcon type={event.type} />
                <span>
                  {event.type}: {event.title} (
                  {event.date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
