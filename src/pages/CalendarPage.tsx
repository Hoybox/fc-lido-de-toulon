import React, { useState } from 'react';
import { mockCalendarEvents } from '../data/mockData';
import { CalendarEvent, EventType, Role } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, ShareIcon } from '../components/icons/Icons.tsx';
import { useAuth } from '../hooks/useAuth';

const EventModal: React.FC<{ event?: CalendarEvent | null; date?: Date, onSave: (event: CalendarEvent) => void; onClose: () => void; }> = ({ event, date, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<CalendarEvent>>(event || { date: date || new Date(), type: EventType.Match });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'date') {
            setFormData(prev => ({...prev, date: new Date(value)}));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as CalendarEvent);
    };

    return (
        <div className="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full border border-rose-500" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">{event ? 'Modifier' : 'Ajouter'} un Événement</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="title" placeholder="Titre de l'événement" value={formData.title || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded" required />
                    <input type="date" name="date" value={formData.date?.toISOString().split('T')[0] || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded" required />
                    <select name="type" value={formData.type || EventType.Match} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded">
                        {Object.values(EventType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                     <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">Annuler</button>
                        <button type="submit" className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700">Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const CalendarPage: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>(mockCalendarEvents);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const { user } = useAuth();
    const isAdmin = user?.role === Role.Admin;

    const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const dates = [];
    let day = new Date(startDate);
    while (day <= endDate) {
        dates.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }
    
    const getEventColor = (type: EventType): string => {
        switch (type) {
            case EventType.Match: return 'border-sky-400 bg-sky-400/10 hover:bg-sky-400/20';
            case EventType.Training: return 'border-green-400 bg-green-400/10 hover:bg-green-400/20';
            case EventType.Tournament: return 'border-orange-400 bg-orange-400/10 hover:bg-orange-400/20';
            case EventType.Break: return 'border-red-400 bg-red-400/10 hover:bg-red-400/20';
            case EventType.Extra: return 'border-pink-400 bg-pink-400/10 hover:bg-pink-400/20';
            default: return 'border-gray-400 bg-gray-400/10 hover:bg-gray-400/20';
        }
    };
    
    const changeMonth = (offset: number) => {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const handleSaveEvent = (event: CalendarEvent) => {
        if (event.id) {
            setEvents(prev => prev.map(e => e.id === event.id ? event : e));
        } else {
            setEvents(prev => [...prev, { ...event, id: Date.now() }]);
        }
        setIsModalOpen(false);
        setSelectedEvent(null);
    };

    const handleDeleteEvent = (id: number) => {
        if(window.confirm("Supprimer cet événement ?")) {
            setEvents(prev => prev.filter(e => e.id !== id));
        }
    };

    const handleShareEvent = async (event: CalendarEvent) => {
        const eventDate = event.date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const shareData = {
            title: `Invitation: ${event.title}`,
            text: `📢 INVITATION FC LIDO 📢\n\nÉvénement: ${event.type} - ${event.title}\nDate: ${eventDate}\n\nSoyez présents !`,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            alert(`La fonction de partage n'est pas supportée sur votre navigateur. Vous pouvez copier ce texte :\n\n${shareData.text}`);
        }
    };

    return (
        <div className="container mx-auto px-4 pb-20">
            {isModalOpen && <EventModal event={selectedEvent} onSave={handleSaveEvent} onClose={() => { setIsModalOpen(false); setSelectedEvent(null); }} />}
             <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700">&lt;</button>
                    <h2 className="text-3xl font-bold text-[#fd6c9e] w-64 text-center">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700">&gt;</button>
                </div>
                {isAdmin && (
                    <button onClick={() => setIsModalOpen(true)} className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 flex items-center gap-2 transition-transform transform hover:scale-105">
                        <PlusIcon />
                        <span>Ajouter Événement</span>
                    </button>
                )}
            </div>

            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
                <div className="grid grid-cols-7 gap-px text-center font-semibold text-gray-300 mb-2">
                    {daysOfWeek.map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 grid-rows-5 gap-px">
                    {dates.map((date, index) => {
                        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                        const eventsOnDay = events.filter(e => e.date.toDateString() === date.toDateString());
                        return (
                            <div key={index} className={`relative min-h-[120px] p-2 bg-gray-800 transition-colors ${isCurrentMonth ? 'hover:bg-gray-700/50' : 'bg-gray-900/50 text-gray-500'}`}>
                                <span className="font-bold">{date.getDate()}</span>
                                <div className="mt-1 space-y-1 overflow-y-auto max-h-24 text-xs">
                                    {eventsOnDay.map(event => (
                                        <div key={event.id} className={`group p-1 rounded text-left border-l-4 transition-colors relative ${getEventColor(event.type)}`}>
                                            <p className="font-semibold text-white truncate">{event.title}</p>
                                            <div className="absolute top-0 right-0 flex items-center bg-gray-900/60 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                                <button onClick={() => handleShareEvent(event)} className="p-1 text-gray-300 hover:text-green-400" title="Partager l'invitation">
                                                    <ShareIcon className="h-4 w-4"/>
                                                </button>
                                                {isAdmin && (
                                                    <>
                                                        <button onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }} className="p-1 text-gray-300 hover:text-blue-400" title="Modifier">
                                                            <PencilIcon />
                                                        </button>
                                                        <button onClick={() => handleDeleteEvent(event.id)} className="p-1 text-gray-300 hover:text-red-400" title="Supprimer">
                                                            <TrashIcon />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;