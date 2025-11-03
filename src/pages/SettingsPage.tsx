import React, { useRef } from 'react';
import { useSite } from '../hooks/useSite';
import { Role } from '../types';
import { useAuth } from '../hooks/useAuth';
import { ArrowUpTrayIcon, TrashIcon } from '../components/icons/Icons.tsx';

const DEFAULT_LOGO = 'https://lh3.googleusercontent.com/d/1ywPPqbphpaFkBXvrB66kTXBk0sxp8pK7';

const SettingsPage: React.FC = () => {
  const { logoUrl, setLogoUrl } = useSite();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user || user.role !== Role.Admin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p className="text-lg font-semibold">Accès refusé ⚠️</p>
        <p className="text-sm">Cette section est réservée aux administrateurs.</p>
      </div>
    );
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setLogoUrl(e.target.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleResetLogo = () => {
    if (window.confirm('Voulez-vous réinitialiser le logo par défaut ?')) {
      setLogoUrl(DEFAULT_LOGO);
    }
  };

  return (
    <div className="max-w-xl mx-auto text-center mt-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-rose-500">Paramètres du Club</h2>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Logo actuel</h3>

        <div className="flex flex-col items-center space-y-4">
          <img
            src={logoUrl}
            alt="Logo du club"
            className="w-40 h-40 rounded-lg border border-gray-600 shadow-md object-contain bg-gray-900"
          />

          <div className="flex gap-4 mt-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={handleUploadClick}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition"
            >
              <ArrowUpTrayIcon className="h-5 w-5" />
              Changer le logo
            </button>

            <button
              onClick={handleResetLogo}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition"
            >
              <TrashIcon className="h-5 w-5" />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
