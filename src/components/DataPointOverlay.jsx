import React, { useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { useDataPoints } from '../contexts/DataPointContext';

const DataPointOverlay = ({ mapRef }) => {
  const {
    meteorDensityData,
    luminosityData,
    systemNames,
    isOverlayVisible,
    isLoading,
    error,
    maxValues
  } = useDataPoints();

  const renderOverlay = useCallback(() => {
    if (!mapRef?.current?.g) return;

    // Clean up existing elements
    mapRef.current.g.selectAll('.meteor-density-group').remove();
    mapRef.current.g.selectAll('.system-name-label').remove();

    if (!isOverlayVisible || isLoading || error) {
      return;
    }

    const { g } = mapRef.current;
    const transform = d3.zoomTransform(g.node());
    const zoomLevel = transform?.k || 1;

    // Color scales for both metrics
    const densityColorScale = d3.scaleSequential()
      .domain([0, maxValues.density])
      .interpolator(d3.interpolatePuBu);

    const luminosityColorScale = d3.scaleSequential()
      .domain([0, maxValues.luminosity])
      .interpolator(d3.interpolateWarm);

    g.selectAll('rect:not(.meteor-density-bar)').each(function() {
      const node = d3.select(this);
      const systemId = node.attr('id');

      if (systemId === 'rect1') return;

      const density = meteorDensityData[systemId] || 0;
      const luminosity = luminosityData[systemId] || 0;

      const nodeWidth = parseFloat(node.attr('width'));
      const nodeHeight = parseFloat(node.attr('height'));
      const nodeX = parseFloat(node.attr('x'));
      const nodeY = parseFloat(node.attr('y'));

      const systemGroup = g.append('g')
        .attr('class', 'meteor-density-group');

      // Calculate bar dimensions
      const barWidth = Math.max(3, nodeWidth * 0.2 / zoomLevel);
      const maxBarHeight = nodeHeight;
      const barSpacing = barWidth * 0.5;

      // Create log scale for luminosity bar height
      const luminosityLogScale = d3.scaleLog()
        .domain([0.01, maxValues.luminosity]) // Using 0.1 as minimum to avoid log(0)
        .range([0, maxBarHeight]);

      // Density bar
      const densityHeight = maxBarHeight * (density / maxValues.density);
      const densityX = nodeX + nodeWidth * 1.2;

      // Background for density bar
      systemGroup.append('rect')
        .attr('class', 'meteor-density-bar-background data-overlay')
        .attr('x', densityX)
        .attr('y', nodeY)
        .attr('width', barWidth)
        .attr('height', maxBarHeight)
        .attr('fill', '#2a2a2a')
        .attr('opacity', 0.5);

      // Density bar
      const densityBar = systemGroup.append('rect')
        .attr('class', 'meteor-density-bar data-overlay')
        .attr('x', densityX)
        .attr('y', nodeY + maxBarHeight - densityHeight)
        .attr('width', barWidth)
        .attr('height', densityHeight)
        .attr('fill', densityColorScale(density))
        .attr('opacity', 0.8);

      // Luminosity bar
      const luminosityHeight = luminosityLogScale(Math.max(0.1, luminosity));
      const luminosityX = densityX + barWidth + barSpacing;

      // Background for luminosity bar
      systemGroup.append('rect')
        .attr('class', 'luminosity-bar-background data-overlay')
        .attr('x', luminosityX)
        .attr('y', nodeY)
        .attr('width', barWidth)
        .attr('height', maxBarHeight)
        .attr('fill', '#2a2a2a')
        .attr('opacity', 0.5);

      // Luminosity bar
      const luminosityBar = systemGroup.append('rect')
        .attr('class', 'luminosity-bar data-overlay')
        .attr('x', luminosityX)
        .attr('y', nodeY + maxBarHeight - luminosityHeight)
        .attr('width', barWidth)
        .attr('height', luminosityHeight)
        .attr('fill', luminosityColorScale(luminosity))
        .attr('opacity', 0.8);

      // System name label
      systemGroup.append('text')
        .attr('class', 'system-name-label data-overlay')
        .attr('x', nodeX + (nodeWidth / 2))
        .attr('y', nodeY + nodeHeight + 2)
        .attr('fill', '#CCCCCC')
        .attr('stroke', '#000000')
        .attr('stroke-width', 1 / zoomLevel)
        .attr('paint-order', 'stroke')
        .attr('font-size', '6px')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'hanging')
        .style('pointer-events', 'none')
        .text(systemNames[systemId] || systemId);

      // Add hover interactions for both bars
      const addBarHoverEffects = (bar, dataType, value, colorScale) => {
        bar.on('mouseover.data', function(event) {
          event.stopPropagation();
          d3.select(this)
            .attr('opacity', 1)
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1 / zoomLevel);

          d3.select('body')
            .append('div')
            .attr('class', 'data-overlay-tooltip')
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
                <div>${dataType}: ${value.toFixed(3)}</div>
                <div style="color: #aaa; font-size: 11px; margin-top: 2px">
                  Relative to Max (${maxValues[dataType.toLowerCase()].toFixed(2)}):
                  ${((value / maxValues[dataType.toLowerCase()]) * 100).toFixed(1)}%
                </div>
              </div>
            `);
        })
        .on('mouseout.data', function(event) {
          event.stopPropagation();
          d3.select(this)
            .attr('opacity', 0.8)
            .attr('stroke', 'none');
          d3.selectAll('.data-overlay-tooltip').remove();
        });
      };

      addBarHoverEffects(densityBar, 'Density', density, densityColorScale);
      addBarHoverEffects(luminosityBar, 'Luminosity', luminosity, luminosityColorScale);
    });
  }, [mapRef, isOverlayVisible, isLoading, error, meteorDensityData, luminosityData, systemNames, maxValues]);

  useEffect(() => {
    renderOverlay();
  }, [renderOverlay]);

  useEffect(() => {
    if (!mapRef?.current?.svg) return;

    // Capture the current svg reference
    const svg = mapRef.current.svg;

    const handleZoom = () => {
      renderOverlay();
    };

    svg.on('zoom.overlay', handleZoom);

    return () => {
      // Use the captured reference in cleanup
      svg.on('zoom.overlay', null);
    };
  }, [mapRef, renderOverlay]);

  return null;
};

export default React.memo(DataPointOverlay);