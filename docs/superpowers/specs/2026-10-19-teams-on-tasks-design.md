# Teams on Tasks

**Status: draft for discussion — nothing here is implemented.** Section invariants stay in [`Teams.md`](../../../src/Sections/Humans.Teams/Docs/Teams.md); this file becomes the user-facing spec once agreed. Items marked **[OPEN]** are undecided.

Teams is the first host of the [Tasks module](2026-10-19-tasks-module-design.md), which owns tasks, slots, openness, endorsement, capabilities, milestones, Get involved and the production view. This spec covers what is specific to teams. Raising and handling concerns, including deselection, is its own spec: [Concerns](2026-10-19-concerns-design.md).

## What Teams gains

A team page that shows a visitor a way in — who to talk to, when the next meeting is and what it covers, what needs doing, what's coming — and shifts with how involved the viewer is. Roles go away; work, access and responsibility are held through tasks. The coordinator's job shrinks to making sure every task has someone on it, while the people doing the work hold the tools for it. Engagement is the goal; the full case is in the Tasks spec.

Non-goals: replacing Shifts rotas, replacing Camps' own roles (`CampRoleDefinition`), replacing the Workgroups register.

## Teams as a host

- **Containers** are teams (departments and sub-teams). Hidden and sensitive flags are passed to Tasks, which honours them in every org view.
- **Staffing task** is the team's **coordination** task.
- **Standing tasks** every team gets at creation (a small sub-team can inherit its department's coordination and switch the rest on only when it wants a landing page **[OPEN: proposed, to limit overhead for many small teams; what counts as a team is a community definition the tool does not need to settle]**):
  - **Coordination** — see below.
  - **Contact point** (`team.contact`).
  - **Take part** — open, unlimited, no capability; the front door for people with no specific task, and where migrated members land.
  - **Concern panel representative** — the seat the team fills on deselection panels ([Concerns](2026-10-19-concerns-design.md)).
- **Reactions:** taking a slot creates the `TeamMember` row; the last slot ending starts the contributor window, after which the row ends (below).
- **System teams** (Volunteers, Coordinators, Board, Asociados, Colaboradors, Barrio Leads) stay automatic. Board governance roles become Board tasks, held only by existing sync-managed members, as today.
- **Workgroups do not affect teams.** Nothing a workgroup host does creates team membership, access or Coordinators-team entries; the only bridge is the opt-in affiliation lens, which makes a holder an *associate* (invitations only).

## Team page by involvement

| Section | Visitor | Contributor | Holder | Coordinator |
|---|---|---|---|---|
| Summary (page content) | ✔ | ✔ | ✔ | ✔ |
| Next meeting and topics | ✔ | ✔ | ✔ | ✔ |
| **Contact point** — holders of `team.contact` | ✔ | ✔ | ✔ | ✔ |
| Tasks, open first | ✔ | ✔ | ✔ | ✔ |
| Timeline & milestone progress | ✔ | ✔ | ✔ | ✔ |
| Handbook pages (visibility set per page) | public ones | + signed-in ones | all, can edit | all, can edit |
| Past meetings and notes | — | ✔ | ✔ | ✔ |
| My tasks / what's next on me | — | ✔ | ✔ | ✔ |
| Team resources | — | — | by capability | by capability |
| Staffing gaps, sole-holder flags, pick-up requests | — | — | — | ✔ |

- **Contact point** shows the holders of `team.contact`, not the coordinators. If nobody holds it, the section falls back to the coordinators and the task counts as unfilled. Replaces `ShowCoordinatorsOnPublicPage`.
- **Page content** is edited by holders of `team.page`.
- With no meeting posted, the meeting section says so and points to the contact point.
- Hidden teams stay invisible to non-admins. Contact visibility follows existing profile contact rules; no new personal data reaches visitors.

## Involvement and membership

Involvement is derived, never a roster:
- *Visitor* — no relationship.
- *Contributor* — finished a task here within the contributor window **[OPEN: default 12 months]**.
- *Holder* — holds an active slot.
- *Coordinator / Deputy* — holds a coordination slot.
- *Associate* — holds a task homed elsewhere (a working group or another team) that is **affiliated** with this team. An associate is invited to the team's meetings and sees what a contributor sees, but is not a member: no `TeamMember` row, no Google or Drive access, no authority.

Membership follows: taking any slot creates the `TeamMember` row; it persists while the person holds a slot or is a contributor, then ends. There is no join request and no manual add; coordinators confirm or nominate into slots.

`TeamMember` stays the anchor for legal-requirement inheritance and sub-team rollup. Because open tasks make membership self-service, **membership alone grants no access**: Group, Drive and other resources follow capabilities.

## Coordination

Three separate jobs, never merged: the **coordinator** makes sure every task has someone; the **contact point** faces the rest of the org; **reporting** items belong to the holders of the tasks behind a reporting milestone. One person may hold several, but each is its own task.

- **Slots:** primary (coordinators) and secondary (deputies) counts are team settings, default one of each; no minimum is enforced. An empty coordination task is Critical and flagged (Tasks: Gap cover).
- **Powers — staffing only:** create, edit and cancel the team's (and its sub-teams') tasks; confirm or decline pick-ups; nominate and remove holders; see staffing gaps. Deputies have the same powers and join the Coordinators system team. Nothing else is implicit; sub-team slots do not join the Coordinators system team.
- **Confirmation by endorsement.** The coordination task is *Endorsed*; the Tasks spec's Selection section describes the vacancy notice, candidacy and endorsement. Endorser classes: the team's involved pool, other teams' coordinators and deputies, and holders of the designated org-level task, each with a required count (zero allowed); they are settings, so the community can add the Board or TeamsAdmin if it wants. Appointment, when endorsement does not settle it, is by holders of the Tasks spec's `tasks.appoint` capability (seeded on a Recruitment task), not by the Board. A brand-new team's threshold reduces to outside endorsers. Candidates earn endorsements by talking to people, above all at the team meeting. When several candidates clear the threshold they share the slots — deputies have the same powers, so coordinator and deputy are internal labels. **[OPEN — not fully certain: thresholds, whether appointment by the Recruitment task's holders alone suffices. The selection process needs refining before build.]**
- **Standing until released.** No term; each new year holders re-affirm without endorsement or confirmation.
- **Leaving:** by release, by not re-affirming, or by a panel decision ([Concerns](2026-10-19-concerns-design.md)).
- **Governance:** being a coordinator anywhere puts you in the Coordinators system team, which scopes legal documents; now only coordination-slot holders of departments qualify. Review which documents rely on it.

## Capabilities Teams declares

`team.contact`, `team.page`, `team.email`, `earlyentry.manage` (with EarlyEntry). `team.resources` is GoogleIntegration's and `meetings.organise` is Meetings'. Catalog and rules (floor, nothing implicit, checking) are in the Tasks spec.

- **Team email.** Google Group membership comes from holders of `team.email` (default confirmed), not all members. Teams already feeds the group through `IGoogleGroupMembershipSource`; only its source list changes.
- **Resources.** Drive and Group resource access follows `team.resources`, not membership.
- **Early entry.** Granting early entry for the team follows `earlyentry.manage`; EETeamAdmin migrates through adoption.
- **Other consumers** move from coordinator checks to capability checks: Shifts (`shifts.manage`, `volunteers.manage`), Budget (`budget.manage`), Expenses (`expenses.manage`), GoogleIntegration, Camps' compliance matrix.

## Meetings

Team meetings use the shared [Meetings](2026-10-19-meetings-design.md) capability with the team as owner: agenda, scheduling poll, attendance, notes archive and the community-calendar feed all live there. Teams adds only:
- **Organiser.** The `meetings.organise` capability, scoped to the team, is held through a task the team can create from a template; an unfilled one is featured on Get involved, because a meeting is the invitation.
- **Involved pool.** Members and associates are invited by default.
- **The next-meeting card** on the team page, from Meetings, and the contact-point pointer when none is posted.
- **Sensitive teams** limit meeting notes to holders and coordinators.

## Documentation

Continuity at the team level: if the coordinator, the contact point or the person who "just knows" vanishes, the team still knows how it works. Three layers, all linking rather than storing files.

- **Team handbook** — any number of Markdown pages per team (how we work, processes, onboarding for new holders, FAQs), separate from the single public team page. Each page has a title, body, visibility (public / signed-in / holders) and a **revision history**: every save is a revision with author and time, current is the latest, any revision can be restored.
- **Who edits:** any current holder of a slot in the team can create and edit pages. The bar is low on purpose — revisions make edits reversible, and continuity depends on many people writing things down. Coordinators edit as holders, with no special right. `team.page` holders additionally set page visibility and pin pages (a pinned "Start here" shows on the team page). **[OPEN: may contributors edit too?]**
- **Questions** — any signed-in human can ask a question on a team page; it waits as a pending page until a holder answers by writing the body, or marks it a duplicate of an existing page (which then shows "also asked as…"). Pending questions show to holders and, unanswered after N days **[OPEN: default 14]**, to the contact-point holders. Doubles as an engagement signal. **[OPEN: v1 or later?]**
- **Index of task notes** — "how we do things here": the team's tasks with their current notes from Tasks, grouped by window or phase. A view, no new storage.
- **Handover** — the coordination task's notes are the team's "state of the team" note; releasing or declining to re-affirm prompts updating it (Tasks' handover prompt).
- **Continuity signal** — in the coordinator's view: tasks with no notes, and standing tasks whose notes have not been touched for N months **[OPEN: default 12]**. Computed, never a gate.
- **Resources** — Drive and Group links stay in GoogleIntegration; pages link to them.
- **Rendering** uses the shared sanitized Markdown renderer. Content is written in whatever language the team uses and is not translated; only the surrounding interface is localized.
- **Audited:** page created, edited, restored, deleted, visibility changed. **Erasure** keeps page content and removes attribution, the posture Workgroups already takes.

## Timeline

The team page composes its milestones from Tasks: date, computed progress, both reporting layers (production reporting from the production calendar, team reporting the team flags itself), grouped by phase, with overdue and upcoming marked, each linking to its tasks. Teams adds nothing to the data.

## Migration

- **Roles → tasks.** Every `TeamRoleDefinition` becomes a standing task. Slot count → capacity. Per-slot priorities → *needed* = number of Critical slots (at least one); criticality = Critical if any slot is, else the highest present. `EstimatedHours` → effort hours; `IsPublic` kept.
- **Period → window.** *Build*, *Event*, *Strike* become offset windows from the active event's existing offsets (Build: build start → gate opening; Event: gate opening → event end; Strike: event end → strike end); *Year-round* gets no window. Windows stay editable and can be re-pointed at finer production phases. **[OPEN: alternatives were mapping by phase name (fragile) or dropping Period.]**
- `TeamRoleAssignment` → primary slots, keeping assigner and time. `IsManagement` roles → coordination slots.
- **Nobody drops out or loses access on day one:** current coordinators get slots on the capability tasks they effectively held; everyone in a team with a Group gets a `team.email` slot; every member gets a Take part slot.
- Shifts' workload aggregation reads task hours and spreads them across Build/Event/Strike by window overlap; no window stays year-round. Existing `TeamRoleDefinition*` audit entries stay readable.
- One consolidated migration in `TeamsDbContext`; role tables dropped only with Peter's approval.

## Ownership

- Teams keeps `teams`, `team_members`, early-entry grants and handbook pages with their revisions (`team_doc_pages`, `team_doc_revisions`); tasks, slots, candidacies, milestones and capability grants move to Tasks. `TeamRoleDefinition` / `TeamRoleAssignment` retire after migration.
- Public surface: `ITeamService` keeps its signatures; `IsUserCoordinatorOfTeamAsync` and siblings mean staffing authority only and read the coordination task through Tasks.
- Next meeting reads Teams' own meetings; Workgroups meetings stay on workgroup pages **[OPEN: leaning keep separate]**.

## Surfaces checklist

- **Cultures:** team page, meetings and the timeline are member-facing → full resx set, six cultures. Coordinator/TeamAdmin screens exempt.
- **Authorization + negatives:** visitors cannot see holders' contact detail beyond the contact point; hidden/sensitive teams excluded from org views; sensitive team notes limited; only `meetings.organise` holders post meetings; non-holders cannot edit handbook pages and cannot see signed-in or holder pages they are not entitled to; hidden-team pages are invisible and sensitive-team pages are limited; coordinators lose implicit page, resource, budget and shift powers.
- **Audit:** membership changes remain audited with the acting slot decision; meetings and polls as above.
- **GDPR:** poll responses and authored handbook revisions join the export path; erasure keeps handbook content and removes attribution; membership slices follow the new derivation.
- **Navigation:** team page → tasks, meetings, timeline; `/Teams` → Get involved and Production (Tasks pages); each with a way back.
- **Tests:** `tests/Humans.Teams.Tests` — involvement derivation, membership lifecycle, contact fallback, meetings and poll blindness/confirmation, Google Group source from `team.email`, migration mapping.
- **Invariant doc:** `Teams.md` updated in the implementing PR.

## Reuse audit

| Considered | Decision |
|---|---|
| Per-team meetings implementation | Rejected: meetings are a shared capability (see the Meetings spec). |
| Extend `TeamRoleDefinition` into tasks | Rejected: tasks live in the Tasks module. |
| Guide section for team documentation | Rejected: Guide renders repo markdown written by developers; team pages are member-authored, versioned data. |
| Orchard's Documentation module | Adopted in reduced form, scoped per team: revisioned pages, question pages, an index over task notes. A community-wide wiki is not proposed. |
| Existing team page (`PageContent`) | Kept as the public summary. **[OPEN: fold it into the handbook as the pinned "Start here" page.]** |
| Workgroups' erase-attribution-keep-content posture | Adopted for handbook erasure. |
