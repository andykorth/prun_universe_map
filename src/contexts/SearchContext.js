import React, { createContext, useState, useCallback, useContext } from 'react';
import { GraphContext } from './GraphContext';
import { highlightSearchResults, clearHighlights } from '../utils/searchUtils';

export const SearchContext = createContext();

const sanitizeInput = (input) => {
  // Remove any HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  // Remove special characters except spaces, hyphens, and parentheses
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-()]/g, '');
  // Trim whitespace from the beginning and end
  sanitized = sanitized.trim();
  // Limit the length of the input
  const maxLength = 200;
  sanitized = sanitized.slice(0, maxLength);

  return sanitized;
};

// Helper function to split camelCase into separate words
const splitCamelCase = (str) => {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
};

export const SearchProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState([]);
  const { universeData, planetData, materials } = useContext(GraphContext);
  const [searchMaterial, setSearchMaterial] = useState([]);
  const [searchMaterialConcentrationLiquid, setSearchMaterialConcentrationLiquid] = useState([]);
  const [searchMaterialConcentrationGaseous, setSearchMaterialConcentrationGaseous] = useState([]);
  const [searchMaterialConcentrationMineral, setSearchMaterialConcentrationMineral] = useState([]);
  const [filters, setFilters] = useState({
    planetType: ['Rocky', 'Gaseous'],
    gravity: ['Low', 'High'],
    temperature: ['Low', 'High'],
    pressure: ['Low', 'High']
  });
  const [systemSearchTerm, setSystemSearchTerm] = useState('');
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');


  const handleSystemSearch = useCallback((searchTerm) => {
    const sanitizedSearchTerm = sanitizeInput(searchTerm);
    const results = [];
    const terms = sanitizedSearchTerm.split(/\s+/)
        .filter(term => term.length >= 2); // Only keep terms with 1 or more characters

    terms.forEach(term => {
      const lowerTerm = term.toLowerCase();

      // Search in systems
      Object.entries(universeData).forEach(([systemId, systemArray]) => {
      let system = systemArray[0]
        if (system.Name.toLowerCase().includes(term.toLowerCase()) ||
            system.NaturalId.toLowerCase().includes(term.toLowerCase())) {
          results.push({ type: 'system', id: systemId });
        }
      });

      // Search in planets
      Object.entries(planetData).forEach(([systemId, planets]) => {
        planets.forEach(planet => {
          if (planet.PlanetName.toLowerCase().includes(lowerTerm) ||
              planet.PlanetNaturalId.toLowerCase().includes(lowerTerm)) {
            results.push({ type: 'planet', id: planet.PlanetNaturalId, systemId: systemId });
          }
        });
      });
    });

    console.log('Results', results);
    setSearchResults(results);
    highlightSearchResults(results);
    return results;
  }, [universeData, planetData]);


  const handleMaterialSearch = useCallback((searchTerm) => {
    const sanitizedSearchTerm = sanitizeInput(searchTerm);
    const results = [];
    const terms = sanitizedSearchTerm.split(/\s+/)
        .filter(term => term.length >= 1); // Only keep terms with 1 or more characters

    terms.forEach(term => {
      const lowerTerm = term.toLowerCase();
      const regex = new RegExp(`\\b${lowerTerm}\\b`, 'i'); // Word boundary and case insensitive

      if (lowerTerm === 'ore') {
        return
      }

      // Search in materials
      materials.forEach(material => {
        const splitName = splitCamelCase(material.Name);
        if ((regex.test(splitName) || regex.test(material.Ticker.toLowerCase())) && ['ores', 'gases', 'liquids', 'minerals'].includes(material.CategoryName)) {
          setSearchMaterial(material.MaterialId)
          // Find systems and planets that have this material
          Object.entries(planetData).forEach(([systemId, planets]) => {
            planets.forEach(planet => {
              const resource = planet.Resources.find(resource => resource.MaterialId === material.MaterialId);
              if (resource) {
                results.push({
                  type: 'material',
                  id: material.MaterialId,
                  name: material.Name,
                  ticker: material.Ticker,
                  planetId: planet.PlanetNaturalId,
                  systemId: systemId,
                  factor: resource.Factor,
                  resourceType: resource.ResourceType
                });
              }
            });
          });
        }
      });
    });

    const filteredResults = results.filter(result => {
      const planet = planetData[result.systemId].find(p => p.PlanetNaturalId === result.planetId);

      if (!planet) {
        console.warn(`Planet not found for result:`, result);
        return false;
      }

      const planetTypeCondition =
        (filters.planetType.includes('Rocky') && planet.Surface) ||
        (filters.planetType.includes('Gaseous') && !planet.Surface);

      const gravityCondition =
        (filters.gravity.includes('Low') && (planet.Gravity < 0.25)) ||
        (filters.gravity.includes('High') && (planet.Gravity >= 2.5)) ||
        ((0.25 <= planet.Gravity) && (planet.Gravity <= 2.5));

      const temperatureCondition =
        (filters.temperature.includes('Low') && (planet.Temperature < -25.0)) ||
        (filters.temperature.includes('High') && (planet.Temperature >= 75.0)) ||
        ((-25.0 <= planet.Temperature) && (planet.Temperature <= 75.0));

      const pressureCondition =
        (filters.pressure.includes('Low') && (planet.Pressure < 0.25)) ||
        (filters.pressure.includes('High') && (planet.Pressure >= 2.0)) ||
        ((0.25 <= planet.Pressure) && (planet.Pressure <= 2.0));

      return planetTypeCondition && gravityCondition && temperatureCondition && pressureCondition;
    });

    // Remove duplicates
    const uniqueResults = Array.from(new Set(filteredResults.map(JSON.stringify))).map(JSON.parse);
    // Obtain the highest concentration
    const highestFactorLiquid = uniqueResults
      .filter(result => result.resourceType === 'LIQUID')
      .reduce((max, item) => item.factor > max ? item.factor : max, -Infinity);
    setSearchMaterialConcentrationLiquid(highestFactorLiquid)
    const highestFactorGaseous = uniqueResults
      .filter(result => result.resourceType === 'GASEOUS')
      .reduce((max, item) => item.factor > max ? item.factor : max, -Infinity);
    setSearchMaterialConcentrationGaseous(highestFactorGaseous)
    const highestFactorMineral = uniqueResults
      .filter(result => result.resourceType === 'MINERAL')
      .reduce((max, item) => item.factor > max ? item.factor : max, -Infinity);
    setSearchMaterialConcentrationMineral(highestFactorMineral)

    console.log('Results', uniqueResults);
    setSearchResults(uniqueResults);
    highlightSearchResults(uniqueResults, highestFactorLiquid, highestFactorGaseous, highestFactorMineral);
    return uniqueResults;
  }, [planetData, materials, filters]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSystemSearchTerm('');
    setMaterialSearchTerm('');
    setSearchMaterial([]);
    setSearchMaterialConcentrationLiquid([]);
    setSearchMaterialConcentrationGaseous([]);
    setSearchMaterialConcentrationMineral([]);
    clearHighlights();
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const updateSystemSearchTerm = useCallback((term) => {
    setSystemSearchTerm(term);
  }, []);

  const updateMaterialSearchTerm = useCallback((term) => {
    setMaterialSearchTerm(term);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchResults,
        searchMaterial,
        searchMaterialConcentrationLiquid,
        searchMaterialConcentrationMineral,
        searchMaterialConcentrationGaseous,
        handleSystemSearch,
        handleMaterialSearch,
        clearSearch,
        filters,
        updateFilters,
        systemSearchTerm,
        materialSearchTerm,
        updateSystemSearchTerm,
        updateMaterialSearchTerm,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};