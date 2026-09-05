import { ProsePage } from '@/components/prose/ProsePage';
import { CONTACT_EMAIL, REPO_URL, REPO_ISSUES_URL } from '@/lib/contact';

export const metadata = {
  title: 'Contact — SHADOWMODE',
  description:
    'How to report a wrong number, request a correction or deletion, or reach the operator of SHADOWMODE.',
  alternates: { canonical: 'https://shadowmode.us/contact' },
};

export default function ContactPage() {
  return (
    <ProsePage title="CONTACT" updated="2026-09-05">
      <p>
        SHADOWMODE is run by one operator, not a support department. There is no ticket queue
        and no phone tree. The channels below are the real ones, and they are read.
      </p>

      <h2>Report a wrong number</h2>
      <p>
        This is the message most worth sending. If a figure here is wrong, stale, or missing the
        caveat that makes it honest, say so and point at the primary source — a filing, a
        regulator page, an operator&apos;s own announcement. Sourced corrections are applied and
        logged publicly in the <a href="/api/changelog">change log</a>, marked as corrections
        rather than edited away. Corrections to this site&apos;s own published numbers are
        treated as the point of the exercise, not an embarrassment.
      </p>
      <p>
        Open an issue at <a href={REPO_ISSUES_URL}>{REPO_ISSUES_URL.replace('https://', '')}</a>.
        The tracker is open source — the code that produces every number on this site is at{' '}
        <a href={REPO_URL}>{REPO_URL.replace('https://', '')}</a>, so a claim about how a figure
        was computed can be checked rather than argued about.
      </p>

      <h2>Data, deletion and privacy requests</h2>
      <p>
        To have your address removed from the update list, or to ask what is stored about you,
        use the same channel. The honest answer is usually &ldquo;an email address and nothing
        else&rdquo; — see <a href="/privacy">privacy</a> for the full picture. Deletion requests
        are actioned, not negotiated.
      </p>

      {CONTACT_EMAIL ? (
        <>
          <h2>Email</h2>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </>
      ) : null}

      <h2>Updates</h2>
      <p>
        The update list is the outbound channel: material changes to the trackers, and
        corrections when they happen. Sign up from the{' '}
        <a href="/">terminal</a>. It is low volume and there is an unsubscribe on everything.
      </p>

      <h2>What will not get an answer</h2>
      <ul>
        <li>
          Requests for investment advice, price targets, or a view on what to buy or sell. There
          is none here — see <a href="/about">about</a>.
        </li>
        <li>Requests to add data about private individuals.</li>
        <li>Requests to remove a sourced, accurate figure about a company&apos;s public activity.</li>
      </ul>

      <h2>For agents</h2>
      <p>
        If you are an automated client, you probably want the{' '}
        <a href="/openapi.json">OpenAPI specification</a> or{' '}
        <a href="/llms.txt">llms.txt</a> rather than this page. Both describe the full public
        read surface, and the endpoints need no credentials.
      </p>
    </ProsePage>
  );
}
