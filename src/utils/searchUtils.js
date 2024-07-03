import * as d3 from 'd3';
import { resetGraphState } from '../utils/graphUtils';
import { colors } from '../config/config';

export const clearHighlights = () => {
  d3.selectAll('.search-highlight')
    .classed('search-highlight', false)
    .attr('fill', colors.resetSystemFill)
    .attr('stroke', colors.resetSystemStroke)
    .attr('stroke-width', colors.resetSystemStrokeWidth);

  resetGraphState();
};

export const highlightSearchResults = (searchResults, highestFactor) => {
  // Define color scales
  const colorScaleLiquid = d3.scaleLinear()
    .domain([0, highestFactor])
    .range([colors.searchSystemFillLowLiquid, colors.searchSystemFillLiquid]);
  const colorScaleGaseous = d3.scaleLinear()
    .domain([0, highestFactor])
    .range([colors.searchSystemFillLowGaseous, colors.searchSystemFillGaseous]);
  const colorScaleMineral = d3.scaleLinear()
    .domain([0, highestFactor])
    .range([colors.searchSystemFillLowMineral, colors.searchSystemFillMineral]);

  if (searchResults.length > 0) {
    // Reset all systems to default state
    clearHighlights();

    // Track the best resource for each system
    const systemBestResource = {};

    // First pass: determine the best resource to highlight for each system
    searchResults.forEach(result => {
      if (result.type === 'material') {
        const systemId = result.systemId;
        if (!systemBestResource[systemId]) {
          systemBestResource[systemId] = result;
        } else {
          const current = systemBestResource[systemId];

          // Prefer liquid if it's within 0.2 absolute concentration of the highest
          if (result.resourceType === 'LIQUID' && (result.factor >= current.factor - 0.2)) {
            systemBestResource[systemId] = result;
          } else if (result.factor > current.factor &&
                     (result.resourceType !== 'LIQUID' || result.factor > current.factor + 0.2)) {
            // For non-liquid resources, or if liquid is more than 0.2 higher, keep the highest concentration
            systemBestResource[systemId] = result;
          }
        }
      }
    });

    // Second pass: highlight systems based on the best resource
    searchResults.forEach(result => {
      let highlightSystemNode = {};
      let fillColor = colors.searchSystemFill;
      let systemId;

      if (result.type === 'system') {
        systemId = result.id;
        highlightSystemNode = d3.select(`#${CSS.escape(systemId)}`);
      } else if (result.type === 'planet') {
        systemId = result.systemId;
        highlightSystemNode = d3.select(`#${CSS.escape(systemId)}`);
      } else if (result.type === 'material') {
        systemId = result.systemId;
        const bestForSystem = systemBestResource[systemId];

        if (result === bestForSystem) {
          if (result.resourceType === 'LIQUID') {
            fillColor = colorScaleLiquid(result.factor);
          } else if (result.resourceType === 'GASEOUS') {
            fillColor = colorScaleGaseous(result.factor);
          } else {
            fillColor = colorScaleMineral(result.factor);
          }
          highlightSystemNode = d3.select(`#${CSS.escape(systemId)}`);
        } else {
          // Skip this result as it's not the best for the system
          return;
        }
      }

      if (!highlightSystemNode.empty()) {
        highlightSystemNode
          .attr('fill', fillColor)
          .attr('stroke', colors.searchSystemStroke)
          .attr('stroke-width', colors.searchSystemStrokeWidth)
          .attr('fill-opacity', 1.0)
          .classed('search-highlight', true);
      }
    });
  }
};