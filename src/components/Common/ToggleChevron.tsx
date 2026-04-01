import React, { FC, useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';

interface ToggleChevronProps {
  open: boolean;
  size?: number;
  className?: string;
}

const ToggleChevron: FC<ToggleChevronProps> = ({ open, size = 16, className = '' }) => {
  // Track previous state to choose easing based on direction
  const prevOpenRef = useRef<boolean>(open);

  let transition = 'transform 200ms ease';
  const prevOpen = prevOpenRef.current;
  if (prevOpen !== open) {
    // Opening: ease-out (longer), Closing: ease-in (shorter)
    transition = open ? 'transform 400ms ease-out' : 'transform 300ms ease-in';
  }

  useEffect(() => {
    prevOpenRef.current = open;
  }, [open]);

  const style: React.CSSProperties = {
    width: size,
    height: size,
    transform: open ? 'rotate(180deg)' : 'rotate(90deg)',
    transition,
    transformOrigin: 'center',
    willChange: 'transform'
  };

  return (
    <ChevronUp
      className={className}
      style={style}
      aria-hidden="true"
    />
  );
};

export default ToggleChevron;
