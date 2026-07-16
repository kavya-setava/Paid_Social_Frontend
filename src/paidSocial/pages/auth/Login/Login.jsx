import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../../../../socket';
import { authApi, errMessage } from '../../../api/paidSocialApi';
import { saveSession, getToken, getActiveRole, routeForRole } from '../../../api/session';
import './Login.css';

// Paid-Social login — real Google OAuth (see PaidSocial-API-Docs.md §2).
//  1. "Sign in with Google" → GET /auth/google → redirect to Google.
//  2. Google bounces back to /login?id_token=... which we POST to
//     /auth/google/signin.
//  3. If the account has >1 role the backend asks us to pick one; we show
//     the role picker and re-call signin with { token, role }.
const Login = () => {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    // When the account holds multiple roles the backend returns the list here.
    const [pendingAuth, setPendingAuth] = useState(null); // { idToken, availableRoles }

    const finishLogin = useCallback((data) => {
        saveSession({ token: data.token, refreshToken: data.refreshToken, user: data.user });
        try {
            if (!socket.connected) socket.connect();
            socket.emit('register', data.user?.id);
        } catch (_) { /* socket is best-effort */ }
        navigate(routeForRole(data.user?.activeRole?.name), { replace: true });
    }, [navigate]);

    // Already signed in? Skip straight to the dashboard.
    useEffect(() => {
        if (getToken() && getActiveRole()) {
            navigate(routeForRole(getActiveRole()), { replace: true });
        }
    }, [navigate]);

    // Handle the Google redirect (id_token / access_token in the URL).
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const idToken = params.get('id_token') || params.get('access_token');
        if (!idToken) return;

        (async () => {
            setIsLoading(true);
            setApiError('');
            try {
                const data = await authApi.signin(idToken);
                // Clean the token out of the address bar.
                window.history.replaceState({}, document.title, '/paid/login');

                if (data?.needsRoleSelection) {
                    setPendingAuth({ idToken, availableRoles: data.availableRoles || [] });
                } else if (data?.success && data?.token) {
                    finishLogin(data);
                } else {
                    setApiError(data?.message || 'Login failed. Please contact your administrator.');
                }
            } catch (err) {
                setApiError(errMessage(err, 'Authentication failed. Please try again.'));
                window.history.replaceState({}, document.title, '/paid/login');
            } finally {
                setIsLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Kick off the Google OAuth flow.
    const handleGoogleLogin = async () => {
        setApiError('');
        setIsLoading(true);
        try {
            const data = await authApi.getGoogleUrl();
            if (data?.authUrl) {
                window.location.href = data.authUrl;
            } else {
                setApiError('Could not reach the identity provider. Please try again.');
                setIsLoading(false);
            }
        } catch (err) {
            setApiError(errMessage(err, 'The identity provider is unreachable.'));
            setIsLoading(false);
        }
    };

    // Re-sign in with a chosen role (multi-role accounts).
    const handleRoleSelect = async (role) => {
        setApiError('');
        setIsLoading(true);
        try {
            const data = await authApi.signin(pendingAuth.idToken, role);
            if (data?.success && data?.token) {
                finishLogin(data);
            } else {
                setApiError(data?.message || 'Could not sign in with that role.');
            }
        } catch (err) {
            setApiError(errMessage(err, 'Role sign-in failed.'));
        } finally {
            setIsLoading(false);
        }
    };

    const prettyRole = (r) => {
        const map = { QM: 'Queue Manager', AGENT: 'Agent', QC: 'Quality Checker' };
        return map[String(r).toUpperCase()] || r;
    };

    return (
        <div className="netflix-login-container">
            <div className="netflix-background-overlay"></div>

            <header className="netflix-header">
                <h1 className="netflix-logo">paidSocial</h1>
            </header>

            <div className="netflix-login-card">
                <h2>Ticket Management System</h2>
                <p className="qms-tagline">
                    Manage campaign tickets with intelligent routing, seamless collaboration, and
                    real-time workflow visibility across every region.
                </p>

                {apiError && <div className="error-alert-banner">{apiError}</div>}

                {pendingAuth ? (
                    /* ── Role picker (multi-role accounts) ── */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={{ fontSize: '13px', color: '#8c8c8c', margin: '0 0 4px' }}>
                            You have more than one role. Choose how to sign in:
                        </p>
                        {pendingAuth.availableRoles.map((role) => (
                            <button
                                key={role}
                                type="button"
                                className="login-btn"
                                disabled={isLoading}
                                onClick={() => handleRoleSelect(role)}
                                style={{ marginTop: 0 }}
                            >
                                {prettyRole(role)}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setPendingAuth(null)}
                            disabled={isLoading}
                            style={{
                                background: 'transparent', color: '#8c8c8c', border: 'none',
                                cursor: 'pointer', fontSize: '13px', marginTop: '4px',
                            }}
                        >
                            ← Back
                        </button>
                    </div>
                ) : (
                    /* ── Google sign-in ── */
                    <button
                        type="button"
                        className="login-btn"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? <span className="spinner"></span> : 'Sign in with Google'}
                    </button>
                )}

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
