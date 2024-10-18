import React, { useEffect, useState, useCallback } from 'react';
import { ref, update, remove } from 'firebase/database';
import { db } from '../firebase/firebase';
import {
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    TablePagination,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    IconButton
} from '@mui/material';
import { Edit, DeleteOutline } from '@mui/icons-material';
import './AdminPanel.css';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [cropData, setCropData] = useState([]);
    const [userPage, setUserPage] = useState(0);
    const [userRowsPerPage, setUserRowsPerPage] = useState(3);
    const [cropPage, setCropPage] = useState(0);
    const [cropRowsPerPage, setCropRowsPerPage] = useState(5);
    const [open, setOpen] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [detectedClass, setDetectedClass] = useState('');
    const [recommendation, setRecommendation] = useState('');
    const [reference, setReference] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [cropToDelete, setCropToDelete] = useState(null);
    const [imageOpen, setImageOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/users');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
        const interval = setInterval(fetchUserData, 60000); // Fetch user data every 60 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchCropData = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/cropData');
            const data = await response.json();
            data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by latest images first
            setCropData(data);
        } catch (error) {
            console.error('Error fetching crop data:', error);
        }
    }, []);

    useEffect(() => {
        fetchCropData();
    }, [fetchCropData]);

    const handleUserChangePage = (event, newPage) => {
        setUserPage(newPage);
    };

    const handleUserChangeRowsPerPage = (event) => {
        setUserRowsPerPage(parseInt(event.target.value, 10));
        setUserPage(0);
    };

    const handleCropChangePage = (event, newPage) => {
        setCropPage(newPage);
    };

    const handleCropChangeRowsPerPage = (event) => {
        setCropRowsPerPage(parseInt(event.target.value, 10));
        setCropPage(0);
    };

    const handleOpen = (crop) => {
        setSelectedCrop(crop);
        setDetectedClass(crop.detectedClass || '');
        setRecommendation(crop.recommendation || '');
        setReference(crop.reference || '');
        setOpen(true);
    };

    const handleImageOpen = (imageUrl) => {
        setSelectedImage(imageUrl);
        setImageOpen(true);
    };

    const handleImageClose = () => {
        setImageOpen(false);
        setSelectedImage('');
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedCrop(null);
        setDetectedClass('');
        setRecommendation('');
        setReference('');
    };

    const handleSave = async () => {
        if (selectedCrop) {
            const updates = {
                [`cropData/${selectedCrop.id}/detectedClass`]: detectedClass,
                [`cropData/${selectedCrop.id}/recommendation`]: recommendation,
                [`cropData/${selectedCrop.id}/reference`]: reference,
            };
            await update(ref(db), updates);
            fetchCropData();  // Refresh the crop data to reflect the changes
            handleClose();
        }
    };

    const handleDeleteCrop = (crop) => {
        setCropToDelete(crop);
        setShowDeleteDialog(true);
    };

    const confirmDeleteCrop = async () => {
        try {
            if (cropToDelete) {
                // Remove the crop data from the database
                await remove(ref(db, `cropData/${cropToDelete.id}`));
                console.log('Deleted Crop:', cropToDelete);

                // Immediately remove the deleted crop from the state
                setCropData(prevCropData => prevCropData.filter(crop => crop.id !== cropToDelete.id));

                // Close the delete dialog and clear the selected crop
                setShowDeleteDialog(false);
                setCropToDelete(null);

                // Fetch the updated list of crops to ensure the state is synchronized
                fetchCropData();
            }
        } catch (error) {
            console.error('Error deleting crop data:', error);
            alert('Error deleting crop data. Please try again.');
        }
    };

    const formatTimestamp = (timestamp) => {
        try {
            return new Date(timestamp).toLocaleString();
        } catch (error) {
            console.error('Error formatting timestamp:', error);
            return 'Invalid date';
        }
    };

    return (
        <Container className="admin-container" maxWidth={false}>
            <Typography variant="h3" component="h1" gutterBottom className="admin-title">
                Admin Panel
            </Typography>
            <Paper elevation={3} className="MuiPaper-elevation3" style={{ padding: '20px', marginBottom: '20px', margin: '0 auto', width: '90%' }}>
                <Typography variant="h5" component="h2" gutterBottom className="MuiTypography-h5">
                    Total Registered Users: {users.length}
                </Typography>
                <TableContainer className="table-container" sx={{ width: '100%' }}>
                    <Table className="wide-table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="MuiTableCell-head">Email</TableCell>
                                <TableCell className="MuiTableCell-head">Registered</TableCell>
                                <TableCell className="MuiTableCell-head">Last Sign In</TableCell>
                                <TableCell className="MuiTableCell-head">Last Refresh</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.slice(userPage * userRowsPerPage, userPage * userRowsPerPage + userRowsPerPage).map((user, index) => (
                                <TableRow key={index}>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{formatTimestamp(user.metadata.creationTime)}</TableCell>
                                    <TableCell>{formatTimestamp(user.metadata.lastSignInTime)}</TableCell>
                                    <TableCell>{formatTimestamp(user.metadata.lastRefreshTime)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[3, 5, 10]}
                        component="div"
                        count={users.length}
                        rowsPerPage={userRowsPerPage}
                        page={userPage}
                        onPageChange={handleUserChangePage}
                        onRowsPerPageChange={handleUserChangeRowsPerPage}
                    />
                </TableContainer>
            </Paper>
            <Paper elevation={3} className="MuiPaper-elevation3" style={{ padding: '20px', margin: '0 auto', width: '90%' }}>
                <Typography variant="h5" component="h2" gutterBottom className="MuiTypography-h5">
                    Images Uploaded By Users
                </Typography>
                <TableContainer className="table-container" sx={{ width: '100%' }}>
                    <Table className="wide-table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="MuiTableCell-head">Username</TableCell>
                                <TableCell className="MuiTableCell-head">Crop Area</TableCell>
                                <TableCell className="MuiTableCell-head">Image</TableCell>
                                <TableCell className="MuiTableCell-head">Pest Name</TableCell>
                                <TableCell className="MuiTableCell-head">Confidence Level</TableCell>
                                <TableCell className="MuiTableCell-head">Recommendation</TableCell>
                                <TableCell className="MuiTableCell-head">Reference</TableCell>
                                <TableCell className="MuiTableCell-head">Timestamp</TableCell>
                                <TableCell className="MuiTableCell-head">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cropData.slice(cropPage * cropRowsPerPage, cropPage * cropRowsPerPage + cropRowsPerPage).map((crop, index) => (
                                <TableRow key={index}>
                                    <TableCell>{crop.email}</TableCell>
                                    <TableCell>{crop.cropArea}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleImageOpen(crop.imageUrl)}>
                                            <Avatar variant="square" src={crop.imageUrl} alt={crop.cropArea} style={{ width: 80, height: 80 }} />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>{crop.detectedClass}</TableCell>
                                    <TableCell>{crop.confidence}</TableCell>
                                    <TableCell>{crop.recommendation}</TableCell>
                                    <TableCell>{crop.reference}</TableCell>
                                    <TableCell className="timestamp-cell">{formatTimestamp(crop.timestamp)}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpen(crop)}><Edit /></IconButton>
                                        <IconButton onClick={() => handleDeleteCrop(crop)} color="secondary">
                                            <DeleteOutline style={{ color: 'red' }} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 15]}
                        component="div"
                        count={cropData.length}
                        rowsPerPage={cropRowsPerPage}
                        page={cropPage}
                        onPageChange={handleCropChangePage}
                        onRowsPerPageChange={handleCropChangeRowsPerPage}
                    />
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Edit Crop Data</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Detected Pest Class"
                        fullWidth
                        value={detectedClass}
                        onChange={(e) => setDetectedClass(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Recommendation"
                        fullWidth
                        value={recommendation}
                        onChange={(e) => setRecommendation(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Reference"
                        fullWidth
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this data?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDeleteCrop} color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={imageOpen} onClose={handleImageClose}>
                <DialogTitle>Image Preview</DialogTitle>
                <DialogContent>
                    <img src={selectedImage} alt="Crop" style={{ width: '100%' }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleImageClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminPanel;
