import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { db } from '../firebase/firebase';
import { ref, get, child, onValue } from 'firebase/database';
import './UserHomePage.css';

const UserHomePage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [detections, setDetections] = useState([]);
    const [pests, setPests] = useState([]);
    const [isFlipped, setIsFlipped] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(3);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchDetections = () => {
            if (currentUser) {
                const dbRef = ref(db, `users/${currentUser.uid}/detections`);
                onValue(dbRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const detectionsList = Object.values(snapshot.val());
                        detectionsList.sort((a, b) => b.timestamp - a.timestamp); // Sort detections by timestamp
                        setDetections(detectionsList);
                    }
                });
            }
        };

        const fetchPests = async () => {
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, 'pestwiki'));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const pestsList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                setPests(pestsList);
            }
        };

        fetchDetections();
        fetchPests();
    }, [currentUser]);

    const pestCounts = detections.reduce((acc, detection) => {
        acc[detection.className] = (acc[detection.className] || 0) + 1;
        return acc;
    }, {});

    const getPestRecommendation = (pestName) => {
        const pest = pests.find(p => p.name === pestName);
        return pest ? pest.recommendation : 'No recommendation yet. Wait for the expert or admin.';
    };

    const getPestWikiImage = (pestName) => {
        const pest = pests.find(p => p.name === pestName);
        return pest ? pest.imageUrl : '';
    };

    const topPests = Object.entries(pestCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    const handlePestClick = pestName => {
        navigate('/user-pestwiki', { state: { pestName } });
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleViewFullLogs = () => {
        navigate('/user-panel', { state: { showLogs: true } });
    };

    const handleViewDashboard = () => {
        navigate('/user-panel', { state: { showLogs: false } });
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1); // Reset to the first page
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = Object.entries(pestCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(Object.entries(pestCounts).length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="homepage-container">
            <div className={`panel-container ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
                <div className="card">
                    <div className="card-front">
                        <h2>Top 3 Pests Detected</h2>
                        <div className="top-pests">
                            {topPests.map(([pest, count], index) => (
                                <div
                                    key={index}
                                    className="top-pest-item"
                                    onClick={() => handlePestClick(pest)}
                                >
                                    <img src={getPestWikiImage(pest)} alt={pest} />
                                    <p>{pest}: {count} times</p>
                                    <button
                                        className="view-details-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePestClick(pest);
                                        }}
                                    >
                                        View details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card-back">
                        <h2>Detection Logs</h2>
                        {detections.slice(0, 4).map((detection, index) => (
                            <p key={index}>
                                <span className="timestamp">{new Date(detection.timestamp).toLocaleString()}:</span>
                                <span className="log-message"> PestaAway detected <span className="pest-name">{detection.className}</span> in the <span className="crop-area">{detection.cropArea}</span> area.</span>
                            </p>
                        ))}
                        <button className="view-full-logs-button" onClick={handleViewFullLogs}>
                            View Full Logs
                        </button>
                    </div>
                </div>
                <div className="flip-indicator">
                    Click to flip
                </div>
            </div>
            <div className="summary-panel">
                <h2>Pest Detection Summary</h2>
                <div className={`table-container items-${itemsPerPage}`}>
                    <table>
                        <thead>
                            <tr>
                                <th>Pest</th>
                                <th>Count</th>
                                <th>Recommendation</th>
                                <th>View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map(([pest, count], index) => (
                                <tr key={index}>
                                    <td>{pest}</td>
                                    <td>{count}</td>
                                    <td>{getPestRecommendation(pest)}</td>
                                    <td>
                                        <button
                                            className="view-details-button"
                                            onClick={() => handlePestClick(pest)}
                                        >
                                            View {pest}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="pagination-controls">
                    <label>
                        Items per page:
                        <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                            <option value={3}>3</option>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                        </select>
                    </label>
                    <div className="pagination">
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => paginate(index + 1)}
                                className={currentPage === index + 1 ? 'active' : ''}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
                <button className="view-dashboard-button" onClick={handleViewDashboard}>
                    View Analysis Dashboard
                </button>
            </div>
        </div>
    );
};

export default UserHomePage;
