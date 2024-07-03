import React, { useState, useContext } from 'react';
import { SearchContext } from '../contexts/SearchContext';

const MaterialSearchField = () => {
  const [notification, setNotification] = useState('');
  const { handleMaterialSearch, materialSearchTerm, updateMaterialSearchTerm } = useContext(SearchContext);

  const onSearch = (e) => {
    e.preventDefault();
    const result = handleMaterialSearch(materialSearchTerm);
    if (result.length === 0) {
      setNotification('No matches found');
      setTimeout(() => setNotification(''), 3000); // Clear notification after 3 seconds
    } else {
      setNotification('');
    }
  };

  return (
    <div className="material-search-field">
      <form onSubmit={onSearch}>
        <input
          type="text"
          value={materialSearchTerm}
          onChange={(e) => updateMaterialSearchTerm(e.target.value)}
          placeholder="Search resource, ticker..."
        />
        <button type="submit" className="search-button material-search">Search</button>
      </form>
      {notification && <div className="search-notification">{notification}</div>}
    </div>
  );
};

export default MaterialSearchField;