import React from 'react';
import { useSite } from '../hooks/useSite';

interface LogoProps {
  className?: string;
  alt?: string;
}

// 🔹 Composant Logo : gère le fallback automatique si l’image échoue à se charger
const Logo: React.FC<LogoProps> = ({ className, alt = 'Logo du FC LIDO' }) => {
  const { logoUrl, setLogoUrl } = useSite();

  const handleError = () => {
    console.warn('⚠️ Erreur de chargement du logo. Utilisation du logo par défaut.');
    setLogoUrl('https://lh3.googleusercontent.com/d/1ywPPqbphpaFkBXvrB66kTXBk0sxp8pK7');
  };

  return (
    <img
      src={logoUrl}
      alt={alt}
      className={className ?? 'w-12 h-12 object-contain rounded-lg'}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default Logo;
