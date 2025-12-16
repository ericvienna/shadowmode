import { RobotaxiDashboard } from '@/components/RobotaxiDashboard';
import { getDashboardData } from '@/lib/seed-data';

export default function Home() {
  const data = getDashboardData();
  return <RobotaxiDashboard data={data} />;
}
