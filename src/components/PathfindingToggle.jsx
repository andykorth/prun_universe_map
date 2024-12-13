import React, { useContext } from 'react';
import { SelectionContext } from '../contexts/SelectionContext';

const PathfindingToggle = () => {
  const { isPathfindingEnabled, togglePathfinding } = useContext(SelectionContext);

  return (
    <div className="pathfinding-toggle">
      <button
        className={`toggle-token ${isPathfindingEnabled ? 'active' : ''}`}
        onClick={togglePathfinding}
        data-tooltip="Toggle pathfinding mode"
      >
        Pathfinding/Gateways
      </button>
    </div>
  );
};

export default PathfindingToggle;
