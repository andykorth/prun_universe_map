import React from 'react';
import { useMapMode, MAP_MODES } from '../contexts/MapModeContext';
import { MousePointer2, Route, Plane } from 'lucide-react'; // Example icons

const ModeSwitcher = () => {
  const { activeMode, setActiveMode } = useMapMode();

  return (
    <div className="mode-switcher">
      <button 
        className={`mode-btn ${activeMode === MAP_MODES.EXPLORE ? 'active' : ''}`}
        onClick={() => setActiveMode(MAP_MODES.EXPLORE)}
        title="Explore Mode"
      >
        <MousePointer2 size={16} />
        <span>Explore</span>
      </button>
      
      <button 
        className={`mode-btn ${activeMode === MAP_MODES.NAVIGATION ? 'active' : ''}`}
        onClick={() => setActiveMode(MAP_MODES.NAVIGATION)}
        title="Navigation (Pathfinding)"
      >
        <Route size={16} />
        <span>Nav</span>
      </button>
      
      <button 
        className={`mode-btn ${activeMode === MAP_MODES.GATEWAY ? 'active' : ''}`}
        onClick={() => setActiveMode(MAP_MODES.GATEWAY)}
        title="Gateway Planning"
      >
        <Plane size={16} /> {/* Or a Gateway Icon */}
        <span>Gateway</span>
      </button>
    </div>
  );
};

export default ModeSwitcher;