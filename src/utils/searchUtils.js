import * as d3 from 'd3';
import { resetGraphState } from '../utils/graphUtils';
import { colors } from '../config/config';

export const highlightSearchResults = (searchResults) => {
  if (searchResults.length > 0) {

    // Reset all systems to default state
    resetGraphState();

    // Highlight systems from search results
    searchResults.forEach(result => {
      let highlightSystemNode = {}
      if (result.type === 'system') {
        highlightSystemNode = d3.select(`#${CSS.escape(result.id)}`);
      } else if (result.type === 'planet') {
        highlightSystemNode = d3.select(`#${CSS.escape(result.systemId)}`);
      }
      if (!highlightSystemNode.empty()) {
        highlightSystemNode
          .attr('fill', colors.searchSystemFill)
          .attr('stroke', colors.searchSystemStroke)
          .attr('stroke-width', colors.searchSystemStrokeWidth);
      }
    });
  }
};

export const clearHighlights = () => {
  resetGraphState();
};