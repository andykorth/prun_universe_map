import React, { useContext } from 'react';
import { SelectionContext } from '../contexts/SelectionContext';

const PathfindingToggle = () => {
  const { isPathfindingEnabled, togglePathfinding } = useContext(SelectionContext);

  return (
    <div className="pathfinding-toggle">
      <label>
        <input
          type="checkbox"
          checked={isPathfindingEnabled}
          onChange={togglePathfinding}
        />
        Enable Pathfinding
      </label>
    </div>
  );
};

export default PathfindingToggle;