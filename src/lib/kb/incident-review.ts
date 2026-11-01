import { causeOf, groupByCause, uniqueById, type Report, type Tenant } from './causes.ts';

export type Finding = 'parser' | 'hint' | 'investigation';
export const FINDINGS: readonly Finding[] = ['parser', 'hint', 'investigation'];

// Desk notes identify observations that contradict the broad locale/channel classifier.
// Preserve them for investigation; neither a parser nor a timezone cause is proved by a label.
export function reviewIncident(reports: Report[], tenants: Tenant[], anomalyIds: readonly string[], ticket = 4471) {
  const tenantByHandle = new Map(tenants.map((t) => [t.handle, t]));
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const anomalies = new Set(anomalyIds);
  const groups = new Map<Finding, Report[]>(FINDINGS.map((finding) => [finding, []]));
  const unplaced: Report[] = [];

  for (const r of merged) {
    const finding = anomalies.has(r.id) ? 'investigation' : causeOf(r, tenantByHandle.get(r.tenant));
    if (finding) groups.get(finding)!.push(r);
    else unplaced.push(r);
  }

  const rows = FINDINGS.map((finding) => {
    const members = groups.get(finding)!;
    const days = members.map((r) => r.receivedAt.slice(0, 10)).sort();
    return {
      finding,
      reports: members,
      count: members.length,
      tenants: new Set(members.map((r) => r.tenant)).size,
      firstSeen: days[0] ?? null,
      lastSeen: days.at(-1) ?? null,
    };
  });

  return {
    rawRows: reports.length,
    uniqueReports: uniqueById(reports).length,
    total: merged.length,
    repeatedRows: reports.length - uniqueById(reports).length,
    rows,
    unplaced,
    heuristicGroups: groupByCause(merged, (r) => tenantByHandle.get(r.tenant)),
    intakeDisagreements: merged.filter((r) => {
      const cause = causeOf(r, tenantByHandle.get(r.tenant));
      return cause !== null && cause !== r.meta.intakeTag;
    }).length,
  };
}
