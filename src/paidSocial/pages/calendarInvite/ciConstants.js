import { CI_STATUS } from '../../utils/tickets';

// Status cards per role (key = ciStatus value, or 'all').
export const CI_CARDS = {
  AGENT: [
    { key: 'all', label: 'All', color: '#64748b' },
    { key: CI_STATUS.CALENDAR_INVITE, label: 'Calendar Invite', color: '#f97316' },
    { key: CI_STATUS.IN_PROGRESS, label: 'Enable In Progress', color: '#3b82f6' },
    { key: CI_STATUS.READY_TO_QC, label: 'Enable Ready to QC', color: '#8b5cf6' },
    { key: CI_STATUS.IN_QC, label: 'Enable In QC', color: '#ec4899' },
    { key: CI_STATUS.COMPLETED, label: 'Completed', color: '#10b981' },
  ],
  QC: [
    { key: 'all', label: 'All', color: '#64748b' },
    { key: CI_STATUS.READY_TO_QC, label: 'Enable Ready to QC', color: '#8b5cf6' },
    { key: CI_STATUS.IN_QC, label: 'Enable In QC', color: '#ec4899' },
    { key: CI_STATUS.COMPLETED, label: 'Completed', color: '#10b981' },
  ],
  QM: [
    { key: 'all', label: 'All', color: '#64748b' },
    { key: CI_STATUS.CALENDAR_INVITE, label: 'Calendar Invite', color: '#f97316' },
    { key: CI_STATUS.IN_PROGRESS, label: 'Enable In Progress', color: '#3b82f6' },
    { key: CI_STATUS.READY_TO_QC, label: 'Enable Ready to QC', color: '#8b5cf6' },
    { key: CI_STATUS.IN_QC, label: 'Enable In QC', color: '#ec4899' },
    { key: CI_STATUS.COMPLETED, label: 'Completed', color: '#10b981' },
  ],
};

// Dropdown options per role, keyed by the ticket's CURRENT ciStatus. If the
// current status isn't a key here, the status is read-only for that role.
export const CI_TRANSITIONS = {
  AGENT: {
    [CI_STATUS.CALENDAR_INVITE]: [
      { value: CI_STATUS.CALENDAR_INVITE, label: 'Calendar Invite' },
      { value: CI_STATUS.IN_PROGRESS, label: 'Enable In Progress' },
    ],
    [CI_STATUS.IN_PROGRESS]: [
      { value: CI_STATUS.IN_PROGRESS, label: 'Enable In Progress' },
      { value: CI_STATUS.READY_TO_QC, label: 'Enable Ready to QC' },
    ],
  },
  QC: {
    [CI_STATUS.READY_TO_QC]: [
      { value: CI_STATUS.READY_TO_QC, label: 'Enable Ready to QC' },
      { value: CI_STATUS.IN_QC, label: 'Enable In QC' },
    ],
    [CI_STATUS.IN_QC]: [
      { value: CI_STATUS.IN_QC, label: 'Enable In QC' },
      { value: CI_STATUS.COMPLETED, label: 'Completed' },
    ],
  },
  QM: {}, // read-only
};
