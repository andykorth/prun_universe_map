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
  // Define a color scale
  const colorScaleLiquid = d3.scaleLinear()
    .domain([0, highestFactor])  // Domain from 0 to the highest factor
    .range([colors.resetSystemFill, colors.searchSystemFillLiquid]);  // Range from faint to intense color
  const colorScaleGaseous = d3.scaleLinear()
    .domain([0, highestFactor])  // Domain from 0 to the highest factor
    .range([colors.resetSystemFill, colors.searchSystemFillGaseous]);  // Range from faint to intense color
  const colorScaleMineral = d3.scaleLinear()
    .domain([0, highestFactor])  // Domain from 0 to the highest factor
    .range([colors.resetSystemFill, colors.searchSystemFillMineral]);  // Range from faint to intense color

  if (searchResults.length > 0) {
    // Reset all systems to default state
    clearHighlights();

    // Highlight systems from search results
    searchResults.forEach(result => {
      let highlightSystemNode = {};
      var fillColor = colors.searchSystemFill
      if (result.type === 'system') {
        highlightSystemNode = d3.select(`#${CSS.escape(result.id)}`);
      } else if (result.type === 'planet') {
        highlightSystemNode = d3.select(`#${CSS.escape(result.systemId)}`);
      } else if (result.type === 'material') {
        if( result.resourceType === 'LIQUID') {
          fillColor = colorScaleLiquid(result.factor);
        } else if (result.resourceType === 'GASEOUS') {
          fillColor = colorScaleGaseous(result.factor);
        } else {
          fillColor = colorScaleMineral(result.factor);
        }
        highlightSystemNode = d3.select(`#${CSS.escape(result.systemId)}`);
      }
      if (!highlightSystemNode.empty()) {
        highlightSystemNode
          .attr('fill', fillColor)
          .attr('stroke', colors.searchSystemStroke)
          .attr('stroke-width', colors.searchSystemStrokeWidth)
          .classed('search-highlight', true);
      }
    });
  }
};