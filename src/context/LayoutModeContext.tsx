import React, { createContext, useContext, useState, useEffect } from 'react';

type LayoutMode = 'auto' | 'desktop' | 'mobile';

interface LayoutModeContextProps {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
}

const LayoutModeContext = createContext<LayoutModeContextProps | undefined>(undefined);

export const LayoutModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_layout_mode');
      return (saved as LayoutMode) || 'auto';
    } catch {
      return 'auto';
    }
  });

  useEffect(() => {
    localStorage.setItem('thanaweya_layout_mode', layoutMode);
    
    // Manage class on body/html or a wrapper class based on mode
    const root = document.documentElement;
    root.classList.remove('layout-auto', 'layout-desktop', 'layout-mobile');
    root.classList.add(`layout-${layoutMode}`);
    
    // Force body background to dark/grey when in mobile preview mode on desktop
    if (layoutMode === 'mobile') {
      document.body.style.setProperty('background-color', '#F1F5F9', 'important');
    } else {
      document.body.style.setProperty('background-color', '#FFFFFF', 'important');
    }
  }, [layoutMode]);

  return (
    <LayoutModeContext.Provider value={{ layoutMode, setLayoutMode }}>
      {children}
    </LayoutModeContext.Provider>
  );
};

export const useLayoutMode = () => {
  const context = useContext(LayoutModeContext);
  if (!context) {
    throw new Error('useLayoutMode must be used within a LayoutModeProvider');
  }
  return context;
};
