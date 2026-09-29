import React, { useState, useEffect } from 'react';

export default function AnimatedCountUp({ endValue, duration = 1000, prefix = '', suffix = '', decimals = 0 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const startVal = 0;
    const endVal = Number(endValue) || 0;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out quad
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const current = startVal + (endVal - startVal) * easeProgress;
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [endValue, duration]);

  const formatted = decimals > 0 
    ? count.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(count).toLocaleString('en-IN');

  return <span>{prefix}{formatted}{suffix}</span>;
}
