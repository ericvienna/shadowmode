'use client';

import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, RefreshCw, Rss } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  date: string;
  snippet?: string;
}

// Real news data with verified article links
const REAL_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Tesla Starts Testing Robotaxis in Austin With No Safety Driver',
    source: 'TechCrunch',
    url: 'https://techcrunch.com/2025/12/15/tesla-starts-testing-robotaxis-in-austin-with-no-safety-driver/',
    date: '2025-12-15',
    snippet: 'Tesla is now letting robotaxis drive around Austin with no safety monitor onboard, a major milestone for FSD Unsupervised...',
  },
  {
    id: '2',
    title: 'Empty Tesla Robotaxis Spotted Driving Autonomously in Austin',
    source: 'NotATeslaApp',
    url: 'https://www.notateslaapp.com/news/3424/empty-tesla-robotaxis-spotted-driving-autonomously-in-austin-video',
    date: '2025-12-14',
    snippet: 'Tesla Model Y with zero occupants spotted navigating public roads in Austin, Texas...',
  },
  {
    id: '3',
    title: 'Tesla Robotaxi Goes Driverless as Musk Confirms Safety Monitor Removal',
    source: 'Teslarati',
    url: 'https://www.teslarati.com/tesla-starts-robotaxi-testing-without-any-vehicle-occupants/',
    date: '2025-12-13',
    snippet: 'Testing begins just a week after Musk confirmed Tesla would remove Safety Monitors from vehicles...',
  },
  {
    id: '4',
    title: 'Tesla Is Finally Letting Robotaxis Drive Solo In Austin',
    source: 'InsideEVs',
    url: 'https://insideevs.com/news/781782/tesla-removes-robotaxi-model-y-safety-driver-testing/',
    date: '2025-12-12',
    snippet: 'Six months after starting testing, Tesla removes safety monitors from its robotaxi fleet...',
  },
  {
    id: '5',
    title: 'Tesla to Launch Larger FSD Model After the Holidays',
    source: 'NotATeslaApp',
    url: 'https://www.notateslaapp.com/news/3417/tesla-to-launch-a-larger-fsd-model-after-the-holidays-will-remove-robotaxi-safety-monitors-in-three-weeks',
    date: '2025-12-10',
    snippet: 'New FSD model an order of magnitude larger, introducing reasoning and advanced learning capabilities...',
  },
  {
    id: '6',
    title: 'Musk Slashes Tesla Robotaxi Fleet Goal from 500 to ~60 in Austin',
    source: 'Electrek',
    url: 'https://electrek.co/2025/11/26/elon-musk-slashes-tesla-robotaxi-fleet-goal-austin/',
    date: '2025-11-26',
    snippet: 'Tesla will "roughly double" its Austin fleet next month as riders report long wait times...',
  },
  {
    id: '7',
    title: 'Tesla to Begin Cybercab Production in April, Musk Claims',
    source: 'TechCrunch',
    url: 'https://techcrunch.com/2025/11/06/tesla-to-begin-cybercab-production-in-april-musk-claims/',
    date: '2025-11-06',
    snippet: 'Purpose-built robotaxi without steering wheel or pedals to start production at Texas factory...',
  },
  {
    id: '8',
    title: 'NHTSA Opens New Investigation Into Tesla Full Self-Driving',
    source: 'Road & Track',
    url: 'https://www.roadandtrack.com/news/a68987045/tesla-full-self-driving-system-nhtsa-federal-investigation/',
    date: '2025-10-09',
    snippet: 'Investigation covers 2.9 million vehicles after reports of traffic violations and crashes...',
  },
  {
    id: '9',
    title: 'Tesla FSD Under Investigation for Traffic Safety Violations',
    source: 'TechCrunch',
    url: 'https://techcrunch.com/2025/10/09/teslas-full-self-driving-software-under-investigation-for-traffic-safety-violations/',
    date: '2025-10-09',
    snippet: 'NHTSA probing more than 50 reports of traffic violations including running red lights...',
  },
  {
    id: '10',
    title: 'Tesla Releases FSD v14, First Major Update in a Year',
    source: 'Electrek',
    url: 'https://electrek.co/2025/10/07/tesla-fsd-v14-release-notes/',
    date: '2025-10-07',
    snippet: 'FSD v14 brings learnings from Robotaxi program to consumer vehicles with improved navigation...',
  },
  {
    id: '11',
    title: 'Tesla Robotaxi to Expand Austin Coverage, Bay Area Launch Targeted',
    source: 'Teslarati',
    url: 'https://www.teslarati.com/tesla-robotaxi-to-expand-austin-coverage-bay-area-launch-targeted-in-coming-months/',
    date: '2025-09-15',
    snippet: 'Tesla aims for 500 robotaxis in Austin, 1,000 in Bay Area by end of 2025...',
  },
  {
    id: '12',
    title: 'California Robotaxis: Tesla Gets First Permit for Robotaxi Plans',
    source: 'Autoblog',
    url: 'https://www.autoblog.com/news/tesla-receives-first-round-of-permits-to-operate-robotaxis-in-california',
    date: '2025-03-19',
    snippet: 'CPUC grants Tesla transportation charter-party carrier permit as first step toward robotaxi service...',
  },
  {
    id: '13',
    title: 'What Tesla Can and Can\'t Do With Its New California Permit',
    source: 'TechCrunch',
    url: 'https://techcrunch.com/2025/03/18/what-tesla-can-and-cant-do-in-california-with-its-new-passenger-transportation-permit/',
    date: '2025-03-18',
    snippet: 'TCP permit allows employee transport but doesn\'t authorize autonomous ride-hailing yet...',
  },
  {
    id: '14',
    title: 'Tesla Launches Robotaxi Rides in Austin With Big Promises',
    source: 'TechCrunch',
    url: 'https://techcrunch.com/2025/06/22/tesla-launches-robotaxi-rides-in-austin-with-big-promises-and-unanswered-questions/',
    date: '2025-06-22',
    snippet: 'Service launches in limited capacity in South Austin with Model Y SUVs and safety monitors...',
  },
  {
    id: '15',
    title: 'Tesla\'s Paid Robotaxi Service Is Starting Small but Having Issues',
    source: 'Car and Driver',
    url: 'https://www.caranddriver.com/news/a63632919/tesla-robotaxi-paid-service-start-austin-texas/',
    date: '2025-06-25',
    snippet: 'Initial fleet of about ten Model Y SUVs operating in narrowly defined area of Austin...',
  },
  {
    id: '16',
    title: 'Tesla Begins FSD Supervised Ride-Hail Tests With Employees',
    source: 'TechCrunch',
    url: 'https://techcrunch.com/2025/04/23/tesla-begins-fsd-supervised-ride-hail-tests-with-employees-in-austin-bay-area/',
    date: '2025-04-23',
    snippet: 'Over 1,500 trips and 15,000 miles completed in Austin and San Francisco Bay Area...',
  },
  {
    id: '17',
    title: 'Tesla\'s Cybercab Robotaxi: Everything To Know About the Reveal',
    source: 'MotorTrend',
    url: 'https://www.motortrend.com/news/tesla-robotaxi-first-look-review',
    date: '2024-10-11',
    snippet: 'Cybercab unveiled at "We, Robot" event with no steering wheel or pedals, expected under $30,000...',
  },
  {
    id: '18',
    title: 'Tesla Robotaxi Service Launches in Austin With Safety Drivers',
    source: 'KVUE',
    url: 'https://www.kvue.com/article/money/cars/austin-tesla-robotaxi-launch/269-9d0118a0-a22a-486e-ac6c-a23b84e45d33',
    date: '2025-06-22',
    snippet: 'Tesla\'s highly anticipated robotaxi service begins operating in Austin, Texas...',
  },
];

interface NewsFeedProps {
  maxItems?: number;
}

export function NewsFeed({ maxItems = 5 }: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load news data
    const fetchNews = async () => {
      setIsLoading(true);
      // Sort by date (newest first) and slice
      const sortedNews = [...REAL_NEWS].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      await new Promise(resolve => setTimeout(resolve, 300));
      setNews(sortedNews.slice(0, maxItems));
      setIsLoading(false);
      setLastRefresh(new Date());
    };

    fetchNews();
  }, [maxItems]);

  const refresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      const sortedNews = [...REAL_NEWS].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setNews(sortedNews.slice(0, maxItems));
      setIsLoading(false);
      setLastRefresh(new Date());
    }, 300);
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
