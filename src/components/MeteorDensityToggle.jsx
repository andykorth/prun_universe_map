import React from 'react';
import { useDataPoints } from '../contexts/DataPointContext';

const MeteorDensityToggle = () => {
  const { isOverlayVisible, toggleOverlayVisibility } = useDataPoints();

  return (
    <div className="meteor-density-toggle">
      <button
        className={`toggle-token ${isOverlayVisible ? 'active' : ''}`}
        onClick={toggleOverlayVisibility}
        data-tooltip="Toggle overlay with meteor density and system names"
      >
      </button>
    </div>
  );
};

export default MeteorDensityToggle;