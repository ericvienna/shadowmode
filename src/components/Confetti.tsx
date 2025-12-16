'use client';

import { useEffect, useState } from 'react';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<Array<{
    id: number;
    left: number;
    delay: number;
    color: string;
    size: number;
  }>>([]);

  useEffect(() => {
    if (trigger) {
      const colors = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#a855f7', '#ec4899'];
      const newPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
      }));
      setPieces(newPieces);

      const timeout = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 3500);

      return () => clearTimeout(timeout);
    }
  }, [trigger, onComplete]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="confetti-piece absolute"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  );
}
