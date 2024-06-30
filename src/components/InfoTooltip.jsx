import React, { useState } from 'react';
import { Info, BadgeCent, Globe, Truck, BookOpen, Anchor, Earth, Cloud } from 'lucide-react';

const InfoTooltip = () => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  return (
    <div className="info-tooltip-container" style={{ position: 'relative' }}>
      <Info
        size={24}
        color="#f7a600"
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
      />
      {isTooltipVisible && (
        <div className="tooltip" style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          backgroundColor: '#333',
          color: 'white',
          padding: '10px',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          width: '300px',
          zIndex: 1000,
          border: '2px solid #222222',
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Symbol Legend</h4>
          <h5 style={{ margin: '10px 0 5px 0' }}>Planet Types:</h5>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            <li><Earth size={16} style={{marginRight: '5px', color: '#f7a600'}} /> Rocky Planet</li>
            <li><Cloud size={16} style={{marginRight: '5px', color: '#f7a600'}} /> Gas Giant</li>
          </ul>
          <h5 style={{ margin: '10px 0 5px 0' }}>Resources:</h5>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            <li>🪨 - Mineral resource</li>
            <li>💨 - Gaseous resource</li>
            <li>💧 - Liquid resource</li>
          </ul>
          <h5 style={{ margin: '10px 0 5px 0' }}>Facilities:</h5>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            <li><BadgeCent size={16} style={{marginRight: '5px', color: '#f7a600'}} /> - Local Market</li>
            <li><Globe size={16} style={{marginRight: '5px', color: '#f7a600'}} /> - Chamber of Commerce</li>
            <li><Truck size={16} style={{marginRight: '5px', color: '#f7a600'}} /> - Warehouse</li>
            <li><BookOpen size={16} style={{marginRight: '5px', color: '#f7a600'}} /> - Administration Center</li>
            <li><Anchor size={16} style={{marginRight: '5px', color: '#f7a600'}} /> - Shipyard</li>
          </ul>
          <h5 style={{ margin: '10px 0 5px 0' }}>Planet Tiers:</h5>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            <li>★★★ - Tier 1: No special materials required</li>
            <li>★★☆ - Tier 2: Requires SEA</li>
            <li>★☆☆ - Tier 3: Requires MGC, BL, HSE, or INS</li>
            <li>☆☆☆ - Tier 4: Requires TSH</li>
          </ul>
          <p style={{ margin: '10px 0 0 0' }}>
            Higher tier planets require more advanced materials to establish bases. Tier is determined by the most advanced material required.
          </p>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;