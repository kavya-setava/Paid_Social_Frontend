import React from 'react';
import PropTypes from 'prop-types';
import { WifiOff, Coffee } from 'lucide-react';
import './PresenceOverlay.css';

// Full-screen blocker shown when an Agent/QC is Offline or On Break. The app is
// inaccessible until they flip back via the button here.
const PresenceOverlay = ({ mode, busy, onGoOnline, onBreakOff }) => {
  const offline = mode === 'offline';
  return (
    <div className="pv-overlay">
      <div className="pv-card">
        <div className={`pv-icon ${offline ? 'offline' : 'break'}`}>
          {offline ? <WifiOff size={40} /> : <Coffee size={40} />}
        </div>
        <h2>{offline ? 'You are currently Offline.' : 'You are currently On Break.'}</h2>
        <p>
          {offline
            ? 'You will not receive any ticket assignments while offline. Go online to continue working.'
            : 'You will not receive any ticket assignments while on break. End your break to continue.'}
        </p>
        {offline ? (
          <button type="button" className="pv-btn" disabled={busy} onClick={onGoOnline}>
            {busy ? 'Please wait…' : 'Go Online'}
          </button>
        ) : (
          <button type="button" className="pv-btn" disabled={busy} onClick={onBreakOff}>
            {busy ? 'Please wait…' : 'End Break'}
          </button>
        )}
      </div>
    </div>
  );
};

PresenceOverlay.propTypes = {
  mode: PropTypes.oneOf(['offline', 'break']).isRequired,
  busy: PropTypes.bool,
  onGoOnline: PropTypes.func,
  onBreakOff: PropTypes.func,
};

export default PresenceOverlay;
