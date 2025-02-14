import React, { useState } from 'react';
import UniverseMap from './components/UniverseMap';
import Sidebar from './components/Sidebar';
import PathfindingToggle from './components/PathfindingToggle';
import MeteorDensityToggle from './components/MeteorDensityToggle';
import SearchField from './components/SearchField';
import MaterialSearchField from './components/MaterialSearchField';
import FilterCategories from './components/FilterCategories';
import InfoTooltip from './components/InfoTooltip';
import { GraphProvider } from './contexts/GraphContext';
import { SelectionProvider } from './contexts/SelectionContext';
import { SearchProvider, SearchContext } from './contexts/SearchContext';
import { CogcOverlayProvider } from './contexts/CogcOverlayContext';
import { DataPointProvider } from './contexts/DataPointContext';
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
            <DataPointProvider>
              <AppContent
                showFilters={showFilters}
                setShowFilters={setShowFilters}
              />
            </DataPointProvider>
          </CogcOverlayProvider>
        </SearchProvider>
      </SelectionProvider>
    </GraphProvider>
  );
};

const AppContent = ({ showFilters, setShowFilters }) => {
  const { clearSearch, isCompanySearch, toggleCompanySearch } = React.useContext(SearchContext);

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="App-logo" />
          <h1>Taiyi's Prosperous Universe Map</h1>
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
        <div className="header-buttons">
          <button className="clear-button" onClick={clearSearch}>Clear</button>
          <button
            onClick={toggleCompanySearch}
            className={`toggle-token company-search-toggle ${isCompanySearch ? 'active' : ''}`}
            data-tooltip={"Enter company code to search base data using FIO"}
          >
          Company
          </button>
        </div>
        <div className="header-info">
          <InfoTooltip />
            <div className="toggle-stack-container">
            <div className="pathfinding-toggle-container">
              <PathfindingToggle />
            </div>
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