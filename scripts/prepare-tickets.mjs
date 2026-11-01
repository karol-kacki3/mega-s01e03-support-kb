import fs from 'node:fs';
import { reviewIncident } from '../src/lib/kb/incident-review.ts';

const root = new URL('../', import.meta.url);
const reports = JSON.parse(fs.readFileSync(new URL('src/lib/data/reports-4471.json', root)));
const notes = JSON.parse(fs.readFileSync(new URL('src/lib/data/desk-notes.json', root)));
const directory = new URL('src/lib/data/tenants/', root);
const tenants = fs.readdirSync(directory).map(name => JSON.parse(fs.readFileSync(new URL(name, directory))));
const review = reviewIncident(reports, tenants, notes.oneDayMove);
const descriptions = {
  parser: {
    title: 'Day-first tenant dates parsed month-first',
    description: 'The shared app/email parser interprets dates month-first although the tenant writes day-first. This is separate from the booking-v3 form hint failure.',
    evidence: ['R-41200', 'R-41205'],
    reproduction: 'As a day-first tenant (for example Harbour Dental, en-GB), submit 07/04/2026 through the shared date parser. Expected: 7 April 2026. Reported: 4 July 2026. This is a proposed reproduction from the export; the product executable is not included.',
    checks: 'Make parsing obey an explicit tenant date contract. Test ambiguous dates, dates with days above 12, month-first tenants, app/email channels, and locale switching. Confirm original entered values against stored bookings and emitted invites.',
    caveat: 'The original locale/channel classifier assigns 379 reports to parser. Five contradictory day/chronology observations are held in the investigation ticket, leaving 374 assigned here. Do not double-count those five or assert that this fix resolves them.',
  },
  hint: {
    title: 'booking-v3 date hint disagrees with day-first form reading',
    description: 'booking-v3 displays MM/DD/YYYY but the form reads dates in the day-first tenant order. A fix to the shared parser alone does not establish that this separate form defect is fixed.',
    evidence: ['R-41230', 'R-41241', 'R-41251'],
    reproduction: 'Open a day-first booking-v3 tenant form (Copper Studio es-ES, Alder Physio de-DE, or Pale Harbour pt-PT). Follow the displayed MM/DD/YYYY hint and type 01/06/2026 intending 6 January. Expected: 6 January; day-first reading produces 1 June. This is a proposed reproduction, not an executed product test.',
    checks: 'Make the hint, validation, and reading agree with the tenant date contract. Test all three affected tenant locales, month-first tenants, booking-v2 as a control, and app/email paths independently.',
    caveat: 'Use tenant locale, form version, and channel, not browser locale or intakeTag. Fifteen of these reports are tagged parser at intake, but still belong to this form failure.',
  },
  investigation: {
    title: 'Investigate day shifts, cross-timezone dates, and invite chronology',
    description: 'Five reports filed under parser do not demonstrate a month/day swap. They describe one-day shifts, different local days for one meeting, or an invite preceding booking. Their root cause is unresolved; do not call a timezone bug proved or assume one mechanism explains all five.',
    evidence: notes.oneDayMove,
    reproduction: 'No confirmed reproduction exists in the export. Retrieve the original input, stored instant, event ID, tenant/customer timezones, all-day flag, invite payload, and creation/delivery timestamps for each listed report. Replay the original event across the affected timezones; separately investigate R-41236 creation/delivery chronology.',
    checks: 'Compare local-date preservation with UTC conversion, DST boundaries, and timed versus all-day events. Establish expected and observed dates from primary records. Split this investigation if distinct mechanisms are demonstrated; reassign each report once with an audit trail.',
    caveat: 'These are five reports, not five proven instances of a single bug. causes.ts classifies all five as parser by tenant/channel, and CauseTable only footnotes them. They are excluded from the 374 parser reports and 33 hint reports in the new review.',
  },
};

fs.mkdirSync(new URL('tickets/', root), {recursive: true});
for (const row of review.rows) {
  const d = descriptions[row.finding];
  const evidence = d.evidence.map(id => {
    const r = row.reports.find(r => r.id === id);
    const t = tenants.find(t => t.handle === r.tenant);
    return `### ${id}\n\n${r.tenant} · ${t.locale} · ${t.form} · ${r.channel}\n\n> ${r.body}\n`;
  }).join('\n');
  const body = `# ${d.title}\n\n## Report count and scope\n\n**${row.count} unique reports** assigned to this finding in source ticket #4471, across ${row.tenants} tenants, received ${row.firstSeen} through ${row.lastSeen}. Snapshot: 2026-10-04. These are reports, not unique people or bookings.\n\n${d.description}\n\n${d.caveat}\n\n## Evidence\n\n${evidence}\n## Reproduction / investigation\n\n${d.reproduction}\n\n## Acceptance checks\n\n${d.checks}\n\n## Traceability\n\nSource: src/lib/data/reports-4471.json; tenant configuration: src/lib/data/tenants/; classifier: src/lib/kb/causes.ts; anomaly notes: src/lib/data/desk-notes.json. The source export contains ${review.rawRows} rows, ${review.repeatedRows} repeats, and ${review.total} unique reports. The three ticket counts partition that total without overlaps.\n\nKB review: src/routes/kb/incidents/4471-review/+page.svx. Count routine: src/lib/kb/incident-review.ts. Run node --test scripts/incident-review.test.mjs. The known status and queued fix are not evidence of recovery; fresh reports continue through the snapshot.\n\n### Assigned report IDs\n\n\`\`\`text\n${row.reports.map(r => r.id).join('\n')}\n\`\`\`\n`;
  fs.writeFileSync(new URL(`tickets/${row.finding}.md`, root), body);
  console.log(`${row.finding}: ${row.count} reports — ${d.title}`);
}
