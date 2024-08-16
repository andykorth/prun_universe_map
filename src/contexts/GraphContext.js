import React, { createContext, useState, useEffect, useCallback } from 'react';
import { findShortestPath as findShortestPathUtil, highlightPath} from '../utils/graphUtils';

export const GraphContext = createContext();

export const GraphProvider = ({ children }) => {
  const [graph, setGraph] = useState({ nodes: {}, edges: [] });
  const [materials, setMaterials] = useState({});
  const [selectedSystems, setSelectedSystems] = useState([]);
  const [planetData, setPlanetData] = useState({});
  const [universeData, setUniverseData] = useState({});

  useEffect(() => {
    console.log('Fetching graph data');
    fetch('graph_data.json')
      .then(response => response.json())
      .then(data => {
        setGraph(data);
      })
      .catch(error => {
        console.error('Error fetching graph data:', error);
      });

    fetch('material_data.json')
      .then(response => response.json())
      .then(data => {
        setMaterials(data);
      })
      .catch(error => {
        console.error('Error fetching material data:', error);
      });

    fetch('prun_universe_data.json')
      .then(response => response.json())
      .then(data => {
        // Group planets by SystemId
        const groupedUniverseData = data.reduce((acc, system) => {
          if (!acc[system.SystemId]) {
            acc[system.SystemId] = [];
          }
          acc[system.SystemId].push(system);
          return acc;
        }, {});
        setUniverseData(groupedUniverseData);
      })
      .catch(error => {
        console.error('Error fetching universe data:', error);
      });

    // Fetch planet data
    fetch('planet_data.json')
      .then(response => response.json())
      .then(data => {
        // Group planets by SystemId
        const groupedPlanetData = data.reduce((acc, planet) => {
          if (!acc[planet.SystemId]) {
            acc[planet.SystemId] = [];
          }
          acc[planet.SystemId].push(planet);
          return acc;
        }, {});
        setPlanetData(groupedPlanetData);
      })
      .catch(error => {
        console.error('Error fetching planet data:', error);
      });
  }, []);

  const findShortestPath = useCallback((system1, system2) => {
    findShortestPathUtil(graph, system1, system2, highlightPath);
  }, [graph]);


  return (
    <GraphContext.Provider
      value={{
        graph,
        setGraph,
        materials,
        setMaterials,
        selectedSystems,
        setSelectedSystems,
        findShortestPath,
        planetData,
        universeData
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};