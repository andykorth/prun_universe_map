import React, { useContext } from 'react';
import { SearchContext } from '../contexts/SearchContext';

const FilterCategory = ({ title, options, mouseoverText, selectedOptions, onChange }) => (
  <div className="filter-category">
    <h4>{title}</h4>
    <div className="checkbox-group">
      {options.map((option, index) => (
        <label
          key={option}
          className="checkbox-label"
          data-tooltip={mouseoverText[index] || option}
        >
          <input
            type="checkbox"
            checked={selectedOptions.includes(option)}
            onChange={() => onChange(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  </div>
);

const FilterCategories = () => {
  const { filters, updateFilters } = useContext(SearchContext);

  const handleChange = (category, option) => {
    const newFilters = {
      ...filters,
      [category]: filters[category].includes(option)
        ? filters[category].filter(item => item !== option)
        : [...filters[category], option]
    };
    updateFilters(newFilters);
  };

  return (
    <div className="filter-categories">
      <FilterCategory
        title="Planet Type"
        options={['Rocky', 'Gaseous']}
        mouseoverText={['MCG', 'AEF']}
        selectedOptions={filters.planetType}
        onChange={option => handleChange('planetType', option)}
      />
      <FilterCategory
        title="Gravity"
        options={['Low', 'High']}
        mouseoverText={['MGC', 'BL']}
        selectedOptions={filters.gravity}
        onChange={option => handleChange('gravity', option)}
      />
      <FilterCategory
        title="Temperature"
        options={['Low', 'High']}
        mouseoverText={['INS', 'TSH']}
        selectedOptions={filters.temperature}
        onChange={option => handleChange('temperature', option)}
      />
      <FilterCategory
        title="Pressure"
        options={['Low', 'High']}
        mouseoverText={['SEA', 'HSE']}
        selectedOptions={filters.pressure}
        onChange={option => handleChange('pressure', option)}
      />
    </div>
  );
};

export default FilterCategories;