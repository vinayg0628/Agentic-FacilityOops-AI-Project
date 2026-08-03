import React, { useEffect, useState } from 'react';

export const HealthScoreGauge = ({ score, size = 'md', showLabel = true }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const sizeMap = {
    sm: { radius: 32, strokeWidth: 6, fontSize: 'text-sm' },
    md: { radius: 48, strokeWidth: 8, fontSize: 'text-2xl' },
    lg: { radius: 64, strokeWidth: 10, fontSize: 'text-4xl' }
  };

  const { radius, strokeWidth, fontSize } = sizeMap[size] || sizeMap.md;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  let color = '#10b981'; // emerald
  let label = 'Excellent';
  
  if (score < 40) {
    color = '#f43f5e'; // rose
    label = 'Critical';
  } else if (score < 60) {
    color = '#f97316'; // orange
    label = 'Warning';
  } else if (score < 75) {
    color = '#f59e0b'; // amber
    label = 'Fair';
  } else if (score < 90) {
    color = '#06b6d4'; // cyan
    label = 'Good';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="#1e293b"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold text-slate-100 ${fontSize}`}>{score}</span>
        </div>
      </div>
      {showLabel && (
        <span className="mt-2 text-xs font-medium uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  );
};
