// Prototype-only behaviour: a viewer switcher, tab panels and a clickable poll. No data is real.
(function () {
  var LEVELS = ['visitor', 'contributor', 'holder', 'coordinator'];
  var LABELS = { visitor: 'Visitor', contributor: 'Contributor', holder: 'Holder', coordinator: 'Coordinator' };
  var body = document.body;
  var embedded = window.self !== window.top;
  if (embedded) body.classList.add('embedded');

  function stored() { try { return localStorage.getItem('protoViewer'); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem('protoViewer', v); } catch (e) { /* prototype only */ } }

  function parse(spec) {
    // "2-3", "0,1", "3"
    var out = [];
    spec.split(',').forEach(function (part) {
      var m = part.trim().match(/^(\d)-(\d)$/);
      if (m) { for (var i = +m[1]; i <= +m[2]; i++) out.push(i); }
      else if (part.trim() !== '') out.push(+part);
    });
    return out;
  }

  function apply(viewer) {
    var lvl = LEVELS.indexOf(viewer);
    body.dataset.viewer = viewer;
    document.querySelectorAll('[data-levels]').forEach(function (el) {
      el.classList.toggle('vis-hidden', parse(el.dataset.levels).indexOf(lvl) === -1);
    });
    document.querySelectorAll('.proto-bar [data-viewer]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.viewer === viewer);
    });
    document.querySelectorAll('.pg-glance').forEach(function (g) { g.scrollLeft = 0; if (g._renderGlance) g._renderGlance(); });
    document.querySelectorAll('[data-viewer-label]').forEach(function (el) { el.textContent = LABELS[viewer]; });
  }

  function buildBar() {
    if (embedded) return;
    var banner = document.createElement('div');
    banner.className = 'env-banner';
    banner.textContent = 'Prototype • Prototype • Prototype • Prototype • Prototype • Prototype • Prototype • Prototype • Prototype';
    body.insertBefore(banner, body.firstChild);

    if (body.dataset.protoViewer === 'off') return;
    var bar = document.createElement('div');
    bar.className = 'proto-bar';
    var html = '<div class="container"><span class="label">Viewing as</span><div class="btn-group" role="group">';
    LEVELS.forEach(function (l) {
      html += '<button type="button" class="btn btn-outline-secondary" data-viewer="' + l + '">' + LABELS[l] + '</button>';
    });
    html += '</div><span class="text-muted">Fake data; the page changes with involvement, as the spec describes.</span>';
    if (body.dataset.protoCurator === 'on') {
      html += '<label class="ms-auto d-flex align-items-center gap-1"><input type="checkbox" id="curatorToggle"> I hold the <em>curate tasks</em> task</label>';
    }
    html += '</div>';
    bar.innerHTML = html;
    banner.insertAdjacentElement('afterend', bar);
    bar.querySelectorAll('[data-viewer]').forEach(function (b) {
      b.addEventListener('click', function () { store(b.dataset.viewer); apply(b.dataset.viewer); });
    });
    var ct = document.getElementById('curatorToggle');
    if (ct) {
      ct.addEventListener('change', function () {
        document.querySelectorAll('[data-curator]').forEach(function (el) { el.classList.toggle('vis-hidden', !ct.checked); });
      });
      document.querySelectorAll('[data-curator]').forEach(function (el) { el.classList.add('vis-hidden'); });
    }
  }

  function tabs() {
    document.querySelectorAll('[data-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var g = btn.dataset.group;
        document.querySelectorAll('[data-tab][data-group="' + g + '"]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        document.querySelectorAll('[data-panel][data-group="' + g + '"]').forEach(function (p) {
          p.classList.toggle('vis-hidden', p.dataset.panel !== btn.dataset.tab);
        });
      });
    });
  }

  function poll() {
    var order = ['', 'yes', 'maybe', 'no'];
    var glyph = { '': '–', yes: '✓ yes', maybe: '~ if needed', no: '✗ no' };
    document.querySelectorAll('.poll-cell').forEach(function (c) {
      c.dataset.v = c.dataset.v || '';
      c.textContent = glyph[c.dataset.v];
      c.addEventListener('click', function () {
        var next = order[(order.indexOf(c.dataset.v) + 1) % order.length];
        c.dataset.v = next; c.textContent = glyph[next];
      });
    });
  }

  function follow() {
    document.querySelectorAll('[data-follow]').forEach(function (b) {
      b.addEventListener('click', function () {
        var on = b.classList.toggle('btn-secondary');
        b.classList.toggle('btn-outline-secondary', !on);
        b.innerHTML = on ? '<i class="fa-solid fa-bell me-1"></i>Following' : '<i class="fa-regular fa-bell me-1"></i>Follow';
      });
    });
  }


  // ---- proposed app nav: group menus on desktop, bottom tab bar on phones (see the navigation spec) ----
  var GROUPS = {
    involved: { label: 'Get involved', icon: 'fa-hand-holding-heart', entries: [
      ['fa-people-group', 'Teams', 'Find your people and what they need', 'team-page.html'],
      ['fa-hand-holding-heart', 'Get involved', 'Open tasks across every team', 'get-involved.html'],
      ['fa-calendar-check', 'Shifts', 'Browse and sign up for shifts', '#'],
      ['fa-users-gear', 'Workgroups', 'Time-bound groups with a goal', '#']] },
    event: { label: 'The event', icon: 'fa-campground', entries: [
      ['fa-calendar-days', 'Calendar', 'Meetings and dates', '#'],
      ['fa-masks-theater', 'Events guide', 'What’s on, and how to submit', '#'],
      ['fa-campground', 'Barrios', 'Camps and their placement', '#'],
      ['fa-map', 'City', 'The site map', '#'],
      ['fa-car-side', 'Rideshare', 'Get there together', '#'],
      ['fa-timeline', 'Production', 'How the event is coming together', 'production.html']] },
    assoc: { label: 'Association', icon: 'fa-landmark', entries: [
      ['fa-check-to-slot', 'Votes', 'Assembly and Board votes', '#'],
      ['fa-coins', 'Budget', 'Where the money goes', '#'],
      ['fa-scale-balanced', 'Legal', 'Statutes and documents', '#'],
      ['fa-book-open', 'Guide', 'How things work here', '#']] }
  };
  function entryHtml(e) { return '<a class="entry" href="' + e[3] + '"><i class="fa-solid ' + e[0] + '"></i><div><strong>' + e[1] + '</strong><span>' + e[2] + '</span></div></a>'; }

  function buildNav() {
    var active = body.dataset.navGroup;
    var hdr = document.querySelector('header');
    if (!active || !hdr) return;
    var groups = '';
    Object.keys(GROUPS).forEach(function (k) {
      var g = GROUPS[k];
      groups += '<li class="nav-item dropdown"><a class="nav-link dropdown-toggle' + (k === active ? ' active' : '') + '" href="#" data-bs-toggle="dropdown" aria-expanded="false">' + g.label + '</a>' +
        '<div class="dropdown-menu group-menu"><div class="entries">' + g.entries.map(entryHtml).join('') + '</div></div></li>';
    });
    hdr.innerHTML = '<nav class="navbar navbar-expand navbar-dark mb-3 appnav">' +
      '<a class="navbar-brand" href="index.html"><img src="../../../../../src/Humans.Web/wwwroot/img/logo.svg" alt="" aria-hidden="true"> Humans</a>' +
      '<ul class="navbar-nav groups ms-2">' + groups + '</ul>' +
      '<div class="bar-right"><a class="search-btn" href="#" aria-label="Go to"><i class="fa-solid fa-magnifying-glass"></i><span>Go to…</span><kbd>Ctrl K</kbd></a>' +
      '<span class="avatar you">SU</span></div></nav>';

    // phone tab bar
    body.classList.add('has-tabbar');
    var tabs = [['home', 'Home', 'fa-house']].concat(Object.keys(GROUPS).map(function (k) { return [k, GROUPS[k].label, GROUPS[k].icon]; }));
    var bar = document.createElement('div');
    bar.className = 'tabbar';
    bar.innerHTML = tabs.map(function (t) { return '<button type="button" data-tab-key="' + t[0] + '" class="' + (t[0] === active ? 'on' : '') + '"><i class="fa-solid ' + t[2] + '"></i>' + t[1] + '</button>'; }).join('');
    var sheet = document.createElement('div');
    sheet.className = 'tab-sheet';
    body.appendChild(sheet); body.appendChild(bar);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var key = b.dataset.tabKey;
      if (key === 'home' || !GROUPS[key]) { sheet.classList.remove('open'); return; }
      var same = sheet.dataset.key === key && sheet.classList.contains('open');
      sheet.classList.toggle('open', !same); sheet.dataset.key = key;
      sheet.innerHTML = '<h6>' + GROUPS[key].label + '</h6>' + GROUPS[key].entries.map(entryHtml).join('');
      Array.prototype.forEach.call(bar.querySelectorAll('button'), function (x) { x.classList.toggle('on', x.dataset.tabKey === (same ? active : key)); });
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.tabbar') && !e.target.closest('.tab-sheet')) { sheet.classList.remove('open'); Array.prototype.forEach.call(bar.querySelectorAll('button'), function (x) { x.classList.toggle('on', x.dataset.tabKey === active); }); } });

    // tab bar tucks away while reading down the page, returns on scroll up
    var lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      var y = window.scrollY, atBottom = (window.innerHeight + y) >= (document.documentElement.scrollHeight - 4);
      if (y > lastY + 12 && y > 120) body.classList.add('tabbar-hidden');
      else if (y < lastY - 12 || y < 120 || atBottom) body.classList.remove('tabbar-hidden');
      if (body.classList.contains('tabbar-hidden')) sheet.classList.remove('open');
      lastY = y;
    }, { passive: true });
  }

  // ---- glance strip cues: hint row, dots and count that follow the swipe ----
  function setupGlance() {
    document.querySelectorAll('.pg-glance').forEach(function (g) {
      var hint = document.createElement('div');
      hint.className = 'glance-hint';
      hint.innerHTML = '<span>At a glance</span><span class="swipe">Swipe <i class="fa-solid fa-arrow-right"></i></span>';
      var dots = document.createElement('div');
      dots.className = 'glance-dots';
      var wrap = document.createElement('div');
      wrap.className = 'pg-glance-wrap';
      g.parentNode.insertBefore(wrap, g);
      wrap.appendChild(hint); wrap.appendChild(g); wrap.appendChild(dots);
      function cards() { return Array.prototype.filter.call(g.children, function (c) { return !c.classList.contains('vis-hidden'); }); }
      function render() {
        var cs = cards(), step = cs.length > 1 ? cs[1].offsetLeft - cs[0].offsetLeft : 1;
        var idx = cs.length > 1 ? Math.min(cs.length - 1, Math.round(g.scrollLeft / step)) : 0;
        dots.innerHTML = cs.map(function (c, i) { return '<button type="button" aria-label="Show card ' + (i + 1) + ' of ' + cs.length + '" class="' + (i === idx ? 'on' : '') + '"></button>'; }).join('') + '<span class="count">' + (idx + 1) + ' of ' + cs.length + '</span>';
        var single = cs.length < 2;
        hint.style.display = single ? 'none' : ''; dots.style.display = single ? 'none' : '';
      }
      g.addEventListener('scroll', render, { passive: true });
      ['touchstart', 'pointerdown', 'wheel'].forEach(function (ev) { g.addEventListener(ev, function () { hint.classList.add('touched'); }, { passive: true }); });
      dots.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        var i = Array.prototype.indexOf.call(dots.querySelectorAll('button'), b), cs = cards();
        if (cs[i]) g.scrollTo({ left: cs[i].offsetLeft - cs[0].offsetLeft, behavior: 'smooth' });
      });
      g._renderGlance = render;
      render();
    });
  }

  buildNav();
  setupGlance();
  buildBar();
  tabs(); poll(); follow();
  function fromHash() { return (location.hash.match(/viewer=(\w+)/) || [])[1]; }
  var initial = fromHash() || stored() || 'visitor';
  if (LEVELS.indexOf(initial) === -1) initial = 'visitor';
  apply(initial);
  window.addEventListener('hashchange', function () { var v = fromHash(); if (v && LEVELS.indexOf(v) !== -1) apply(v); });

  // optional deep-link options, used to produce repeatable screenshots: #viewer=holder&curator=1&tab=board&sheet=event
  function hashOpt(k) { var m = location.hash.match(new RegExp('[#&]' + k + '=([\\w-]+)')); return m && m[1]; }
  if (hashOpt('curator')) { var ct = document.getElementById('curatorToggle'); if (ct) { ct.checked = true; ct.dispatchEvent(new Event('change')); } }
  if (hashOpt('tab')) { var tb = document.querySelector('[data-tab="' + hashOpt('tab') + '"][data-group="views"]'); if (tb) tb.click(); }
  if (hashOpt('sheet')) { var sb = document.querySelector('[data-tab-key="' + hashOpt('sheet') + '"]'); if (sb) sb.click(); }
})();
