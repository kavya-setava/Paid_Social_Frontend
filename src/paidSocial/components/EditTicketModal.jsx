import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { ticketApi, errMessage } from '../api/paidSocialApi';
import { toastSuccess, toastError } from '../utils/toast';
import './EditTicketModal.css';

// Every editable column for the row Edit modal (QM & Agent).
const FIELDS = [
  { key: 'marketingCampaign', label: 'Marketing Campaign' },
  { key: 'campaignName', label: 'Campaign Name' },
  { key: 'adSetName', label: 'AdSet Name' },
  { key: 'adName', label: 'Ad Name' },
  { key: 'highVisibility', label: 'High-Visibility Titles', type: 'select', options: ['', 'Yes', 'No'] },
  { key: 'adTech', label: 'Ad-Tech' },
  { key: 'taskType', label: 'Task Type' },
  { key: 'page', label: 'Page' },
  { key: 'platform', label: 'Platform' },
  { key: 'region', label: 'Region', type: 'select', options: ['EMEA', 'APAC', 'UCAN'] },
  { key: 'country', label: 'Country' },
  { key: 'flightStart', label: 'AD Flight Start', type: 'datetime' },
  { key: 'flightEnd', label: 'AD Flight End', type: 'datetime' },
  { key: 'publishDatePST', label: 'Publish Date (PST)', type: 'datetime' },
  { key: 'operator', label: 'Operator' },
  { key: 'launchPriority', label: 'Launching Prioritization' },
  { key: 'priority', label: 'Priority', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
  { key: 'socialiteLink', label: 'Socialite Link' },
  { key: 'tacticalLink', label: 'Tactical Link' },
  { key: 'qcThread', label: 'QC Thread' },
  { key: 'qcStatus', label: 'QC Status' },
  { key: 'socialiteNotes', label: 'Socialite Notes', type: 'textarea' },
  { key: 'traffickerComments', label: 'Trafficker Comments', type: 'textarea' },
  { key: 'qcObservations', label: 'QC Observations', type: 'textarea' },
  { key: 'qmNotes', label: 'QM Notes', type: 'textarea' },
  { key: 'agentNotes', label: 'Agent Notes', type: 'textarea' },
  { key: 'qcNotes', label: 'QC Notes', type: 'textarea' },
];

// ISO → value for a datetime-local input (local time).
const toInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

// Full-ticket editor. Reads raw values off ticket._ticket, sends only changes.
const EditTicketModal = ({ ticket, onClose, onSaved }) => {
  const raw = ticket._ticket || {};
  const [form, setForm] = useState(() => {
    const init = {};
    FIELDS.forEach((f) => {
      init[f.key] = f.type === 'datetime' ? toInput(raw[f.key]) : (raw[f.key] ?? '');
    });
    return init;
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    // Only send fields the user actually changed.
    const changed = {};
    FIELDS.forEach((f) => {
      const orig = f.type === 'datetime' ? toInput(raw[f.key]) : (raw[f.key] ?? '');
      if (form[f.key] !== orig) changed[f.key] = form[f.key];
    });
    if (!Object.keys(changed).length) { onClose(); return; }

    setSaving(true);
    try {
      const res = await ticketApi.updateFields(ticket.id, changed);
      if (res?.success) {
        toastSuccess('Ticket updated');
        onSaved?.();
        onClose();
      } else {
        toastError(res?.message || 'Could not update ticket');
      }
    } catch (err) {
      toastError(errMessage(err, 'Could not update ticket'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="et-overlay" onClick={onClose}>
      <div className="et-modal" onClick={(e) => e.stopPropagation()}>
        <div className="et-header">
          <h3>Edit Ticket {ticket.ticketId ? `— ${ticket.ticketId}` : ''}</h3>
          <button className="et-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="et-body">
          {FIELDS.map((f) => (
            <label key={f.key} className={`et-field ${f.type === 'textarea' ? 'et-field-wide' : ''}`}>
              <span className="et-label">{f.label}</span>
              {f.type === 'textarea' ? (
                <textarea value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
              ) : f.type === 'select' ? (
                <select value={form[f.key]} onChange={(e) => set(f.key, e.target.value)}>
                  {f.options.map((o) => <option key={o} value={o}>{o || '—'}</option>)}
                </select>
              ) : (
                <input
                  type={f.type === 'datetime' ? 'datetime-local' : 'text'}
                  value={form[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}
            </label>
          ))}
        </div>

        <div className="et-footer">
          <button className="et-btn et-btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="et-btn et-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

EditTicketModal.propTypes = {
  ticket: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func,
};

export default EditTicketModal;
