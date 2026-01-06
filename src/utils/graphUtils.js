import * as d3 from 'd3';
import { find_path } from 'dijkstrajs';
import { colors } from '../config/config';
import { calculate3DDistance, getDistanceColor } from './distanceUtils';
import { MAP_MODES, GATEWAY_STRATEGIES } from '../contexts/MapModeContext';

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
  } catch (error) {
    console.error('Error finding path:', error);
  }
};

export const resetGraphState = (nextSelectedSystem, activeMode, gatewayData, universeData) => {
  const svg = d3.select('#map-container svg');

  if (activeMode === MAP_MODES.GATEWAY) {
      renderGatewayVisuals(svg, gatewayData, universeData);
      return;
  }

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

      const savedRx = node.attr('data-original-rx');
      const savedRy = node.attr('data-original-ry');
      
      if (savedRx !== null) node.attr('rx', savedRx === 'null' ? null : savedRx);
      if (savedRy !== null) node.attr('ry', savedRy === 'null' ? null : savedRy);
    }
  });

  svg.selectAll('path').each(function() {
    d3.select(this)
      .attr('stroke', colors.resetPathStroke)
      .attr('stroke-width', colors.resetPathStrokeWidth);
  });
};

export const renderGatewayVisuals = (svg, gatewayData, universeData) => {
    if (!universeData) return;

    const { originA, originB, strategy } = gatewayData;

    const getDualColor = (val, min, max) => {
        const t = (val - min) / (max - min); 
        if (t < 0.2) return colors.tol.green;
        if (t < 0.4) return colors.tol.teal;
        if (t < 0.6) return colors.tol.sand;
        if (t < 0.8) return colors.tol.rose;
        return colors.tol.wine;
    };

    let minTotal = Infinity;
    if (strategy === GATEWAY_STRATEGIES.DUAL && originA && originB) {
        Object.values(universeData).forEach(sysArr => {
            const sys = sysArr[0];
            const d = calculate3DDistance(originA, sys) + calculate3DDistance(originB, sys);
            if (d < minTotal) minTotal = d;
        });
    }

    svg.selectAll('rect').each(function() {
        const node = d3.select(this);
        const systemId = node.attr('id');
        if (systemId === 'rect1') return;

        const systemData = universeData[systemId] ? universeData[systemId][0] : null;
        if (!systemData) return;

        if (node.attr('data-original-ry') == null) {
            const rx = node.attr('rx');
            const ry = node.attr('ry');
            node.attr('data-original-rx', rx === null ? 'null' : rx);
            node.attr('data-original-ry', ry === null ? 'null' : ry);
        }

        let fill = colors.resetSystemFill;
        let stroke = colors.resetSystemStroke;
        let strokeWidth = colors.resetSystemStrokeWidth;
        
        const storedRx = node.attr('data-original-rx');
        const storedRy = node.attr('data-original-ry');
        let rx = storedRx === 'null' ? null : storedRx;
        let ry = storedRy === 'null' ? null : storedRy;

        if (strategy === GATEWAY_STRATEGIES.SINGLE) {
            if (originA) {
                if (systemId === originA.SystemId) {
                    fill = colors.systemFill; 
                    ry = 4; rx = 4; strokeWidth = "2px";
                } else {
                    const dist = calculate3DDistance(originA, systemData);
                    fill = getDistanceColor(dist);
                }
            }
        }
        else if (strategy === GATEWAY_STRATEGIES.DUAL) {
            if (originA && systemId === originA.SystemId) {
                fill = colors.systemFill;
                ry = 4; rx = 4; strokeWidth = "2px";
            } else if (originB && systemId === originB.SystemId) {
                fill = colors.systemFill;
                ry = 4; rx = 4; strokeWidth = "2px";
            } else if (originA && originB) {
                const dist = calculate3DDistance(originA, systemData) + calculate3DDistance(originB, systemData);
                fill = getDualColor(dist, minTotal, minTotal * 1.5);
            }
        }

        node.attr('fill', fill)
            .attr('stroke', stroke)
            .attr('stroke-width', strokeWidth)
            .attr('rx', rx)
            .attr('ry', ry);
    });
};

export const highlightPath = (path, systemSelected) => {
  resetGraphState(systemSelected, 'STANDARD', null, null); 

  path.forEach(system => {
    const systemNode = d3.select(`#${CSS.escape(system)}`);
    if (!systemNode.classed('search-highlight')) {
      systemNode
        .attr('fill', colors.systemFill)
        .attr('stroke', colors.systemStroke);
    }
  });

  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];

    d3.selectAll(`path[id*="${start}"][id*="${end}"], path[id*="${end}"][id*="${start}"]`)
      .attr('stroke', colors.pathStroke)
      .attr('stroke-width', colors.pathStrokeWidth);
  }

  if (path.length >= 2) {
    const startSystem = path[0];
    const endSystem = path[path.length - 1];
    highlightSelectedSystem(null, startSystem, [startSystem, endSystem]);
    highlightSelectedSystem(null, endSystem, [startSystem, endSystem]);
  }
};

export const highlightSelectedSystem = (prevSelectedSystem, nextSelectedSystem, pathfindingSelection, isPathfindingEnabled) => {
  if (pathfindingSelection.length < 2 && isPathfindingEnabled) {
    resetGraphState(nextSelectedSystem, 'STANDARD', null, null);
  }

  if (prevSelectedSystem && !pathfindingSelection.includes(prevSelectedSystem)) {
    const prevSystemNode = d3.select(`#${CSS.escape(prevSelectedSystem)}`);
    if (!prevSystemNode.empty() && !prevSystemNode.classed('search-highlight')) {
      prevSystemNode
        .attr('fill', colors.resetSystemFill)
        .attr('fill-opacity', colors.resetSystemFillOpacity)
        .attr('stroke', colors.resetSystemStroke)
        .attr('stroke-width', colors.resetSystemStrokeWidth);
        
        const savedRx = prevSystemNode.attr('data-original-rx');
        const savedRy = prevSystemNode.attr('data-original-ry');
        if (savedRx !== null) prevSystemNode.attr('rx', savedRx === 'null' ? null : savedRx);
        if (savedRy !== null) prevSystemNode.attr('ry', savedRy === 'null' ? null : savedRy);
    }
  }

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