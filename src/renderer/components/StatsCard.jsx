import React from 'react';

export default function StatsCard({ label, value, trend, trendDirection, description }) {
  const getTrendIcon = () => {
    if (trendDirection === 'up') {
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        </svg>
      );
    }
    if (trendDirection === 'down') {
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
        </svg>
      );
    }
    return (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
      </svg>
    );
  };

  return (
    <div className="stats-card">
      <div className="flex items-center justify-between mb-3">
        <span className="stats-label">{label}</span>
        <span className={`stats-trend ${trendDirection}`}>
          {getTrendIcon()}
          {trend}
        </span>
      </div>
      <div className="stats-value mb-1">{value}</div>
      {description && (
        <p className="stats-description">{description}</p>
      )}
    </div>
  );
}
