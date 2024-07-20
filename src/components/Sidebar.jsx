import React, { useState, useContext } from 'react';
import { ChevronRight, ChevronLeft, Earth, Cloud, Thermometer, Gauge, Weight } from 'lucide-react';
import { GraphContext } from '../contexts/GraphContext';
import { SearchContext } from '../contexts/SearchContext';
import { SelectionContext } from '../contexts/SelectionContext';

const ResourceIcon = ({ type }) => {
  let icon = '❓';
  switch (type) {
    case 'MINERAL':
      icon = '🪨';
      break;
    case 'GASEOUS':
      icon = '💨';
      break;
    case 'LIQUID':
      icon = '💧';
      break;
    default:
      icon = '❓'; // Default case
      break;
  }
  return <span title={type}>{icon}</span>;
};

const PlanetTypeIcon = ({ isRocky }) => {
  const IconComponent = isRocky ? Earth : Cloud;
  return (
    <IconComponent
      size={18}
      color="#f7a600"
      strokeWidth={1.5}
      title={isRocky ? "Rocky Planet" : "Gas Giant"}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        width: '18px',
        height: '18px',
        color: '#f7a600', // Ensuring color is applied
        fill: 'none', // Ensure no fill is applied
        stroke: 'currentColor', // Use the color for stroke
      }}
    />
  );
};

const ConcentrationBar = ({ concentration }) => {
  const percentage = concentration * 100;
  const hue = (percentage / 100) * 120; // 0 is red, 120 is green
  const backgroundColor = `hsl(${hue}, 100%, 50%)`;

  return (
    <div className="concentration-bar-container" style={{ width: '100px', backgroundColor: '#ddd', height: '10px', marginLeft: '5px' }}>
      <div
        className="concentration-bar"
        style={{
          width: `${percentage}%`,
          backgroundColor,
          height: '100%',
        }}
      />
    </div>
  );
};

const PlanetConditionIcon = ({ condition, value, ticker }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  let IconComponent;
  let tooltipContent;
  let iconColor;

  const isLow = (condition, value) => {
    switch (condition) {
      case 'gravity':
        return value < 0.25;
      case 'temperature':
        return value < -25.0;
      case 'pressure':
        return value < 0.25;
      default:
        return false;
    }
  };

  switch (condition) {
    case 'gravity':
      IconComponent = Weight;
      tooltipContent = `Gravity: ${value.toFixed(2)} (${ticker})`;
      iconColor = isLow(condition, value) ? '#6f6ff7' : '#f54c4c'; // Blue for low, light red for high
      break;
    case 'temperature':
      IconComponent = Thermometer;
      tooltipContent = `Temperature: ${value.toFixed(2)}°C (${ticker})`;
      iconColor = isLow(condition, value) ? '#6f6ff7' : '#f54c4c';
      break;
    case 'pressure':
      IconComponent = Gauge;
      tooltipContent = `Pressure: ${value.toFixed(2)} atm (${ticker})`;
      iconColor = isLow(condition, value) ? '#6f6ff7' : '#f54c4c';
      break;
    default:
      return null;
  }

  return (
    <div
      className="planet-condition-icon"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <IconComponent
        size={16}
        color={iconColor}
        strokeWidth={1.5}
      />
      {showTooltip && (
        <div className="tooltip">
          {tooltipContent}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);
  const { universeData, planetData, materials } = useContext(GraphContext);
  const { selectedSystem } = useContext(SelectionContext);
  const { searchMaterial, searchResults } = useContext(SearchContext);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  var materialsMap = []
  // Convert array to object for easy lookup
  if (materials && materials.length > 0) {
    materialsMap = materials.reduce((acc, material) => {
    acc[material.MaterialId] = material;
    return acc;
  }, {});
  } else {
    console.warn("Materials data is not loaded or is empty.");
  }

  const planets = selectedSystem ? planetData[selectedSystem] : null;

  // Sort planets by PlanetNaturalId
  const sortedPlanets = planets ? [...planets].sort((a, b) => a.PlanetNaturalId.localeCompare(b.PlanetNaturalId)) : null;

  const isHighlighted = (materialId, planetId) => {
    const isPlanetInSearchResults = searchResults.some(result =>
      (result.type === 'planet' && result.id === planetId) ||
      (result.type === 'material' && result.planetId === planetId)
    );
    const isMaterialInSearchMaterial = searchMaterial.includes(materialId);
    return isMaterialInSearchMaterial && isPlanetInSearchResults;
  };

  const isConditionAbnormal = (condition, value) => {
    switch (condition) {
      case 'gravity':
        return value < 0.25 || value > 2.5;
      case 'temperature':
        return value < -25.0 || value > 75.0;
      case 'pressure':
        return value < 0.25 || value > 2.0;
      default:
        return false;
    }
  };

  const getConditionTicker = (condition, value) => {
    switch (condition) {
      case 'gravity':
        return value < 0.25 ? 'MGC' : 'BL';
      case 'temperature':
        return value < -25.0 ? 'INS' : 'TSH';
      case 'pressure':
        return value < 0.25 ? 'SEA' : 'HSE';
      default:
        return '';
    }
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isCollapsed ? <ChevronLeft /> : <ChevronRight />}
      </button>
      {!isCollapsed && (
        <div className="sidebar-content">
          <h2>{selectedSystem && universeData[selectedSystem] ? universeData[selectedSystem][0].Name : 'No System Selected'}</h2>
          {sortedPlanets && sortedPlanets.map((planet, index) => (
            <div key={planet.PlanetNaturalId} className="planet-info-sb">
              <h3>
                <PlanetTypeIcon isRocky={planet.Surface} />
                <span style={{ marginLeft: '5px' }}>{planet.PlanetName} ({planet.PlanetNaturalId})</span>
                {isConditionAbnormal('gravity', planet.Gravity) && (
                  <PlanetConditionIcon
                    condition="gravity"
                    value={planet.Gravity}
                    ticker={getConditionTicker('gravity', planet.Gravity)}
                  />
                )}
                {isConditionAbnormal('temperature', planet.Temperature) && (
                  <PlanetConditionIcon
                    condition="temperature"
                    value={planet.Temperature}
                    ticker={getConditionTicker('temperature', planet.Temperature)}
                  />
                )}
                {isConditionAbnormal('pressure', planet.Pressure) && (
                  <PlanetConditionIcon
                    condition="pressure"
                    value={planet.Pressure}
                    ticker={getConditionTicker('pressure', planet.Pressure)}
                  />
                )}
              </h3>
              <ul>
                {planet.Resources.map((resource, idx) => (
                  <li
                    key={idx}
                    className="resource-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '5px',
                      fontWeight: isHighlighted(resource.MaterialId, planet.PlanetNaturalId) ? 'bold' : 'normal',
                      color: isHighlighted(resource.MaterialId, planet.PlanetNaturalId) ? '#4a90e2' : 'inherit',
                      backgroundColor: isHighlighted(resource.MaterialId, planet.PlanetNaturalId) ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
                      padding: '2px 5px',
                      borderRadius: '3px'
                    }}
                  >
                    <ResourceIcon type={resource.ResourceType} />
                    <span style={{ marginLeft: '5px', minWidth: '50px' }}>{materialsMap[resource.MaterialId]?.Ticker || 'Unknown'}</span>
                    <ConcentrationBar concentration={resource.Factor} />
                    <span className="resource-percentage">{(resource.Factor * 100).toFixed(2)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;