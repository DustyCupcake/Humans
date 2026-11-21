# Tasks and roles in Humans: where we're heading and how we get there

**Status: draft for discussion. Nothing here is decided or built.** Items marked **[OPEN]** are undecided. This replaces the "everything at once" framing of the earlier Tasks, Teams and Navigation specs with an end goal and a sequence. Governance questions (who is chosen how, re-affirmation, org structure) are being worked in the org structure group and are not settled here.

## The idea

People who want to help should be able to see what needs doing, how big it is and whether it fits them, without joining anything first. Coordinators should have a visible way to hand work out. Every team and working group should always have an invitation out.

## The end goal

### Three kinds of work

| | Role | Task | Shift |
|---|---|---|---|
| What | A standing responsibility: coordinator, contact point, Power lead | A piece of work with an end | Presence at a place for a time slot |
| Ends when | It is handed over | It is done | The slot passes |
| Lives in | Teams | Teams and working groups | Shifts |

The test: **a task finishes; a role is only done when handed off.** Roles continue from year to year and are not copied. Tasks are cloned for the next year. Last year's tasks, finished or not, drop out of the current lists and stay in history, where one that was never finished is still shown as unfinished. Roles stay small (a title, holders, a short description) and coordinator and contact point are separate roles. A role can have several holders, who can see each other.

### Everything is open, and visible

- Every task and role is visible and can be claimed. Only sensitive ones are hidden (**[OPEN]**: sensitive per task, or only per team or working group).
- Every task has a short description. Writing them is a coordinator's first job, and a parent's description stands in for a child's blank one. Existing title-only roles carry over and are flagged until described.
- Get involved is one page across the organisation. It lists the invitations, meaning tasks and roles with an unfilled place, with the team shown.
- A task has assignees and can be associated with a team or working group. It is never owned by a role.

### Confirmation scales with size, not ceremony

- Small tasks are claimed directly.
- Larger or critical tasks need a coordinator to confirm (a team's coordinator, or production for tasks with no team), unless the person has already completed a task in that team or working group. Requirements are not waived for urgency.
- Later, a track record can inform confirmation, weighted by the size of the work.
- Join and membership stay as they are.

### What coordinators and holders see

- A **generated needs-attention view**: tasks with unfilled places, overdue or blocked tasks, critical gaps and pick-up requests waiting. It is computed from the tasks and cannot be edited, so work can't hide in a private list.
- Tasks can have sub-tasks (three levels), dependencies, a deadline or window, and a checklist.
- The **production view** is a cross-team overview of all tasks and their dependencies, as a list and a timeline. It also shows **projects**: named groups of related tasks, each living in its own team, with a goal, dates, a lead and computed progress, and no places of their own.

### Communication out and continuity

- Roles and tasks have a notes area that any holder can edit, so how things are done doesn't live in one head.
- Releasing a role prompts for a handover note, which the next holder sees first.
- A team's page shows its contact point and its latest update, posted by the team.
- Milestones appear as dated markers on tasks and projects, and on the timeline.

### Permissions, meetings, access

- Permissions become named and per team (manage shifts, edit budget, manage members). Roles grant them, and the existing coordinator power becomes "grants all", so nothing changes for anyone on day one. Tasks can grant them later. The long-term aim is for named permissions to replace most of the separate admin roles, one at a time, each with its own approval.
- Meetings become one central place used by teams and working groups. They appear on the calendar, and agenda, poll and notes work the same everywhere.
- Drive and email-list access stays tied to membership for now. Separating it is a later change.

### What stays the same

The volunteer path, join requests, working groups' register and documents, and shifts (on-site work stays shifts).

## The development plan

Peter's update: tasks are needed soon, so we start building them now as their own section, shown inside other screens through embedded views. Permissions, meetings and navigation proceed as parallel tracks. Production's planning needs define the first version.

### Minimum viable version (build now)

A production planning tool with open claiming and a Get involved page ([module plan](2026-11-21-tasks-module-mvp-plan.md)):

- **Tasks** with a title, description, status (to do, in progress, blocked, done, cancelled), start and due dates, criticality, an optional team or department, and needed places.
- **Dependencies** (finish to start) across teams. A task is blocked while a predecessor is unfinished, and at risk when a predecessor's due date falls after its start.
- **Assignees** and **claiming**: anyone can claim a task with a free place. Each task is either open (claim directly) or needs confirmation, given by the coordinator of its team, or by production when it has no team. New tasks are open by default, and critical ones need confirmation. If production adds someone beyond the needed places, it warns first and then adds a place.
- **Views:** a list with filters (team, status, dates), a timeline across all teams showing dependencies, a Get involved page listing tasks with unfilled places (critical first, then soonest due; open roles stay on the Teams roster, linked from it), and a team page listing the tasks associated with that team through one embedded slot.
- **Bulk create:** production loads a whole plan, with dependencies, in one request through the existing personal-key API (or a pasted file). It is checked in full and creates nothing if anything is wrong. It is the second build step, right after the core.
- **Visible to all members.** Who can change what:
  - **Production**, through a global role that is still to be chosen (possibly one the production lead already holds, otherwise a new temporary section role like `ShiftsAdmin`), can do everything. It is the only one that changes dates, dependencies or deletion on tasks it created.
  - **A team's coordinator**, through the existing Teams coordinator check, confirms claims, assigns and changes status on tasks associated with their team, and fully manages tasks they created.

  Both are replaced by named permissions later and recorded as known debt.
- **Required with it:** audit entries for every change, export and erasure for assignees and authored text, all seven cultures, the invariant doc, and tests including the deny paths.

### Parallel tracks

- **Permissions:** named per-team permissions, then Shifts, Budget, Expenses, GoogleIntegration and Teams move onto them. Tasks then moves onto them too, replacing the temporary production role and the coordinator check.
- **Meetings:** Peter's design, using the shared calendar form.
- **Navigation:** independent. Menus and search first, phone layouts last.
- **Groundwork:** merge `origin/main` into the spec branch, rework the specs per step, agree the module invariants, and request sign-off for the permission change.

### After the minimum viable version

1. Open roles on Get involved beside tasks, and the needs-attention view. Working-group association, once Workgroups offers a narrow coordinator read.
2. Sub-tasks and projects, a board, milestones, notes and handover prompts, contact point and latest team update, the dashboard card and feed. Dates relative to the event.
3. Tasks that carry permissions, which needs explicit sign-off as a privilege change.

**Deferred until use shows a need:** following and comments, proposing a task, task requirements, the reporting layers, handbook pages, year-end review, the production calendar and generated tasks, the requests chain, endorsement and candidacy, re-affirmation (a governance decision), escalation and gap cover, track record (needs shift attendance first), capacity and care, Concerns, the paid backstop team, build and strike planning, Shifts improvements, and separating Drive and Group access from membership. Each is described, with the input it needs, in [the community document](2026-11-06-community-discussion-proposed-changes.md#other-proposals-that-need-more-input-before-anything-is-built).

None of this depends on the governance questions. It can ship whatever the org structure consultation decides.

## Still open

- The name of the temporary production role and who holds it.
- Working-group association needs a narrow public coordinator read from Workgroups, which is new public surface and needs Peter's approval.
- Whether new tasks default to open, with critical ones needing confirmation.
- Whether claiming a task makes someone a team member. In the first version it doesn't, because Teams isn't told about claims.
- What "Take part" is (a follow, or the existing join).
- Who posts a team's update: a reporter role, the coordinator, or anyone on the team.
- Whether a claim's confirmation is a setting per team, per task, or both, once permissions land.
- Whether "sensitive" is set per task or only per team.
- Whether the depth cap of three stays.
- Where the permission read lives: Auth as it is, or Base.
- Whether task requirements, such as a qualification before confirmation, come early.
