import React, { useState, useContext } from 'react';
import { ChevronRight, ChevronLeft, Earth, Cloud } from 'lucide-react';
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

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { universeData, planetData, materials } = useContext(GraphContext);
  const { selectedSystem } = useContext(SelectionContext);
  const { searchMaterial } = useContext(SearchContext);

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

  const isHighlighted = (materialId) => {
    return searchMaterial && searchMaterial === materialId;
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
                      fontWeight: isHighlighted(resource.MaterialId) ? 'bold' : 'normal',
                      color: isHighlighted(resource.MaterialId) ? '#4a90e2' : 'inherit',
                      backgroundColor: isHighlighted(resource.MaterialId) ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
                      padding: '2px 5px',
                      borderRadius: '3px'
                    }}
                  >
                    <ResourceIcon type={resource.ResourceType} />
                    <span style={{ marginLeft: '5px', minWidth: '50px' }}>{materialsMap[resource.MaterialId]?.Ticker || 'Unknown'}</span>
                    <ConcentrationBar concentration={resource.Factor} />
                    <span style={{ marginLeft: '5px' }}>{(resource.Factor * 100).toFixed(2)}%</span>
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