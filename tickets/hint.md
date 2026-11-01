# booking-v3 date hint disagrees with day-first form reading

## Report count and scope

**33 unique reports** assigned to this finding in source ticket #4471, across 3 tenants, received 2026-04-17 through 2026-09-22. Snapshot: 2026-10-04. These are reports, not unique people or bookings.

booking-v3 displays MM/DD/YYYY but the form reads dates in the day-first tenant order. A fix to the shared parser alone does not establish that this separate form defect is fixed.

Use tenant locale, form version, and channel, not browser locale or intakeTag. Fifteen of these reports are tagged parser at intake, but still belong to this form failure.

## Evidence

### R-41230

copper.studio · es-ES · booking-v3 · form

> My client came on 1 June instead of 6 January. We sorted it out.

### R-41241

alder.physio · de-DE · booking-v3 · form

> We had two people show up on 8 June. They were booked for 6 August.

### R-41251

pale.harbour · pt-PT · booking-v3 · form

> Wednesday 7 January showed as Wednesday 1 July. I moved it myself.

## Reproduction / investigation

Open a day-first booking-v3 tenant form (Copper Studio es-ES, Alder Physio de-DE, or Pale Harbour pt-PT). Follow the displayed MM/DD/YYYY hint and type 01/06/2026 intending 6 January. Expected: 6 January; day-first reading produces 1 June. This is a proposed reproduction, not an executed product test.

## Acceptance checks

Make the hint, validation, and reading agree with the tenant date contract. Test all three affected tenant locales, month-first tenants, booking-v2 as a control, and app/email paths independently.

## Traceability

Source: src/lib/data/reports-4471.json; tenant configuration: src/lib/data/tenants/; classifier: src/lib/kb/causes.ts; anomaly notes: src/lib/data/desk-notes.json. The source export contains 427 rows, 15 repeats, and 412 unique reports. The three ticket counts partition that total without overlaps.

KB review: src/routes/kb/incidents/4471-review/+page.svx. Count routine: src/lib/kb/incident-review.ts. Run node --test scripts/incident-review.test.mjs. The known status and queued fix are not evidence of recovery; fresh reports continue through the snapshot.

### Assigned report IDs

```text
R-41230
R-41241
R-41251
R-41259
R-41262
R-41275
R-41294
R-41305
R-41308
R-41366
R-41372
R-41384
R-41387
R-41396
R-41400
R-41406
R-41415
R-41416
R-41418
R-41428
R-41439
R-41441
R-41449
R-41453
R-41456
R-41460
R-41472
R-41485
R-41493
R-41539
R-41572
R-41582
R-41584
```
