import React, { useContext, useState } from 'react';
import { SearchContext } from '../contexts/SearchContext';
import { cogcPrograms } from '../constants/cogcPrograms';

const ToggleToken = ({ label, active, onClick, tooltip }) => (
  <button
    className={`toggle-token ${active ? 'active' : ''}`}
    onClick={onClick}
    data-tooltip={tooltip}
  >
    {label}
  </button>
);

const FilterCategory = ({ title, options, mouseoverText, selectedOptions, onChange }) => (
  <div className="filter-category">
    <h4>{title}</h4>
    <div className="toggle-group">
      {options.map((option, index) => (
        <ToggleToken
          key={option}
          label={option}
          active={selectedOptions.includes(option)}
          onClick={() => onChange(option)}
          tooltip={mouseoverText[index] || option}
        />
      ))}
    </div>
  </div>
);

const CoGCFilter = ({ active, program, onToggle, onProgramChange }) => (
  <div className="filter-category">
    <h4>CoGC Program</h4>
    <ToggleToken
      label="CoGC"
      active={active}
      onClick={onToggle}
      tooltip="Toggle CoGC Program filter"
    />
    {active && (
      <select value={program} onChange={(e) => onProgramChange(e.target.value)}>
        {cogcPrograms.map((program) => (
          <option key={program.value} value={program.value}>
            {program.display}
          </option>
        ))}
      </select>
    )}
  </div>
);

const FilterCategories = () => {
  const { filters, updateFilters } = useContext(SearchContext);
  const [cogcActive, setCogcActive] = useState(false);

  const handleChange = (category, option) => {
    const newFilters = {
      ...filters,
      [category]: filters[category].includes(option)
        ? filters[category].filter(item => item !== option)
        : [...filters[category], option]
    };
    updateFilters(newFilters);
  };

  const handleCoGCToggle = () => {
    setCogcActive(!cogcActive);
    if (!cogcActive) {
      updateFilters({ ...filters, cogcProgram: [cogcPrograms[0].value] });
    } else {
      updateFilters({ ...filters, cogcProgram: [] });
    }
  };

  const handleCoGCProgramChange = (value) => {
    updateFilters({ ...filters, cogcProgram: [value] });
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
      <CoGCFilter
        active={cogcActive}
        program={filters.cogcProgram[0] || ''}
        onToggle={handleCoGCToggle}
        onProgramChange={handleCoGCProgramChange}
      />
    </div>
  );
};

export default FilterCategories;