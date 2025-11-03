// src/components/TestLogo.tsx
import React, { useState } from 'react';
import { useSite } from '../hooks/useSite';
import Logo from './Logo';

const TestLogo: React.FC = () => {
  const { logoUrl, setLogoUrl } = useSite();
  const [inputValue, setInputValue] = useState(logoUrl);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSave = () => {
    if (inputValue.trim() === '') {
      alert('Veuillez saisir une URL de logo valide.');
      return;
    }
    setLogoUrl(inputValue.trim());
    alert('✅ Nouveau logo enregistré !');
  };

  const handleReset = () => {
    setInputValue(logoUrl);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-lg w-full text-center shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-rose-400">🧪 Test du Logo FC LIDO</h2>

      <div className="flex justify-center mb-4">
        <Logo className="w-24 h-24 rounded-lg shadow-md" alt="Logo du FC LIDO" />
      </div>

      <p className="text-gray-300 text-sm mb-4 break-all">
        <strong>URL actuelle :</strong><br />
        {logoUrl}
      </p>

      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Nouvelle URL d’image (Google Drive, etc.)"
        className="w-full p-2 mb-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-md text-sm"
      />

      <div className="flex justify-center gap-3">
        <button
          onClick={handleSave}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
        >
          Enregistrer
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
};

export default TestLogo;
