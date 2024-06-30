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
  const maxLength = 100;
  sanitized = sanitized.slice(0, maxLength);

  return sanitized;
};

export const SearchProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState([]);
  const { universeData, planetData } = useContext(GraphContext);

  const handleSearch = useCallback((searchTerm) => {
    const sanitizedSearchTerm = sanitizeInput(searchTerm);
    const results = [];
    const terms = sanitizedSearchTerm.split(/\s+/)
        .filter(term => term.length >= 3); // Only keep terms with 3 or more characters

    terms.forEach(term => {
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
          if (planet.PlanetName.toLowerCase().includes(term.toLowerCase()) ||
              planet.PlanetNaturalId.toLowerCase().includes(term.toLowerCase())) {
            results.push({ type: 'planet', id: planet.PlanetNaturalId, systemId: systemId });
          }
        });
      });
    });

    console.log('Results', results)
    setSearchResults(results);
    highlightSearchResults(results);
    return results;
  }, [universeData, planetData]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    clearHighlights();
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchResults,
        handleSearch,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};