import { RobotaxiDashboard } from '@/components/RobotaxiDashboard';
import { getDashboardData } from '@/lib/seed-data';

// Revalidate page every 5 minutes (300 seconds)
export const revalidate = 300;

export default function Home() {
  const data = getDashboardData();
  return <RobotaxiDashboard data={data} />;
}
