/**
 * Reusable Hardware Category Icon Component
 * Renders standardized SVG hardware icons for IT asset categories.
 */

export default function AssetCategoryIcon({ category, size = 15, className = '' }) {
  const iconProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.75',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    'aria-hidden': true,
  };

  switch (category) {
    case 'Laptop':
      return (
        <svg {...iconProps}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      );

    case 'Desktop':
      return (
        <svg {...iconProps}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <line x1="8" y1="21" x2="16" y2="21" />
        </svg>
      );

    case 'Monitor':
      return (
        <svg {...iconProps}>
          <rect x="3" y="4" width="18" height="12" rx="1" />
          <line x1="8" y1="20" x2="16" y2="20" />
          <line x1="12" y1="16" x2="12" y2="20" />
        </svg>
      );

    case 'Printer':
      return (
        <svg {...iconProps}>
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
      );

    case 'Smartphone':
      return (
        <svg {...iconProps}>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M12 18h.01" />
        </svg>
      );

    case 'Server':
      return (
        <svg {...iconProps}>
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>
      );

    case 'Router':
      return (
        <svg {...iconProps}>
          <rect x="2" y="14" width="20" height="8" rx="2" />
          <line x1="6" y1="6" x2="6" y2="14" />
          <line x1="12" y1="6" x2="12" y2="14" />
          <line x1="18" y1="6" x2="18" y2="14" />
        </svg>
      );

    case 'Keyboard':
      return (
        <svg {...iconProps}>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="6" y1="9" x2="6.01" y2="9" />
          <line x1="10" y1="9" x2="10.01" y2="9" />
          <line x1="14" y1="9" x2="14.01" y2="9" />
          <line x1="18" y1="9" x2="18.01" y2="9" />
          <line x1="7" y1="13" x2="17" y2="13" />
        </svg>
      );

    case 'Mouse':
      return (
        <svg {...iconProps}>
          <rect x="6" y="3" width="12" height="18" rx="6" />
          <line x1="12" y1="7" x2="12" y2="11" />
        </svg>
      );

    case 'Other':
    default:
      return (
        <svg {...iconProps}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
        </svg>
      );
  }
}
