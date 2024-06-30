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
  const [searchMaterialConcentration, setSearchMaterialConcentration] = useState([]);

  const handleSearch = useCallback((searchTerm) => {
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

      if (lowerTerm.length >= 3) {
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

    // Remove duplicates
    const uniqueResults = Array.from(new Set(results.map(JSON.stringify))).map(JSON.parse);
    // Obtain the highest concentration
    const highestFactor = uniqueResults
      .filter(result => result.type === 'material') // Filter only materials
      .reduce((max, item) => item.factor > max ? item.factor : max, -Infinity);
    setSearchMaterialConcentration(highestFactor)

    console.log('Results', uniqueResults);
    setSearchResults(uniqueResults);
    highlightSearchResults(uniqueResults, highestFactor);
    return uniqueResults;
  }, [universeData, planetData, materials]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    clearHighlights();
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchResults,
        searchMaterial,
        searchMaterialConcentration,
        handleSearch,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};