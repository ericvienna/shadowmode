import { EnergyPageShell } from '@/components/energy/EnergyPageShell';

export const metadata = {
  title: 'Tesla Energy — SHADOWMODE',
  description: 'Sourced Tesla Energy storage scoreboard — GWh deployed, margins, Megapack deal ledger.',
};

export default function EnergyPage() {
  return <EnergyPageShell />;
}