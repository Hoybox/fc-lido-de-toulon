// src/hooks/useSite.ts
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// 🔹 Logo par défaut (hébergé publiquement sur Google Drive ou /public)
const DEFAULT_LOGO_URL = 'https://lh3.googleusercontent.com/d/1ywPPqbphpaFkBXvrB66kTXBk0sxp8pK7';

interface SiteContextType {
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  backendError: boolean;
  setBackendError: (hasError: boolean) => void;
}

// 🔹 Création du contexte global
const SiteContext = createContext<SiteContextType | undefined>(undefined);

// 🔹 Provider global (à placer dans App.tsx autour de toute l’app)
export const SiteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logoUrl, setLogoUrl] = useLocalStorage<string>('fclido_logo_url', DEFAULT_LOGO_URL);
  const [backendError, setBackendError] = useState(false);

  // 🛡️ Vérifie que l’URL du logo est valide
  useEffect(() => {
    if (!logoUrl || typeof logoUrl !== 'string' || !logoUrl.startsWith('http')) {
      console.warn('⚠️ Logo invalide détecté, réinitialisation au logo par défaut.');
      setLogoUrl(DEFAULT_LOGO_URL);
    }
  }, [logoUrl, setLogoUrl]);

  return (
    <SiteContext.Provider value={{ logoUrl, setLogoUrl, backendError, setBackendError }}>
      {children}
    </SiteContext.Provider>
  );
};

// 🔹 Hook pour consommer le contexte
export const useSite = (): SiteContextType => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within a <SiteProvider>');
  }
  return context;
};
