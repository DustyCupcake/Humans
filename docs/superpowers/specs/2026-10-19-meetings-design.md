# Meetings — one capability for team, workgroup, project and community meetings

**Status: draft for discussion — nothing here is implemented.** Items marked **[OPEN]** are undecided. Related specs: [Tasks](2026-10-19-tasks-module-design.md), [Teams on tasks](2026-10-19-teams-on-tasks-design.md), [Navigation](2026-10-19-navigation-design.md).

## Why

A meeting is often the invitation to get involved: a person who does not know a team yet can see when it meets, what it will talk about, and what was decided last time. Today that exists in two places (Workgroups has meetings and minutes; Teams only links to a calendar), and some meetings belong to neither:
- **Project meetings** — a cross-team session such as site layout belongs to a project, not to any one team, yet needs an agenda, notes and a findable place.
- **Community meetings** — larger gatherings, usually organised by a comms task, are not the same thing as the comms team's own meeting.

So meetings become one shared capability with an *owner* of any of those kinds.

## Concepts

- **Meeting** — owner, title, date/time and timezone, location or link, agenda (topics, Markdown), status (Scheduled / Held / Cancelled), attendance, notes (Markdown, afterwards), visibility. The organiser posts each meeting; "copy last meeting" seeds the next. Automatic recurrence is later.
- **Owner** — a team, a working group, a project, or the community. Each kind is declared by the section that knows it (Teams, Workgroups, Tasks for projects; Meetings itself for the community) through a seam discovered in DI, so Meetings references none of them. An owner supplies its name, its visibility rules, its **involved pool** (who is invited by default) and who may organise.
  - *Team:* members and associates. *Working group:* members. *Project:* the holders of the project's tasks (the people representing their teams). *Community:* every signed-in member.
- **Kinds.** Most meetings are ordinary. Community-scoped meetings can be fixed-date **kinds** the association relies on, such as the **general assembly** and the **All Leads Meeting**. When a kind's date is finalised it feeds the production calendar, and anything that references it (a budget deliverable that must be voted at the assembly) follows the date.
- **Organising** is a task, not a rank: the `meetings.organise` capability, scoped to the owner. Teams and working groups seed a task that grants it. A project has no people of its own, so any holder of one of its tasks may organise unless the project has chosen a lead task **[OPEN]**. Community meetings use the org-scoped `meetings.community`, held through a task such as one in comms.
- **Agenda items** — the organiser curates topics; anyone signed in may suggest one **[OPEN: v1?]**. Other sections can contribute items (a year-end review adds "Year-end review: flagged items" to the All Leads Meeting, listing only what teams flagged or left unresolved): a vacancy on an Endorsed task adds a "Filling: *task*" item (see the Tasks spec's Selection section), with the invitation also reaching the outgoing holder and other teams' coordinators.
- **Private calls** — a meeting can be a private call with explicit invitees: not listed, with notes visible only to those invited, and scheduled with the same poll between them. A confirmer uses one to talk with someone asking to pick up a task (see the Tasks spec's Track record); it is linked to the request.
- **Scheduling poll** — the organiser proposes candidate slots; any signed-in human answers yes / if-needed / no. Answers are blind: respondents see only their own; the organiser sees counts per slot **[OPEN: or blind to the organiser too]**. Confirming a slot sets the meeting time and notifies the involved pool and everyone who answered through Notifications. Responses are deleted a set time after confirmation **[OPEN: default 30 days]**. A grid-style availability picker is later.
- **Attendance and notes** — the organiser records who attended or, at least, how many. Past meetings and notes are listed for any signed-in human; sensitive owners limit notes to their members. Notes of a meeting where endorsements were given are published by default and **must be published when two or fewer people attended** (a setting), so a decision never rests on a private two-person conversation.

## Where meetings show

- On the owner's page: next meeting with topics (visible to everyone who can see the page) and the notes archive. With none posted the page says so and points to the contact point.
- On the community calendar: public meetings feed Calendar through its existing contributor seam, so Calendar's open-edit policy never lets someone change a meeting's time.
- A listing of upcoming meetings across owners, so a member can find a meeting without knowing the team first **[OPEN: a `/Meetings` page in the Get involved group, or only through owners and search]**.
- A project page lists its meetings alongside its tasks.

## Existing Workgroups meetings

Workgroups' meeting records (title, time, link, public flag, minutes) move into Meetings as working-group-owned meetings, and the Workgroups section stops owning a meeting table and pages. That changes another section's doc and data, so it needs that section's agreement. **[OPEN]**

## Ownership

- A new **Meetings** section (`Humans.Meetings` + `Humans.Meetings.Contracts`) owns meetings, agenda items, attendance, notes, polls and responses. Owners and agenda contributors reach it through its contracts; Calendar and Notifications are called, never read from.
- Public surface kept narrow: read DTOs for next meeting and archive, a write contract for organisers, and the two seams (owner provider, agenda contributor).

## Surfaces checklist

- **Cultures:** every member-facing string in all six cultures; meeting content is written in whatever language the owner uses and is not translated.
- **Authorization + negatives:** only `meetings.organise` holders of that owner post or edit; sensitive owners' notes limited; poll answers visible only to their author (and counts to the organiser); suggesting a topic needs sign-in; a project's meetings are visible as its tasks are.
- **Audit:** meeting created/edited/cancelled, notes published, poll opened/confirmed.
- **GDPR:** poll responses, attendance and authored notes in export and erasure paths. Erasure keeps notes and removes attribution, the posture Workgroups already takes.
- **Navigation:** from each owner's page, the go-to search, and the Get involved group if a listing page is added.
- **Tests:** `tests/Humans.Meetings.Tests` — owner resolution and involved pools, organiser capability per owner kind, poll blindness and confirmation, the two-or-fewer publication rule, agenda contribution, sensitive notes.
- **Invariant doc:** a new `Meetings.md` in the implementing PR.

## Reuse audit

| Considered | Decision |
|---|---|
| Calendar events as meetings | Rejected: Calendar is open-edit; meetings need organiser authority, agendas, notes and polls. Calendar still lists public ones. |
| Workgroups' meetings and minutes | Adopted as the basis and migrated. |
| Orchard scheduling polls | Adopted in reduced form (candidate slots, blind answers); grid picker later. |
| Surveys for polls | Rejected: surveys collect answers, not confirmed times. |
| One implementation per section | Rejected: Teams, Workgroups, projects and the community all need the same thing. |
