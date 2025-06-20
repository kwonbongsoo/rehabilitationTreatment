import React, { memo } from 'react';
import Link from 'next/link';
import { IconType } from 'react-icons';

interface ActionButtonProps {
  href: string;
  icon: IconType;
  iconSize?: number;
  label: string;
  title?: string;
  className?: string;
  badge?: number;
  badgeClassName?: string;
  showIndicator?: boolean;
  indicatorClassName?: string;
}

const ActionButton: React.FC<ActionButtonProps> = memo(
  ({
    href,
    icon: Icon,
    iconSize = 20,
    label,
    title,
    className = '',
    badge,
    badgeClassName = '',
    showIndicator = false,
    indicatorClassName = '',
  }) => {
    return (
      <Link href={href} className={className} aria-label={label} title={title || label}>
        <Icon size={iconSize} />
        {showIndicator && <span className={indicatorClassName} />}
        {badge !== undefined && badge > 0 && <span className={badgeClassName}>{badge}</span>}
      </Link>
    );
  },
);

ActionButton.displayName = 'ActionButton';

export default ActionButton;
