import { RobotaxiDashboard } from '@/components/RobotaxiDashboard';
import { getDashboardDataFromDB } from '@/lib/db';

// Revalidate every 60 seconds — data now lives in Supabase
export const revalidate = 60;

export default async function Home() {
  const data = await getDashboardDataFromDB();
  return (
    <>
      {/* The terminal carries its name as a logo, so the document had no H1 at
          all — a crawler reading raw HTML saw a page with no stated subject.
          Visually hidden, present in the server-rendered markup. */}
      <h1 className="sr-only">
        SHADOWMODE — Tesla robotaxi deployment tracker: regulatory milestones,
        supervision level and fleet observations across US metros
      </h1>
      <RobotaxiDashboard data={data} />
    </>
  );
}
