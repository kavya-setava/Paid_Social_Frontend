import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown, Check, Coffee, Power, X } from 'lucide-react';
import socket from '../../socket';
import { authApi, notificationApi, errMessage } from '../api/paidSocialApi';
import {
  getUser, getActiveRole, saveSession, clearSession, routeForRole, setPresenceFlags,
} from '../api/session';
import { toastError, toastSuccess } from '../utils/toast';
import { fmtDateTime } from '../utils/tickets';
import PresenceOverlay from './PresenceOverlay';
import './PaidHeader.css';

const ROLE_LABELS = { QM: 'Queue Manager', AGENT: 'Agent', QC: 'Quality Checker' };
const prettyRole = (r) => ROLE_LABELS[String(r || '').toUpperCase()] || r;

const PaidHeader = ({ title = 'Ticket Management System' }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef(null);

  const user = getUser() || {};
  const activeRole = getActiveRole();
  const roles = (user.roles || []).map((r) => (typeof r === 'string' ? r : r.name));
  const hasPresence = activeRole === 'AGENT' || activeRole === 'QC';

  // Presence (Agent/QC only).
  const [isOnline, setIsOnline] = useState(!!user.isOnline);
  const [isOnBreak, setIsOnBreak] = useState(!!user.isOnBreak);
  const [presenceBusy, setPresenceBusy] = useState(false);

  // Notifications.
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  // Close dropdowns on outside click.
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Load notifications + live updates.
  const loadNotifs = useCallback(async () => {
    try {
      const res = await notificationApi.list();
      setNotifs(res?.data || []);
      setUnread(res?.unread || 0);
    } catch (_) { /* best effort */ }
  }, []);

  useEffect(() => {
    loadNotifs();
    const onNotif = () => loadNotifs();
    socket.on('PAID_NOTIFICATION', onNotif);
    return () => socket.off('PAID_NOTIFICATION', onNotif);
  }, [loadNotifs]);

  const applyPresence = async (payload) => {
    setPresenceBusy(true);
    try {
      const data = await authApi.setPresence(payload);
      if (data?.success) {
        setIsOnline(!!data.isOnline);
        setIsOnBreak(!!data.isOnBreak);
        setPresenceFlags(!!data.isOnline, !!data.isOnBreak);
      } else {
        toastError(data?.message || 'Could not update status');
      }
    } catch (err) {
      toastError(errMessage(err, 'Could not update status'));
    } finally {
      setPresenceBusy(false);
    }
  };

  const toggleOnline = () => applyPresence({ isOnline: !isOnline });
  const toggleBreak = () => { if (isOnline) applyPresence({ isOnBreak: !isOnBreak }); };

  const openBell = async () => {
    const next = !bellOpen;
    setBellOpen(next);
    if (next && unread > 0) {
      try { await notificationApi.markAllRead(); setUnread(0); } catch (_) { /* ignore */ }
    }
  };

  const dismissNotif = async (e, id) => {
    e.stopPropagation();
    setNotifs((prev) => prev.filter((n) => n._id !== id));
    try {
      const res = await notificationApi.remove(id);
      if (typeof res?.unread === 'number') setUnread(res.unread);
    } catch (_) { loadNotifs(); }
  };

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

  const showOverlay = hasPresence && (!isOnline || isOnBreak);

  return (
    <>
      <header className="ps-header">
        <div className="ps-header-left">
          <div className="ps-logo">PAIDSOCIAL</div>
          <div className="ps-header-divider" />
          <h1 className="ps-dashboard-title">{title}</h1>
        </div>

        <div className="ps-header-right">
          {/* Presence toggles (Agent / QC only) */}
          {hasPresence && (
            <div className="ps-presence">
              <button
                type="button"
                className={`ps-toggle ${isOnline ? 'online' : 'offline'}`}
                disabled={presenceBusy}
                onClick={toggleOnline}
                title={isOnline ? 'Go Offline' : 'Go Online'}
              >
                <Power size={14} />
                {isOnline ? 'Online' : 'Offline'}
              </button>
              {isOnline && (
                <button
                  type="button"
                  className={`ps-toggle ${isOnBreak ? 'onbreak' : ''}`}
                  disabled={presenceBusy}
                  onClick={toggleBreak}
                  title={isOnBreak ? 'End Break' : 'Start Break'}
                >
                  <Coffee size={14} />
                  {isOnBreak ? 'On Break' : 'Break'}
                </button>
              )}
            </div>
          )}

          {/* Notification bell */}
          <div className="ps-profile-container" ref={bellRef}>
            <button className="ps-icon-button" aria-label="Notifications" type="button" onClick={openBell}>
              <Bell size={18} />
              {unread > 0 && <span className="ps-notification-badge">{unread}</span>}
            </button>
            {bellOpen && (
              <div className="ps-dropdown ps-notif-dropdown" role="menu">
                <div className="ps-dropdown-section-label">Notifications</div>
                {notifs.length === 0 ? (
                  <div className="ps-notif-empty">No notifications</div>
                ) : (
                  notifs.map((n) => (
                    <div key={n._id} className={`ps-notif-item ${n.read ? '' : 'unread'}`}>
                      <div className="ps-notif-text">
                        <span className="ps-notif-msg">{n.message}</span>
                        <span className="ps-notif-time">{fmtDateTime(n.createdAt)}</span>
                      </div>
                      <button
                        type="button"
                        className="ps-notif-close"
                        title="Dismiss"
                        onClick={(e) => dismissNotif(e, n._id)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Profile + role switch + logout */}
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
                {roles.length > 1 && <div className="ps-dropdown-section-label">Switch role</div>}
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

      {showOverlay && (
        <PresenceOverlay
          mode={!isOnline ? 'offline' : 'break'}
          busy={presenceBusy}
          onGoOnline={() => applyPresence({ isOnline: true })}
          onBreakOff={() => applyPresence({ isOnBreak: false })}
        />
      )}
    </>
  );
};

PaidHeader.propTypes = {
  title: PropTypes.string,
};

export default PaidHeader;
