// Prototype-only behaviour: role switch, local-strip contexts and the go-to search. Fake data.
(function () {
  var ROLES = ['volunteer', 'coordinator', 'guideadmin', 'admin'];
  var ROLE_LABEL = { volunteer: 'Volunteer', coordinator: 'Shifts coordinator', guideadmin: 'Guide admin', admin: 'Admin' };
  var role = 'volunteer';

  // Pages the go-to search can list. roles: who can reach it. Mirrors what nav + policies would allow.
  var PAGES = [
    { t: 'Teams', w: 'Get involved', i: 'fa-people-group', r: 'all' },
    { t: 'Get involved (open tasks)', w: 'Get involved', i: 'fa-hand-holding-heart', r: 'all' },
    { t: 'My tasks', w: 'Get involved', i: 'fa-list-check', r: 'all' },
    { t: 'Shifts', w: 'Get involved', i: 'fa-calendar-check', r: 'all' },
    { t: 'My shifts', w: 'Get involved › Shifts', i: 'fa-user-clock', r: 'all' },
    { t: 'Workgroups', w: 'Get involved', i: 'fa-users-gear', r: 'all' },
    { t: 'Calendar', w: 'The event', i: 'fa-calendar-days', r: 'all' },
    { t: 'Events guide', w: 'The event', i: 'fa-masks-theater', r: 'all' },
    { t: 'My schedule', w: 'The event › Events', i: 'fa-bookmark', r: 'all' },
    { t: 'Barrios', w: 'The event', i: 'fa-campground', r: 'all' },
    { t: 'City map', w: 'The event', i: 'fa-map', r: 'all' },
    { t: 'Rideshare', w: 'The event', i: 'fa-car-side', r: 'all' },
    { t: 'Production view', w: 'The event', i: 'fa-timeline', r: 'all' },
    { t: 'Votes', w: 'Association', i: 'fa-check-to-slot', r: 'all' },
    { t: 'Budget', w: 'Association', i: 'fa-coins', r: 'all' },
    { t: 'Legal', w: 'Association', i: 'fa-scale-balanced', r: 'all' },
    { t: 'Guide', w: 'Association', i: 'fa-book-open', r: 'all' },
    { t: 'Profile', w: 'Account', i: 'fa-user', r: 'all' },
    { t: 'Consent & privacy', w: 'Account', i: 'fa-shield-halved', r: 'all' },
    { t: 'Shift dashboard', w: 'Get involved › Shifts', i: 'fa-gauge', r: 'coordinator,admin' },
    { t: 'Volunteer tracking', w: 'Get involved › Shifts', i: 'fa-table-cells', r: 'coordinator,admin' },
    { t: 'Moderate events', w: 'Admin › Events', i: 'fa-gavel', r: 'guideadmin,admin' },
    { t: 'Guide settings', w: 'Admin › Events', i: 'fa-sliders', r: 'guideadmin,admin' },
    { t: 'Export guide', w: 'Admin › Events', i: 'fa-file-export', r: 'guideadmin,admin' },
    { t: 'Humans (member list)', w: 'Admin', i: 'fa-address-book', r: 'admin' },
    { t: 'Google sync', w: 'Admin', i: 'fa-arrows-rotate', r: 'admin' },
    { t: 'Audit log', w: 'Admin', i: 'fa-clipboard-list', r: 'admin' }
  ];
  var ENTITIES = [
    { t: 'Barrio Support', w: 'Team', i: 'fa-people-group' },
    { t: 'Power & Infrastructure', w: 'Team', i: 'fa-people-group' },
    { t: 'Coordinate barrio placement requests', w: 'Task · Barrio Support', i: 'fa-list-check' },
    { t: 'Run the barrio welcome call', w: 'Task · Barrio Support', i: 'fa-list-check' },
    { t: 'Fern', w: 'Person', i: 'fa-user' },
    { t: 'Juniper', w: 'Person', i: 'fa-user' },
    { t: 'Camp Lumen', w: 'Barrio', i: 'fa-campground' }
  ];
  var PINS = ['Teams', 'My shifts', 'Calendar'];
  var RECENT = ['Coordinate barrio placement requests', 'Barrio Support', 'Budget'];

  var STRIPS = {
    teams: { name: 'Teams', links: [['Directory', 1], ['Tree'], ['Roster'], ['Map'], ['Birthdays'], ['My teams']] },
    shifts: { name: 'Shifts', links: [['Browse', 1], ['My shifts'], ['Availability'], ['Dashboard', 0, 'coordinator,admin'], ['Volunteer tracking', 0, 'coordinator,admin']] },
    events: { name: 'Events', links: [['Browse', 1], ['My submissions'], ['My schedule']], admin: 'guideadmin,admin' },
    tasks: { name: 'Get involved', links: [['Open tasks', 1], ['My tasks'], ['Production']] }
  };

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function allowed(spec) { return !spec || spec === 'all' || spec.split(',').indexOf(role) !== -1; }

  function applyRole() {
    $$('[data-roles]').forEach(function (el) { el.classList.toggle('vis-hidden', !allowed(el.dataset.roles)); });
    $$('[data-role-btn]').forEach(function (b) { b.classList.toggle('active', b.dataset.roleBtn === role); });
    var before = 11 + (role === 'guideadmin' || role === 'admin' ? 1 : 0);
    var after = 3 + (role === 'guideadmin' || role === 'admin' ? 1 : 0);
    $('#cntBefore').textContent = before;
    $('#cntAfter').textContent = after;
    var ev = role === 'guideadmin' || role === 'admin' ? 11 : 3;
    $('#cntEventsBefore').textContent = ev;
    $('#cntEventsAfter').textContent = 3;
    renderStrip(currentStrip);
  }

  var currentStrip = 'teams';
  function renderStrip(key) {
    currentStrip = key;
    var s = STRIPS[key], html = '<span class="where">' + s.name + '</span>';
    s.links.forEach(function (l) {
      if (l[2] && !allowed(l[2])) return;
      html += '<a href="#" class="' + (l[1] ? 'active' : '') + '">' + l[0] + '</a>';
    });
    if (s.admin && allowed(s.admin)) html += '<a href="#" class="admin-hop">Moderation &amp; settings are in Admin <i class="fa-solid fa-arrow-up-right-from-square ms-1"></i></a>';
    $('#localStrip').innerHTML = html;
    $$('[data-strip]').forEach(function (b) { b.classList.toggle('active', b.dataset.strip === key); });
  }

  // ---- go-to search ----
  var backdrop, input, results, sel = 0, shown = [];
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function mark(text, q) {
    if (!q) return esc(text);
    var i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }
  function find(list, q) { return list.filter(function (p) { return (p.t + ' ' + p.w).toLowerCase().indexOf(q.toLowerCase()) !== -1; }); }
  function render() {
    var q = input.value.trim(), html = '';
    shown = [];
    function group(label, items) {
      if (!items.length) return;
      html += '<div class="group-label">' + label + '</div>';
      items.forEach(function (p) {
        html += '<div class="item" data-i="' + shown.length + '"><i class="fa-solid ' + p.i + '"></i><span class="t">' + mark(p.t, q) + '</span><span class="w">' + esc(p.w) + '</span></div>';
        shown.push(p);
      });
    }
    var pages = PAGES.filter(function (p) { return allowed(p.r); });
    if (!q) {
      group('Pinned', pages.filter(function (p) { return PINS.indexOf(p.t) !== -1; }));
      group('Recent', RECENT.map(function (n) { return PAGES.concat(ENTITIES).filter(function (p) { return p.t === n; })[0]; }).filter(Boolean));
    } else {
      group('Pages you can open', find(pages, q).slice(0, 6));
      if (q.length > 1) group('People, teams, tasks, barrios', find(ENTITIES, q).slice(0, 5));
      if (!shown.length) html = '<div class="empty">Nothing you can open matches &ldquo;' + esc(q) + '&rdquo;.</div>';
    }
    sel = 0;
    results.innerHTML = html;
    mark2();
  }
  function mark2() { $$('.item', results).forEach(function (el, i) { el.classList.toggle('sel', i === sel); }); var s = $('.item.sel', results); if (s) s.scrollIntoView({ block: 'nearest' }); }
  function open() { backdrop.classList.add('open'); input.value = ''; render(); setTimeout(function () { input.focus(); }, 0); }
  function close() { backdrop.classList.remove('open'); }
  function go(i) { var p = shown[i]; if (!p) return; close(); $('#lastGo').textContent = 'Would open: ' + p.t + ' (' + p.w + ')'; }

  document.addEventListener('DOMContentLoaded', function () {
    backdrop = $('#palette'); input = $('#paletteInput'); results = $('#paletteResults');
    $$('[data-open-palette]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open(); }); });
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
    input.addEventListener('input', render);
    results.addEventListener('click', function (e) { var it = e.target.closest('.item'); if (it) go(+it.dataset.i); });
    results.addEventListener('mousemove', function (e) { var it = e.target.closest('.item'); if (it) { sel = +it.dataset.i; mark2(); } });
    document.addEventListener('keydown', function (e) {
      var typing = /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '');
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) { e.preventDefault(); open(); return; }
      if (!backdrop.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); mark2(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); mark2(); }
      else if (e.key === 'Enter') { e.preventDefault(); go(sel); }
    });
    $$('[data-role-btn]').forEach(function (b) { b.addEventListener('click', function () { role = b.dataset.roleBtn; applyRole(); }); });
    $$('[data-strip]').forEach(function (b) { b.addEventListener('click', function () { renderStrip(b.dataset.strip); }); });
    applyRole();
    // optional deep-link options for repeatable screenshots: #role=guideadmin&open=event&palette=mod&strip=events
    function opt(k) { var m = location.hash.match(new RegExp('[#&]' + k + '=([\\w-]+)')); return m && m[1]; }
    if (opt('role')) { var rb = document.querySelector('[data-role-btn="' + opt('role') + '"]'); if (rb) rb.click(); }
    if (opt('strip')) { var sb = document.querySelector('[data-strip="' + opt('strip') + '"]'); if (sb) sb.click(); }
    if (opt('open')) {
      var idx = { involved: 0, event: 1, assoc: 2 }[opt('open')];
      var toggles = document.querySelectorAll('.mock .nav-link.dropdown-toggle');
      if (toggles[idx] && window.bootstrap) window.bootstrap.Dropdown.getOrCreateInstance(toggles[idx]).show();
    }
    if (opt('palette')) { open(); input.value = opt('palette'); render(); }
  });
})();
