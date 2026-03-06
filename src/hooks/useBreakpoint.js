import { useState, useEffect } from 'react';

export function useBreakpoint(maxWidth = 768) {
  const [isMatch, setIsMatch] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= maxWidth;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const handleChange = (event) => {
      setIsMatch(event.matches);
    };

    setIsMatch(mq.matches);
    mq.addEventListener('change', handleChange);

    return () => {
      mq.removeEventListener('change', handleChange);
    };
  }, [maxWidth]);

  return isMatch;
}

