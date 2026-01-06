import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { useMapMode } from '../contexts/MapModeContext';

const GatewayLayer = ({ mapRef }) => {
  const { existingGateways, gatewayData } = useMapMode();

  useEffect(() => {
    if (!mapRef.current) return;
    const { g } = mapRef.current;

    // cleanup
    g.selectAll('.gateway-line').remove();
    g.selectAll('.planned-gateway-line').remove();
    g.selectAll('.gateway-arrow').remove(); // If using markers

    // Helper to get coords
    const getCoords = (systemId) => {
        const node = g.select(`#${CSS.escape(systemId)}`);
        if (node.empty()) return null;
        return {
            x: parseFloat(node.attr('x')) + parseFloat(node.attr('width')) / 2,
            y: parseFloat(node.attr('y')) + parseFloat(node.attr('height')) / 2
        };
    };

    // Draw Existing Gateways
    if (existingGateways && existingGateways.length > 0) {
        existingGateways.forEach(gw => {
            const start = getCoords(gw.sourceId);
            const end = getCoords(gw.targetId);
            
            if (start && end) {
                g.append('line')
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

    // Draw Planned Gateways
    if (gatewayData.plannedGateways && gatewayData.plannedGateways.length > 0) {
        gatewayData.plannedGateways.forEach(gw => {
             // plannedGateways stores names/distances, check if we have IDs or need to look up
             // For safety, assuming gw object has sourceId and targetId added during creation, 
             // or we look up by name if IDs aren't stored. 
             // Phase 1 implementation stored: { id, source: name, target: name, distance }
             // We need IDs to draw lines. I will assume we passed IDs or will look them up via node selection.
             // EDIT: Context implementation passed full objects. I will update Context/Map to ensure IDs are passed.
             // For now, let's try to find nodes by ID.
             
             const start = getCoords(gw.sourceId);
             const end = getCoords(gw.targetId);

             if (start && end) {
                 g.append('line')
                    .attr('class', 'planned-gateway-line')
                    .attr('x1', start.x)
                    .attr('y1', start.y)
                    .attr('x2', end.x)
                    .attr('y2', end.y)
                    .attr('stroke', '#f7a600') // PrUn Gold
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', '6,3')
                    .attr('pointer-events', 'none');
             }
        });
    }

  }, [mapRef, existingGateways, gatewayData.plannedGateways]);

  return null;
};

export default GatewayLayer;