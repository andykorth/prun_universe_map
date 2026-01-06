import React, { useEffect, useContext, useRef, useCallback } from 'react';
import DataPointOverlay from './DataPointOverlay';
import GatewayLayer from './GatewayLayer'; // NEW
import * as d3 from 'd3';
import { GraphContext } from '../contexts/GraphContext';
import { SelectionContext } from '../contexts/SelectionContext';
import { useCogcOverlay } from '../contexts/CogcOverlayContext';
import { useMapMode, MAP_MODES, GATEWAY_STRATEGIES } from '../contexts/MapModeContext'; // NEW
import { addMouseEvents } from '../utils/svgUtils';
import { resetGraphState, renderGatewayVisuals } from '../utils/graphUtils'; // NEW
import { calculate3DDistance } from '../utils/distanceUtils';
import { cogcPrograms } from '../constants/cogcPrograms';
import './UniverseMap.css';
import { SearchContext } from '../contexts/SearchContext';

const CX_SYSTEMS = [
  '8ecf9670ba070d78cfb5537e8d9f1b6c', // Antares
  '92029ff27c1abe932bd2c61ee4c492c7', // Benten
  'f2f57766ebaca9d69efae41ccf4d8853', // Hortus
  '49b6615d39ccba05752b3be77b2ebf36', // Moria
  'a4ba8b12739da65efc2b518703652ee1', // Arclight
  'afda9bea7f948f4a066a8882cdfa9055'  // Hubur
];

const UniverseMap = React.memo(() => {
  const { graph, planetData, materials, universeData } = useContext(GraphContext);
  const { highlightSelectedSystem } = useContext(SelectionContext);
  const { overlayProgram } = useCogcOverlay();
  const { searchResults, isRelativeThreshold } = useContext(SearchContext);
  
  // NEW Hooks
  const { activeMode, gatewayData, setOriginById, addPlannedGateway, clearGatewaySelections } = useMapMode();

  const svgRef = useRef(null);
  const graphRef = useRef(null);
  const selectedProgramValue = cogcPrograms.find(program => program.display === overlayProgram)?.value;

  // --- Click Handling ---
  const handleSystemClick = useCallback((systemId) => {
    if (systemId === 'rect1') return;

    if (activeMode === MAP_MODES.STANDARD) {
        // Standard Behavior
        highlightSelectedSystem(systemId);
    } 
    else if (activeMode === MAP_MODES.GATEWAY) {
        // Gateway Behavior
        if (gatewayData.strategy === GATEWAY_STRATEGIES.SINGLE) {
            if (!gatewayData.originA) {
                // Set Origin A
                setOriginById(systemId, 'A');
            } else {
                // Prevent self-loop: If clicking the same system, just deselect
                if (gatewayData.originA.SystemId === systemId) {
                    clearGatewaySelections();
                } else {
                    // Plan Route (A -> Target)
                    const targetSystem = universeData[systemId][0];
                    const dist = calculate3DDistance(gatewayData.originA, targetSystem);
                    
                    addPlannedGateway({
                        id: Date.now().toString(),
                        sourceId: gatewayData.originA.SystemId,
                        targetId: targetSystem.SystemId,
                        source: gatewayData.originA.Name,
                        target: targetSystem.Name,
                        distance: dist.toFixed(2)
                    });
                    
                    clearGatewaySelections();
                }
            }
        } 
        else if (gatewayData.strategy === GATEWAY_STRATEGIES.DUAL) {
            if (!gatewayData.originA) {
                setOriginById(systemId, 'A');
            } else if (!gatewayData.originB) {
                setOriginById(systemId, 'B');
            } else {
                // If both set, maybe cycle A? Or do nothing? 
                // Let's reset A to new click for fluid behavior
                setOriginById(systemId, 'A');
            }
        }
    }
  }, [activeMode, gatewayData, highlightSelectedSystem, setOriginById, addPlannedGateway, clearGatewaySelections, universeData]);


  // Attach Events
  const attachClickEvents = useCallback((g) => {
    g.selectAll('rect').on('click', function() {
      const systemId = d3.select(this).attr('id').replace('#', '');
      handleSystemClick(systemId);
    });
  }, [handleSystemClick]);


  // --- D3 Initialization ---
  useEffect(() => {
    if (!graph || !graph.edges) return;

    d3.xml('PrUn_universe_map_normalized.svg').then(data => {
      const svgNode = data.documentElement;
      const container = document.getElementById('map-container');

      while (container.firstChild) container.removeChild(container.firstChild);
      container.appendChild(svgNode);

      const svg = d3.select(svgNode);
      const g = svg.append('g');

      while (svgNode.firstChild && svgNode.firstChild !== g.node()) {
        g.node().appendChild(svgNode.firstChild);
      }

      g.selectAll('rect').each(function() {
        const systemId = d3.select(this).attr('id');
        if (CX_SYSTEMS.includes(systemId)) {
          d3.select(this).attr('rx', '2').attr('ry', '2');
        }
      });

      graphRef.current = { svg, g };

      const zoom = d3.zoom()
        .scaleExtent([1, 20])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });

      svg.call(zoom);

      // Initial Mouse Events
      addMouseEvents(g, searchResults, materials, isRelativeThreshold, selectedProgramValue, activeMode, gatewayData);

      svgRef.current = svgNode;
      graphRef.current = { svg, g };

      attachClickEvents(g);
    });

    return () => {
      if (svgRef.current) {
        const container = document.getElementById('map-container');
        if (container && container.contains(svgRef.current)) {
          container.removeChild(svgRef.current);
        }
      }
    };
  // eslint-disable-next-line
  }, [graph]); // Run once on graph load


  // --- Updates & Rerenders ---

  // 1. Update Mouse Events when Context changes
  useEffect(() => {
    if (graphRef.current) {
      addMouseEvents(
          graphRef.current.g, 
          searchResults, 
          materials, 
          isRelativeThreshold, 
          selectedProgramValue,
          activeMode,
          gatewayData,
          universeData
      );
      // Re-attach click events to ensure they use latest closure variables (important for handleSystemClick)
      attachClickEvents(graphRef.current.g);
    }
  }, [searchResults, materials, isRelativeThreshold, selectedProgramValue, activeMode, gatewayData, universeData, attachClickEvents]);


  // 2. Handle Gateway Visuals (Heatmap/Highlight)
  useEffect(() => {
    if (!graphRef.current || !universeData) return;
    const { svg } = graphRef.current;

    if (activeMode === MAP_MODES.GATEWAY) {
        renderGatewayVisuals(svg, gatewayData, universeData);
    } else {
        // When switching back to standard, ensure reset (unless pathfinding is holding state)
        // resetGraphState calls 'renderGatewayVisuals' if mode is GATEWAY, else resets to gray
        resetGraphState(null, activeMode, null, null);
    }
  }, [activeMode, gatewayData, universeData]);


  // 3. COGC Overlay (Existing)
  const applyCogcOverlay = useCallback(() => {
    if (!graphRef.current || !overlayProgram) return;
    const { g } = graphRef.current;
    g.selectAll('.cogc-overlay-rect').remove();

    g.selectAll('rect').each(function() {
      const rect = d3.select(this);
      const systemId = d3.select(this).attr('id');
      const planets = planetData[systemId];

      if (planets && planets.some(planet => {
        if (!planet.COGCPrograms || planet.COGCPrograms.length === 0) return false;
        const sortedPrograms = planet.COGCPrograms.sort((a, b) => b.StartEpochMs - a.StartEpochMs);
        const relevantProgram = sortedPrograms[1] || sortedPrograms[0];
        return relevantProgram && relevantProgram.ProgramType === selectedProgramValue;
      })) {
        rect.classed('cogc-overlay', true);
        const x = parseFloat(rect.attr('x'));
        const y = parseFloat(rect.attr('y'));
        const width = parseFloat(rect.attr('width'));
        const height = parseFloat(rect.attr('height'));
        const scaleUp = 4;
        const isCX = CX_SYSTEMS.includes(systemId);
        const borderRadius = isCX ? '4' : '50%';

        const overlayRect = g.append('rect')
          .attr('class', 'cogc-overlay-rect')
          .attr('x', x - scaleUp/2)
          .attr('y', y - scaleUp/2)
          .attr('width', width + scaleUp)
          .attr('height', height + scaleUp)
          .attr('fill', 'none')
          .attr('stroke', '#56c7f7')
          .attr('stroke-width', '3px')
          .attr('rx', borderRadius)
          .attr('ry', borderRadius);
        rect.property('cogcOverlayRect', overlayRect);
      } else {
        rect.classed('cogc-overlay', false);
        rect.property('cogcOverlayRect', null);
      }
    });
  }, [overlayProgram, planetData, selectedProgramValue]);

  useEffect(() => {
    applyCogcOverlay();
  }, [applyCogcOverlay]);


  return (
    <div id="map-container">
      <DataPointOverlay mapRef={graphRef} />
      <GatewayLayer mapRef={graphRef} />
    </div>
  );
});

export default UniverseMap;