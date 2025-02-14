import React, { useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { useDataPoints } from '../contexts/DataPointContext';

const DataPointOverlay = ({ mapRef }) => {
  const {
    meteorDensityData,
    systemNames,
    isOverlayVisible,
    isLoading,
    error,
    getNormalizedDensity,
    maxDensity
  } = useDataPoints();

  const renderOverlay = useCallback(() => {
    // Always clean up existing elements first
    if (!mapRef?.current?.g) return;

    // Clean up all meteor density related elements
    mapRef.current.g.selectAll('.meteor-density-group').remove();
    mapRef.current.g.selectAll('.system-name-label').remove();

    if (!isOverlayVisible || isLoading || error) {
      return;
    }

    const { g } = mapRef.current;

    // Get current transform for zoom scaling
    const transform = d3.zoomTransform(g.node());
    const zoomLevel = transform?.k || 1;

    // Calculate the actual maximum density value from the data
    const maxDensityValue = d3.max(Object.values(meteorDensityData));

    // Color scale for density visualization
    const colorScale = d3.scaleSequential()
      .domain([0, maxDensityValue])
      .interpolator(d3.interpolatePuBu);

    // Add elements for each system
    g.selectAll('rect:not(.meteor-density-bar)').each(function() {
      const node = d3.select(this);
      const systemId = node.attr('id');

      // Skip background rectangle
      if (systemId === 'rect1') return;

      const density = meteorDensityData[systemId] || 0;

      // Get node dimensions
      const nodeWidth = parseFloat(node.attr('width'));
      const nodeHeight = parseFloat(node.attr('height'));
      const nodeX = parseFloat(node.attr('x'));
      const nodeY = parseFloat(node.attr('y'));

      // Create a group for this system's elements
      const systemGroup = g.append('g')
        .attr('class', 'meteor-density-group');

      // Calculate bar dimensions
      const barWidth = Math.max(3, nodeWidth * 0.2 / zoomLevel);
      const maxBarHeight = nodeHeight;
      const barHeight = maxBarHeight * (density / maxDensityValue);
      const xOffset = nodeWidth * 1.2;

      // Add background bar
      systemGroup.append('rect')
        .attr('class', 'meteor-density-bar-background')
        .attr('x', nodeX + xOffset)
        .attr('y', nodeY)
        .attr('width', barWidth)
        .attr('height', maxBarHeight)
        .attr('fill', '#2a2a2a')
        .attr('opacity', 0.5);

      // Add the density bar
      const bar = systemGroup.append('rect')
        .attr('class', 'meteor-density-bar')
        .attr('x', nodeX + xOffset)
        .attr('y', nodeY + maxBarHeight - barHeight)
        .attr('width', barWidth)
        .attr('height', barHeight)
        .attr('fill', colorScale(density))
        .attr('opacity', 0.8);

      // Add system name label
      systemGroup.append('text')
        .attr('class', 'system-name-label')
        .attr('x', nodeX + (nodeWidth / 2))
        .attr('y', nodeY + nodeHeight + 2) // (16 / zoomLevel)
        .attr('fill', '#CCCCCC')
        .attr('stroke', '#000000')  // Black outline
        .attr('stroke-width', 1 / zoomLevel) // Adjust thickness based on zoom
        .attr('paint-order', 'stroke') // Ensure stroke renders before fill
        .attr('font-size', 6 + 'px') // Math.max(6, 24 / zoomLevel)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'hanging')
        .style('pointer-events', 'none')
        .text(systemNames[systemId] || systemId);

      // Add hover interactions
      bar.on('mouseover', function(event) {
          d3.select(this)
            .attr('opacity', 1)
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1 / zoomLevel);

          // Add tooltip
          const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
            .style('background-color', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '5px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .html(`
              <div style="background: rgba(0,0,0,0.9); padding: 8px; border-radius: 4px; border: 1px solid #444">
                <div style="font-weight: bold; color: #f7a600; margin-bottom: 4px">${systemNames[systemId] || systemId}</div>
                <div>Meteor Density: ${density.toFixed(2)}</div>
                <div style="color: #aaa; font-size: 11px; margin-top: 2px">
                  Relative to Max (${maxDensityValue.toFixed(2)}): ${((density / maxDensityValue) * 100).toFixed(1)}%
                </div>
              </div>
            `);
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('opacity', 0.8)
            .attr('stroke', 'none');
          d3.selectAll('.tooltip').remove();
        });
    });
  }, [mapRef, isOverlayVisible, isLoading, error, meteorDensityData, systemNames]);

  // Render overlay when visibility changes or data updates
  useEffect(() => {
    renderOverlay();
  }, [renderOverlay]);

  // Update overlay when zooming
  useEffect(() => {
    if (!mapRef?.current?.svg) return;

    const handleZoom = () => {
      renderOverlay();
    };

    mapRef.current.svg.on('zoom.overlay', handleZoom);

    return () => {
      mapRef.current?.svg?.on('zoom.overlay', null);
    };
  }, [mapRef, renderOverlay]);

  return null;
};

export default React.memo(DataPointOverlay);