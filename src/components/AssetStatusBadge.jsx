/**
 * Reusable Asset Status Badge Component
 * Displays standardized status badges across all 6 asset lifecycle stages:
 * In Stock | Assigned | In Use | In Repair | Returned | Disposed
 */

const STATUS_CONFIG = {
  'In Stock': {
    badgeClass: 'badge-gray',
    dotColor: 'gray',
  },
  'Assigned': {
    badgeClass: 'badge-blue',
    dotColor: 'blue',
  },
  'In Use': {
    badgeClass: 'badge-green',
    dotColor: 'green',
  },
  'In Repair': {
    badgeClass: 'badge-amber',
    dotColor: 'amber',
  },
  'Returned': {
    badgeClass: 'badge-neutral',
    dotColor: 'gray',
  },
  'Disposed': {
    badgeClass: 'badge-red',
    dotColor: 'red',
  },
};

export default function AssetStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    badgeClass: 'badge-gray',
    dotColor: 'gray',
  };

  return (
    <span className={`badge ${config.badgeClass}`}>
      <span className={`badge-dot ${config.dotColor}`} />
      {status}
    </span>
  );
}
