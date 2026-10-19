# Navigation — a bar that does not grow, and actions that stay in reach

**Status: draft for discussion — nothing here is implemented.** Items marked **[OPEN]** are undecided. This is its own spec; the [Tasks](2026-10-19-tasks-module-design.md) and [Teams on tasks](2026-10-19-teams-on-tasks-design.md) specs only ask it for somewhere to put their pages. Mock-ups, in Humans' own styling: [`prototypes/navigation/`](2026-10-19-tasks-teams-navigation-prototypes/navigation/index.html), with a side-by-side [phone comparison](2026-10-19-tasks-teams-navigation-prototypes/navigation/mobile.html).

## Problem

The member top bar is a strip of about eleven links (Search, Barrios, Teams, Calendar, City, Votes, Events, Rideshare, Shifts, Budget, Guide), twelve with Admin. It scrolls sideways whenever the links do not fit, which is the common case. Each section adds its own link through `ISectionNav` and nothing caps the total, so every new feature makes it worse. Other symptoms:

- The Events dropdown holds 3 links for members and 11 for guide admins, mixing moderation and settings into the member menu even though Events also contributes the same admin pages to the Admin area.
- The avatar menu holds nine entries and repeats Guide, Legal and Governance.
- Sections such as Workgroups, Surveys, Tickets, Expenses and Store have no member top-bar link at all; people find them through Home cards or links inside other pages.
- On phones, the important links on a page — Join, Pick up, Calendar, contact — live at the top of a right-hand column on desktop. In the page source that column comes after the main content, so a phone shows it underneath everything else. 83 views use a narrow side column, none reorder it for phones, and the Teams "Actions" card (Join, Leave, Calendar, Open store) comes after the whole member list.
- Permissions change how long the bar is, so two people see different layouts and the longest bar belongs to the people with the most to do.

## Principles

1. **The bar never grows with permissions or with features.** Permissions change what is inside the menus, never how many items the bar has.
2. **Admin tools live in Admin.** Member menus carry no admin-gated pages.
3. **Everything reachable is reachable by search.** A "go to" search lists every page the person may open.
4. **Navigation inside a section belongs to the section**, not to the global bar.
5. **One way to add a page.** A section declares its entry once; where it appears follows from that.
6. **Important actions are at the top at every width.** A page's primary actions sit in its header, not in a side column; the side column is context.

## Structure

**Top bar** (every signed-in member): logo (home) · **Get involved** · **The event** · **Association** · search icon · **Admin** (only if the person has any admin access or a capability with admin tools) · avatar. Three group menus plus Admin, at any permission level.

**Group menus.** A click opens a short panel: each entry has an icon, a name and a one-line description. Entries are sections, not their sub-pages. A group with nothing visible to the person does not render. Proposed starting membership **[OPEN: names and membership]**:

| Group | Entries |
|---|---|
| Get involved | Teams, Get involved (tasks), Shifts, Workgroups |
| The event | Calendar, Events guide, Barrios, City, Rideshare, Production view |
| Association | Votes, Budget, Legal, Guide |

**Go-to search** (Cmd/Ctrl-K, `/`, or the search icon). One box over the page. With nothing typed it shows pinned and recent pages. Typing lists matching **pages** the person can reach, then matching people, teams, barrios, shifts and events from the existing global search. Enter opens the first result; arrows move; Esc closes. Pages come from the same nav declarations and policy checks as the menus, so it discloses nothing the menus would not already show.

**Local navigation.** A section's own pages show as a strip under the bar on that section's pages (Teams: Directory · Tree · Roster · Map · Birthdays · My teams; Shifts: Browse · Mine; Events: Browse · My submissions · My schedule; Tasks: Get involved · My tasks · Production). Strip entries are the `Children` a section already declares; their policy gating is unchanged, but admin-gated children move to Admin.

**Home as the hub.** Home keeps its things-to-do and dashboard cards and adds **pinned** shortcuts (up to six, chosen by the person) and **recent** pages. This is the answer for the long tail, so no section needs a top-level link to be findable.

**Avatar menu.** Personal things only: Profile, Consent & privacy, About, Language, Sign out. Guide, Legal and Governance move to the Association group.

**Admin entry.** Leads to the existing Admin shell, whose sidebar already aggregates 41 sections. Anyone holding a [capability](2026-10-19-tasks-module-design.md) with admin tools sees those tools there, not in member menus.

**Phones.** The top bar reduces to logo, search and avatar; Home and the three groups become a **bottom tab bar** (always four labelled tabs), each opening a sheet of its entries. The local strip scrolls under the bar. The tab bar tucks away while reading down a page and returns on scroll up; see *Page actions on phones* for how it shares the bottom edge with the action bar.

## Page actions on phones

Applies to every page with a title, not only to section landing pages.

- **Page header.** Breadcrumb, title, status pills and the page's **primary actions** (at most two buttons) plus a **More** menu for the rest. It renders the same at every width, so nothing important depends on which column a card ends up in. Joining, picking up, following and "review requests" live here.
- **Side column is context.** Details, dates, who is involved. It follows the main content on phones.
- **At-a-glance cards come first on phones.** A page marks the few side cards a person needs to decide or act (on a team page: contact point, next meeting, a coordinator's staffing card; on a task page: what it grants and whether it fits). On phones they form one swipeable strip directly under the header. Because swiping is not obvious, the strip carries visible cues: an "At a glance · Swipe →" label that disappears after the first swipe, the next card peeking from the edge, and dots with an "n of N" count that also work as tap targets. Each card is compact, with its details behind a "More" toggle, so the strip stays short. On desktop the same cards stay at the top of the side column. This is a page-level layout with named areas (main, glance, aside), not a per-card reorder hack.
- **Sticky action bar, above the tab bar.** On phones, pages whose point is one decisive action (Join, Pick up, Sign up, Confirm, Review requests) pin that action to the bottom of the screen at any scroll position. It sits directly above the bottom tab bar (see Structure). While the person reads down the page the tab bar tucks away and the action bar drops to the bottom edge; scrolling up, or reaching the end of the page, brings the tab bar back. The action bar never holds more than two buttons and repeats what the header offers; it does not replace it.
- **Jump chips** on long pages: a row of links to the page's sections (Next meeting · Tasks · Timeline), phones only.
- **Collapsed cards.** Secondary cards (past meetings, timeline) start collapsed on phones and are always open on desktop.
- **Rule of thumb:** if a person would look for it within a few seconds, it goes in the header, the glance strip or the sticky bar, never in the aside.

Rolled out starting with the busiest pages — Team, Camp, Shifts, Profile — and the new Tasks pages are built this way from the start. A Razor lint check could later flag primary buttons placed in a side column without the shared header.

## Contract changes

All reuse existing seams; new public surface needs the maintainer's approval.

- `MemberNavItem` gains an optional `Group` key and a description resource key. Items without a group fall into the last group, so an unmigrated section still renders.
- The group list (key, label resource, icon, order) is a small Base-owned list, so adding a group is a reviewed Base change rather than something a section does. **[OPEN: Base-owned list vs sections contributing groups.]**
- `SectionNavViewComponent` groups visible items by `Group`, keeps weight ordering inside a group, and hides empty groups. `Children` render as the local strip as well as, optionally, the menu.
- Search gains a **pages** bucket read from `ISectionNav` and `ISectionAdminNav` plus policy checks. It still owns no tables.
- A shared page header partial and a small page-layout CSS utility (main / glance / aside areas, glance strip on phones, sticky action bar, collapse-on-phone) in the shared view layer in Base. No new section, and no change to controllers or services.
- Pins and recents are per-person preferences. **[OPEN: pins stored in the browser only (no GDPR surface, not portable) or on the account (portable, needs export and erasure).]** Recents stay in the browser.

## Migration

| Today | Becomes |
|---|---|
| Search icon | stays in the bar; becomes the go-to search |
| Teams, Shifts | Get involved |
| Camps (Barrios), Calendar, City, Rideshare, Events | The event; Events' three member pages become its local strip, its admin items go to Admin |
| Votes, Budget, Guide, Legal | Association |
| Avatar: Guide, Legal, Governance | Association |
| New: Get involved page, Production view | Get involved, The event (no new top-level link) |
| New: raise a concern | persistent footer/help action and avatar menu, not the bar |

## Surfaces checklist

- **Cultures:** group labels, descriptions and go-to search strings in all six cultures; section labels already localized.
- **Authorization + negatives:** a group with no visible entry is hidden; go-to search lists only pages the person can open; admin-gated pages never appear in member menus or the member strip; anonymous visitors see only the public set.
- **Accessibility:** menus are keyboard-operable (Enter/Space open, arrows move, Esc closes and returns focus); the go-to search is a labelled dialog with live-region result counts; bottom tabs have text labels, not icons alone.
- **Navigation test:** every page remains reachable in at most two clicks from Home, or by search.
- **Phones:** primary actions and the contact/decision cards are visible without scrolling past main content; the sticky bar clears the iOS safe area and does not cover the last card (page bottom padding); touch targets at least 44 px; the glance strip is reachable by keyboard and screen reader in reading order.
- **Audit / GDPR:** none beyond pins above.
- **Tests:** view-component grouping and ordering, empty-group hiding, search pages-bucket permission negatives, ungrouped fallback; Shell access-matrix widget keeps resolving.
- **Docs:** the layout and section-nav description updated in the implementing PR.

## Rollout **[OPEN]**

1. Groups replace the scrolling strip; admin items move out of member menus.
2. Go-to search.
3. Local strips per section.
4. Phone tab bar.
5. Shared page header and layout utility on Team, Camp, Shifts and Profile; Tasks pages from the start.

## Reuse audit

| Considered | Decision |
|---|---|
| Left sidebar for members, like Admin | Rejected: takes width on every page. |
| Hamburger only | Rejected: hides everything; hurts discoverability. |
| Keep the strip, add a "More" menu | Fine as a first step, but only delays the problem. |
| Different bars per role | Rejected: the bar stays the same, contents vary. |
| A new navigation module | Rejected: Shell composes what sections already declare. |
| Bootstrap `order-*` per card | Rejected: reorders single cards in a way that is hard to read and maintain; named layout areas say what each card is for. |
| Floating action button | Rejected for now: the sticky bar carries a label and handles two actions. |
| Stacking the at-a-glance cards vertically | Rejected: even compact, three cards push the page's own content a full screen down. The strip keeps them one swipe away with clear cues. |
| Two permanent bars at the bottom | Rejected: about 110 px of a phone screen. The tab bar hides while reading and returns on scroll up. |
| Accordion for the whole sidebar | Rejected: hides the cards people need; only secondary cards collapse. |
| Reuse `ISectionNav` weight, policy, visibility and `Children`; the Admin shell sidebar; the global-search orchestrator; Home things-to-do | Accepted. |
