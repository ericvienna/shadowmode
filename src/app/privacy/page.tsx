import { ProsePage } from '@/components/prose/ProsePage';

export const metadata = {
  title: 'Privacy — SHADOWMODE',
  description:
    'What SHADOWMODE collects, what it does not, who processes it, and how to have it deleted.',
  alternates: { canonical: 'https://shadowmode.us/privacy' },
};

export default function PrivacyPage() {
  return (
    <ProsePage title="PRIVACY" updated="2026-09-05">
      <p>
        SHADOWMODE is a public dashboard. Reading it requires no account, no login and no
        identification of any kind, and the API is unauthenticated for the same reason. This
        page describes the only two places where data about a visitor exists at all.
      </p>

      <h2>Email, if you give it</h2>
      <p>
        If you submit your email address to the update list, that address is stored so updates
        can be sent to it. It is used for that and nothing else: it is not sold, rented, traded,
        used to build a profile, or passed to advertisers. Storage is handled by Supabase and
        delivery by Resend, both acting as processors on behalf of this site. Ask and the
        address is deleted — see <a href="/contact">contact</a>. There is no retention argument
        to be had about it; the list exists to send updates, so leaving it ends the reason to
        keep the record.
      </p>

      <h2>Traffic measurement</h2>
      <p>
        Page views are counted with Vercel Analytics, which is cookieless and does not attempt
        to identify individual visitors or follow them to other sites. It reports aggregates —
        how many people opened a page, roughly from where. Requests are also logged by the
        hosting platform in the ordinary course of serving them, which includes IP addresses,
        for the operational purposes any web server has: keeping the thing up and stopping
        abuse.
      </p>

      <h2>What is deliberately absent</h2>
      <ul>
        <li>No advertising or third-party tracking scripts.</li>
        <li>No cross-site profiling and no data broker relationships.</li>
        <li>No cookies set by this site for tracking purposes.</li>
        <li>No accounts, so no passwords and no credential storage.</li>
        <li>No collection of location, contacts, or device identifiers.</li>
      </ul>

      <h2>Data about third parties</h2>
      <p>
        The tracked content on this site concerns companies and their published activity —
        regulatory filings, service areas, public posts by public accounts about their own
        products. It is not a database about private individuals, and requests to add one will
        be declined.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes materially, the change is dated here rather than applied quietly.
        Questions, deletion requests, and corrections go through <a href="/contact">contact</a>.
      </p>
    </ProsePage>
  );
}
