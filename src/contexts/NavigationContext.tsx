import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
  initialTab?: string;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ 
  children, 
  initialTab = 'home' 
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </NavigationContext.Provider>
  );
};
