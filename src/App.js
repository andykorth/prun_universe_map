import React, { useState } from 'react';
import UniverseMap from './components/UniverseMap';
import Sidebar from './components/Sidebar';
import PathfindingToggle from './components/PathfindingToggle';
import SearchField from './components/SearchField';
import MaterialSearchField from './components/MaterialSearchField';
import FilterCategories from './components/FilterCategories';
import InfoTooltip from './components/InfoTooltip';
import { GraphProvider } from './contexts/GraphContext';
import { SelectionProvider } from './contexts/SelectionContext';
import { SearchProvider, SearchContext } from './contexts/SearchContext';
import { CogcOverlayProvider } from './contexts/CogcOverlayContext';
import './App.css';
import './components/FilterCategories.css';
import logo from './logo.png';

const App = () => {
  const [showFilters, setShowFilters] = useState(window.innerWidth > 768);

  return (
    <GraphProvider>
      <SelectionProvider>
        <SearchProvider>
          <CogcOverlayProvider>
            <AppContent
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />
          </CogcOverlayProvider>
        </SearchProvider>
      </SelectionProvider>
    </GraphProvider>
  );
};

const AppContent = ({ showFilters, setShowFilters }) => {
  const { clearSearch } = React.useContext(SearchContext);
  const { showMySystems } = React.useContext(SearchContext);
  // const { clearGateways } = React.useContext();

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="App-logo" />
          <div style={{margin: 0}}>
          <h2 style={{margin: 3}}>OOG Capital Management</h2>
          <h5 style={{margin: 3}}>Map by Taiyi</h5>
          </div>
        </div>
        <div className="header-center">
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {showFilters && <FilterCategories />}
        </div>
        <div className="header-right">
          <MaterialSearchField />
          <SearchField />
        </div>
        <div className="header-info">
          <button className="clear-button" onClick={showMySystems}>Show OOG</button>
          <button className="clear-button" onClick={clearSearch}>Clear Search</button>
          <InfoTooltip />
          <div className="pathfinding-toggle-container">
            <PathfindingToggle />
          </div>
          {/* <button className="clear-button" onClick={clearGateways}>Clear Gateways</button> */}
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