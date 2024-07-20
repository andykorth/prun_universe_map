import React, { useContext, useState } from 'react';
import { SearchContext } from '../contexts/SearchContext';
import { useCogcOverlay } from '../contexts/CogcOverlayContext';
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


const CogcFilter = ({ active, program, onToggle, onProgramChange }) => {
  const { setOverlayProgram } = useCogcOverlay();

  const handleProgramChange = (value) => {
    onProgramChange(value);
    if (value !== 'ALL' && value !== null) {
      setOverlayProgram(value);
    } else {
      setOverlayProgram(null);
    }
  };

  return (
    <div className="filter-category">
      <h4>Cogc Program</h4>
      <div className="cogc-filter-controls">
        <ToggleToken
          label="Cogc"
          active={active}
          onClick={onToggle}
          tooltip="Toggle Cogc Program filter, dropdown activates an overlay"
        />
        <select
          value={program}
          onChange={(e) => handleProgramChange(e.target.value)}
        >
          {cogcPrograms.map((program) => (
            <option key={program.value} value={program.display}>
              {program.display}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const FilterCategories = () => {
  const { filters, updateFilters } = useContext(SearchContext);
  const [cogcActive, setCogcActive] = useState(false);
  const { overlayProgram } = useCogcOverlay();

  const handleChange = (category, option) => {
    const newFilters = {
      ...filters,
      [category]: filters[category].includes(option)
        ? filters[category].filter(item => item !== option)
        : [...filters[category], option]
    };
    updateFilters(newFilters);
  };

  const handleCogcToggle = (value) => {
    setCogcActive(!cogcActive);
    if (!cogcActive) {
      // Find the corresponding value for the current overlayProgram
      const programObject = cogcPrograms.find(program => program.display === overlayProgram);
      let programValue;

      if (programObject) {
        programValue = programObject.value;
      } else if (overlayProgram === null || overlayProgram === undefined) {
        programValue = 'ALL'; // Default to 'ALL' if no overlay program is set
      } else {
        console.warn(`No matching program found for: ${overlayProgram}`);
        programValue = 'ALL'; // Default to 'ALL' if no match is found
      }
      updateFilters({ ...filters, cogcProgram: [programValue] });
    } else {
      updateFilters({ ...filters, cogcProgram: [] });
    }
  };

  const handleCogcProgramChange = (value) => {
      const valueToSet = cogcPrograms.find(program => program.display === value);
      updateFilters({ ...filters, cogcProgram: [valueToSet.value] });
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
      <CogcFilter
        active={cogcActive}
        //program={filters.cogcProgram[0] || ''}
        onToggle={handleCogcToggle}
        onProgramChange={handleCogcProgramChange}
      />
    </div>
  );
};

export default FilterCategories;