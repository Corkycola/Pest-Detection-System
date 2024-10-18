import React from 'react';

const DropdownMenu = ({ selectedPanel, setSelectedPanel }) => {
    return (
        <div className="dropdown-menu">
            <label htmlFor="panel-select">Select Data: </label>
            <select id="panel-select" value={selectedPanel} onChange={(e) => setSelectedPanel(e.target.value)}>
                <option value="detections">Detections</option>
                <option value="cropData">Upload Image</option>
            </select>
        </div>
    );
};

export default DropdownMenu;
