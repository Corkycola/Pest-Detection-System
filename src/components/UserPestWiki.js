import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import {
    Container,
    Paper,
    Typography,
    Grid,
    IconButton
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import './UserPestWiki.css';

const UserPestWiki = () => {
    const location = useLocation();
    const { pestName } = location.state || {};
    const [pests, setPests] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const fetchPests = useCallback(() => {
        const dbRefObject = dbRef(db, 'pestwiki');
        onValue(dbRefObject, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const pestsList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                setPests(pestsList);
                if (pestName) {
                    const pestIndex = pestsList.findIndex(p => p.name === pestName);
                    setCurrentImageIndex(pestIndex !== -1 ? pestIndex : 0);
                }
            } else {
                setPests([]);
                console.log('No data available');
            }
        });
    }, [pestName]);

    useEffect(() => {
        fetchPests();
    }, [fetchPests]);

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? pests.length - 1 : prevIndex - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === pests.length - 1 ? 0 : prevIndex + 1));
    };

    const highlightUrls = (text) => {
        return text.split('\n').map((line, lineIndex) => {
            const parts = line.split(':');
            if (parts.length > 1) {
                return (
                    <span key={lineIndex}>
                        {parts[0]}: <a href={`http://${parts[1].trim()}`} target="_blank" rel="noopener noreferrer">{parts[1].trim()}</a>
                    </span>
                );
            }
            return <span key={lineIndex}>{line}</span>;
        });
    };

    return (
        <Container>
            <div className="top-view-container">
                <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Pest Wiki
                    </Typography>
                    {pests.length > 0 && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconButton onClick={handlePrevImage}>
                                    <ChevronLeft />
                                </IconButton>
                                <img
                                    src={pests[currentImageIndex].imageUrl}
                                    alt={pests[currentImageIndex].name}
                                    className="pest-image"
                                />
                                <IconButton onClick={handleNextImage}>
                                    <ChevronRight />
                                </IconButton>
                            </div>
                            <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
                                <Typography variant="h6">{pests[currentImageIndex].name}</Typography>
                                <Typography variant="body1">{pests[currentImageIndex].details}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {pests[currentImageIndex].recommendation}
                                </Typography>
                                {pests[currentImageIndex].references && pests[currentImageIndex].references.map((reference, refIndex) => (
                                    <div key={refIndex}>
                                        {highlightUrls(reference)}
                                    </div>
                                ))}
                            </Paper>
                        </>
                    )}
                </Paper>
            </div>
            <div className="table-view-container">
                <Grid container spacing={3} className="grid-container">
                    <Paper elevation={3} style={{ padding: '20px', width: '100%' }}>
                        <table className="pest-table">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Details</th>
                                    <th>Recommendation</th>
                                    <th>References</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pests.map((pest, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td><img src={pest.imageUrl} alt={pest.name} className="pest-thumbnail-table" /></td>
                                        <td>{pest.name}</td>
                                        <td>{pest.details}</td>
                                        <td>{pest.recommendation}</td>
                                        <td>
                                            {pest.references && pest.references.map((reference, refIndex) => (
                                                <div key={refIndex}>
                                                    {highlightUrls(reference)}
                                                </div>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Paper>
                </Grid>
            </div>
        </Container>
    );
};

export default UserPestWiki;
