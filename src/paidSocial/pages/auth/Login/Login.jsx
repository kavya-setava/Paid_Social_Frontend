import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();

    // State variables
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [testRole, setTestRole] = useState('Queue Manager'); // Temporary testing state

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
                navigate('/paid/qm');
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

        // FEATURE FLAG: Set to true for dropdown testing, set to false when backend API is ready
        const useMockData = true; 

        try {
            if (useMockData) {
                // 1. TESTING MODE: Route using the dropdown selection
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulating quick delay

                if (testRole) {
                    localStorage.setItem('authToken', 'mock-jwt-token-xyz');
                    localStorage.setItem('userRole', testRole);
                    redirectUserByRole(testRole);
                } else {
                    setApiError('Unable to identify your account role. Please contact your system administrator.');
                }

            } else {
                // 2. PRODUCTION MODE: Integrate with the backend API
                const response = await fetch('https://api.paidsocial.internal/auth/session-resolve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) throw new Error('Backend authentication response failed.');

                const data = await response.json(); 
                
                if (data.role && data.token) {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('userRole', data.role);
                    redirectUserByRole(data.role);
                } else {
                    setApiError('Unable to identify your account role. Please contact your system administrator.');
                }
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
                    {/* Temporary Test Dropdown UI (Will be hidden/removed after API Integration) */}
                    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="test-role-select" style={{ fontSize: '13px', color: '#8c8c8c', textAlign: 'left' }}>
                            Select Test Profile Role:
                        </label>
                        <select 
                            id="test-role-select"
                            value={testRole} 
                            onChange={(e) => setTestRole(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px',
                                backgroundColor: '#333333',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '15px',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="Queue Manager">Queue Manager</option>
                            <option value="Agent">Agent</option>
                            <option value="Quality Checker">Quality Checker</option>
                        </select>
                    </div>

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