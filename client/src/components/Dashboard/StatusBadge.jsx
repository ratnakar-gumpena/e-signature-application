import React from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { label: 'Draft', className: 'status-draft' },
    sent: { label: 'Sent', className: 'status-sent' },
    viewed: { label: 'Viewed', className: 'status-viewed' },
    completed: { label: 'Completed', className: 'status-completed' },
    pending: { label: 'Pending', className: 'status-pending' },
    voided: { label: 'Voided', className: 'status-voided' },
    expired: { label: 'Expired', className: 'status-expired' },
    partially_signed: { label: 'Partially Signed', className: 'status-viewed' }
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;

  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
