'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { motion, HTMLMotionProps } from 'framer-motion';

interface Props extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  onDebouncedClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function DebounceButton({ children, onDebouncedClick, className, ...rest }: Props) {
  const { debounceMode } = useAccessibilityStore();
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // If debounce mode is OFF, just call the handler directly
      if (!debounceMode) {
        onDebouncedClick(e);
        return;
      }

      // If debounce mode is ON (Tremors / 수전증), block multiple clicks for 500ms
      if (isDebouncing) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      setIsDebouncing(true);
      onDebouncedClick(e);

      timeoutRef.current = setTimeout(() => {
        setIsDebouncing(false);
      }, 500); // 500ms debounce delay as per specifications
    },
    [debounceMode, isDebouncing, onDebouncedClick]
  );

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    // @ts-expect-error - Framer Motion types might conflict with React 19
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 600, damping: 15 }}
      onClick={handleClick}
      className={className}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
