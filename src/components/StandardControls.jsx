import React, { useState, useContext } from 'react';
import FilterCategories from './FilterCategories';
import MaterialSearchField from './MaterialSearchField';
import SearchField from './SearchField';
import { SearchContext } from '../contexts/SearchContext';

const StandardControls = () => {
  const [showFilters, setShowFilters] = useState(window.innerWidth > 768);
  const { clearSearch, toggleCompanySearch, isCompanySearch } = useContext(SearchContext);

  return (
    <div className="standard-controls" style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
      <div className="controls-row top-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '5px', flexWrap: 'wrap' }}>
         <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <div className="search-group" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            <MaterialSearchField />
            <SearchField />
          </div>

          <div className="button-group" style={{ display: 'flex', alignItems: 'center' }}>
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
      
      {showFilters && (
        <div className="controls-row bottom-row" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
           <FilterCategories />
        </div>
      )}
    </div>
  );
};

export default StandardControls;