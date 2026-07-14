import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();

    // State variables
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // Auto-redirect if token already exists (Requirement: Session check)
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        if (token && userRole) {
            redirectUserByRole(userRole);
        }
    }, []);

    // Role-Based Navigation Routing
    const redirectUserByRole = (role) => {
        switch (role) {
            case 'Queue Manager':
                navigate('/qm-dashboard');
                break;
            case 'Agent':
                navigate('/agent-dashboard');
                break;
            case 'Quality Checker':
                navigate('/qc-dashboard');
                break;
            default:
                navigate('/');
        }
    };

    // Handle Automatic Federated / Contextual Authentication
    const handleAutoSignIn = async (e) => {
        e.preventDefault();
        setApiError('');
        setIsLoading(true);

        try {
            // Simulating secure identity authentication
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Mocking a successful session resolution. 
            // Replace this with your actual single-sign-on (SSO) or profile resolution logic.
            const mockResolvedRole = 'Queue Manager';

            if (mockResolvedRole) {
                // Storing session data
                localStorage.setItem('authToken', 'mock-jwt-token-xyz');
                localStorage.setItem('userRole', mockResolvedRole);

                // Dynamic navigation routing based on the resolved role
                redirectUserByRole(mockResolvedRole);
            } else {
                setApiError('Unable to identify your account role. Please contact your system administrator.');
            }
        } catch (error) {
            setApiError('Authentication failed. The identity provider is unreachable.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="netflix-login-container">
            {/* Background Overlay */}
            <div className="netflix-background-overlay"></div>
        
            {/* Top Header Logo */}
            <header className="netflix-header">
                <h1 className="netflix-logo">paidSocial</h1>
            </header>

            {/* Login Card wrapper */}
            <div className="netflix-login-card">
                <h2>Ticket Management System</h2>
                <p className="qms-tagline">
                   Manage campaign tickets with intelligent routing, seamless collaboration, and real-time workflow visibility across every region.
                </p>

                {apiError && <div className="error-alert-banner">{apiError}</div>}

                <form onSubmit={handleAutoSignIn}>
                    {/* Submit Action Button */}
                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? <span className="spinner"></span> : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer-info">
                    <p className="signup-text">
                        Powered by <span>MediaMint</span>
                        <img
                            src="/mediamintlogo.jpg"
                            alt="MediaMint Logo"
                            className="mediamint-logo"
                        />
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;