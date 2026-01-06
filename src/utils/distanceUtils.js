import { colors } from '../config/config';

/**
 * Calculates the 3D Euclidean distance between two systems.
 * Expects objects with PositionX, PositionY, PositionZ properties.
 */
export const calculate3DDistance = (sys1, sys2) => {
  if (!sys1 || !sys2) return Infinity;

  // Fallback if Z is missing (though PrUn data usually has it)
  const z1 = sys1.PositionZ || 0;
  const z2 = sys2.PositionZ || 0;

  const dx = sys1.PositionX - sys2.PositionX;
  const dy = sys1.PositionY - sys2.PositionY;
  const dz = z1 - z2;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Returns the appropriate color from the Tol Palette based on distance.
 */
export const getDistanceColor = (distance) => {
  if (distance < 10) return colors.gateway.under10;
  if (distance < 15) return colors.gateway.under15;
  if (distance < 20) return colors.gateway.under20;
  if (distance < 25) return colors.gateway.under25;
  return colors.gateway.over25;
};

/**
 * Generates a list of candidate systems sorted by distance from the origin.
 * Filters out systems > maxRange (optional, default 30pc to include the >25pc bucket).
 */
export const findClosestSystems = (origin, allSystemsMap, maxRange = 35) => {
  if (!origin) return [];

  const candidates = [];
  
  Object.values(allSystemsMap).forEach(systemArray => {
    const target = systemArray[0]; // universeData is grouped by ID, so we take the first item
    if (target.SystemId === origin.SystemId) return; // Skip self

    const dist = calculate3DDistance(origin, target);
    
    if (dist <= maxRange) {
      candidates.push({
        system: target,
        distance: dist
      });
    }
  });

  // Sort by nearest first
  return candidates.sort((a, b) => a.distance - b.distance);
};

/**
 * Generates a list of midpoints sorted by the lowest combined distance (A->Node + B->Node).
 */
export const findBestMidpoints = (originA, originB, allSystemsMap, limit = 50) => {
  if (!originA || !originB) return [];

  const candidates = [];

  Object.values(allSystemsMap).forEach(systemArray => {
    const target = systemArray[0];
    if (target.SystemId === originA.SystemId || target.SystemId === originB.SystemId) return;

    const distA = calculate3DDistance(originA, target);
    const distB = calculate3DDistance(originB, target);
    const totalDist = distA + distB;

    candidates.push({
      system: target,
      distA,
      distB,
      totalDist
    });
  });

  // Sort by lowest total distance
  return candidates.sort((a, b) => a.totalDist - b.totalDist).slice(0, limit);
};