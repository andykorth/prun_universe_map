import React from 'react';
import UniverseMap from './components/UniverseMap';
import Sidebar from './components/Sidebar';
import PathfindingToggle from './components/PathfindingToggle';
import SearchField from './components/SearchField';
import { GraphProvider } from './contexts/GraphContext';
import { SelectionProvider } from './contexts/SelectionContext';
import { SearchProvider } from './contexts/SearchContext';
import './App.css';
import logo from './logo.png';

const App = () => {
  return (
    <GraphProvider>
      <SelectionProvider>
        <SearchProvider>
          <div className="App">
            <header className="App-header">
              <img src={logo} alt="Logo" className="App-logo" />
              <h1>Taiyi's Prosperous Universe Map</h1>
              <div className="controls">
                <SearchField />
                <PathfindingToggle />
              </div>
            </header>
            <div className="main-content">
              <UniverseMap />
              <Sidebar />
            </div>
          </div>
        </SearchProvider>
      </SelectionProvider>
    </GraphProvider>
  );
};

export default App;