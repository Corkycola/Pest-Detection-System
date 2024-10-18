import React, { useState } from 'react';
import { useAuth } from '../firebase/AuthContext';
import './Login.css';
import logo from '../media/PestaAwayLogo.png';
import videoBackground from '../media/agriculture_background.mp4';
import schoolLogo from '../media/APU_Logo.png';
import sustainableLogo from '../media/SustainableLogo.png';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/user-panel');
        } catch (error) {
            setError('Failed to login. Please check the username or password');
        }
    };

    return (
        <div className="login__container login-page">
            <video className="login__video-background" autoPlay loop muted>
                <source src={videoBackground} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="login__admin-link" onClick={() => navigate('/admin-login')}>
                Admin Login
            </div>
            <h1 className="login__welcome-text">Welcome to PestaAway</h1>
            <div className="login__floating-container">
                <div className="login__left-side">
                    <img src={logo} alt="Logo" className="login__logo" />
                </div>
                <div className="login__right-side">
                    <form onSubmit={handleSubmit} className="login__form">
                        <div>
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="login__password-container">
                            <label>Password</label>
                            <div className="login__password-input-container">
                                <input
                                    type={passwordVisible ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                />
                                <span
                                    className="login__eye-icon"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                >
                                    {passwordVisible ? '👁️' : '👁️‍🗨️'}
                                </span>
                            </div>
                        </div>
                        {error && <div className="login__error-message">{error}</div>}
                        <button type="submit">Login</button>
                    </form>
                </div>
            </div>
            <div className="login__logos-container">
                <img src={schoolLogo} alt="School Logo" className="login__apu-logo" />
                <img src={sustainableLogo} alt="Sustainable Logo" className="login__sdg-logo" />
            </div>
        </div>
    );


};

export default Login;
