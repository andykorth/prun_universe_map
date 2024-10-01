import React, { useState, useContext } from 'react';
import { SearchContext } from '../contexts/SearchContext';

const SearchField = () => {
  const [notification, setNotification] = useState('');
  const {
    handleSystemSearch,
    handleCompanySearch,
    systemSearchTerm,
    companySearchTerm,
    updateSystemSearchTerm,
    updateCompanySearchTerm,
    isCompanySearch
  } = useContext(SearchContext);

  const onSearch = async (e) => {
    e.preventDefault();
    let result;
    if (isCompanySearch) {
      result = await handleCompanySearch(companySearchTerm);
    } else {
      result = handleSystemSearch(systemSearchTerm);
    }
    if (result.length === 0) {
      setNotification('No matches found');
      setTimeout(() => setNotification(''), 3000);
    } else {
      setNotification('');
    }
  };

  return (
    <div className="search-field">
      <form onSubmit={onSearch}>
        <input
          type="text"
          value={isCompanySearch ? companySearchTerm : systemSearchTerm}
          onChange={(e) => isCompanySearch ? updateCompanySearchTerm(e.target.value) : updateSystemSearchTerm(e.target.value)}
          placeholder={isCompanySearch ? "Search company code..." : "Search system, planet..."}
        />
        <button type="submit" className="search-button system-search">Search</button>
      </form>
      {notification && <div className="search-notification">{notification}</div>}
    </div>
  );
};

export default SearchField;