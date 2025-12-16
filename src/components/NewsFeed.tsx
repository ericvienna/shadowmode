'use client';

import { useState, useEffect, useCallback } from 'react';
import { Newspaper, ExternalLink, RefreshCw, Rss } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  date: string;
  snippet?: string;
}

interface NewsFeedProps {
  maxItems?: number;
}

export function NewsFeed({ maxItems = 5 }: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/news');
      if (response.ok) {
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
          setNews(data.articles.slice(0, maxItems));
          setIsLive(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  }, [maxItems]);

  useEffect(() => {
    setMounted(true);
    fetchNews();

    // Auto-refresh every 15 minutes
    const interval = setInterval(fetchNews, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const refresh = () => {
    fetchNews();
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      'TechCrunch': 'bg-emerald-500/20 text-emerald-400',
      'Electrek': 'bg-green-500/20 text-green-400',
      'Teslarati': 'bg-red-600/20 text-red-300',
      'InsideEVs': 'bg-purple-500/20 text-purple-400',
      'NotATeslaApp': 'bg-blue-500/20 text-blue-400',
      'Road & Track': 'bg-orange-500/20 text-orange-400',
      'Autoblog': 'bg-amber-500/20 text-amber-400',
      'Car and Driver': 'bg-red-500/20 text-red-400',
      'MotorTrend': 'bg-cyan-500/20 text-cyan-400',
      'KVUE': 'bg-sky-500/20 text-sky-400',
      'Reuters': 'bg-indigo-500/20 text-indigo-400',
      'Bloomberg': 'bg-pink-500/20 text-pink-400',
      'CNBC': 'bg-yellow-500/20 text-yellow-400',
      'The Verge': 'bg-fuchsia-500/20 text-fuchsia-400',
      'Ars Technica': 'bg-orange-600/20 text-orange-300',
      'WSJ': 'bg-neutral-600/30 text-neutral-300',
    };
    return colors[source] || 'bg-neutral-800 text-neutral-400';
  };

  const formatNewsDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-blue-500" />
          <h3 className="text-white text-xs font-semibold">Latest News</h3>
          {isLive && (
            <span className="text-[8px] text-green-500 animate-pulse">Live</span>
          )}
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="p-1.5 hover:bg-neutral-800 rounded transition-colors"
        >
          <RefreshCw className={`w-3 h-3 text-neutral-500 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="divide-y divide-neutral-800/50">
        {isLoading ? (
          <div className="px-4 py-8 text-center">
            <RefreshCw className="w-5 h-5 text-neutral-600 animate-spin mx-auto mb-2" />
            <span className="text-neutral-500 text-[10px]">Loading news...</span>
          </div>
        ) : (
          news.map((item, index) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 hover:bg-neutral-900/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-neutral-200 text-xs font-medium mb-1 line-clamp-2 hover:text-white transition-colors">
                    {item.title}
                  </h4>
                  {item.snippet && (
                    <p className="text-neutral-500 text-[10px] line-clamp-2 mb-2">
                      {item.snippet}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${getSourceColor(item.source)}`}>
                      {item.source}
                    </span>
                    <span className="text-neutral-600 text-[9px]">
                      {formatNewsDate(item.date)}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-neutral-600 flex-shrink-0 mt-1" />
              </div>
            </a>
          ))
        )}
      </div>

      <div className="px-4 py-2 border-t border-neutral-800 flex items-center justify-between">
        <span className="text-neutral-600 text-[9px]">
          Last updated: {mounted && lastRefresh ? lastRefresh.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }) : '—'}
        </span>
        <a
          href="https://news.google.com/search?q=tesla+robotaxi"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[9px] text-neutral-500 hover:text-white transition-colors"
        >
          <Rss className="w-3 h-3" />
          More news
        </a>
      </div>
    </div>
  );
}
