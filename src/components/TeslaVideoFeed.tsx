'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { TESLA_HERO_CLIPS, type TeslaHeroClip } from '@/lib/tesla-hero-videos';

const ROTATE_MS = 30_000;

interface TeslaVideoFeedProps {
  clips?: TeslaHeroClip[];
}

export function TeslaVideoFeed({ clips = TESLA_HERO_CLIPS }: TeslaVideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const indexRef = useRef(0);
  const [clipIndex, setClipIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [error, setError] = useState(false);

  const current = clips[clipIndex % clips.length];

  const advance = useCallback(() => {
    indexRef.current = (indexRef.current + 1) % clips.length;
    setClipIndex(indexRef.current);
    setLoaded(false);
  }, [clips.length]);

  useEffect(() => {
    const timer = setInterval(advance, ROTATE_MS);
    return () => clearInterval(timer);
  }, [advance]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(false);
    setLoaded(false);
    video.load();

    const tryPlay = () => {
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    };

    const onCanPlay = () => {
      setLoaded(true);
      tryPlay();
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onError = () => setError(true);

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('error', onError);
    };
  }, [clipIndex]);

  const handlePlay = () => {
    videoRef.current?.play();
    setPlaying(true);
  };

  const handlePause = () => {
    videoRef.current?.pause();
    setPlaying(false);
  };

  return (
    <div className="group absolute inset-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        key={current.src}
        className="absolute inset-0 h-full w-full object-cover"
        src={current.src}
        muted
        playsInline
        autoPlay
        loop
        preload="auto"
      />

      {!loaded && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-950">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-800 border-t-red-500" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-950 px-4 text-center text-[10px] text-neutral-500">
          Video unavailable
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 pb-2 pt-6">
        <p className="truncate text-[9px] font-medium uppercase tracking-wide text-white/70">
          {current.title}
        </p>
      </div>

      <div className="absolute inset-0 z-20 flex items-center justify-center gap-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
          type="button"
          aria-label="Play"
          onClick={handlePlay}
          className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
            playing
              ? 'bg-black/40 text-white/50 hover:bg-black/60 hover:text-white'
              : 'bg-black/70 text-white shadow-lg'
          }`}
        >
          <Play className="h-4 w-4 fill-current" />
        </button>
        <button
          type="button"
          aria-label="Pause"
          onClick={handlePause}
          className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
            !playing
              ? 'bg-black/70 text-white shadow-lg'
              : 'bg-black/40 text-white/50 hover:bg-black/60 hover:text-white'
          }`}
        >
          <Pause className="h-4 w-4 fill-current" />
        </button>
      </div>
    </div>
  );
}