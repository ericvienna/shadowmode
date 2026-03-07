import { NextResponse } from 'next/server';

// Types for the fleet data
export interface ServiceAreaStats {
  id: string;
  name: string;
  slug: string;
  provider: 'tesla' | 'waymo';
  vehicleCount: number;
  tripCount: number;
  totalMiles: number;
}

export interface FleetData {
  totalVehicles: number;
  totalTrips: number;
  totalMiles: number;
  teslaVehicles: number;
  waymoVehicles: number;
  serviceAreas: ServiceAreaStats[];
  lastUpdated: string;
}

// Cache the fleet data for 5 minutes
let cachedData: FleetData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  // Return cached data if still valid
  if (cachedData && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return NextResponse.json(cachedData);
  }

  try {
    const response = await fetch(
      'https://www.teslarobotaxitracker.com/api/fleet',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ShadowmodeBot/1.0)',
        },
        next: { revalidate: 300 }, // 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch fleet data');
    }

    const data = await response.json();

    // Parse service areas from the response
    const serviceAreas: ServiceAreaStats[] = [];
    let teslaVehicles = 0;
    let waymoVehicles = 0;

    // The API returns service_areas as an array
    if (data.service_areas && Array.isArray(data.service_areas)) {
      for (const area of data.service_areas) {
        // Determine provider from slug (waymo slugs contain 'waymo')
        const slug = area.service_area_slug || '';
        const isWaymo = slug.toLowerCase().includes('waymo');
        const provider: 'tesla' | 'waymo' = isWaymo ? 'waymo' : 'tesla';
        const vehicleCount = area.total_vehicles || 0;

        serviceAreas.push({
          id: area.service_area_id || slug,
          name: area.service_area_name || 'Unknown',
          slug: slug,
          provider,
          vehicleCount,
          tripCount: area.total_trips || 0,
          totalMiles: area.total_miles || 0,
        });

        if (provider === 'tesla') {
          teslaVehicles += vehicleCount;
        } else {
          waymoVehicles += vehicleCount;
        }
      }
    }

    // Sort by vehicle count descending
    serviceAreas.sort((a, b) => b.vehicleCount - a.vehicleCount);

    const fleetData: FleetData = {
      totalVehicles: data.stats?.total_vehicles || teslaVehicles + waymoVehicles,
      totalTrips: data.stats?.total_trips || 0,
      totalMiles: data.stats?.total_miles || 0,
      teslaVehicles,
      waymoVehicles,
      serviceAreas,
      lastUpdated: data.updated_at || new Date().toISOString(),
    };

    // Cache the data
    cachedData = fleetData;
    cacheTimestamp = Date.now();

    return NextResponse.json(fleetData);
  } catch (error) {
    console.error('Fleet API error:', error);

    // Return cached data if available, even if expired
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    return NextResponse.json(
      { error: 'Failed to fetch fleet data' },
      { status: 500 }
    );
  }
}
