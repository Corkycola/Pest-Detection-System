// src/components/Header.js
import React, { useEffect } from 'react';
import Logout from './Logout';
import pestaLogo from '../media/PestaAwayLogo.png';
import './Header.css';

const Header = ({ onLogout, username }) => {
    useEffect(() => {
        const handleScroll = () => {
            console.log('Scroll event detected');
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="header">
            <div className="logos">
                <img src={pestaLogo} alt="PestaAway Logo" className="logo" />
            </div>
            <div className="shiny-text">PestaAway</div>
            <div className="user-logout">
                <span className="username">{username}</span>
                <Logout onLogout={onLogout} />
            </div>
        </div>
    );
};

export default Header;
