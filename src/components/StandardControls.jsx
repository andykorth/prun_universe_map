import React, { useState, useContext } from 'react';
import FilterCategories from './FilterCategories';
import MaterialSearchField from './MaterialSearchField';
import SearchField from './SearchField';
import { SearchContext } from '../contexts/SearchContext';

const StandardControls = () => {
  const [showFilters, setShowFilters] = useState(window.innerWidth > 768);
  const { clearSearch, toggleCompanySearch, isCompanySearch } = useContext(SearchContext);

  return (
    <div className="standard-controls-container" style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
      
      {/* Mimics original .header-center */}
      <div className="std-center-group">
         <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {showFilters && <FilterCategories />}
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Mimics original .header-right */}
          <div className="std-right-group">
            <MaterialSearchField />
            <SearchField />
          </div>

          {/* Mimics original .header-buttons */}
          <div className="std-buttons-group">
             <button className="clear-button" onClick={clearSearch}>Clear</button>
             <button
                onClick={toggleCompanySearch}
                className={`toggle-token company-search-toggle ${isCompanySearch ? 'active' : ''}`}
                data-tooltip={"Enter company code to search base data using FIO"}
             >
             Company
             </button>
          </div>
      </div>
    </div>
  );
};

export default StandardControls;