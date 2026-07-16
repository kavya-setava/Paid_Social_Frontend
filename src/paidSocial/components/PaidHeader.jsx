import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown, Check } from 'lucide-react';
import socket from '../../socket';
import { authApi, errMessage } from '../api/paidSocialApi';
import { getUser, getActiveRole, saveSession, clearSession, routeForRole } from '../api/session';
import { toastError, toastSuccess } from '../utils/toast';
import './PaidHeader.css';

const ROLE_LABELS = { QM: 'Queue Manager', AGENT: 'Agent', QC: 'Quality Checker' };
const prettyRole = (r) => ROLE_LABELS[String(r || '').toUpperCase()] || r;

// Shared paid-social top bar: brand + title on the left, notifications, a
// role-switcher (driven by the user's real roles) and logout on the right.
const PaidHeader = ({ title = 'Ticket Management System', notificationCount = 0 }) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const menuRef = useRef(null);

    const user = getUser() || {};
    const activeRole = getActiveRole();
    const roles = (user.roles || []).map((r) => (typeof r === 'string' ? r : r.name));

    // Close the dropdown on outside click.
    useEffect(() => {
        const onClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const handleSwitch = async (role) => {
        const target = String(role).toUpperCase();
        if (target === activeRole || busy) return;
        setBusy(true);
        try {
            const data = await authApi.switchRole(target);
            if (data?.success && data?.token) {
                saveSession({ token: data.token, user: data.user });
                toastSuccess(`Switched to ${prettyRole(target)}`);
                setOpen(false);
                navigate(routeForRole(data.user?.activeRole?.name || target), { replace: true });
            } else {
                toastError(data?.message || 'Could not switch role');
            }
        } catch (err) {
            toastError(errMessage(err, 'Could not switch role'));
        } finally {
            setBusy(false);
        }
    };

    const handleLogout = async () => {
        try { await authApi.logout(); } catch (_) { /* best effort */ }
        try { socket.disconnect(); } catch (_) { /* ignore */ }
        clearSession();
        navigate('/paid/login', { replace: true });
    };

    return (
        <header className="ps-header">
            <div className="ps-header-left">
                <div className="ps-logo">PAIDSOCIAL</div>
                <div className="ps-header-divider" />
                <h1 className="ps-dashboard-title">{title}</h1>
            </div>

            <div className="ps-header-right">
                <button className="ps-icon-button" aria-label="View notifications" type="button">
                    <Bell size={18} />
                    {notificationCount > 0 && (
                        <span className="ps-notification-badge">{notificationCount}</span>
                    )}
                </button>

                <div className="ps-profile-container" ref={menuRef}>
                    <button
                        type="button"
                        className="ps-profile"
                        onClick={() => setOpen((o) => !o)}
                        aria-haspopup="menu"
                        aria-expanded={open}
                    >
                        <span className="ps-avatar"><User size={16} /></span>
                        <span className="ps-profile-meta">
                            <span className="ps-profile-name">{user.name || 'User'}</span>
                            <span className="ps-profile-role">
                                {prettyRole(activeRole)}{user.region ? ` · ${user.region}` : ''}
                            </span>
                        </span>
                        <ChevronDown size={14} className={`ps-caret ${open ? 'open' : ''}`} />
                    </button>

                    {open && (
                        <div className="ps-dropdown" role="menu">
                            {roles.length > 1 && (
                                <div className="ps-dropdown-section-label">Switch role</div>
                            )}
                            {roles.length > 1 && roles.map((role) => {
                                const isActive = String(role).toUpperCase() === activeRole;
                                return (
                                    <button
                                        key={role}
                                        type="button"
                                        role="menuitem"
                                        className={`ps-dropdown-item ${isActive ? 'active' : ''}`}
                                        disabled={busy}
                                        onClick={() => handleSwitch(role)}
                                    >
                                        <span>{prettyRole(role)}</span>
                                        {isActive && <Check size={15} />}
                                    </button>
                                );
                            })}
                            <button
                                type="button"
                                role="menuitem"
                                className="ps-dropdown-item ps-logout-item"
                                onClick={handleLogout}
                            >
                                <LogOut size={15} /> <span>Log out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

PaidHeader.propTypes = {
    title: PropTypes.string,
    notificationCount: PropTypes.number,
};

export default PaidHeader;
