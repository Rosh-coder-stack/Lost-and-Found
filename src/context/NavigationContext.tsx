import React, { createContext, useContext, useState, useEffect } from 'react';
import { RoutePage } from '../types';

interface NavigationContextType {
  activeRoute: RoutePage;
  selectedItemId: string | null;
  navigateTo: (route: RoutePage, itemId?: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRoute, setActiveRoute] = useState<RoutePage>('home');
  const [selectedItemId, setSelectedItemId] = useState<string | null>('itm_001');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('item/')) {
        const id = hash.replace('item/', '');
        setSelectedItemId(id);
        setActiveRoute('item-details');
      } else if (hash) {
        setActiveRoute(hash as RoutePage);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: RoutePage, itemId?: string) => {
    if (route === 'item-details' && itemId) {
      setSelectedItemId(itemId);
      window.location.hash = `item/${itemId}`;
    } else {
      setActiveRoute(route);
      window.location.hash = route;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider
      value={{
        activeRoute,
        selectedItemId,
        navigateTo,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
