import React, { useState, useRef } from 'react';
import { mockClubInfo } from '../data/mockData';
import { ClubInfo, Role } from '../types';
import { PencilIcon, TrashIcon } from '../components/icons/Icons.tsx';
import Logo from '../components/Logo';
import { useSite } from '../hooks/useSite';
import { useAuth } from '../hooks/useAuth';


const EditableField: React.FC<{ label: string, value: string, onSave: (newValue: string) => void, isAdmin: boolean }> = ({ label, value, onSave, isAdmin }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(value);

    const handleSave = () => {
        onSave(text);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex justify-between items-center">
                <span>{label}:</span>
                <div className="flex gap-2">
                    <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="bg-gray-700 text-white p-1 rounded-md text-right w-32" />
                    <button onClick={handleSave} className="text-green-400">Ok</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-between group">
            <span>{label}:</span>
            <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{value}</span>
                {isAdmin && <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100"><PencilIcon /></button>}
            </div>
        </div>
    );
};

const ClubPage: React.FC = () => {
    const [clubInfo, setClubInfo] = useState<ClubInfo>(mockClubInfo);
    const { setLogoUrl } = useSite();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoUpdateMsg, setLogoUpdateMsg] = useState('');
    const { user } = useAuth();
    const isAdmin = user?.role === Role.Admin;

    const handleStaffSave = (role: keyof ClubInfo, name: string) => {
        setClubInfo(prev => ({...prev, [role]: name}));
    };
    
    const handleNewsEdit = (id: number, content: string) => {
        // In a real app, this would open a modal to edit title, content, date etc.
        const newTitle = prompt("Nouveau titre:", content);
        if (newTitle) {
            setClubInfo(prev => ({
                ...prev,
                news: prev.news.map(n => n.id === id ? {...n, title: newTitle} : n)
            }));
        }
    };

    const handleNewsDelete = (id: number) => {
        if(window.confirm("Supprimer cette actualité ?")) {
            setClubInfo(prev => ({ ...prev, news: prev.news.filter(n => n.id !== id) }));
        }
    };

    const handleLogoUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setLogoUrl(e.target.result as string);
                    setLogoUpdateMsg('Logo mis à jour et sauvegardé !');
                    setTimeout(() => setLogoUpdateMsg(''), 3000);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    

    return (
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
            {/* Left Column - Staff & Awards */}
            <div className="md:col-span-1 space-y-8">
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-[#fd6c9e] mb-4">LE STAFF</h3>
                    <div className="space-y-3 text-gray-300">
                        <EditableField label="Président" value={clubInfo.president} isAdmin={isAdmin} onSave={(val) => handleStaffSave('president', val)} />
                        <EditableField label="Trésorier" value={clubInfo.treasurer} isAdmin={isAdmin} onSave={(val) => handleStaffSave('treasurer', val)} />
                        <EditableField label="Entraîneur" value={clubInfo.coach} isAdmin={isAdmin} onSave={(val) => handleStaffSave('coach', val)} />
                        <EditableField label="Intendant" value={clubInfo.steward} isAdmin={isAdmin} onSave={(val) => handleStaffSave('steward', val)} />
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-[#fd6c9e] mb-4">PALMARÈS</h3>
                    <ul className="space-y-2 list-inside list-disc text-gray-300">
                        {clubInfo.awards.map((award, i) => <li key={i}><span className="font-semibold text-white">{award}</span></li>)}
                    </ul>
                </div>
            </div>

            {/* Right Column - Presentation & News */}
            <div className="md:col-span-2 space-y-8">
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group shrink-0">
                        <Logo className="w-32 h-32 rounded-2xl" />
                        {isAdmin && (
                            <>
                                <button 
                                    onClick={handleLogoUploadClick}
                                    className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer"
                                    aria-label="Changer le logo"
                                >
                                    <PencilIcon />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleLogoFileChange}
                                    className="hidden" 
                                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                                />
                            </>
                        )}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-[#fd6c9e]">Football Club Le Lido</h2>
                        <p className="text-lg text-[#fd6c9e]/80">Fondé en 2002 à Toulon</p>
                        <p className="mt-2 text-gray-300">
                           Un club familial avec une ambition sportive, portant fièrement les couleurs rose et noir. Notre histoire est celle de la passion, de l'engagement et de l'amour du football.
                        </p>
                        {logoUpdateMsg && <p className="text-green-400 mt-2 animate-fade-in font-semibold">{logoUpdateMsg}</p>}
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-[#fd6c9e] mb-4">ACTUALITÉS</h3>
                    <div className="space-y-6">
                        {clubInfo.news.map(item => (
                            <div key={item.id} className="border-l-4 border-rose-500 pl-4 relative group">
                                <p className="text-xs text-gray-400">{item.date}</p>
                                <h4 className="font-bold text-lg text-white">{item.title}</h4>
                                <p className="text-gray-300">{item.content}</p>
                                {isAdmin && (
                                    <div className="absolute top-0 right-0 flex opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleNewsEdit(item.id, item.title)} className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors">
                                            <PencilIcon />
                                        </button>
                                        <button onClick={() => handleNewsDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClubPage;