import React, { useState } from 'react';
import UniverseMap from './components/UniverseMap';
import Sidebar from './components/Sidebar';
import PathfindingToggle from './components/PathfindingToggle';
import MeteorDensityToggle from './components/MeteorDensityToggle';
import InfoTooltip from './components/InfoTooltip';
import StandardControls from './components/StandardControls';
import GatewayControls from './components/GatewayControls';
import { GraphProvider } from './contexts/GraphContext';
import { SelectionProvider } from './contexts/SelectionContext';
import { SearchProvider } from './contexts/SearchContext';
import { CogcOverlayProvider } from './contexts/CogcOverlayContext';
import { DataPointProvider } from './contexts/DataPointContext';
import { MapModeProvider, useMapMode, MAP_MODES } from './contexts/MapModeContext';
import logo from './logo.png';
import './App.css';
import './components/FilterCategories.css';

const App = () => {
  return (
    <GraphProvider>
      <SelectionProvider>
        <SearchProvider>
          <CogcOverlayProvider>
            <DataPointProvider>
              <MapModeProvider>
                 <AppContent />
              </MapModeProvider>
            </DataPointProvider>
          </CogcOverlayProvider>
        </SearchProvider>
      </SelectionProvider>
    </GraphProvider>
  );
};

const AppContent = () => {
  const { activeMode, toggleMode } = useMapMode();

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="App-logo" />
          <div style={{margin: 0}}>
          <h2 style={{margin: 3}}>OOG Capital Management</h2>
          <h5 style={{margin: 3}}>Original Map is by Taiyi (<a href="https://universemap.taiyibureau.de/">official</a>) (<a href="https://github.com/andykorth/prun_universe_map">src</a></h5>
          </div>
        </div>
        
        <div className="header-center">
            {activeMode === MAP_MODES.STANDARD ? <StandardControls /> : <GatewayControls />}
        </div>

        <div className="header-right">
             <InfoTooltip />
             <div className="toggle-stack-container">
                {/* Gateway Toggle (Top) */}
                <div className="pathfinding-toggle-container">
                    <button 
                        className={`toggle-token gateway-toggle-btn ${activeMode === MAP_MODES.GATEWAY ? 'active' : ''}`}
                        onClick={toggleMode}
                        data-tooltip="Toggle Gateway Planning Mode"
                    >
                        Gateway
                    </button>
                </div>

                {/* Pathfinding Toggle (Middle) */}
                <div className="pathfinding-toggle-container">
                    <PathfindingToggle />
                </div>

                {/* Data Toggle (Bottom) */}
                <div className="pathfinding-toggle-container">
                    <MeteorDensityToggle />
                </div>
             </div>
        </div>
      </header>
      
      <div className="main-content">
        <UniverseMap />
        <Sidebar />
      </div>
    </div>
  );
};

export default App;