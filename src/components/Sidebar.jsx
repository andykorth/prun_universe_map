import React, { useState, useContext, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ChevronRight, ChevronLeft, Earth, Cloud, Thermometer, Gauge, Weight, Users } from 'lucide-react';
import { GraphContext } from '../contexts/GraphContext';
import { SearchContext } from '../contexts/SearchContext';
import { SelectionContext } from '../contexts/SelectionContext';
import { useCogcOverlay } from '../contexts/CogcOverlayContext';
import { cogcPrograms } from '../constants/cogcPrograms';

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

// Updated PlanetTypeIcon to show Tooltip with Type + CoGC
const PlanetTypeIcon = ({ isRocky, cogcProgram }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const IconComponent = isRocky ? Earth : Cloud;
  const typeText = isRocky ? "Rocky Planet" : "Gas Giant";

  // Helper to format program string
  const formatProgram = (prog) => {
    if (!prog) return '';
    return prog.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div 
      className="planet-condition-icon" // Reuse for relative positioning
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '5px' }}
    >
      <IconComponent
        size={18}
        color="#f7a600"
        strokeWidth={1.5}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          width: '18px',
          height: '18px',
          color: '#f7a600',
          fill: 'none',
          stroke: 'currentColor',
        }}
      />
      {showTooltip && (
        <div className="tooltip" style={{ minWidth: '120px' }}>
          <strong>{typeText}</strong>
          {cogcProgram && (
            <div style={{ marginTop: '5px', borderTop: '1px solid #555', paddingTop: '3px' }}>
              <span style={{ fontSize: '10px', color: '#aaa' }}>CoGC Program:</span><br/>
              <span style={{ color: '#f7a600' }}>{formatProgram(cogcProgram)}</span>
            </div>
          )}
        </div>
      )}
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

const WorkforceIcon = ({ planetId, populationData }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const iconRef = useRef(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, right: 0 });
  const data = populationData[planetId];

  // 1. If no data, render nothing (invisible)
  if (!data) return null;

  const tiers = ['Pioneer', 'Settler', 'Technician', 'Engineer', 'Scientist'];

  // 2. Calculate Totals & Status Color
  let totalOpenJobs = 0;
  let totalUnemployed = 0;

  tiers.forEach(tier => {
    const tierData = data.Workforce[tier];
    if (tierData) {
      totalOpenJobs += tierData.OpenJobs;
      totalUnemployed += tierData.Unemployed;
    }
  });

  const totalPop = tiers.reduce((sum, tier) => sum + (data.Workforce[tier]?.Population || 0), 0);
  
  // Logic: Do not display if population is less than 10
  if (totalPop <= 10) return null;

  let iconColor = '#888888'; // Default Grey (Balanced)
  if (totalOpenJobs > 0) {
    iconColor = '#f54c4c'; // Red (Shortage) - Priority 1
  } else if (totalUnemployed > 0) {
    iconColor = '#66ff66'; // Green (Surplus) - Priority 2
  }

  // 3. Calculate "Days Ago"
  const getAgeString = (timestamp) => {
    const diffMs = Date.now() - timestamp;
    // Convert to days: ms / 1000 / 60 / 60 / 24
    const days = diffMs / 86400000;
    
    if (days < 0.1) return "Just now";
    return `${days.toFixed(1)} days ago`;
  };

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.bottom + 5, 
        // Align the right edge of tooltip with right edge of icon
        right: window.innerWidth - rect.right 
      });
    }
    setShowTooltip(true);
  };

  return (
    <>
      <div
        ref={iconRef}
        className="planet-condition-icon"
        style={{ marginLeft: '8px', cursor: 'pointer' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <Users
          size={16}
          color={iconColor}
          strokeWidth={1.5}
        />
      </div>
      
      {showTooltip && ReactDOM.createPortal(
        <div className="tooltip" style={{ 
          minWidth: '230px', 
          textAlign: 'left', 
          backgroundColor: '#222', 
          border: '1px solid #444',
          zIndex: 2000,
          position: 'fixed',
          top: tooltipPos.top,
          right: tooltipPos.right,
          pointerEvents: 'none', // Prevents tooltip from interfering with mouse events if it overlaps
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
          {/* Header */}
          <div style={{ 
            borderBottom: '1px solid #444', 
            paddingBottom: '5px', 
            marginBottom: '5px', 
            fontSize: '11px', 
            color: '#aaa',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Population: {totalPop.toLocaleString()}</span>
            <span style={{ fontStyle: 'italic' }}>{getAgeString(data.Timestamp)}</span>
          </div>

          {/* Table Header */}
          <div style={{ display: 'flex', fontSize: '10px', color: '#888', marginBottom: '2px' }}>
            <span style={{ flex: 1 }}>Tier</span>
            <span style={{ width: '65px', textAlign: 'right' }}>Unemployed</span>
            <span style={{ width: '60px', textAlign: 'right' }}>Open Jobs</span>
          </div>

          {/* Rows */}
          {tiers.map(tier => {
            const wf = data.Workforce[tier];
            if (!wf || (wf.Population === 0 && wf.OpenJobs === 0)) return null;
            
            const hasUnemployment = wf.Unemployed > 0;
            const hasOpenJobs = wf.OpenJobs > 0;

            return (
              <div key={tier} style={{ display: 'flex', fontSize: '11px', marginBottom: '2px' }}>
                <span style={{ flex: 1, color: '#ddd' }}>{tier}</span>
                
                {/* Unemployed Column */}
                <span style={{ 
                  width: '65px', 
                  textAlign: 'right', 
                  color: hasUnemployment ? '#66ff66' : '#444',
                  fontWeight: hasUnemployment ? 'bold' : 'normal'
                }}>
                  {wf.Unemployed > 0 ? wf.Unemployed : '-'}
                </span>

                {/* Open Jobs Column */}
                <span style={{ 
                  width: '60px', 
                  textAlign: 'right', 
                  color: hasOpenJobs ? '#f54c4c' : '#444',
                  fontWeight: hasOpenJobs ? 'bold' : 'normal'
                }}>
                  {wf.OpenJobs > 0 ? wf.OpenJobs : '-'}
                </span>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
};

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);
  const { universeData, planetData, materials, populationData } = useContext(GraphContext);
  const { selectedSystem } = useContext(SelectionContext);
  const { searchMaterial, searchResults, isRelativeThreshold, isCompanySearch } = useContext(SearchContext);
  
  // Get Overlay Program from Context
  const { overlayProgram } = useCogcOverlay();
  const selectedProgramValue = cogcPrograms.find(program => program.display === overlayProgram)?.value;


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

  // Helper to extract the active CoGC from a planet object
  const getActiveCogc = (planet) => {
    if (!planet.COGCPrograms || planet.COGCPrograms.length === 0) return null;
    const sortedPrograms = [...planet.COGCPrograms].sort((a, b) => b.StartEpochMs - a.StartEpochMs);
    const relevantProgram = sortedPrograms[1] || sortedPrograms[0];
    return relevantProgram ? relevantProgram.ProgramType : null;
  };

  const isHighlighted = (materialId, planetId, planet) => {
    // 1. Search Result Highlight
    const isPlanetInSearchResults = searchResults.some(result =>
      (result.type === 'planet' && result.id === planetId) ||
      (result.type === 'material' && result.planetId === planetId) ||
      (result.type === 'company_base' && result.planetNaturalId === planetId)
    );
    const isMaterialInSearchMaterial = searchMaterial.includes(materialId);
    
    // 2. CoGC Overlay Highlight
    // If a program is selected, and this planet matches it, highlight it.
    let isCogcMatch = false;
    if (selectedProgramValue) {
        const activeCogc = getActiveCogc(planet);
        if (activeCogc === selectedProgramValue) {
            isCogcMatch = true;
        }
    }

    // Combine conditions
    if (isCogcMatch) return true;

    // Normal Search Logic
    return (isMaterialInSearchMaterial && isPlanetInSearchResults) ||
           (isCompanySearch && isPlanetInSearchResults);
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

  // Calculate max concentrations for each combination of MaterialId and ResourceType across the entire universe
  const maxConcentrations = useMemo(() => {
    const maxConc = {};

    Object.values(planetData).flat().forEach(planet => {
      planet.Resources.forEach(resource => {
        const key = `${resource.MaterialId}-${resource.ResourceType}`;
        if (!maxConc[key] || resource.Factor > maxConc[key]) {
          maxConc[key] = resource.Factor;
        }
      });
    });

    return maxConc;
  }, [planetData]);

  const ConcentrationBar = ({ concentration, materialId, resourceType }) => {
    const key = `${materialId}-${resourceType}`;
    const maxConcentration = maxConcentrations[key] || concentration;
    const percentage = isRelativeThreshold
      ? (concentration / maxConcentration) * 100
      : concentration * 100;
    const hue = (percentage / 100) * 120; // 0 is red, 120 is green
    const backgroundColor = `hsl(${hue}, 100%, 50%)`;

    return (
      <div className="concentration-bar-container-sb" style={{ width: '100px', backgroundColor: '#ddd', height: '10px', marginLeft: '5px' }}>
        <div
          className="concentration-bar-sb"
          style={{
            width: `${percentage}%`,
            backgroundColor,
            height: '100%',
          }}
        />
      </div>
    );
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isCollapsed ? <ChevronLeft /> : <ChevronRight />}
      </button>
      {!isCollapsed && (
        <div className="sidebar-content">
          <h2>{selectedSystem && universeData[selectedSystem] ? universeData[selectedSystem][0].Name : 'No System Selected'}</h2>
          {sortedPlanets && sortedPlanets.map((planet, index) => {
            const activeCogc = getActiveCogc(planet);
            const shouldHighlight = isHighlighted(null, planet.PlanetNaturalId, planet);

            return (
            <div key={planet.PlanetNaturalId} className={`planet-info-sb ${shouldHighlight ? 'highlighted' : ''}`}>
              <h3>
                <PlanetTypeIcon isRocky={planet.Surface} cogcProgram={activeCogc} />
                <span style={{ marginLeft: '5px' }}>
                  {planet.PlanetName}{' '}
                  (
                    <a
                      href={`https://prunplanner.org/plan/${planet.PlanetNaturalId}`}
                      className="planet-id-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {planet.PlanetNaturalId}
                    </a>
                  )
                </span>
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
                {populationData && (
                  <WorkforceIcon 
                    planetId={planet.PlanetNaturalId} 
                    populationData={populationData}
                  />
                )}
              </h3>
              <ul>
                {planet.Resources.map((resource, idx) => {
                  const key = `${resource.MaterialId}-${resource.ResourceType}`;
                  return (
                    <li
                      key={idx}
                      className="resource-item-sb"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '5px',
                        fontWeight: isHighlighted(resource.MaterialId, planet.PlanetNaturalId, planet) ? 'bold' : 'normal',
                        color: isHighlighted(resource.MaterialId, planet.PlanetNaturalId, planet) ? '#4a90e2' : 'inherit',
                        backgroundColor: isHighlighted(resource.MaterialId, planet.PlanetNaturalId, planet) ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
                        padding: '2px 5px',
                        borderRadius: '3px'
                      }}
                    >
                      <ResourceIcon type={resource.ResourceType} />
                      <span style={{ marginLeft: '5px', minWidth: '50px' }}>{materialsMap[resource.MaterialId]?.Ticker || 'Unknown'}</span>
                      <ConcentrationBar
                        concentration={resource.Factor}
                        materialId={resource.MaterialId}
                        resourceType={resource.ResourceType}
                      />
                      <span className="resource-percentage">
                        {isRelativeThreshold
                          ? ((resource.Factor / maxConcentrations[key]) * 100).toFixed(2)
                          : (resource.Factor * 100).toFixed(2)}%
                      </span>
                    </li>
                  );
                })}
              </ul>
              {isCompanySearch && isHighlighted(null, planet.PlanetNaturalId, planet) && (
                <div className="company-base-indicator">Company Base</div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Sidebar;