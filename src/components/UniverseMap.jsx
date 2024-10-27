import React, { useEffect, useContext, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { GraphContext } from '../contexts/GraphContext';
import { SelectionContext } from '../contexts/SelectionContext';
import { useCogcOverlay } from '../contexts/CogcOverlayContext';
import { addMouseEvents } from '../utils/svgUtils';
import { cogcPrograms } from '../constants/cogcPrograms';
import './UniverseMap.css';
import { SearchContext } from '../contexts/SearchContext';

const UniverseMap = React.memo(() => {
  const { graph, planetData, materials, universeData } = useContext(GraphContext);
  const { highlightSelectedSystem } = useContext(SelectionContext);
  const { overlayProgram } = useCogcOverlay();
  const { searchResults, isRelativeThreshold } = useContext(SearchContext);
  const svgRef = useRef(null);
  const graphRef = useRef(null);

  // Handle system click
  const handleSystemClick = useCallback((systemId) => {
    if (systemId === 'rect1') {
      return;
    }
    highlightSelectedSystem(systemId);
  }, [highlightSelectedSystem]);

  // Attach click events
  const attachClickEvents = useCallback((g) => {
    g.selectAll('rect').on('click', function() {
      const systemId = d3.select(this).attr('id').replace('#', '');
      handleSystemClick(systemId);
    });
  }, [handleSystemClick]);

  // Initialize D3 graph
  useEffect(() => {
    if (!graph || !graph.edges) {
      console.log("No graph!")
      return;
    }

    d3.xml('PrUn_universe_map_normalized.svg').then(data => {
      const svgNode = data.documentElement;
      const container = document.getElementById('map-container');

      // Clear any existing SVG to prevent duplicates
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      // Append the SVG node to the container
      container.appendChild(svgNode);

      // Select the SVG element and create a group element
      const svg = d3.select(svgNode);
      const g = svg.append('g');

      // Move all children of the SVG to the group
      while (svgNode.firstChild && svgNode.firstChild !== g.node()) {
        g.node().appendChild(svgNode.firstChild);
      }

      const zoom = d3.zoom()
        .scaleExtent([1, 20])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);

          const zoomLevel = event.transform.k; 
          const allNames = g.selectAll('.namesText');

          // opacity zero at zoomLevel 5, opacity 1 when it's less than 2.
          const opacity = (zoomLevel - 1.5) / 1.0; // Set your threshold
          console.log("Zoom to " + zoomLevel + " yields opacity " + opacity + " for   elements: " + allNames );

          allNames.each(function(){
            d3.select(this).attr("opacity", opacity);
          });
        });

      svg.call(zoom);

      addMouseEvents(g, searchResults, materials);

      // Store references for later use
      svgRef.current = svgNode;
      graphRef.current = { svg, g };

      // Attach click events here, after the SVG is fully initialized
      attachClickEvents(g);
        
      g.selectAll('.namesText').remove();

      console.log("Add system names.")
      g.selectAll('rect').each(function() {
        const rect = d3.select(this);
        const systemId = d3.select(this).attr('id');
        const starSystem = universeData ? universeData[systemId] : null;
        if (starSystem != null){
          const x = parseFloat(rect.attr('x'));
          const y = parseFloat(rect.attr('y'));
          const width = parseFloat(rect.attr('width'));
          const height = parseFloat(rect.attr('height'));

          // Create a new overlay rect
          // Add text label
          const overlayText = g.append('text')
            .attr('class', 'namesText')
            .attr('x', x + width / 2) // Center text horizontally
            .attr('y', y + height + 10) // Position text below the rect
            .attr('text-anchor', 'middle')
            .attr('fill', '#56c7f7')
            .attr('font-size', '9px')
            .text(starSystem[0].Name); // Set the text to the planet's name
          rect.property('namesText', overlayText);
        }
      });

      g.selectAll('.namesText').each(function(){
        d3.select(this).attr("opacity", 0);
      });

    });

    // Cleanup function
    return () => {
      if (svgRef.current) {
        const container = document.getElementById('map-container');
        if (container && container.contains(svgRef.current)) {
          container.removeChild(svgRef.current);
        }
      }
    };
  // eslint-disable-next-line
  }, [graph]);


  useEffect(() => {
    if (!graphRef.current) return;

  // eslint-disable-next-line
  }, [universeData]);

  useEffect(() => {
    if (graphRef.current) {
      addMouseEvents(graphRef.current.g, searchResults, materials, isRelativeThreshold);
    }
  }, [searchResults, materials, isRelativeThreshold]);

  // Apply Cogc overlay
  const applyCogcOverlay = useCallback(() => {
    if (!graphRef.current || !overlayProgram) return;

    const { g } = graphRef.current;
    const selectedProgramValue = cogcPrograms.find(program => program.display === overlayProgram)?.value;

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
        // Create a new overlay rect
        const overlayRect = g.append('rect')
          .attr('class', 'cogc-overlay-rect')
          .attr('x', x - scaleUp/2)
          .attr('y', y - scaleUp/2)
          .attr('width', width + scaleUp)
          .attr('height', height + scaleUp)
          .attr('fill', 'none')
          .attr('stroke', '#56c7f7')
          .attr('stroke-width', '3px')
          .attr('rx', '50%')
          .attr('ry', '50%');
        rect.property('cogcOverlayRect', overlayRect);
      } else {
        rect.classed('cogc-overlay', false);
        rect.property('cogcOverlayRect', null);
      }
    });
  }, [overlayProgram, planetData]);

  // Effect to apply Cogc overlay when overlayProgram changes
  useEffect(() => {
    applyCogcOverlay();
  }, [applyCogcOverlay]);

  // Update click events when handleSystemClick changes
  useEffect(() => {
    if (graphRef.current) {
      attachClickEvents(graphRef.current.g);
    }
  }, [attachClickEvents]);

  return <div id="map-container"></div>;
});

export default UniverseMap;