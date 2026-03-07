import { RobotaxiDashboard } from '@/components/RobotaxiDashboard';
import { getDashboardDataFromDB } from '@/lib/db';

// Revalidate every 60 seconds — data now lives in Supabase
export const revalidate = 60;

export default async function Home() {
  const data = await getDashboardDataFromDB();
  return <RobotaxiDashboard data={data} />;
}
