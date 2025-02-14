import * as d3 from 'd3';

// Calculate bar dimensions based on node size and zoom level
export const calculateBarDimensions = (nodeWidth, nodeHeight, zoomLevel) => {
  const barWidth = Math.max(2, nodeWidth * 0.15 / zoomLevel); // 15% of node width
  const barHeight = nodeHeight / zoomLevel;
  const xOffset = nodeWidth + (barWidth / 2); // Position right of node
  const yOffset = 0; // Align with top of node

  return {
    barWidth,
    barHeight,
    xOffset,
    yOffset
  };
};

// Calculate color based on density value
export const getDensityColor = (density, maxDensity) => {
  // Color scale from yellow (low) to red (high)
  const colorScale = d3.scaleLinear()
    .domain([0, maxDensity])
    .range(['#FFD700', '#FF4500']); // Gold to Red-Orange

  return colorScale(density);
};

// Calculate bar height based on density value
export const calculateBarHeight = (density, maxDensity, maxHeight) => {
  if (maxDensity === 0) return 0;

  const scale = d3.scaleLinear()
    .domain([0, maxDensity])
    .range([0, maxHeight]);

  return scale(density);
};

// Format density value for display
export const formatDensityValue = (density) => {
  return density.toFixed(2);
};

// Calculate tooltip position
export const calculateTooltipPosition = (event, nodeWidth, nodeHeight) => {
  const { pageX, pageY } = event;
  const tooltipOffset = 10; // Offset from cursor

  return {
    x: pageX + tooltipOffset,
    y: pageY - tooltipOffset
  };
};

// Helper function to determine if a point is near a bar
export const isPointNearBar = (point, barPosition, barDimensions) => {
  const { x, y } = point;
  const { x: barX, y: barY } = barPosition;
  const { barWidth, barHeight } = barDimensions;

  return (
  x >= barX &&
  x <= barX + barWidth &&
  y >= barY &&
  y <= barY + barHeight
  );
};