import React, { useState, useContext } from 'react';
import { SearchContext } from '../contexts/SearchContext';

const SearchField = () => {
  const [notification, setNotification] = useState('');
  const { handleSystemSearch, systemSearchTerm, updateSystemSearchTerm } = useContext(SearchContext);

  const onSearch = (e) => {
    e.preventDefault();
    const result = handleSystemSearch(systemSearchTerm);
    if (result.length === 0) {
      setNotification('No matches found');
      setTimeout(() => setNotification(''), 3000); // Clear notification after 3 seconds
    } else {
      setNotification('');
    }
  };

  return (
    <div className="search-field">
      <form onSubmit={onSearch}>
        <input
          type="text"
          value={systemSearchTerm}
          onChange={(e) => updateSystemSearchTerm(e.target.value)}
          placeholder="Search system, planet..."
        />
        <button type="submit" className="search-button system-search">Search</button>
      </form>
      {notification && <div className="search-notification">{notification}</div>}
    </div>
  );
};

export default SearchField;