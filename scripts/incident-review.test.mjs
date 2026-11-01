import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { reviewIncident } from '../src/lib/kb/incident-review.ts';
import { causeOf, sameCause } from '../src/lib/kb/causes.ts';
import { deskRef } from '../src/lib/kb/desk-ref.ts';

const reports = JSON.parse(fs.readFileSync(new URL('../src/lib/data/reports-4471.json', import.meta.url)));
const notes = JSON.parse(fs.readFileSync(new URL('../src/lib/data/desk-notes.json', import.meta.url)));
const dir = new URL('../src/lib/data/tenants/', import.meta.url);
const tenants = fs.readdirSync(dir).map(name => JSON.parse(fs.readFileSync(new URL(name, dir))));
const review = () => reviewIncident(reports, tenants, notes.oneDayMove);

test('every unique merged report belongs to exactly one finding', () => {
  const r = review();
  assert.equal(r.rawRows, 427);
  assert.equal(r.total, 412);
  assert.equal(r.repeatedRows, 15);
  assert.deepEqual(r.rows.map(g => [g.finding, g.count]), [['parser', 374], ['hint', 33], ['investigation', 5]]);
  const ids = r.rows.flatMap(g => g.reports.map(report => report.id));
  assert.equal(ids.length, new Set(ids).size);
  assert.equal(ids.length, r.total);
  assert.equal(r.unplaced.length, 0);
});

test('preserve and explain the original heuristic counts', () => {
  const r = review();
  assert.deepEqual(r.heuristicGroups.map(g => [g.cause, g.reports.length]), [['parser', 379], ['hint', 33]]);
  assert.equal(r.intakeDisagreements, 38);
  assert.deepEqual(r.rows[2].reports.map(r => r.id).sort(), [...notes.oneDayMove].sort());
});

test('browser locale and intake tags do not decide tenant causes', () => {
  const report = reports.find(r => r.id === 'R-41205');
  assert.equal(report.meta.browserLocale, 'en-US');
  assert.equal(report.meta.intakeTag, 'hint');
  assert.equal(causeOf(report, tenants.find(t => t.handle === report.tenant)), 'parser');
});

test('same tenant and subject can have different causes by channel', () => {
  const tenant = tenants.find(t => t.handle === 'alder.physio');
  assert.equal(sameCause({channel: 'app'}, tenant, {channel: 'form'}, tenant), false);
  assert.equal(sameCause({channel: 'app'}, tenant, {channel: 'email'}, tenant), true);
  assert.equal(causeOf({channel: 'form'}, {handle: 'us', name: 'US', locale: 'en-US', form: 'booking-v3'}), null);
  assert.equal(causeOf({channel: 'email'}, undefined), null);
});

test('overlapping export pages never inflate the findings', () => {
  assert.deepEqual(reviewIncident([...reports, ...reports], tenants, notes.oneDayMove).rows, review().rows);
});

test('signed review uses the real stamp function and required page structure', () => {
  const page = fs.readFileSync(new URL('../src/routes/kb/incidents/4471-review/+page.svx', import.meta.url), 'utf8');
  const signature = page.match(/^signature: '([^']+)'$/m)?.[1];
  assert.ok(signature);
  assert.match(deskRef(signature), /^DR-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
  for (const key of ['title', 'owner', 'status', 'reviewed', 'signature']) assert.match(page, new RegExp(`^${key}:`, 'm'));
  assert.ok(page.trimEnd().endsWith('<RenderStamp {signature} />'));
  console.log(`Review desk ref: ${deskRef(signature)}`);
});
