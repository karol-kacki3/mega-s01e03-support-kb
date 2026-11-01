# Investigate day shifts, cross-timezone dates, and invite chronology

## Report count and scope

**5 unique reports** assigned to this finding in source ticket #4471, across 5 tenants, received 2026-04-02 through 2026-10-04. Snapshot: 2026-10-04. These are reports, not unique people or bookings.

Five reports filed under parser do not demonstrate a month/day swap. They describe one-day shifts, different local days for one meeting, or an invite preceding booking. Their root cause is unresolved; do not call a timezone bug proved or assume one mechanism explains all five.

These are five reports, not five proven instances of a single bug. causes.ts classifies all five as parser by tenant/channel, and CauseTable only footnotes them. They are excluded from the 374 parser reports and 33 hint reports in the new review.

## Evidence

### R-41202

kettle.books · nl-NL · booking-v2 · email

> Invite says Tuesday 12 May. Calendar says Monday 11 May. My client turned up on the Monday. We had coffee.

### R-41209

alder.physio · de-DE · booking-v3 · app

> Every booking in June is one day off. Only June. Why only June.

### R-41236

nine.lanterns · pl-PL · booking-v2 · app

> The invite arrived before I made the booking. I would like to know how.

### R-41344

pale.harbour · pt-PT · booking-v3 · email

> Client in Lisbon got Tuesday. Client in Toronto got Monday. Same meeting. We held it twice.

### R-41620

lantern.row · cs-CZ · booking-v2 · email

> Tuesday 6 October showed as Monday. I moved it myself. I have stopped reporting these but my colleague says it helps you.

## Reproduction / investigation

No confirmed reproduction exists in the export. Retrieve the original input, stored instant, event ID, tenant/customer timezones, all-day flag, invite payload, and creation/delivery timestamps for each listed report. Replay the original event across the affected timezones; separately investigate R-41236 creation/delivery chronology.

## Acceptance checks

Compare local-date preservation with UTC conversion, DST boundaries, and timed versus all-day events. Establish expected and observed dates from primary records. Split this investigation if distinct mechanisms are demonstrated; reassign each report once with an audit trail.

## Traceability

Source: src/lib/data/reports-4471.json; tenant configuration: src/lib/data/tenants/; classifier: src/lib/kb/causes.ts; anomaly notes: src/lib/data/desk-notes.json. The source export contains 427 rows, 15 repeats, and 412 unique reports. The three ticket counts partition that total without overlaps.

KB review: src/routes/kb/incidents/4471-review/+page.svx. Count routine: src/lib/kb/incident-review.ts. Run node --test scripts/incident-review.test.mjs. The known status and queued fix are not evidence of recovery; fresh reports continue through the snapshot.

### Assigned report IDs

```text
R-41202
R-41209
R-41236
R-41344
R-41620
```
