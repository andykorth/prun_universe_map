import React, { createContext, useState, useCallback, useContext } from 'react';
import { highlightSelectedSystem as highlightSelectedSystemUtil } from '../utils/graphUtils';
import { GraphContext } from '../contexts/GraphContext';

export const SelectionContext = createContext();

export const SelectionProvider = ({ children }) => {
  const [isPathfindingEnabled, setIsPathfindingEnabled] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [pathfindingSelection, setPathfindingSelection] = useState([]);

  const { findShortestPath } = useContext(GraphContext);

  const togglePathfinding = useCallback(() => {
  setIsPathfindingEnabled(prev => {
    if (prev) {
      // If turning off pathfinding, reset the graph state
      highlightSelectedSystemUtil(null, null, [], prev);
    }
    return !prev;
  });
  setPathfindingSelection([]); // Reset selection when toggling
}, []);

const highlightSelectedSystem = useCallback((nextSelectedSystem) => {
  if (isPathfindingEnabled) {
    setPathfindingSelection(prev => {
      let newSelection;
      if (prev.length === 2) {
        // Reset selection if it already has two entries
        newSelection = [nextSelectedSystem];
      } else {
        // Add new selection, keeping at most 2 entries
        newSelection = [...prev, nextSelectedSystem].slice(-2);
      }

      // Always update selectedSystem
      setSelectedSystem(prevSelectedSystem => {
        if (newSelection.length === 1) {
          highlightSelectedSystemUtil(prevSelectedSystem, nextSelectedSystem, newSelection, isPathfindingEnabled);
        }
        return nextSelectedSystem;
      });
      // If we now have 2 systems selected, find the shortest path
        if (newSelection.length === 2) {
          findShortestPath(newSelection[0], newSelection[1]);
        }
      return newSelection;
    });
  } else {
    // Behavior when pathfinding is disabled
    setSelectedSystem(prevSelectedSystem => {
      highlightSelectedSystemUtil(prevSelectedSystem, nextSelectedSystem, [], isPathfindingEnabled);
      return nextSelectedSystem;
    });
  }
}, [isPathfindingEnabled, findShortestPath]);

  return (
    <SelectionContext.Provider
      value={{
        isPathfindingEnabled,
        togglePathfinding,
        selectedSystem,
        pathfindingSelection,
        highlightSelectedSystem
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};