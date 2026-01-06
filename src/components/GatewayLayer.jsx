import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { useMapMode } from '../contexts/MapModeContext';

const GatewayLayer = ({ mapRef, mapRenderKey }) => {
  const { existingGateways, gatewayData, activeMode } = useMapMode();

  useEffect(() => {
    if (!mapRef.current || mapRenderKey === 0) return;
    
    const { g } = mapRef.current;

    let layerGroup = g.select('.gateway-layer-group');
    
    if (layerGroup.empty()) {
        const firstSystemNode = g.select('rect:not(#rect1)').node();
        
        if (firstSystemNode) {
            layerGroup = g.insert('g', () => firstSystemNode)
                          .attr('class', 'gateway-layer-group');
        } else {
            layerGroup = g.append('g').attr('class', 'gateway-layer-group');
        }
    }

    layerGroup.selectAll('*').remove();

    const getCoords = (systemId) => {
        const node = g.select(`#${CSS.escape(systemId)}`);
        if (node.empty()) return null;
        return {
            x: parseFloat(node.attr('x')) + parseFloat(node.attr('width')) / 2,
            y: parseFloat(node.attr('y')) + parseFloat(node.attr('height')) / 2
        };
    };

    if (existingGateways && existingGateways.length > 0) {
        existingGateways.forEach(gw => {
            const start = getCoords(gw.sourceId);
            const end = getCoords(gw.targetId);
            
            if (start && end) {
                layerGroup.append('line') // Append to layerGroup, not g
                    .attr('class', 'gateway-line')
                    .attr('x1', start.x)
                    .attr('y1', start.y)
                    .attr('x2', end.x)
                    .attr('y2', end.y)
                    .attr('stroke', '#666')
                    .attr('stroke-width', 1)
                    .attr('stroke-dasharray', '4,2')
                    .attr('pointer-events', 'none');
            }
        });
    }

    if (gatewayData.plannedGateways && gatewayData.plannedGateways.length > 0) {
        gatewayData.plannedGateways.forEach(gw => {
             const start = getCoords(gw.sourceId);
             const end = getCoords(gw.targetId);

             if (start && end) {
                 layerGroup.append('line')
                    .attr('class', 'planned-gateway-line')
                    .attr('x1', start.x)
                    .attr('y1', start.y)
                    .attr('x2', end.x)
                    .attr('y2', end.y)
                    .attr('stroke', '#f7a600') 
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', '6,3')
                    .attr('pointer-events', 'none');
             }
        });
    }

  }, [mapRef, existingGateways, gatewayData.plannedGateways, mapRenderKey, activeMode]);

  return null;
};

export default GatewayLayer;