# Tasks — a module for organising work

**Status: draft for discussion — nothing here is implemented.** Items marked **[OPEN]** are undecided. Related specs: [Teams on tasks](2026-10-19-teams-on-tasks-design.md) (the first host) and [Concerns](2026-10-19-concerns-design.md).

Inspired by Orchard's task-centred model (`Local/Orchard/docs/spec.md`), scaled down: no branches, packs, input rounds or modules.

UI mock-ups of the main screens, in Humans' own styling, are in [`prototypes/tasks/`](2026-10-19-tasks-teams-navigation-prototypes/tasks/index.html) (static, fake data).

## Why: engagement

Today a person who wants to help meets a role list, a Join button and a coordinator they must guess how to approach. Willing people bounce for lack of an obvious place to start, and coordinators end up doing everything because handing work out is manual and invisible. The goal is **engagement**: turn interest into contribution and keep the work spread across many hands.

What we gain:

1. **A way in.** What needs doing, when, how big, and how well it fits you — visible without being a member of anything.
2. **Work people can say yes to.** Tasks are outcomes with a size, a date and a priority, ranked by urgency and by fit.
3. **Gentle ramps.** A standing "Take part" task, shadow slots, holder-open tasks that need no approval for people already involved, a needs-help flag for stuck work, following a task or container to hear about it without committing, and proposing a task you would like to take on.
4. **Work spreads by design.** Every task has a needed and a capacity count; people who coordinate see the tasks only they hold; a curated Get involved page and a needs-attention queue put gaps in front of people who can fill them; critical gaps raise themselves.
5. **Tools go to the people doing the work.** Permissions are held through the tasks that need them, not reserved for a rank. A coordinator's job shrinks to one thing: making sure every task has someone on it.
6. **Visible progress.** Milestones, timelines and a production view across the org let people see that their work matters and let gaps show early.
7. **Continuity.** Yearly roll-forward, re-affirmation instead of re-recruitment, shadows carried forward, task notes — knowledge stops evaporating when someone steps back.
8. **Trust stays intact.** Anything that grants access is confirmed or endorsed, every grant is audited, nothing acts invisibly.

How we'll know it works, all computed from existing state: the share of tasks with two or more holders; how long critical tasks stay understaffed; how many pick-ups come from people with no prior involvement in that container.

## Concepts

- **Task** — a unit of work. Outcome-phrased title, Markdown description, criticality, effort, slots, openness, optional window / milestone / event year, optional capabilities.
- **Container and host.** Every task belongs to a *container* (a team today; possibly a workgroup later) supplied by a *host* section. The host decides what holding a slot means; Tasks never references a host.
- **Slot** — a place on a task. **Primary** slots carry the work; **secondary** slots are learn-alongside/backup (shadow, deputy). Secondary slots never count toward capacity and grant no capability, unless the host says otherwise for its staffing task.
- **Needed / Capacity** — at least *Needed* holders (the staffing floor; criticality applies to it), up to *Capacity*. Same shape as Shifts' `MinVolunteers`/`MaxVolunteers`.
- **Standing vs one-off** — effort shape *ongoing* (owns a thing, never completes) is standing; *one-off* completes.
- **Subtask** — a piece broken off a task, one level deep. Own slots, window and status; an unclaimed subtask is a concrete, grabbable ask. The parent's progress rolls up from its subtasks. A task may also carry a **checklist** of simple micro-steps with no assignee.
- **Dependency** — a finish-to-start link: a task *waits on* another, possibly in another container. It shows as blocked until the predecessor is done.
- **Follower** — a signed-in human who follows a task or container for updates without responsibility. Following never creates membership or involvement.
- **Staffing task** — each container designates one task whose holders make sure every task in it has someone: they confirm pick-ups, nominate and remove holders, and see gaps. Nothing else is implicit. Teams calls it coordination.
- **Capability** — a named permission a task grants to its holders.
- **Milestone** — a dated goal with computed progress; may be flagged as reporting.
- **Phase** — a named span of the event year, owned by the production calendar (Calendar section).
- **Event year** — tasks and milestones are optionally scoped to an `EventSettings` id (one event per year). Unscoped = standing.
- **Date shape** (windows and milestones): *absolute*; *offset* (signed days from the event's gate-opening date); or *calendar reference* (a production-calendar item, or a phase's start or end). Offsets and references resolve live.

## Hosts

A host section declares itself to Tasks through a seam discovered in DI (the pattern Issues uses for queues), so Tasks holds no list of sections:
- **Containers** — id, name, parent, and visibility facts (hidden, sensitive).
- **Staffing task** — which task is the container's staffing task, and the cascade (parent container).
- **Standing task templates** — tasks every container gets at creation (Teams: coordination, contact point, Take part, panel representative).
- **Reactions** — callbacks when a slot is taken or ends (Teams creates and ends `TeamMember` rows; a workgroup host would do something of its own).
- Nothing a host does with slots reaches another host. Workgroup activity never creates team membership, involvement or Coordinators-team entries.

Teams is the first host. **[OPEN: Workgroups as a second host, pending a check with other community members. No Workgroups-specific design here.]**

## Tasks

**Fields:** container, title, description, criticality (reuse `SlotPriority`), effort shape + estimated hours, needed, capacity, secondary slots, requirements, openness, status, tags, parent task, checklist, predecessors, public flag, optional **window**, optional milestone / `eventSettingsId`, optional capabilities, optional origin (production-calendar item), `featured` and `needsAttention` flags.

**Window** — when the task is live: optional start and end in the date shape. Choosing a phase fills in references to its start and end; a task can span several phases; phase filters match any overlapping window. No window = standing / whole year.

**Status** — five categories the platform understands: *To do → In progress → Waiting → Done / Cancelled*. *Waiting* carries a "waiting on" note and a check-in date; on that date the holder is nudged (update, done, snooze, release). **[OPEN: containers may relabel or add statuses within a category, as ClickUp does, so a production team can say "Awaiting quote"; core logic reads only the category.]** *Open* is derived: not Done/Cancelled with holders < capacity. *Understaffed*: holders < needed.

**Tags** are free-form labels on a task, used for filtering and, with profile skills, for compatibility **[OPEN: tag vocabulary]**.

**Openness** (a request is always "pick up this task", with an optional note to the confirmer, limited like the old join message):
- *Confirmed* — **default.** A holder of the container's staffing task approves each pick-up.
- *Holder-open* — anyone already holding an active slot in this container claims instantly. Current holders only.
- *Open* — any eligible human claims instantly.
- *Endorsed* — candidacy + endorsement threshold.

The host may add a confirmation of its own (Teams: sensitive teams keep the deterrent modal on every claim path).

**Requirements:** typed individual-gate predicates — tier, language, **consent / legal document** (e.g. a confidentiality document before a data-access capability).

**Default list order:** understaffed first → Critical → compatibility → soonest due. Compatibility ranks, never filters or hides; v1 uses requirements, language and tier from Users contracts only. Filters: criticality, window/phase, due-before, effort, "fits me", include filled/done.

**Sole-holder flag.** A person holding a staffing task sees a flag on any other task they hold alone, nudging them to spread the work.

**Audited:** created, slot requested/approved/taken/released, completed, cancelled, flags changed.

## Subtasks, dependencies and checklists

**[OPEN — proposal from the ClickUp review.]**
- **Subtasks** — a holder can break off a piece as its own task (one level). Left unclaimed it is a precise "I need help with this", more honest than releasing the whole task. A parent cannot be marked Done with open subtasks without confirming. The parent's progress rolls up from its subtasks.
- **Checklists** — simple tick items inside a task for micro-steps; no assignee, no slots.
- **Dependencies** — finish-to-start only, between any two visible tasks, across containers. A task is *blocked* until its predecessors are Done. If a predecessor's window end moves past its successor's window start, both show *at risk* (computed, soft). Completing a predecessor notifies the successor's holders. This is how "Team B's power plan waits on Team A's placement" is expressed. **[OPEN: whether production items can declare dependencies between the tasks they generate.]**

## Proposing a task

Any signed-in human can propose a task to a container: a title and rough description, plus optional "I'd like to take this" and "I'd suggest this person". It lands in a proposals queue for the container's staffing holders (the gap-cover cascade applies if unanswered), who edit and activate it, or decline with a reason the proposer can see. Audited.

## Following, comments and notifications

**[OPEN — proposal from the ClickUp review.]**
- **Follow** a task or a container. Followers are notified when a slot opens, needs-attention is raised, status or dates change, a milestone slips, or a comment is added. The follower list is visible to staffing holders; everyone else sees a count.
- **Comments** — a short thread per task for signed-in humans, with @mentions that notify. Sensitive containers limit comments to holders and staffing. Distinct from task notes (summary and links) and from [Concerns](2026-10-19-concerns-design.md). **[OPEN: open to all signed-in humans, or holders and followers only.]**
- Notifications go through the Notifications crosscut with per-person preferences. **[OPEN: immediate vs digest defaults.]**

## Views

**[OPEN — proposal from the ClickUp review.]** One dataset, several lenses; all read the same task state.
- **List** — the default, with the ordering and filters above. Filters are remembered per viewer, with a "fits me" preset.
- **Board** — a container's tasks as columns by status; holders and staffing holders drag to change status.
- **Timeline** — windows and milestones in phase lanes with dependencies drawn, per container, and across containers on the production view.
- **Calendar** — tasks and milestones by date. Tasks you hold with dates join your personal iCal feed through Calendar's contributor seam.
- **Workload** — for staffing holders: per person, estimated hours of held tasks against declared availability, as a coarse *has room / about right / over* unless the person chose to show numbers. **[OPEN: needs an availability signal; Shifts' general availability is day-level and build-period only.]**
- **My tasks** — everything I hold or follow across containers, as a card on the member dashboard through the existing dashboard-card seam.
- Not adopted: table, mind map, map.

## Endorsement

A task with *Endorsed* openness works through **candidacies**. A candidacy confirms when the task's endorsement threshold is met. Endorsers come from classes the task defines: the container's involved pool, staffing-task holders of other containers of the same host, Board, and a designated org task. Each class has a required count (zero allowed). Defaults for specific tasks (e.g. Teams' coordination) live in the host's spec. Two routes: the ordinary threshold, or appointment by a Board member.

- No self-endorsement. Endorsements are point-in-time; confirmation stands if endorsers later leave.
- **Visibility:** everyone, including the candidate, sees only the count. Who endorsed is visible only in audit to Board.
- **[OPEN: exact thresholds, competing candidates (leaning first-to-clear takes the slot, later cleared candidates wait or take a secondary slot), expiry (leaning 30 days).]**
- Every candidacy, endorsement, confirmation and revocation is audited.
- **Removal** of a confirmed holder from a capability or staffing task happens by release, by not re-affirming, or by a decision record from a Concerns panel. Admin stays the emergency backstop.

## Gap cover

A container can lack a confirmer. Proposal **[OPEN — thresholds undecided]**:
- **Cascade.** The container's staffing-task holders → the parent container's → the org fallback (Board/Admin). Capability tasks are never opened up because nobody is home.
- **Unanswered requests escalate.** Untouched after N days (default 7), a request moves one step down the cascade and enters the needs-attention queue.
- **Unfilled staffing task** is Critical, needs-attention and featured, and the container shows on the production view under "without staffing coordination". Any staffing-task holder of the same host may endorse a candidate.
- **Critical understaffing raises itself.** A Critical task below *needed* for N days (default 14) enters the queue automatically.

## Capabilities (task-gated permissions)

A task may grant capabilities to its **primary-slot holders**. Holding the slot is the permission; ending it (released, task done/cancelled, container deactivated) revokes immediately.

- **Catalog.** Each section declares the capabilities it exposes through the same DI seam: key, localized label, scope.
  - *Container-scoped* — effect confined to the holding container's own data. Any container may attach it.
  - *Org-scoped* — effect reaches beyond. Hosted by a container a Board member designates once; after that holders self-organise.
- **Floor.** A capability-granting task is at least *Confirmed*: *Open* and *Holder-open* are refused at create and edit; attaching a capability to a held task puts current holders into reconfirmation. Nobody confirms their own claim — a staffing-task holder claiming a capability task needs another holder, or Board.
- **Nothing implicit.** Holding a staffing task grants no capability. On migration current coordinators receive slots on the capability tasks they effectively held; the sole-holder flag then prompts sharing.
- **Checking.** Consumers ask Tasks through its read contract (`user holds capability C [for container X]`), replacing direct coordinator checks. Today's consumers: Shifts, Budget, Expenses, GoogleIntegration, Teams; Camps' compliance matrix reads coordinator status too.
- **Catalog, first set** (each owning section defines the meaning):

  | Key | Gates | Scope | Owner |
  |---|---|---|---|
  | `team.contact` | Shown as the team's contact point | team | Teams |
  | `team.page` | Edit the team page and calls to action | team | Teams |
  | `team.meetings` | Organise meetings, polls, notes | team | Teams |
  | `team.email` | Membership of the team's Google Group | team | Teams / GoogleIntegration |
  | `team.resources` | Link/manage and receive Drive/Group resource access | team | GoogleIntegration |
  | `earlyentry.manage` | Grant/edit/revoke early entry for the team | team | EarlyEntry / Teams |
  | `budget.manage` | Edit the team's budget lines | team | Budget |
  | `expenses.manage` | See and manage the team's expense reports | team | Expenses |
  | `shifts.manage` | Create and modify the team's rotas and shifts | team | Shifts |
  | `volunteers.manage` | Confirm/refuse/voluntell sign-ups, without editing shifts | team | Shifts |
  | `tasks.curate` | Feature tasks on Get involved; work the needs-attention queue | org | Tasks |
  | `production.manage` | Edit the production calendar | org | Calendar |
  | `concerns.handle`, `.mediate`, `.consent-response`, `.configure` | See [Concerns](2026-10-19-concerns-design.md) | org | Concerns |
  | `barrios.manage`, `tickets.manage`, … | One per current global role (see Migration) | org | owning section |

- **Visibility.** A "who holds what" matrix per container and the Shell access matrix; every grant and revocation is audited.
- Granting or changing capabilities is a privilege change — implementation needs explicit sign-off (`privilege-changes-need-explicit-approval`).

## Get involved

`/Tasks` — listed in the *Get involved* group of the [navigation spec](2026-10-19-navigation-design.md), not as a top-level link — open to every member: open tasks across all visible containers, same ordering and filters as a container's list plus container and phase. The successor to `/Teams/Roster`'s open-slot view. Shift rotas keep their own browse for now.

- **Featured** — set by `tasks.curate` holders; featured tasks lead.
- **Needs attention** — raised by a task's holders or a staffing-task holder ("help me find someone"), or automatically per Gap cover; lands in a queue worked by `tasks.curate` holders, who can feature it, nominate people, or hand it back. Cleared when staffed.
- Curator actions are audited with the curator as actor.

## Milestones & reporting

A **milestone** has title, description, date (date shape), optional event, status.
- **Progress** is computed from linked tasks (done ÷ total, effort-weighted **[OPEN]**), never typed in. A milestone with no tasks is completed explicitly with a note/link.
- **Two reporting layers**, both always visible on the container's timeline:
  1. **Production reporting** — defined in the production calendar as an org-level ask of the containers it targets (e.g. "define placement and power needs by 1 May"). Read-only to the container; Not started / In progress / Done / Overdue, marked by staffing-task holders or the milestone's task holders.
  2. **Team reporting** — a container flags its own milestone as a key item. Authored and edited by the container.
  Plain milestones show on the timeline but may collapse.

## Production calendar integration

Calendar owns **phases** (name, order, span) and **production items** (title, description, date, phase, targeted containers, optional task template, reporting flag); editing is gated by `production.manage`.
- Tasks reads Calendar through a read contract; Calendar never writes Tasks' tables.
- On production-item create/change, Tasks reconciles automatically: it ensures a generated task + milestone per targeted container (idempotent per item and container), updates referenced dates live, cancels generated tasks of removed items. Calendar publishes a change notification (the `IEventSettingsChangeListener` pattern).
- Generated tasks are attributed to the production calendar in audit; their dates and reporting fields are read-only to the container.

## Production view

`/Tasks/Production` — every member: phases as the spine, each showing production reporting milestones across visible containers with per-phase progress (done ÷ applicable, overdue list) and containers without staffing coordination. **Team reporting** is a second, toggleable layer, off by default. Read only. Calendar links to it; Calendar owns the data. *(Moved here from Teams now that milestones are Tasks'.)*

## New year

When a new event year is created (Settings change notification):
- **Standing tasks** — each holder is asked to **re-affirm**. Re-affirming keeps the slot and any capability, including staffing, with no endorsement or confirmation. Declined or unanswered after the grace period **[OPEN: default 30 days, with reminders]** releases the slot; the task shows understaffed and staffing holders are told.
- **One-off event tasks** roll forward with empty slots.

**Roll-forward.** A staffing-task holder (or a `production.manage` holder) picks event-scoped tasks and milestones from a past year and rolls them into a target event: preview, then confirm.
- Tasks copy with empty primary slots, Active; secondary holders carry as suggestions. Standing tasks are not cloned. Generated production tasks regenerate from the production calendar.
- Offset milestones and windows recompute against the target's gate-opening date; absolute dates are listed for new values; calendar references re-point to the target year's items.
- The target `EventSettings` row must already exist.

## Continuity & documentation

**[OPEN — proposal.]** If someone vanishes or leaves, the work and its knowledge must survive.
- **Task notes** — a wiki-style summary per task (revision history, holders edit) and a short list of resource links. Done and release prompt "anything worth capturing?".
- **Handover** — releasing a standing task, or declining at re-affirmation, prompts finishing the notes and suggests a successor (the shadow, if any).
- **Vanished holders** — a capability holder with no activity for N months **[OPEN]** gets a check-in; unanswered, the slot is released, the capability revoked, and the task shows understaffed. Audited.
- Reference pages and case logs belong to the same family of records (see the team handbook in [Teams on tasks](2026-10-19-teams-on-tasks-design.md) and [Concerns](2026-10-19-concerns-design.md)).

## Migration

- Teams' role definitions and assignments convert to tasks and slots (details in the Teams spec).
- **Global roles → capabilities.** Each work-oriented global role (ConsentCoordinator, VolunteerCoordinator, NoInfoAdmin, CampAdmin, TicketAdmin, EventsAdmin, FinanceAdmin, StoreAdmin, CantinaAdmin, EETeamAdmin, RideshareAdmin) becomes an org-scoped capability hosted by a container, via a built, audited **adopt** action: pick the role, pick the hosting container, preview the holders who move onto the new task, confirm. Sections accept capability or (transitionally) role until adoption completes; then the role stops being assignable. Admin and Board stay as system and legal backstops; FeedbackAdmin (already inert) retires. **[OPEN: TeamsAdmin and HumanAdmin — they create teams and grant roles, the top of the structure.]** NoInfoAdmin already is `volunteers.manage` in role form.
- One consolidated migration per affected section's context; old tables dropped only with Peter's approval.

## Ownership

- **Tasks** (new section, `Humans.Tasks` + `Humans.Tasks.Contracts`) owns tasks, slots, candidacies/endorsements, milestones, capability grants, notes and flags. **Calendar** owns phases and production items. Each section owns its capability declarations. Hosts own what holding means.
- Public surface kept narrow: `ITasksService` reads (task/milestone summaries, involvement, capability checks); a narrow write contract for slot removal carrying a decision record (Concerns) and for the host-driven standing-task creation. No entity leaves a section.
- Dependency direction: hosts and consumers → Tasks.Contracts; Tasks → Calendar read contract, Settings, Users.Contracts, Audit, Notifications. Tasks references no host.

## Surfaces checklist

- **Cultures:** Get involved, task lists, timelines and the production view are member-facing → full resx set, six cultures. Admin screens exempt.
- **Authorization + negatives:** hidden/sensitive containers excluded from org views for non-admins; no self-endorse or self-confirm; capability tasks never Open/Holder-open; staffing holders have no implicit capability; only `production.manage` edits the calendar; only `tasks.curate` features; endorsement identities hidden except to Board in audit.
- **Consent:** capability tasks can require a legal document before a claim confirms; documents targeted at the Coordinators system team now reach only coordination-slot holders — review which rely on that.
- **Audit:** every task, slot, candidacy, endorsement, capability grant/revoke, flag, generated task, adopt, re-affirmation and roll-forward, attributed to actor or "production calendar".
- **GDPR:** export contributor for slots, candidacies, endorsements given/received, notes, comments, proposals and follows authored; erasure path **[OPEN: join-request precedent (hard delete) vs retain anonymised history]**.
- **Navigation:** `/Tasks` and `/Tasks/Production` from the main nav; each container's page links in and out.
- **Tests:** `tests/Humans.Tasks.Tests` — ordering, endorsement thresholds incl. negatives, capability floor and revocation, windows, roll-forward and re-affirmation, calendar-reference recompute, sole-holder flag, cascade escalation, dependency blocking and at-risk flags, subtask roll-up, status categories; consumer sections test their capability checks.
- **Invariant docs:** a new `Tasks.md`, plus `Calendar.md`, `Teams.md` and each capability-consuming section's doc, in the implementing PRs.

## Reuse audit

| Considered | Decision |
|---|---|
| Tasks inside Teams | Rejected: Workgroups may host tasks too; Tasks is its own section with hosts. |
| Keep role definitions beside tasks | Rejected: no roles remain. |
| Shifts rotas as tasks | Rejected: rotas are recurring and never "done". |
| Calendar events as milestones | Rejected: milestones carry progress and reporting. Calendar supplies phases and production dates. |
| Orchard packs | Rejected: roll-forward is a direct in-app copy. |
| New capability registry in Tasks | Rejected: sections declare capabilities via DI, as Issues does for queues. |
| Extend `/Teams/Roster` | Accepted: becomes Get involved. |
| ClickUp subtasks, dependencies, followers, forms-to-tasks, views, custom statuses | Adapted: one subtask level, finish-to-start only, follow without membership, forms become "propose a task", statuses fixed categories with optional labels. |
| ClickUp milestones as a task type | Rejected: our milestones compute progress from linked tasks. |
| ClickUp goals, sprints | Not needed: milestones with computed progress, and phases / the event year, cover them. |
| ClickUp custom fields, recurring tasks | Deferred: custom fields need six-culture labels and are opaque to the platform; recurrence (e.g. a monthly report) comes later. |
| ClickUp automation builder | Rejected for now: automations stay built in (gap cover, generation, re-affirmation) with configurable thresholds. |
| ClickUp time tracking | Rejected: volunteer surveillance and GDPR cost; self-reported contributed hours may come later. |
| Reuse `SlotPriority`, Shifts' min/max shape, offset-from-gate-opening dates, change-listener pattern | Accepted. |
