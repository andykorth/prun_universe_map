import React, { useState, useContext } from 'react';
import { SearchContext } from '../contexts/SearchContext';

const MaterialSearchField = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState('');
  const { handleSearch } = useContext(SearchContext);

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

  return (
    <div className="material-search-field">
      <form onSubmit={onSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search materials"
        />
        <button type="submit" className="search-button material-search">Search</button>
      </form>
      <span>{notification && <div className="search-notification">{notification}</div>}</span>
    </div>
  );
};

export default MaterialSearchField;