# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

## S01E03 review

The signed review is at `src/routes/kb/incidents/4471-review/+page.svx`.
It separates 374 parser reports, 33 form-hint reports, and 5 unresolved day/chronology
observations. These are disjoint report lists, not counts of customers or bookings.
The existing classifier's 379-parser / 33-hint result is preserved and explained;
it puts the five unresolved observations in its parser bucket.

Public tickets: [parser](https://github.com/karol-kacki3/mega-s01e03-support-kb/issues/1),
[hint](https://github.com/karol-kacki3/mega-s01e03-support-kb/issues/2), and
[investigation](https://github.com/karol-kacki3/mega-s01e03-support-kb/issues/3).

Using Node 24 (no dependency installation required):

```sh
node --test scripts/incident-review.test.mjs
node scripts/prepare-tickets.mjs
```

The scripts run the actual TypeScript count and desk-reference functions. The export
does not include the product executable, so these checks do not reproduce product bugs.
Keep accepted decision records unchanged; proposed operational changes require desk approval.

### Render the actual signed page

The review adds a standalone Svelte/mdsvex server-rendering build for this source-only
export. It compiles the actual `.svx`, shared runbook layout, and imported components;
it is not a handwritten HTML substitute or a recreation of the original full application.

```sh
npm ci
npm run build
npm test
```

The output committed for the desk is `rendered/4471-review.html`. Download and open it
in a browser to read the styled static snapshot. Its counts, timeline, and signature
stamp come from the real components and source data. Internal `/kb` links refer to the
original KB routes; this snapshot does not deploy those routes or interactive navigation.
Build dependencies and intermediate bundles are ignored; the lockfile is committed.

### Desk closure update

The signed-in course page reports source ticket #4471 closed on 5 October 2026:
the parser was fixed (`fix(dates): parse dd/mm for eu locales`), and the hint was
marked won't fix because booking-v3 was retired. The parser ticket is closed as
completed, and the hint ticket as not planned. The investigation remains open:
the update does not establish a cause or resolution for its five observations.
These are desk-reported outcomes, not product fixes or verification performed here.
