import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import logo from '../media/PestaAwayLogo.png';
import videoBackground from '../media/agriculture_background.mp4';
import schoolLogo from '../media/APU_Logo.png';
import sustainableLogo from '../media/SustainableLogo.png';

const AdminLogin = ({ onAdminLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setUsername('');
        setPassword('');

        const interval = setInterval(() => {
            const welcomeText = document.querySelector('.admin-login__welcome-text');
            if (welcomeText) {
                welcomeText.classList.remove('slideInLeft');
                void welcomeText.offsetWidth;
                welcomeText.classList.add('slideInLeft');
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (username === 'admin1' && password === 'Admin@1234Secure') {
            onAdminLogin();
            navigate('/admin-panel');
        } else {
            setError('Invalid admin credentials');
        }
    };

    return (
        <div className="admin-login__container">
            <video className="admin-login__video-background" autoPlay loop muted>
                <source src={videoBackground} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="admin-login__user-link" onClick={() => navigate('/login')}>
                Go to User Login
            </div>
            <h1 className="admin-login__welcome-text slideInLeft">Admin Login</h1>
            <div className="admin-login__floating-container">
                <div className="admin-login__left-side">
                    <img src={logo} alt="Logo" className="admin-login__logo" />
                </div>
                <div className="admin-login__right-side">
                    <form onSubmit={handleSubmit} className="admin-login__form">
                        <div>
                            <label>Admin Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Enter your admin id"
                            />
                        </div>
                        <div className="admin-login__password-container">
                            <label>Password</label>
                            <div className="admin-login__password-input-container">
                                <input
                                    type={passwordVisible ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                />
                                <span
                                    className="admin-login__eye-icon"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                >
                                    {passwordVisible ? '👁️' : '👁️‍🗨️'}
                                </span>
                            </div>
                        </div>
                        {error && <div className="admin-login__error-message">{error}</div>}
                        <button type="submit">Login</button>
                    </form>
                </div>
            </div>
            <div className="admin-login__logos-container">
                <img src={schoolLogo} alt="School Logo" className="admin-login__apu-logo" />
                <img src={sustainableLogo} alt="Sustainable Logo" className="admin-login__sdg-logo" />
            </div>
        </div>
    );
};

export default AdminLogin;
