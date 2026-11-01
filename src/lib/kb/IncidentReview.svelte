<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { reviewIncident, type Finding } from '#lib/kb/incident-review';
  import type { Report, Tenant } from '#lib/kb/causes';

  const tenants = Object.values(import.meta.glob<Tenant>('/src/lib/data/tenants/*.json', { eager: true, import: 'default' }));
  const review = $derived(reviewIncident(reports as Report[], tenants, notes.oneDayMove));
  const titles: Record<Finding, string> = {
    parser: 'Month-first parser for day-first tenant dates',
    hint: 'Month-first booking-v3 hint with day-first reading',
    investigation: 'Unresolved day/chronology anomalies',
  };
  const issues: Record<Finding, string> = {
    parser: 'https://github.com/karol-kacki3/mega-s01e03-support-kb/issues/1',
    hint: 'https://github.com/karol-kacki3/mega-s01e03-support-kb/issues/2',
    investigation: 'https://github.com/karol-kacki3/mega-s01e03-support-kb/issues/3',
  };
</script>

<p>
  The export contains {review.rawRows} rows and {review.uniqueReports} unique reports;
  {review.repeatedRows} repeated rows are not additional reports.
  {review.total} unique reports belong to #4471. The counts below are mutually exclusive.
</p>

<table>
  <thead><tr><th>finding and ticket</th><th>reports</th><th>tenants</th><th>received</th></tr></thead>
  <tbody>
    {#each review.rows as row (row.finding)}
      <tr>
        <td><a href={issues[row.finding]}>{titles[row.finding]}</a></td>
        <td>{row.count}</td><td>{row.tenants}</td>
        <td>{row.firstSeen} → {row.lastSeen}</td>
      </tr>
    {/each}
  </tbody>
</table>

<p>
  The existing classifier instead groups
  {review.heuristicGroups.map((g) => `${g.cause}: ${g.reports.length}`).join(' · ')}.
  Its parser bucket includes the reports held for investigation above.
  Intake tags disagree with that classifier on {review.intakeDisagreements} reports.
  Neither an intake tag nor a rule-based classification proves the cause of an anomalous report.
</p>

{#if review.unplaced.length}
  <p>Unplaced reports: {review.unplaced.length}. Investigate these before relying on the totals.</p>
{/if}

<h3>Reports held for investigation</h3>
{#each review.rows.find((r) => r.finding === 'investigation')?.reports ?? [] as report (report.id)}
  <p><strong>{report.id}</strong> · {report.tenant} · {report.channel} · {report.receivedAt}</p>
  <blockquote>{report.body}</blockquote>
{/each}
