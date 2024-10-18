// src/firebase/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log(`Login successful for user: ${email}`);
        } catch (error) {
            console.error(`Failed to log in with email: ${email}. Error: ${error.message}`);
            throw error;  // Throw the error to be caught by the calling function
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            console.log('Logout successful');
        } catch (error) {
            console.error('Failed to log out. Error:', error.message);
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
