import React, { useContext } from 'react';
import { SearchContext } from '../contexts/SearchContext';

const ResourceThresholdFilter = () => {
  const { resourceThreshold, setResourceThreshold } = useContext(SearchContext);

  const handleThresholdChange = (event) => {
    const value = parseFloat(event.target.value);
    setResourceThreshold(isNaN(value) ? 0 : value);
  };

  return (
    <div className="filter-category">
      <h4>Resource Min</h4>
      <input
        type="number"
        min="0"
        max="1"
        step="0.05"
        value={resourceThreshold}
        onChange={handleThresholdChange}
        className="resource-threshold-input"
      />
      <span className="resource-threshold-value">{(resourceThreshold * 100).toFixed(0)}%</span>
    </div>
  );
};

export default ResourceThresholdFilter;