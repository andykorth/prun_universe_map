import React, { createContext, useState, useContext, useCallback } from 'react';

export const MAP_MODES = {
  STANDARD: 'STANDARD',
  GATEWAY: 'GATEWAY'
};

export const GATEWAY_STRATEGIES = {
  SINGLE: 'SINGLE',
  DUAL: 'DUAL'
};

const MapModeContext = createContext();

export const MapModeProvider = ({ children }) => {
  const [activeMode, setActiveMode] = useState(MAP_MODES.STANDARD);
  
  // Gateway specific state
  const [gatewayData, setGatewayData] = useState({
    originA: null,
    originB: null,
    strategy: GATEWAY_STRATEGIES.SINGLE,
    plannedGateways: [] // Array of { id, source, target, distance }
  });

  const toggleMode = useCallback(() => {
    setActiveMode(prev => prev === MAP_MODES.STANDARD ? MAP_MODES.GATEWAY : MAP_MODES.STANDARD);
  }, []);

  const setGatewayStrategy = useCallback((strategy) => {
    setGatewayData(prev => ({ ...prev, strategy }));
  }, []);

  const addPlannedGateway = useCallback((gateway) => {
    setGatewayData(prev => ({
      ...prev,
      plannedGateways: [...prev.plannedGateways, gateway]
    }));
  }, []);

  const removePlannedGateway = useCallback((gatewayId) => {
    setGatewayData(prev => ({
      ...prev,
      plannedGateways: prev.plannedGateways.filter(g => g.id !== gatewayId)
    }));
  }, []);

  const clearGatewaySelections = useCallback(() => {
    setGatewayData(prev => ({
      ...prev,
      originA: null,
      originB: null
    }));
  }, []);

  return (
    <MapModeContext.Provider value={{
      activeMode,
      toggleMode,
      gatewayData,
      setGatewayData,
      setGatewayStrategy,
      addPlannedGateway,
      removePlannedGateway,
      clearGatewaySelections
    }}>
      {children}
    </MapModeContext.Provider>
  );
};

export const useMapMode = () => useContext(MapModeContext);