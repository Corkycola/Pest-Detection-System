import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { db } from '../firebase/firebase';
import { ref, onValue } from 'firebase/database';
import './UserDetections.css';
import VisualizationPanel from './VisualizationPanel';
import DropdownMenu from './DropdownMenu';
import CustomToggleSwitch from './CustomToggleSwitch';

const UserDetections = () => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [detections, setDetections] = useState([]);
    const [cropData, setCropData] = useState([]);
    const [selectedPanel, setSelectedPanel] = useState('detections');
    const [modalData, setModalData] = useState(null);
    const [graphType, setGraphType] = useState('pie');
    const [xAxisType, setXAxisType] = useState('day');
    const [showStackedBar, setShowStackedBar] = useState(false);
    const [showBarChart, setShowBarChart] = useState(false);
    const [showLine, setShowLine] = useState(false);
    const [showCropArea, setShowCropArea] = useState(false);
    const [showPest, setShowPest] = useState(true);
    const [showGraph, setShowGraph] = useState(location.state?.showLogs ? false : true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('descending'); // State to track sort order
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchDetections = async () => {
            if (currentUser) {
                const dbRef = ref(db, `users/${currentUser.uid}/detections`);
                onValue(dbRef, (snapshot) => {
                    if (snapshot.exists()) {
                        let detectionsList = Object.values(snapshot.val());
                        // Apply sorting based on sortOrder state
                        detectionsList = detectionsList.sort((a, b) => {
                            return sortOrder === 'ascending' ?
                                new Date(a.timestamp) - new Date(b.timestamp) :
                                new Date(b.timestamp) - new Date(a.timestamp);
                        });
                        setDetections(detectionsList);
                    } else {
                        console.log("No data available");
                    }
                });
            }
        };

        const fetchCropData = async () => {
            const dbRef = ref(db, `cropData`);
            onValue(dbRef, (snapshot) => {
                if (snapshot.exists()) {
                    const cropDataList = Object.values(snapshot.val()).filter(crop => crop.uid === currentUser.uid);
                    cropDataList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by timestamp
                    setCropData(cropDataList);
                } else {
                    console.log("No data available");
                }
            });
        };

        fetchDetections();
        fetchCropData();
    }, [currentUser, sortOrder]);

    useEffect(() => {
        if (graphType === 'time-series') {
            setShowPest(true);
            setShowCropArea(false);
            setShowStackedBar(true);
            setShowBarChart(false);
            setShowLine(true);
        }
    }, [graphType]);

    useEffect(() => {
        setCurrentPage(1); // Reset to the first page whenever the selected panel changes
    }, [selectedPanel]);

    const handleDoubleClickPest = (pestName) => {
        navigate('/user-pestwiki', { state: { pestName } });
    };

    const openModal = (data) => {
        setModalData(data);
    };

    const closeModal = () => {
        setModalData(null);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = selectedPanel === 'detections'
        ? detections.slice(indexOfFirstItem, indexOfLastItem)
        : cropData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPagination = () => {
        const pageNumbers = [];
        const totalItems = selectedPanel === 'detections' ? detections.length : cropData.length;

        for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
            pageNumbers.push(i);
        }

        return (
            <nav>
                <ul className="pagination">
                    {pageNumbers.map(number => (
                        <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
                            <a onClick={() => paginate(number)} href="#!" className="page-link">
                                {number}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        );
    };

    const handleRadioChange = (event) => {
        const { name, checked } = event.target;
        if (name === 'cropArea') {
            setShowCropArea(checked);
            setShowPest(false);
        } else if (name === 'pest') {
            setShowPest(checked);
            setShowCropArea(false);
        }
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        if (name === 'showBarChart') {
            setShowBarChart(checked);
            setShowStackedBar(!checked);
        } else if (name === 'showStackedBar') {
            setShowStackedBar(checked);
            setShowBarChart(!checked);
        } else if (name === 'showLine') {
            setShowLine(checked);
        }
    };

    return (
        <div className="container">
            <CustomToggleSwitch isOn={!showGraph} handleToggle={() => setShowGraph(!showGraph)} />
            {showGraph ? (
                <div className="main-panel">
                    <div className="panel">
                        <div className="controls">
                            <label htmlFor="graph-type">Graph Type: </label>
                            <select id="graph-type" value={graphType} onChange={(e) => setGraphType(e.target.value)}>
                                <option value="pie">Pie Chart</option>
                                <option value="time-series">Time Series</option>
                            </select>
                        </div>
                        <div className="controls">
                            {graphType === 'pie' && (
                                <label htmlFor="show-crop-area">
                                    <input
                                        type="checkbox"
                                        id="show-crop-area"
                                        checked={showCropArea}
                                        onChange={(e) => setShowCropArea(e.target.checked)}
                                    />
                                    Crop Area
                                </label>
                            )}
                            {graphType === 'time-series' && (
                                <>
                                    <label htmlFor="x-axis-type">Time (X-Axis): </label>
                                    <select id="x-axis-type" value={xAxisType} onChange={(e) => setXAxisType(e.target.value)}>
                                        <option value="day">Day</option>
                                        <option value="month">Month</option>
                                    </select>
                                    <label htmlFor="show-pest">
                                        <input
                                            type="radio"
                                            id="show-pest"
                                            name="pest"
                                            checked={showPest}
                                            onChange={handleRadioChange}
                                        />
                                        Pest
                                    </label>
                                    <label htmlFor="show-crop-area">
                                        <input
                                            type="radio"
                                            id="show-crop-area"
                                            name="cropArea"
                                            checked={showCropArea}
                                            onChange={handleRadioChange}
                                        />
                                        Crop Area
                                    </label>
                                    <label htmlFor="show-bar-chart">
                                        <input
                                            type="checkbox"
                                            id="show-bar-chart"
                                            name="showBarChart"
                                            checked={showBarChart}
                                            onChange={handleCheckboxChange}
                                        />
                                        Bar Chart
                                    </label>
                                    <label htmlFor="show-stacked-bar">
                                        <input
                                            type="checkbox"
                                            id="show-stacked-bar"
                                            name="showStackedBar"
                                            checked={showStackedBar}
                                            onChange={handleCheckboxChange}
                                        />
                                        Stacked Bar Chart
                                    </label>
                                    <label htmlFor="show-line">
                                        <input
                                            type="checkbox"
                                            id="show-line"
                                            checked={showLine}
                                            disabled={!(showCropArea || showPest)}
                                            onChange={(e) => setShowLine(e.target.checked)}
                                        />
                                        Line
                                    </label>
                                </>
                            )}
                        </div>
                        <VisualizationPanel
                            detections={detections}
                            graphType={graphType}
                            xAxisType={xAxisType}
                            showStackedBar={showStackedBar}
                            showBarChart={showBarChart}
                            showLine={showLine}
                            showCropArea={showCropArea}
                            showPest={showPest}
                        />
                    </div>
                </div>
            ) : (
                <div className="main-panel">
                    <div className="panel" style={{ height: 'auto', overflowY: 'hidden' }}>
                        <div className="panel-header">
                            <DropdownMenu selectedPanel={selectedPanel} setSelectedPanel={setSelectedPanel} />
                        </div>
                        {selectedPanel === 'detections' && (
                            <>
                                <h2>Detections</h2>
                                <div className="controls">
                                    <label htmlFor="sort-order">Sort By Time: </label>
                                    <select id="sort-order" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                                        <option value="ascending">Ascending</option>
                                        <option value="descending">Descending</option>
                                    </select>
                                </div>
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Class Name</th>
                                                <th>Crop Area</th>
                                                <th>Timestamp</th>
                                                <th>Image</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((detection, index) => (
                                                <tr key={index}>
                                                    <td onDoubleClick={() => handleDoubleClickPest(detection.className)}>{detection.className}</td>
                                                    <td>{detection.cropArea}</td>
                                                    <td>{new Date(detection.timestamp).toLocaleString()}</td>
                                                    <td><img src={detection.imageUrl} alt={detection.className} className="table-image" onClick={() => openModal(detection)} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {renderPagination()}
                            </>
                        )}
                        {selectedPanel === 'cropData' && (
                            <>
                                <h2>Images Uploaded</h2>
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Crop Area</th>
                                                <th>Image</th>
                                                <th>Pest Name</th>
                                                <th>Confidence</th>
                                                <th>Recommendation</th>
                                                <th>Reference</th>
                                                <th>Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((crop, index) => (
                                                <tr key={index}>
                                                    <td>{crop.cropArea}</td>
                                                    <td><img src={crop.imagePath} alt={crop.cropArea} className="table-image" onClick={() => openModal(crop)} /></td>
                                                    <td onClick={() => handleDoubleClickPest(crop.detectedClass)} className="pest-name">
                                                        {crop.detectedClass ? `${crop.detectedClass}` : 'No pest detected'}
                                                    </td>
                                                    <td>{crop.confidence ? `${(crop.confidence * 100).toFixed(2)}%` : 'N/A'}</td>
                                                    <td>{crop.recommendation || 'No recommendation yet. Wait for the expert or admin.'}</td>
                                                    <td>
                                                        {crop.reference ? (
                                                            <a href={`//${crop.reference}`} target="_blank" rel="noopener noreferrer">
                                                                {crop.reference}
                                                            </a>
                                                        ) : (
                                                            'No reference available.'
                                                        )}
                                                    </td>
                                                    <td>{new Date(crop.timestamp).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {renderPagination()}
                            </>
                        )}
                    </div>
                </div>
            )}
            {modalData && (
                <div className="modal" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>{modalData.className || modalData.cropArea}</h2>
                        <img src={modalData.imageUrl || modalData.imagePath} alt={modalData.className || modalData.cropArea} className="modal-image" />
                        <p>Crop Area: {modalData.cropArea}</p>
                        <p>Timestamp: {new Date(modalData.timestamp).toLocaleString()}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetections;
