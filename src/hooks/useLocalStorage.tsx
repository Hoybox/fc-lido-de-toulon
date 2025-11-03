// src/hooks/useLocalStorage.tsx
import React, { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour stocker et récupérer une valeur depuis le localStorage.
 * - Compatible SSR (vérifie la présence de window)
 * - Typé génériquement pour TypeScript
 * - Protégé contre les erreurs JSON
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const isBrowser = typeof window !== 'undefined';

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isBrowser) return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`[useLocalStorage] Erreur lecture clé "${key}" :`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (!isBrowser) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`[useLocalStorage] Erreur écriture clé "${key}" :`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
