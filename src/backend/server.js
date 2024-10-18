const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
    credential: admin.credential.cert(require('../../config/serviceAccountKey.json')),
    databaseURL: 'https://yolov8-tflite-5aac6-default-rtdb.firebaseio.com/',
    storageBucket: 'yolov8-tflite-5aac6.appspot.com'
});

const db = admin.database();
const bucket = getStorage().bucket();

app.get('/api/users', async (req, res) => {
    try {
        const listUsersResult = await admin.auth().listUsers();
        const users = listUsersResult.users.map(userRecord => ({
            uid: userRecord.uid,
            email: userRecord.email,
            metadata: userRecord.metadata // Include metadata for registration time
        }));

        console.log('Fetched Users:', users);

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        res.status(500).send('Error fetching user data: ' + error.message);
    }
});

app.get('/api/cropData', async (req, res) => {
    try {
        const listUsersResult = await admin.auth().listUsers();
        const users = listUsersResult.users.reduce((acc, userRecord) => {
            acc[userRecord.uid] = userRecord.email;
            return acc;
        }, {});

        const snapshot = await db.ref('cropData').once('value');
        if (snapshot.exists()) {
            const cropData = await Promise.all(Object.entries(snapshot.val()).map(async ([id, crop]) => {
                let imagePath = crop.imagePath;
                if (imagePath.startsWith('https://')) {
                    // Extract the path relative to the bucket from the full URL
                    const url = new URL(imagePath);
                    imagePath = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
                } else {
                    imagePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath; // Remove leading slash if present
                }

                const file = bucket.file(imagePath);
                try {
                    const [metadata] = await file.getMetadata();
                    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${metadata.bucket}/o/${encodeURIComponent(metadata.name)}?alt=media&token=${metadata.metadata.firebaseStorageDownloadTokens}`;
                    const userEmail = users[crop.uid] || 'Unknown';
                    return {
                        id,
                        ...crop,
                        email: userEmail, // Add user email
                        imageUrl, // Use the public URL
                    };
                } catch (error) {
                    console.error(`Error fetching metadata for file ${imagePath}:`, error.message);
                    return null;
                }
            }));

            const validCropData = cropData.filter(item => item !== null);
            console.log('Fetched Crop Data:', validCropData);
            res.status(200).json(validCropData);
        } else {
            console.log('No crop data available');
            res.status(404).send('No crop data available');
        }
    } catch (error) {
        console.error('Error fetching crop data:', error.message);
        res.status(500).send('Error fetching crop data: ' + error.message);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
