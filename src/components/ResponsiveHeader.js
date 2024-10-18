// src/components/ResponsiveHeader.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../firebase/AuthContext'; // Ensure correct path if necessary
import Header from './Header';
import UserMenu from './UserMenu';
import AdminMenu from './AdminMenu';
import './ResponsiveHeader.css';

const ResponsiveHeader = ({ onLogout, isAdmin }) => {
    const [show, setShow] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const { currentUser } = useAuth(); // Use the AuthContext to get the current user

    const controlNavbar = useCallback(() => {
        if (window.scrollY > lastScrollY) {
            setShow(false);
        } else {
            setShow(true);
        }
        setLastScrollY(window.scrollY);
    }, [lastScrollY]);

    useEffect(() => {
        window.addEventListener('scroll', controlNavbar);

        return () => {
            window.removeEventListener('scroll', controlNavbar);
        };
    }, [controlNavbar]);

    // Determine the username to display based on admin status
    const username = isAdmin ? 'ADMIN' : currentUser?.email; // Display email if available, else null

    return (
        <div className={`responsive-header ${!show ? 'header--hidden' : ''}`}>
            <Header onLogout={onLogout} username={username} />
            {isAdmin ? <AdminMenu /> : <UserMenu />}
        </div>
    );
};

export default ResponsiveHeader;
