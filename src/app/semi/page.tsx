import { SemiPageShell } from '@/components/semi/SemiPageShell';

export const metadata = {
  title: 'Tesla Semi — SHADOWMODE',
  description:
    'Sourced Tesla Semi contract ledger — order book, conversion gap, production ramp, megacharger infra.',
};

export default function SemiPage() {
  return (
    <>
      <h1 className="sr-only">
        Tesla Semi contract ledger — order book, conversion gap, production ramp
        and megacharger infrastructure
      </h1>
      <SemiPageShell />
    </>
  );
}