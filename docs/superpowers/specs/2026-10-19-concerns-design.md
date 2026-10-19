# Concerns — raising, mediating and deciding

**Status: draft for discussion — nothing here is implemented; drawn from the weekend discussion on department coordination.** Items marked **[OPEN]** are undecided. Related specs: [Tasks](2026-10-19-tasks-module-design.md) and [Teams on tasks](2026-10-19-teams-on-tasks-design.md).

## Why

People need a safe, visible way to say "something is wrong here" — a department that has gone quiet, a direction they disagree with, a conflict between people, a consent incident — and the community needs a fair, documented way to respond, up to and including removing someone from a role. Today there is no such place, and the weekend proposal assumed the process would be hardcoded. The goal is the opposite: **hardcode almost nothing, but make it usable on day one.** Who handles what, who sits on a deciding panel and what must be documented are data and tasks, edited by the people who hold the relevant tasks.

Anyone can raise a concern. It applies to tasks, teams and people in roles such as coordination, and later to workgroups.

## Concepts

- **Concern** — a case record: subject (a task, a team/container, or a person *in a role*), category, reporter, optional description, visibility, status, case log, outcome. Raising one is a single action; the description is optional, since detail comes in conversation.
- **Category** — configurable data, seeded with: inactivity, concern about an activity or direction, interpersonal conflict, consent incident. Carries a default visibility, a handling route and a documentation checklist. **[OPEN: configurable labels need text in all six cultures.]**
- **Handling task** — a [Tasks](2026-10-19-tasks-module-design.md) task, multi-slot and *Endorsed*, whose holders handle the cases routed to it. An empty one is Critical.
- **Panel** — a list of seats convened per case to make a decision. Each seat is "the holder of task T", optionally "in the subject's container".
- **Decision record** — panel, outcome, reason and linked case; the only thing that executes a removal.

## Routing is a task, not a role

Each (subject kind, category) points at a handling task. Seeded:
- concern about a task holder → the container's staffing task (coordination), escalating to mediation;
- concern about a coordinator or a team → a mediation task;
- consent incident → a consent-response task.

Handling tasks live in a designated container, so the community backs whom it trusts through ordinary endorsement.

## Visibility

Per concern: **private** (reporter and handlers) or **public**. Public applies only where the subject is a task or team — never a person, never a consent incident. The subject is told, and has a recorded right to respond. **[OPEN: retention; subject-access export redacted for others' data.]**

## Recusal

The reporter, the subject, and anyone who recuses (or is recused by a handler) are excluded, and the case is invisible to them from that point on, not merely locked (the principle from Orchard's conflict management). One honest limit: invisibility only holds if recusal happens before the case is opened. **[OPEN: details.]**

## Documentation checklist

Each category lists required entries, e.g. inactivity: outreach attempts and the impact on event readiness; interpersonal: mediation attempted and a recommendation. The case log is a narrative record, separate from audit. A case cannot move to decision until the required entries exist. This is a flat checklist, not a workflow engine. Event-readiness impact is computed from the subject's tasks, milestones and phases and attached automatically.

## Deselection panel

A decision that removes someone from a slot is made by a panel convened per case.
- **Seats** are plain tasks. Seeded default: a Board representative, a department representative (the team's standing "concern panel representative" task) and a contact-point holder.
- Quorum and majority are settings.
- The subject, an involved reporter and recused people never sit; an unfillable seat falls back to the next holder or is flagged.
- The decision record is what executes the removal, through a narrow write contract on Tasks. Removing a coordination holder, or any capability holder via a concern, needs a panel decision; Admin stays the emergency backstop. A coordinator removing an ordinary task holder is unchanged.
- Individual panel votes are working data, deleted when the case closes, while the decision note stays (as Board votes are).

## Who defines all this

Categories, routes, checklists, panel seats, quorum and timings are editable by holders of `concerns.configure`, an org-scoped capability hosted by a container a Board member designates once and then staffed like any task. Every change is audited and visible. **[OPEN: whether configuration changes need Board approval or an endorsed configure task is enough.]**

**Hardcoded minimum:** a concern has a subject, category, log and decision; the subject is informed; recusal is invisible; a removal needs a recorded decision. Everything else is data.

## Ownership

- A new **Concerns** section (`Humans.Concerns`) owns cases, categories, routes, checklists, panels and decisions, with its own context and migrations.
- It reads Tasks (who holds task T, task and container facts for event-readiness impact) and executes removals through Tasks' narrow write contract. It references no host.
- Governance's Board vote is a pattern to follow (transient votes, retained decision), not a table to reuse.
- Capabilities declared: `concerns.handle`, `concerns.mediate`, `concerns.consent-response`, `concerns.configure`.

## Surfaces checklist

- **Cultures:** raising a concern and its status are member-facing → full resx set, six cultures. Handler and configure screens exempt.
- **Authorization + negatives:** non-handlers cannot see private cases; recused people see nothing; the subject sees their own case as the policy allows but never reporter identity; reporter identity visible only to handlers; public concerns never name a person.
- **Audit:** raised, routed, entries, recusals, decisions, executions, configuration changes. The audit trail never exposes reporter identity beyond handlers.
- **GDPR:** reporter and subject data in export and erasure paths **[OPEN: retention, redaction]**; panel votes deleted at close.
- **Navigation:** a "Raise a concern" entry from task and team pages and the main nav; handlers get a queue.
- **Tests:** `tests/Humans.Concerns.Tests` — routing, visibility rules incl. never-public subjects, recusal invisibility, checklist gating, panel seat resolution and exclusions, decision-gated removal.
- **Invariant doc:** a new `Concerns.md` in the implementing PR.

## Reuse audit

| Considered | Decision |
|---|---|
| Concerns inside Teams or Tasks | Rejected: separate section; sensitivity, recusal and retention rules differ and it serves more than one host. |
| Hardcoded deselection rule | Rejected: panels, routes and checklists are data and tasks. |
| Orchard conflict management | Adopted: conflict team as a task, three-way recusal, invisibility. Anonymous reporting left open. |
| Workflow engine | Rejected: a flat checklist per category is enough. |
| Surveys / Issues | Rejected: they collect answers or product issues, not case handling. |
