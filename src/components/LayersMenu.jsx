import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import MeteorDensityToggle from './MeteorDensityToggle';
// Import other visual toggles here

const LayersMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="layers-menu-container">
      <button 
        className={`layers-btn ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        title="Map Layers"
      >
        <Layers size={20} />
      </button>
      
      {isOpen && (
        <div className="layers-dropdown">
           <h4>Overlays</h4>
           <div className="layer-item">
             <MeteorDensityToggle /> {/* Refactor this component to lose its wrapper div if needed */}
           </div>
           {/* Add Future "Show Existing Gateways" toggle here */}
           
           {/* You could even move the CoGC dropdown here! */}
        </div>
      )}
    </div>
  );
};

export default LayersMenu;