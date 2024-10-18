// src/firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBOpg7jdcD2ZA5nNvGi9Jd9Hrm5h6WRH6A",
    authDomain: "yolov8-tflite-5aac6.firebaseapp.com",
    projectId: "yolov8-tflite-5aac6",
    storageBucket: "yolov8-tflite-5aac6.appspot.com",
    messagingSenderId: "605838764955",
    appId: "1:605838764955:android:80e9ef484ced6455414f3e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { auth, db, storage, signInWithEmailAndPassword };
