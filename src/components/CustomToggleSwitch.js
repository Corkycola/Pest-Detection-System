import React from 'react';
import './CustomToggleSwitch.css';

const CustomToggleSwitch = ({ isOn, handleToggle }) => {
    return (
        <div className="toggle-container">
            <input
                type="checkbox"
                id="toggle"
                className="toggle-checkbox"
                checked={isOn}
                onChange={handleToggle}
            />
            <label htmlFor="toggle" className="toggle-label">
                <div>Detection Graph</div>
                <div>Detection Logs</div>
            </label>
        </div>
    );
};

export default CustomToggleSwitch;
