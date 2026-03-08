import { NextResponse } from 'next/server';

// Cache the stock data for 60 seconds to avoid rate limiting
let cachedData: {
  price: number;
  change: number;
  changePercent: number;
  isMarketOpen: boolean;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 60 * 1000; // 60 seconds

export async function GET() {
  // Return cached data if still valid
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return NextResponse.json({
      price: cachedData.price,
      change: cachedData.change,
      changePercent: cachedData.changePercent,
      isMarketOpen: cachedData.isMarketOpen,
    });
  }

  try {
    // Use Yahoo Finance API (no key required)
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/TSLA?interval=1d&range=1d',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }

    const data = await response.json();
    const quote = data.chart.result[0];
    const meta = quote.meta;

    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose || meta.previousClose;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    // Check if market is open (US Eastern Time: 9:30 AM - 4:00 PM, Mon-Fri)
    const now = new Date();
    const etTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const hours = etTime.getHours();
    const minutes = etTime.getMinutes();
    const day = etTime.getDay();
    const timeInMinutes = hours * 60 + minutes;
    const marketOpenTime = 9 * 60 + 30; // 9:30 AM
    const marketCloseTime = 16 * 60; // 4:00 PM
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = timeInMinutes >= marketOpenTime && timeInMinutes < marketCloseTime;
    const isMarketOpen = isWeekday && isMarketHours;

    // Cache the data
    cachedData = {
      price: currentPrice,
      change,
      changePercent,
      isMarketOpen,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      price: currentPrice,
      change,
      changePercent,
      isMarketOpen,
    });
  } catch (error) {
    console.error('Stock API error:', error);

    // Return cached data if available, even if expired
    if (cachedData) {
      return NextResponse.json({
        price: cachedData.price,
        change: cachedData.change,
        changePercent: cachedData.changePercent,
        isMarketOpen: false,
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
