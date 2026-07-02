'use client';

import { useMemo, type ReactNode } from 'react';
import { MAP_VIEWBOX, getStatePaths } from '@/lib/us-map-projection';

interface USMapBaseProps {
  children?: ReactNode;
  className?: string;
  /** Extra tactical overlays (radar, HUD, etc.) */
  overlay?: ReactNode;
  showGrid?: boolean;
  stateFill?: string;
  stateStroke?: string;
}

export function USMapBase({
  children,
  className = '',
  overlay,
  showGrid = false,
  stateFill = '#1a222d',
  stateStroke = '#566a85',
}: USMapBaseProps) {
  const statePaths = useMemo(() => getStatePaths(), []);

  return (
    <div className={`relative h-full w-full ${className}`}>
      <svg
        viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="United States deployment map"
      >
        <defs>
          <linearGradient id="us-map-land-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#111827" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <filter id="us-map-soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {showGrid && (
            <pattern id="us-map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#94a3b8" strokeWidth="0.4" opacity="0.25" />
            </pattern>
          )}
        </defs>

        <rect width={MAP_VIEWBOX.width} height={MAP_VIEWBOX.height} fill="#0b0f13" />

        {showGrid && (
          <rect width={MAP_VIEWBOX.width} height={MAP_VIEWBOX.height} fill="url(#us-map-grid)" />
        )}

        <g filter="url(#us-map-soft-glow)">
          {statePaths.map((state) => (
            <path
              key={state.id}
              d={state.d}
              fill={stateFill}
              stroke={stateStroke}
              strokeWidth={1}
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* Continental highlight rim */}
        <g fill="none" stroke="#64748b" strokeWidth={0.5} opacity={0.5}>
          {statePaths.map((state) => (
            <path key={`rim-${state.id}`} d={state.d} />
          ))}
        </g>

        {children}
      </svg>

      {overlay}
    </div>
  );
}