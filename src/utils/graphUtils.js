import * as d3 from 'd3';
import { find_path } from 'dijkstrajs';
import { useContext } from 'react';
import { colors } from '../config/config';
import { GraphContext } from '../contexts/GraphContext';

export const findShortestPath = (graph, system1, system2, highlightPath) => {
  if (system1 === 'rect1' || system2 === 'rect1') {
    console.error('Invalid system selection for pathfinding:', system1, system2);
    return;
  }

  const graphNodes = {};
  graph.edges.forEach(edge => {
    if (!graphNodes[edge.start]) graphNodes[edge.start] = {};
    if (!graphNodes[edge.end]) graphNodes[edge.end] = {};
    graphNodes[edge.start][edge.end] = edge.distance;
    graphNodes[edge.end][edge.start] = edge.distance;
  });

  try {
    const path = find_path(graphNodes, system1, system2);
    console.log('Found Path:', path)
    highlightPath(path, system2);
    DrawGatewayPlanner(path);
  } catch (error) {
    console.error('Error finding path:', error);
  }
};

// Function to reset all nodes and paths
export const resetGraphState = (nextSelectedSystem) => {
  const svg = d3.select('#map-container svg');
  // Reset all system nodes color and stroke except the background rect and current selection
  svg.selectAll('rect').each(function() {
    const node = d3.select(this);
    const systemId = node.attr('id');
    if (systemId !== 'rect1'
      && systemId !== nextSelectedSystem
      && !node.classed('search-highlight')
      && !node.classed('cogc-overlay-rect')
      && !node.classed('data-overlay')
      ) {
      node
        .attr('fill', colors.resetSystemFill)
        .attr('fill-opacity', colors.resetSystemFillOpacity)
        .attr('stroke', colors.resetSystemStroke)
        .attr('stroke-width', colors.resetSystemStrokeWidth);
    }
  });

  // Reset all paths color and stroke
  svg.selectAll('path').each(function() {
    d3.select(this)
      .attr('stroke', colors.resetPathStroke)
      .attr('stroke-width', colors.resetPathStrokeWidth);
  });
};

// Function to highlight the path
export const highlightPath = (path, systemSelected) => {
  // Reset all system nodes color and stroke except the background rect
  resetGraphState(systemSelected)

  // Highlight systems in the path
  path.forEach(system => {
  const systemNode = d3.select(`#${CSS.escape(system)}`);
    if (!systemNode.classed('search-highlight')) {
      systemNode
        .attr('fill', colors.systemFill)
        .attr('stroke', colors.systemStroke);
    }
  });

  // Highlight paths in the path
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];

    d3.selectAll(`path[id*="${start}"][id*="${end}"], path[id*="${end}"][id*="${start}"]`)
      .attr('stroke', colors.pathStroke)
      .attr('stroke-width', colors.pathStrokeWidth);
  }

  // Ensure the start and end systems of the path are highlighted
  if (path.length >= 2) {
    const startSystem = path[0];
    const endSystem = path[path.length - 1];
    highlightSelectedSystem(null, startSystem, [startSystem, endSystem]);
    highlightSelectedSystem(null, endSystem, [startSystem, endSystem]);
  }
}

export const ClearAllGateways = (path) => {
  const g = d3.select('#map-container g');

  // clear any old paths and labels
  g.selectAll('#gatewayLine').remove();
  g.selectAll('#gatewayLineLabel').remove();
  g.selectAll('#gatewayLineLabelOutline').remove();

}

export const DrawGatewayPlanner = (path) => {

  const { universeData } = useContext(GraphContext);

  // Draw Gateway Planner Path:
  if (path.length >= 2) {
    const startSystem = path[0];
    const endSystem = path[path.length - 1];
    const g = d3.select('#map-container g');

    // Retrieve the coordinates of the start and end systems
    const startNode = d3.select(`#${CSS.escape(startSystem)}`);
    const endNode = d3.select(`#${CSS.escape(endSystem)}`);

    if (startNode.node() && endNode.node()) {
      const startX = parseFloat(startNode.attr('x'));
      const startY = parseFloat(startNode.attr('y'));
      const endX = parseFloat(endNode.attr('x'));
      const endY = parseFloat(endNode.attr('y'));

      // Draw a dotted red line between start and end systems
      g.insert('line', `:nth-child(100)`) // gross hack to get it under the planets but above the universe region polygons
        .attr('id', 'gatewayLine')
        .attr('x1', startX + 7.5 )
        .attr('y1', startY + 7.5 )
        .attr('x2', endX + 15)
        .attr('y2', endY + 15)
        .attr('stroke', 'red')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '4 3'); // Dotted line

      // need to pull real X,Y,Z data from universe for the parsec calc, not the nice map X,Y display values
      const startSystemData = universeData ? universeData[startSystem] : null;
      const endSystemData = universeData ? universeData[endSystem] : null;

      // see https://rest.fnar.net/global/simulationdata for the ParsecLength
      const parsecConstant = 12;
      const parsecDistance = Math.sqrt(
        Math.pow(startSystemData[0]["PositionX"]  - endSystemData[0]["PositionX"], 2) + 
        Math.pow(startSystemData[0]["PositionY"]  - endSystemData[0]["PositionY"], 2) + 
        Math.pow(startSystemData[0]["PositionZ"]  - endSystemData[0]["PositionZ"], 2)
      ) / parsecConstant;

      // midpoints used for the label.
      const midX = (startX + endX) / 2 + 15;
      const midY = (startY + endY) / 2 + 15;
      // const lineLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)).toFixed(2);

      g.append('text')
        .attr('id', 'gatewayLineLabelOutline')
        .attr('x', midX)
        .attr('y', midY)
        .attr('fill', '#ffffff')
        .attr('font-size', '12px')
        .attr('text-anchor', 'middle')
        .attr('stroke', 'white') // Stroke the outline
        .attr('stroke-width', '2px') // Thickness of the outline
        .attr('style', 'text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.3);')
        .attr('dy', -15) // Adjusts the position of the text slightly above the line
        .text(`${parsecDistance.toFixed(2)} parsecs`);
    
      g.append('text')
        .attr('id', 'gatewayLineLabel')
        .attr('x', midX)
        .attr('y', midY)
        .attr('fill', '#dd0000')
        .attr('font-size', '12px')
        .attr('text-anchor', 'middle')
        .attr('style', 'text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.3);')
        .attr('dy', -15) // Adjusts the position of the text slightly above the line
        .text(`${parsecDistance.toFixed(2)} parsecs`);
    }
  }
};

export const highlightSelectedSystem = (prevSelectedSystem, nextSelectedSystem, pathfindingSelection, isPathfindingEnabled) => {

  // Check if pathfindingSelection is empty, if so reset all nodes
  if (pathfindingSelection.length < 2 && isPathfindingEnabled) {
    resetGraphState(nextSelectedSystem);
  }

  // Reset previous system if it's not part of pathfinding selection
  if (prevSelectedSystem && !pathfindingSelection.includes(prevSelectedSystem)) {
    const prevSystemNode = d3.select(`#${CSS.escape(prevSelectedSystem)}`);
    if (!prevSystemNode.empty() && !prevSystemNode.classed('search-highlight')) {
      prevSystemNode
        .attr('fill', colors.resetSystemFill)
        .attr('fill-opacity', colors.resetSystemFillOpacity)
        .attr('stroke', colors.resetSystemStroke)
        .attr('stroke-width', colors.resetSystemStrokeWidth);
    }
  }

  // Highlight new system
  if (nextSelectedSystem) {
    const nextSystemNode = d3.select(`#${CSS.escape(nextSelectedSystem)}`);
    if (!nextSystemNode.empty() && !nextSystemNode.classed('search-highlight')) {
      nextSystemNode
        .attr('fill', colors.systemFill)
        .attr('stroke', colors.systemStroke)
        .attr('stroke-width', colors.systemStrokeWidth);
    }
  }
};
