import React, { FC } from 'react';
import { ChevronUp } from 'lucide-react';

interface ToggleChevronProps {
  open: boolean;
  size?: number;
  className?: string;
}

const ToggleChevron: FC<ToggleChevronProps> = ({ open, size = 16, className = '' }) => {
  // Simple implementation: use the ChevronUp icon and rotate via Tailwind classes
  const rotateClass = open ? 'rotate-180' : 'rotate-0';
  // Debug log to help diagnose remount vs class toggle issues
  // eslint-disable-next-line no-console
  console.log('[ToggleChevron] render', { open });
  return (
    <ChevronUp
      className={`${className} transform transition-transform duration-200 origin-center ${rotateClass}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
};

export default ToggleChevron;
