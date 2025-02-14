import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';

// Create the context
export const DataPointContext = createContext();

export const DataPointProvider = ({ children }) => {
  // State for system meteorite density data
  const [meteorDensityData, setMeteorDensityData] = useState({});
  const [systemNames, setSystemNames] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Visibility toggle for the overlay
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  // Scale setting (absolute vs relative)
  const [useRelativeScale, setUseRelativeScale] = useState(false);

  // Fetch system stars data
  useEffect(() => {
    const fetchMeteorData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/systemstars.json');
        if (!response.ok) {
          throw new Error('Failed to fetch system stars data');
        }
        const data = await response.json();

        // Transform data into maps for density and system names
        const densityMap = {};
        const systemNameMap = {};
        data.forEach(system => {
          densityMap[system.SystemId] = system.MeteoroidDensity;
          systemNameMap[system.SystemId] = system.Name;
        });

        setMeteorDensityData(densityMap);
        setSystemNames(systemNameMap);
        setError(null);
      } catch (err) {
        console.error('Error fetching meteor density data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeteorData();
  }, []);

  // Get meteorite density for a specific system
  const getSystemMeteorDensity = useCallback((systemId) => {
    return meteorDensityData[systemId] || 0;
  }, [meteorDensityData]);

  // Toggle overlay visibility
  const toggleOverlayVisibility = useCallback(() => {
    setIsOverlayVisible(prev => !prev);
  }, []);

  // Toggle scale type
  const toggleScaleType = useCallback(() => {
    setUseRelativeScale(prev => !prev);
  }, []);

  // Get maximum density value for relative scaling
  const maxDensity = useMemo(() => {
    return Math.max(0, ...Object.values(meteorDensityData));
  }, [meteorDensityData]);

  // Calculate normalized density based on scale type
  const getNormalizedDensity = useCallback((density) => {
    if (!useRelativeScale) return density;
    return maxDensity === 0 ? 0 : density / maxDensity;
  }, [useRelativeScale, maxDensity]);

  const contextValue = {
    meteorDensityData,
    systemNames,
    isOverlayVisible,
    useRelativeScale,
    isLoading,
    error,
    getSystemMeteorDensity,
    toggleOverlayVisibility,
    toggleScaleType,
    getNormalizedDensity,
    maxDensity
  };

  return (
<DataPointContext.Provider value={contextValue}>
{children}
</DataPointContext.Provider>
);
};

// Custom hook for using the data point context
export const useDataPoints = () => {
const context = useContext(DataPointContext);
if (!context) {
throw new Error('useDataPoints must be used within a DataPointProvider');
}
return context;
};