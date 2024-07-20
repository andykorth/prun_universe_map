import React, { createContext, useState, useContext } from 'react';

const CogcOverlayContext = createContext();

export const CogcOverlayProvider = ({ children }) => {
  const [overlayProgram, setOverlayProgram] = useState(null);

  return (
    <CogcOverlayContext.Provider value={{ overlayProgram, setOverlayProgram }}>
      {children}
    </CogcOverlayContext.Provider>
  );
};

export const useCogcOverlay = () => useContext(CogcOverlayContext);