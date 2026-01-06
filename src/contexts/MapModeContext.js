import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { GraphContext } from './GraphContext';
import { calculate3DDistance, findClosestSystems, findBestMidpoints } from '../utils/distanceUtils';

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
  const { universeData } = useContext(GraphContext); // Access Universe Data
  
  const [activeMode, setActiveMode] = useState(MAP_MODES.STANDARD);
  
  // Existing Gateways (from JSON)
  const [existingGateways, setExistingGateways] = useState([]);

  // Gateway Planning State
  const [gatewayData, setGatewayData] = useState({
    originA: null, // Holds the full System Object, not just ID
    originB: null,
    strategy: GATEWAY_STRATEGIES.SINGLE,
    plannedGateways: [] // Array of { id, source, target, distance }
  });

  // Calculated Results State
  const [candidateList, setCandidateList] = useState([]);

  // 1. Fetch Existing Gateways on Mount
  useEffect(() => {
    fetch('gateways.json')
      .then(response => response.json())
      .then(data => {
        setExistingGateways(data);
      })
      .catch(err => {
        console.error("Failed to load existing gateways:", err);
      });
  }, []);

  // 2. Calculation Effect: Runs when Origins or Strategy change
  useEffect(() => {
    if (activeMode !== MAP_MODES.GATEWAY || !universeData) return;

    // Clear candidates if no origin selected
    if (!gatewayData.originA) {
      setCandidateList([]);
      return;
    }

    if (gatewayData.strategy === GATEWAY_STRATEGIES.SINGLE) {
      // Find systems within range of Origin A
      const results = findClosestSystems(gatewayData.originA, universeData);
      setCandidateList(results);
    } 
    else if (gatewayData.strategy === GATEWAY_STRATEGIES.DUAL && gatewayData.originB) {
      // Find midpoints between A and B
      const results = findBestMidpoints(gatewayData.originA, gatewayData.originB, universeData);
      setCandidateList(results);
    }
  }, [gatewayData.originA, gatewayData.originB, gatewayData.strategy, activeMode, universeData]);


  // Actions
  const toggleMode = useCallback(() => {
    setActiveMode(prev => prev === MAP_MODES.STANDARD ? MAP_MODES.GATEWAY : MAP_MODES.STANDARD);
  }, []);

  const setGatewayStrategy = useCallback((strategy) => {
    setGatewayData(prev => ({ 
      ...prev, 
      strategy,
      // Reset Origin B if switching to Single, keep A
      originB: strategy === GATEWAY_STRATEGIES.SINGLE ? null : prev.originB 
    }));
  }, []);

  // Helper to set origins by System ID (useful for map clicks)
  const setOriginById = useCallback((systemId, slot = 'A') => {
    if (!universeData || !universeData[systemId]) return;
    const systemObj = universeData[systemId][0]; // universeData is grouped
    
    setGatewayData(prev => ({
      ...prev,
      [slot === 'A' ? 'originA' : 'originB']: systemObj
    }));
  }, [universeData]);

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
      existingGateways,
      gatewayData,
      candidateList, // Expose calculation results to Sidebar
      setGatewayData,
      setGatewayStrategy,
      setOriginById,
      addPlannedGateway,
      removePlannedGateway,
      clearGatewaySelections,
      calculate3DDistance // Expose util for map hover effects
    }}>
      {children}
    </MapModeContext.Provider>
  );
};

export const useMapMode = () => useContext(MapModeContext);