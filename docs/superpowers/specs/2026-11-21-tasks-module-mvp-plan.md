# Tasks module: first version plan

**Status: draft for Peter's review. Nothing is built.** Checked against Peter's current `main` on 21 Nov 2026. Anything not verified in code is marked *unverified*. The wider direction is in [the overview](2026-11-06-tasks-and-roles-plan-overview.md).

## For Peter: what we need from you

1. **Which role is production?** Does the production lead already hold a role this can attach to, or do we add a `TasksAdmin`-style role (flag 2)?
2. **Is the shape right?** A new `Humans.Tasks` section, a Tasks→Backdoor API for bulk create, and one new Teams slot (flags 1, 3, 14).
3. **Does anything here fight your rules?** Anything we missed in the hard rules or the memory atoms.
4. **Is the PR split right?** Four steps, core first (see below).

**How to review:** read "What the first version is" and "Module shape" first, then the flags. Everything under "Verified in code" was checked against Peter's `main` on 21 Nov; the one thing we couldn't settle by reading is marked there.

## What the first version is

A production planning tool with open claiming and a Get involved page, in its own section, `Humans.Tasks`. Tasks have dates, dependencies, assignees and an optional team. It is the minimum production needs for the May build: the plan lives in one place with dates and dependencies, and a large existing plan can be loaded rather than typed. Anyone can claim a task with a free place. Team coordinators confirm claims and manage their team's tasks. Production manages the plan, and can load a whole plan at once through the API. Every member can see everything.

**Get involved stays inside Tasks.** It lists tasks with unfilled places. Open roles remain on the existing Teams roster (`/Teams/Roster`), and the page links to it. Showing both in one list needs a Teams read and comes later.

## Module shape

**Project layout** (as Rideshare and Guide): `src/Sections/Humans.Tasks` with `Section.cs`, `SectionNav`, `SectionPolicies`, `SectionThingsToDo`, a resx set, `Docs/Tasks.md`, and `tests/Humans.Tasks.Tests`. A `Contracts/` folder holds the role constant and its predicate (`TasksRoles`, as `ShiftsRoles` does) from step 1, and the bulk create interface from step 2. No `.Contracts` leaf: nothing in Tasks' dependency chain needs one.

**Data** (own `TasksDbContext`, own migration, tables prefixed `tasks_`; no other section reads them):
- `tasks_tasks`: title (max 200), Markdown description (max 4000; the limits Calendar events use, the shared `Validation_MaxLength` message),  status (to do, in progress, blocked, done, cancelled), start and due date, criticality (reusing `SlotPriority` from `Humans.Teams.Contracts`), needed places, openness (open by default; needs confirmation when critical, and production can set it either way), optional `TeamId` (a plain reference, no navigation), created by, created and updated times.
- `tasks_dependencies`: finish-to-start links between two tasks.
- `tasks_assignments`: task, person, state (requested, confirmed), who confirmed, times.

**Rules the section guarantees**
- A dependency can't form a cycle. Deleting a task removes its links.
- A task is blocked while a predecessor is unfinished. It is at risk when a predecessor's due date falls after its start. Both are computed, not stored.
- A task can't have more confirmed assignees than needed places. When production adds someone beyond that, it first gets a warning, and on confirming, the task gains a place for them.
- Claiming an open task confirms immediately. Claiming one that needs confirmation creates a request.
- Done and cancelled tasks leave the current lists. Last year's tasks, finished or not, stay in history.
- Every create, edit, delete, claim, confirmation and release is audited, including each task a bulk create makes.

**Bulk create (step 2).** Production loads a whole plan in one request, and an AI-drafted plan can produce it.
- **Format:** a list of tasks, each with a key that is local to the payload. Dependencies refer to those keys (`"after": ["permits"]`), so no task IDs are needed up front. Fields are the same as the task form, with the team given by name or ID.
- **All or nothing:** the whole plan is checked first (no dependency cycles, known keys, teams exist, dates and field limits valid). If anything fails, nothing is created and the response lists every problem.
- **Who:** only someone who could create those tasks in the UI: a team's coordinator for that team's tasks, production for any.
- **Where:** one `ITasksService` method holds the rules. Two callers use it: a Backdoor controller (`/api/backdoor/tasks/plan`, the existing personal-key API, so each request runs as that person) and a production-only `/Tasks/Import` page that takes a pasted file. Dry run is a flag on the same request.

**Services:** `ITasksRepository` (singleton over `IDbContextFactory`) is the only code touching the context. An internal `ITasksService : IApplicationService` holds the rules. The whole dataset fits in memory, so there is no caching decorator at first.

**Pages**

| Route | Purpose |
|---|---|
| `/Tasks` | List with filters (team, status, dates, mine) |
| `/Tasks/Timeline` | Cross-team timeline with dependencies |
| `/Tasks/{id}` | Task page: dates, dependencies, assignees, claim |
| `/Tasks/Import` | Production only. Paste a plan, dry-run it, create it (step 2). Teams importing their own tasks can come later; the service already allows it |
| `/Tasks/GetInvolved` | Tasks with unfilled places, critical first then soonest due. Filters: team, size, due. Claim or request from the list. Link to the roster for open roles |
| Team page part | The team's tasks, contributed into a Teams slot |

**Who can do what**

| Who | Can |
|---|---|
| Any member | See all tasks, claim a free place, release their own claim |
| A team's coordinator (existing Teams check) | Confirm or decline claims, assign, change status on tasks associated with their team, fully manage tasks they created |
| Production (new temporary global role) | Everything, and the only one that changes dates, dependencies or deletion on tasks it created |
| Admin | Everything, as the backstop |

Deny paths to test: a non-coordinator can't confirm; a coordinator of another team can't edit; a coordinator can't change dates or delete a production-created task; an anonymous visitor sees nothing.

**Home things-to-do:** pending claims appear on the coordinator's Home through the existing `ISectionThingsToDo` seam. Production sees pending claims for tasks with no team. No Notifications section needed.

## Connections to other modules

| Module | What Tasks uses or gives | Surface |
|---|---|---|
| Teams | Reads `GetTeamsAsync` (names, links) and `IsUserCoordinatorOfTeamAsync`; reuses `SlotPriority`. Teams gains a team-page slot and renders it in the team detail view | Reads exist. The slot is **new public surface** in `Teams.Contracts` |
| Backdoor | New controller there calls the Tasks bulk create through a `Contracts/` interface, so Backdoor gains a reference to Tasks | **New public surface** in Tasks (one interface), and a new row in the Backdoor surface table and its auth doc |
| Users | Display names through `IUserService`. Tasks implements `IUserMerge` | Existing |
| Gdpr | Tasks implements `IUserDataContributor` for assignments and authored text, with erasure declared | Existing |
| AuditLog | Writes through `IAuditLogService`. Tasks declares its own actions (`TasksAuditActions`, section-owned) | No AuditLog change. Action names are stored on rows, so they are never renamed |
| Auth | The production role is declared through `ISectionRoles`; the `RoleCatalog` picks it up. A line in `ShippedStoredNames` in `SectionRolesTests`. Who may grant it follows `RoleAssignmentRules` (*unverified* for a new role) | Existing pattern, no Auth change |
| Base | Nav label keys in `SharedResource` | New resx keys in all cultures |
| Shell | Project reference in `Humans.Web.csproj`, entries in `Humans.slnx`. Nav link through `ISectionNav` | Existing pattern |
| Home | Things-to-do entries | Existing seam |

Not touched: Shifts, Calendar, Workgroups, Budget, Expenses, GoogleIntegration, Notifications, Meetings, Surveys.

## Flags for Peter

1. **New section, tables and migration.** Own context, one migration, run through the EF migration review gate. *Event deploy freeze:* build is in May, so the first version has months of room before the freeze.
2. **Which role is production?** Cupcake's guess is that the production lead already holds a role this can attach to, which would avoid a new one. **Question for Peter.** If a new role is needed, it is a privilege-model addition (`TasksRoles`, declared through `ISectionRoles`), temporary, and goes in the debt ledger with the permissions track as its exit.
3. **New public surface:** the team-page slot (`ITeamPart` and `TeamPartArgs`, modelled on `ICampPart`). Alternatives rejected: a `Tasks.Contracts` home-provider seam (the earlier plan; heavier, and makes Teams reference Tasks), and a Teams service reading Tasks directly (couples the sections).
4. **One more consumer of the coordinator read,** which is slated to retire. Single call site, to move with the permissions track. Add a debt row.
5. **Audit actions are section-owned.** `TasksAuditActions` declares them; the AuditLog contract is untouched. Names are permanent once rows exist.
6. **Seven cultures.** New pages are member-facing, because coordinators and all members use them, so they are not admin-exempt. The `nl` resx files are already on main.
7. **New personal data:** assignments and authored text need the export contributor, an erasure declaration and audit entries.
8. **Top bar is already crowded** (about eleven links, scrolling sideways). One Get involved link makes it worse. The navigation track folds it into a Get involved group.
9. **Roster divergence.** Claiming a task doesn't add someone to the team roster, because Teams isn't told about claims. Contributors show on the task only.
10. **No sensitive tasks in the first version.** Everything is visible. Anything that must be hidden, such as a sensitive budget task, can't go in yet.
11. **Working groups are out.** Association needs a narrow coordinator read from Workgroups, which is new public surface.
12. **Docs to update in the same PRs:** `Tasks.md` (new, from the section template), `data-access.md`, `service-data-access-map.md`, `dependency-graph.md`, `Teams.md` for the slot, and `Backdoor.md` (surface table, auth doc) for the bulk create.
13. **Reuse audit:** `SlotPriority`, `ICampPart`'s slot pattern, `ISectionThingsToDo`, `ISectionNav`, the Gdpr and merge fan-outs, and the coordinator read are all reused. Rejected: role-owned tasks, the Issues queue-owner seam (meant for queues), the Notifications section (things-to-do is enough), Calendar feeds (later).
14. **Bulk create is new public surface and a new Backdoor dependency.** A `Contracts/` interface in Tasks and a controller in Backdoor, which is the existing home for key-authed agent APIs. Alternatives rejected: a Tasks-owned API with its own keys (duplicates the key lifecycle), and a CSV upload only (no use for production's Claude, and can't express dependencies as cleanly).

## Suggested PR split

One step per PR, and a PR touching more than two sections is probably two.
1. **Tasks core:** the section, data, rules, list and task pages, timeline, production role, audit and GDPR. Touches Base only for nav label keys.
2. **Bulk create:** the service method, the `Contracts/` interface, the Backdoor controller, and the import page. Touches Tasks and Backdoor. Comes right after core so the existing plan can be loaded instead of typed.
3. **Claiming and Get involved:** assignments, requests, things-to-do, the Get involved page. Inside Tasks only.
4. **Team-page slot:** the Teams contract and the render line, plus the Tasks contribution.

## Verified in code

Checked on Peter's `main` (21 Nov): `SlotPriority` in `Humans.Teams.Contracts`; `ITeamService.IsUserCoordinatorOfTeamAsync` (and a caching decorator, so a coordinator change may lag by the cache's refresh, *TTL not checked*); `ICampPart` as the slot pattern; `ISectionRoles`, `RoleCatalog` and `ShiftsRoles` as the role pattern; `AuditActionContributor` for section-owned audit actions; `ISectionThingsToDo`; `IUserDataContributor`; `IUserMerge`; the Backdoor personal-key API (`/api/backdoor/*`); `nl` resx present. Field limits copied from Calendar (200, 4000).

**Not verified:** who may grant a new role under `RoleAssignmentRules`; the coordinator cache's refresh time.

## Settled

- Build is in May, so the deploy freeze is not a constraint on the first version.
- New tasks are open by default; critical ones need confirmation.
- Production adding someone beyond the needed places adds a place, after a warning.
- Bulk create, with its import page, is in the first version, as step 2.
- Field limits: title 200, description 4000.

## Still to settle

- The role production uses, and whether a new one is needed (question for Peter).
