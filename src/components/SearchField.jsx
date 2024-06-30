import React, { useState, useContext } from 'react';
import { SearchContext } from '../contexts/SearchContext';

const SearchField = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState('');
  const { handleSearch, clearSearch } = useContext(SearchContext);

  const onSearch = (e) => {
    e.preventDefault();
    const result = handleSearch(searchTerm);
    if (result.length === 0) {
      setNotification('No matches found');
      setTimeout(() => setNotification(''), 3000); // Clear notification after 3 seconds
    } else {
      setNotification('');
    }
  };

  const onClear = () => {
    setSearchTerm('');
    clearSearch();
    setNotification('');
  };

  return (
    <div className="search-field">
      <form onSubmit={onSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search system, planet..."
        />
        <button type="submit">Search</button>
        <button type="button" onClick={onClear}>Clear</button>
      </form>
      {notification && <div className="search-notification">{notification}</div>}
    </div>
  );
};

export default SearchField;