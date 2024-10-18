import React from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useNavigate } from 'react-router-dom';

const Logout = ({ onLogout }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout()
            .then(() => {
                onLogout(); // Call the onLogout function to reset login states
                navigate('/login'); // Redirect to login on successful logout
            })
            .catch(error => {
                console.error('Failed to log out', error);
            });
    };

    return (
        <button onClick={handleLogout} className="logout-button">Logout</button>
    );
};

export default Logout;
