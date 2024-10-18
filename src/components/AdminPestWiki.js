import React, { useState, useEffect, useCallback } from 'react';
import { db, storage } from '../firebase/firebase';
import { ref as dbRef, get, child, push, set, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import {
    Container,
    Paper,
    Typography,
    Grid,
    IconButton,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { ChevronLeft, ChevronRight, CloudUpload, Delete, Edit, DeleteOutline } from '@mui/icons-material';
import './AdminPestWiki.css';

const AdminPestWiki = () => {
    const [pestName, setPestName] = useState('');
    const [details, setDetails] = useState('');
    const [recommendation, setRecommendation] = useState('');
    const [references, setReferences] = useState(['']);
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [pests, setPests] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPestId, setEditingPestId] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [pestToDelete, setPestToDelete] = useState(null);

    const fetchPests = useCallback(async () => {
        try {
            const dbRefObject = dbRef(db);
            const snapshot = await get(child(dbRefObject, 'pestwiki'));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const pestsList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                setPests(pestsList);
            } else {
                setPests([]);
                console.log('No data available');
            }
        } catch (error) {
            console.error('Error fetching pests data:', error);
        }
    }, []);

    useEffect(() => {
        fetchPests();
    }, [fetchPests]);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === 'image/jpeg' || file.type === 'image/png') {
                setImage(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImageUrl(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please upload a JPG or PNG image.');
            }
        }
    };

    const handleUpload = async () => {
        if (pestName && details && recommendation && references.every(ref => ref.trim() !== '')) {
            try {
                let uploadedImageUrl = imageUrl;

                if (image) {
                    const imageRef = storageRef(storage, `pestwiki_images/${image.name}`);
                    await uploadBytes(imageRef, image);
                    uploadedImageUrl = await getDownloadURL(imageRef);
                }

                const pestData = {
                    name: pestName,
                    details: details,
                    recommendation: recommendation,
                    references: references.filter(ref => ref.trim() !== ''), // Remove empty references
                    imageUrl: uploadedImageUrl
                };

                if (isEditing) {
                    await update(dbRef(db, `pestwiki/${editingPestId}`), pestData);
                } else {
                    const newPestRef = push(dbRef(db, 'pestwiki')).key;
                    await set(dbRef(db, `pestwiki/${newPestRef}`), pestData);
                }

                resetForm();
                fetchPests();
                setShowForm(false); // Close the modal after submission
            } catch (error) {
                console.error('Error uploading image and adding pest data:', error);
                alert('Error uploading image and adding pest data. Please try again.');
            }
        } else {
            alert('Please fill in all fields.');
        }
    };

    const handleAddReference = () => {
        setReferences([...references, '']);
    };

    const handleRemoveReference = (index) => {
        setReferences(references.filter((_, i) => i !== index));
    };

    const handleReferenceChange = (index, value) => {
        const newReferences = [...references];
        newReferences[index] = value;
        setReferences(newReferences);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? pests.length - 1 : prevIndex - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === pests.length - 1 ? 0 : prevIndex + 1));
    };

    const handleEditPest = (pest) => {
        setPestName(pest.name);
        setDetails(pest.details);
        setRecommendation(pest.recommendation);
        setReferences(pest.references || ['']);
        setImageUrl(pest.imageUrl);
        setIsEditing(true);
        setEditingPestId(pest.id);
        setShowForm(true);
    };

    const handleDeletePest = (pest) => {
        setPestToDelete(pest);
        setShowDeleteDialog(true);
    };

    const confirmDeletePest = async () => {
        try {
            if (pestToDelete) {
                // Remove the pest data from the database
                await remove(dbRef(db, `pestwiki/${pestToDelete.id}`));

                // Remove the associated image from storage
                if (pestToDelete.imageUrl) {
                    const imageRef = storageRef(storage, pestToDelete.imageUrl);
                    await deleteObject(imageRef);
                }

                // Immediately remove the deleted pest from the state
                setPests(prevPests => prevPests.filter(pest => pest.id !== pestToDelete.id));

                // Close the delete dialog and clear the selected pest
                setShowDeleteDialog(false);
                setPestToDelete(null);

                // Fetch the updated list of pests to ensure the state is synchronized
                fetchPests();
            }
        } catch (error) {
            console.error('Error deleting pest data:', error);
            alert('Error deleting pest data. Please try again.');
        }
    };

    const resetForm = () => {
        setPestName('');
        setDetails('');
        setRecommendation('');
        setReferences(['']);
        setImage(null);
        setImageUrl(null);
        setIsEditing(false);
        setEditingPestId(null);
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
        <Container className="admin-pestwiki-container">
            <div className="admin-pestwiki-title-container">
                <Typography variant="h3" component="h1" className="admin-pestwiki-title">
                    Pest Wiki
                </Typography>
            </div>
            <div className="admin-pestwiki-top-view-container">
                <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                    {pests.length > 0 && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconButton onClick={handlePrevImage}>
                                    <ChevronLeft />
                                </IconButton>
                                <img
                                    src={pests[currentImageIndex].imageUrl}
                                    alt={pests[currentImageIndex].name}
                                    className="admin-pestwiki-image"
                                />
                                <IconButton onClick={handleNextImage}>
                                    <ChevronRight />
                                </IconButton>
                            </div>
                            <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
                                <Typography variant="body1"><strong>Pest Name:</strong> {pests[currentImageIndex].name}</Typography>
                                <Typography variant="body1"><strong>Pest Details:</strong> {pests[currentImageIndex].details}</Typography>
                                <Typography variant="body1"><strong>Recommendation:</strong> {pests[currentImageIndex].recommendation}</Typography>
                                <Typography variant="body1"><strong>References:</strong></Typography>
                                {pests[currentImageIndex].references && pests[currentImageIndex].references.map((reference, refIndex) => (
                                    <Typography variant="body2" color="textSecondary" key={refIndex}>
                                        {refIndex + 1}. {highlightUrls(reference)}
                                    </Typography>
                                ))}
                            </Paper>
                        </>
                    )}
                </Paper>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                >
                    Add Pest Data
                </Button>
            </div>
            <Paper elevation={3} className="admin-pestwiki-table-container">
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>No.</TableCell>
                                <TableCell>Pest Image</TableCell>
                                <TableCell>Pest Name</TableCell>
                                <TableCell>Pest Details</TableCell>
                                <TableCell>Recommendation</TableCell>
                                <TableCell>References</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pests.map((pest, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell><img src={pest.imageUrl} alt={pest.name} className="admin-pestwiki-thumbnail-table" /></TableCell>
                                    <TableCell>{pest.name}</TableCell>
                                    <TableCell>{pest.details}</TableCell>
                                    <TableCell>{pest.recommendation}</TableCell>
                                    <TableCell>
                                        {pest.references && pest.references.map((reference, refIndex) => (
                                            <Typography variant="body2" color="textSecondary" key={refIndex}>
                                                {refIndex + 1}. {highlightUrls(reference)}
                                            </Typography>
                                        ))}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEditPest(pest)}><Edit /></IconButton>
                                        <IconButton onClick={() => handleDeletePest(pest)} color="secondary">
                                            <DeleteOutline style={{ color: 'red' }} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="md" fullWidth>
                <DialogTitle>{isEditing ? 'Edit Pest Data' : 'Add Pest Data'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="Pest"
                                    className="admin-pestwiki-preview-image"
                                />
                            ) : (
                                <div className="admin-pestwiki-image-placeholder">Image Preview</div>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<CloudUpload />}
                            >
                                Upload Image
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleImageChange}
                                />
                            </Button>
                            {image && <Typography>{image.name}</Typography>}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Pest Name"
                                value={pestName}
                                onChange={(e) => setPestName(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Details"
                                multiline
                                rows={4}
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Recommendation"
                                multiline
                                rows={4}
                                value={recommendation}
                                onChange={(e) => setRecommendation(e.target.value)}
                            />
                        </Grid>
                        {references.map((reference, index) => (
                            <Grid item xs={12} key={index}>
                                <TextField
                                    fullWidth
                                    label="Reference"
                                    value={reference}
                                    onChange={(e) => handleReferenceChange(index, e.target.value)}
                                />
                                <IconButton onClick={() => handleRemoveReference(index)}><Delete /></IconButton>
                            </Grid>
                        ))}
                        <Grid item xs={12}>
                            <Button onClick={handleAddReference}>Add Another Reference</Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowForm(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleUpload} color="primary">
                        {isEditing ? 'Update' : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this pest data?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDeletePest} color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminPestWiki;
