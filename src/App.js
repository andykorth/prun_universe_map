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
          <h1>Taiyi's Prosperous Universe Map</h1>
        </div>
        
        <div className="header-center">
            {activeMode === MAP_MODES.STANDARD ? <StandardControls /> : <GatewayControls />}
        </div>

        <div className="header-right">
          <div className="global-tools">
             <button 
                className={`toggle-token mode-switch-btn ${activeMode === MAP_MODES.GATEWAY ? 'active' : ''}`}
                onClick={toggleMode}
                title="Toggle Gateway Planning Mode"
             >
                {activeMode === MAP_MODES.STANDARD ? 'Gateway Planner' : 'Exit Planner'}
             </button>
             
             <div className="tool-separator"></div>

             <InfoTooltip />
             <div className="mini-stack">
                <div className="pathfinding-toggle-container">
                    <PathfindingToggle />
                </div>
                <div className="pathfinding-toggle-container">
                    <MeteorDensityToggle />
                </div>
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