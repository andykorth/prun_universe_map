import React, { useEffect, useContext, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { GraphContext } from '../contexts/GraphContext';
import { SelectionContext } from '../contexts/SelectionContext';
import { addMouseEvents } from '../utils/svgUtils';
import './UniverseMap.css';

const UniverseMap = React.memo(() => {
  const { graph } = useContext(GraphContext);
  const { highlightSelectedSystem } = useContext(SelectionContext);
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
    if (!graph || !graph.edges) return;

    d3.xml('/PrUn_universe_map_normalized.svg').then(data => {
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
        });

      svg.call(zoom);

      addMouseEvents(g);

      // Store references for later use
      svgRef.current = svgNode;
      graphRef.current = { svg, g };

      // Attach click events here, after the SVG is fully initialized
      attachClickEvents(g);
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

  // Update click events when handleSystemClick changes
  useEffect(() => {
    if (graphRef.current) {
      attachClickEvents(graphRef.current.g);
    }
  }, [attachClickEvents]);

  return <div id="map-container"></div>;
});

export default UniverseMap;