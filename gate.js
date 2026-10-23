/*!
 * Access Gate v0.1.0 — תוסף גישה בתשלום לכלים של בועז ברקת
 * שלב 1: backend מדומה (localStorage). אין התחברות אמיתית ואין חיוב.
 *
 * שימוש:
 *   <script src="https://boazbareket1.github.io/access-gate/gate.js"></script>
 *   <script>
 *     AccessGate.init({ toolId: 'fill-drill', toolName: 'Fill Drill' });
 *     // לפני פעולה בתשלום:
 *     if (!AccessGate.require('ספריית המעברים המלאה')) return;
 *   </script>
 */
(function () {
  'use strict';

  var VERSION = '0.1.0';
  var DAY = 86400000;

  /* ---------- אחסון מקומי בטוח ---------- */
  var LS = {
    get: function (k, d) {
      try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); }
      catch (e) { return d; }
    },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDate(t) {
    try { return new Date(t).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return new Date(t).toDateString(); }
  }
  function addMonths(t, m) { var d = new Date(t); d.setMonth(d.getMonth() + m); return d.getTime(); }
  function daysBetween(a, b) { return Math.max(0, Math.ceil((b - a) / DAY)); }

  /* ---------- זיהוי מכשיר ---------- */
  function deviceId() {
    var id = LS.get('ag_device_id', null);
    if (!id) { id = 'd' + Math.random().toString(36).slice(2) + Date.now().toString(36); LS.set('ag_device_id', id); }
    return id;
  }
  function deviceName() {
    var ua = navigator.userAgent || '';
    var os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' :
      /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'מכשיר';
    var br = /Edg\//.test(ua) ? 'Edge' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' :
      /Safari\//.test(ua) ? 'Safari' : '';
    return br ? os + ' · ' + br : os;
  }

  /* =====================================================================
   * Backend מדומה. ה-backend האמיתי (Supabase + ספק סליקה) יממש בדיוק
   * את אותן פונקציות, כך שהחלפה לא תדרוש שינוי בכלים עצמם.
   * ===================================================================== */
  var MockBackend = {
    name: 'mock',
    _db: function () { return LS.get('ag_mock_db', { users: {} }); },
    _save: function (db) { LS.set('ag_mock_db', db); },
    _user: function (db, email) {
      if (!db.users[email]) db.users[email] = { email: email, passes: {}, devices: [], marketing: false, purchases: [] };
      return db.users[email];
    },
    now: function () { return Date.now() + LS.get('ag_mock_timeshift', 0); },

    currentUser: function () {
      var e = LS.get('ag_mock_session', null);
      return Promise.resolve(e ? { email: e } : null);
    },
    signIn: function (opts) {
      /* Google מדומה: מתחבר כמשתמש האחרון שהתחבר בדפדפן הזה, או כמשתמש לדוגמה */
      var email = String(opts.email || LS.get('ag_mock_last_email', 'demo.user@gmail.com')).trim().toLowerCase();
      LS.set('ag_mock_last_email', email);
      var db = this._db(); var u = this._user(db, email);
      if (opts.marketing) u.marketing = true;
      this._save(db); LS.set('ag_mock_session', email);
      return Promise.resolve({ email: email });
    },
    signOut: function () { LS.del('ag_mock_session'); return Promise.resolve(); },

    /* רושם את המכשיר; אם עברנו את המקסימום — מנתק את הוותיק ביותר שאינו הנוכחי */
    registerDevice: function (email, dev, max) {
      var db = this._db(); var u = this._user(db, email); var now = this.now();
      var found = u.devices.filter(function (d) { return d.id === dev.id; })[0];
      if (found) { found.lastSeen = now; found.name = dev.name; }
      else u.devices.push({ id: dev.id, name: dev.name, lastSeen: now, added: now });
      var removed = [];
      while (u.devices.length > max) {
        u.devices.sort(function (a, b) { return a.lastSeen - b.lastSeen; });
        var victim = u.devices[0].id === dev.id ? u.devices[1] : u.devices[0];
        removed.push(victim);
        u.devices = u.devices.filter(function (d) { return d !== victim; });
      }
      this._save(db);
      return Promise.resolve({ removed: removed, devices: u.devices.slice() });
    },
    isDeviceActive: function (email, id) {
      var u = this._db().users[email];
      return Promise.resolve(!!(u && u.devices.some(function (d) { return d.id === id; })));
    },
    listDevices: function (email) {
      var u = this._db().users[email];
      return Promise.resolve(u ? u.devices.slice() : []);
    },
    removeDevice: function (email, id) {
      var db = this._db(); var u = this._user(db, email);
      u.devices = u.devices.filter(function (d) { return d.id !== id; });
      this._save(db); return Promise.resolve();
    },

    getPass: function (email, toolId) {
      var u = this._db().users[email];
      return Promise.resolve(u && u.passes[toolId] ? u.passes[toolId] : null);
    },
    /* בגרסה האמיתית: הפניה לעמוד התשלום של הספק, והמעבר יירשם ע"י webhook */
    mockCompletePurchase: function (email, toolId, plan) {
      var db = this._db(); var u = this._user(db, email); var now = this.now();
      var cur = u.passes[toolId]; var base = cur && cur.until > now ? cur.until : now;
      var until = addMonths(base, plan.months);
      u.passes[toolId] = { until: until, plan: plan.id };
      u.purchases.push({ toolId: toolId, plan: plan.id, at: now, until: until });
      this._save(db);
      return Promise.resolve({ until: until });
    }
  };

  /* ---------- סגנון ---------- */
  var CSS = [
    ':host{all:initial}',
    '.ag{--bg:#14161C;--card:#1F2230;--card2:#262A3A;--line:#2E3244;--text:#F2F2F5;--muted:#A6A9B8;--soft:#C4C7D4;--ok:#7BD88F;--accent:#F5A524;--onaccent:#14161C;--sel:#2A2618;',
    'font-family:var(--ag-font,inherit),system-ui,-apple-system,"Segoe UI",Arial,sans-serif;direction:rtl;color:var(--text);font-size:15px;line-height:1.5}',
    '.ag.light{--bg:#FFFFFF;--card:#F3F4F7;--card2:#ECEEF3;--line:#DADDE5;--text:#1A1C22;--muted:#5D6170;--soft:#3D404B;--ok:#1E8E3E;--sel:#FFF6E5}',
    '.ag *{box-sizing:border-box}',
    'button{font:inherit;color:inherit;cursor:pointer;border:0;background:none}',
    'button:focus-visible,input:focus-visible,a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}',
    '.badge{position:fixed;z-index:2147483000;background:var(--card);color:var(--text);border:1px solid var(--line);padding:8px 14px;border-radius:999px;font-size:13px;box-shadow:0 4px 14px rgba(0,0,0,.25);min-height:36px}',
    '.badge b{color:var(--accent);font-weight:600}',
    '.pos-top-left{top:12px;left:12px}.pos-top-right{top:12px;right:12px}.pos-bottom-left{bottom:12px;left:12px}.pos-bottom-right{bottom:12px;right:12px}',
    '.scrim{position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center}',
    '@media(min-width:640px){.scrim{align-items:center}}',
    '.sheet{background:var(--bg);width:100%;max-width:420px;max-height:92vh;overflow:auto;border-radius:24px 24px 0 0;padding:22px 20px 28px;display:flex;flex-direction:column;gap:16px}',
    '@media(min-width:640px){.sheet{border-radius:24px}}',
    '.top{display:flex;justify-content:space-between;align-items:center;min-height:32px}',
    '.link{color:var(--muted);font-size:14px;padding:6px 0}',
    '.x{width:36px;height:36px;border-radius:50%;background:var(--card);display:flex;align-items:center;justify-content:center}',
    'h2{margin:0;font-size:24px;font-weight:700}',
    '.sub{color:var(--muted);font-size:14px;margin:4px 0 0}',
    '.reason{background:var(--sel);border:1px solid var(--accent);border-radius:12px;padding:10px 14px;font-size:14px}',
    '.plans{display:flex;flex-direction:column;gap:10px}',
    '.plan{width:100%;display:flex;justify-content:space-between;align-items:center;padding:15px 16px;border-radius:16px;background:var(--card);border:2px solid var(--line);text-align:right}',
    '.plan.on{background:var(--sel);border-color:var(--accent)}',
    '.plan .l{display:flex;flex-direction:column;gap:2px}',
    '.plan .n{font-weight:700;font-size:16px}.plan .s{color:var(--muted);font-size:13px}.plan .p{font-weight:700;font-size:17px}',
    '.tag{font-size:11px;font-weight:700;background:var(--accent);color:var(--onaccent);padding:2px 8px;border-radius:999px;margin-inline-start:8px}',
    '.card{background:var(--card);border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:8px;font-size:14px;color:var(--soft)}',
    '.row{display:flex;justify-content:space-between;gap:12px}.row .k{color:var(--muted)}',
    '.btn{display:block;width:100%;text-align:center;background:var(--accent);color:var(--onaccent);font-weight:700;font-size:16px;padding:14px;border-radius:14px;min-height:48px}',
    '.btn.ghost{background:transparent;color:var(--accent);border:1px solid var(--accent);font-weight:500}',
    '.btn.white{background:#fff;color:#1f1f1f;font-weight:500;border:1px solid #DADDE5;display:flex;gap:10px;align-items:center;justify-content:center}',
    '.btn.plain{background:var(--card);color:var(--text);font-weight:500}',
    '.fine{font-size:12px;color:var(--muted);text-align:center}',
    '.or{display:flex;align-items:center;gap:12px;color:var(--muted);font-size:13px}.or i{flex:1;height:1px;background:var(--line)}',
    'label{font-size:14px;color:var(--soft)}',
    'input[type=email]{width:100%;background:var(--card);border:1px solid var(--line);color:var(--text);border-radius:12px;padding:13px;font:inherit;font-size:16px;direction:ltr;text-align:left}',
    '.chk{display:flex;gap:10px;align-items:flex-start}.chk input{width:20px;height:20px;margin:2px 0 0;accent-color:var(--accent);flex-shrink:0}',
    '.center{text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px}',
    '.icon{width:76px;height:76px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--card)}',
    '.mock{border:1px dashed var(--accent);border-radius:14px;padding:14px;font-size:13px;color:var(--soft);background:var(--sel)}',
    '.dev{display:flex;justify-content:space-between;align-items:center;background:var(--card);border-radius:12px;padding:12px 14px;font-size:14px}',
    '.dev .meta{font-size:12px;color:var(--muted)}',
    '.dev .act{color:var(--accent);font-size:13px;padding:6px 8px}',
    '.err{color:#FF8A80;font-size:13px}',
    '.toast{position:fixed;z-index:2147483002;left:50%;transform:translateX(-50%);bottom:16px;width:calc(100% - 32px);max-width:420px;background:var(--card2);border:1px solid var(--line);border-radius:14px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 8px 24px rgba(0,0,0,.35)}',
    '.toast .t{font-size:14px}.toast .act{background:var(--accent);color:var(--onaccent);font-weight:700;font-size:14px;padding:9px 14px;border-radius:10px;white-space:nowrap}',
    '.toast .close{color:var(--muted);padding:4px 8px}',
    '.debug{position:fixed;z-index:2147483003;bottom:12px;right:12px;width:230px;background:#0B0C10;color:#E8E8EE;border:1px solid #3A3F55;border-radius:12px;padding:10px;font-size:12px;display:flex;flex-direction:column;gap:6px;direction:rtl}',
    '.debug .g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}',
    '.debug button{background:#1F2230;border-radius:8px;padding:6px;font-size:12px;color:#E8E8EE}',
    '.debug .h{display:flex;justify-content:space-between;font-weight:700}'
  ].join('\n');

  var ICONS = {
    x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    check: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    phone: '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 17.5h2"/></svg>',
    lock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0;margin-top:2px"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    g: '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"/><path fill="#FBBC05" d="M10.6 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>'
  };

  var DEFAULT_PLANS = [
    { id: '1m', label: 'חודש', months: 1, price: null, sub: 'לטעום ברצינות' },
    { id: '3m', label: '3 חודשים', months: 3, price: null, sub: 'המשתלם ביותר', best: true },
    { id: '12m', label: 'שנה', months: 12, price: null, sub: 'לשימוש קבוע' }
  ];

  /* =====================================================================
   * AccessGate
   * ===================================================================== */
  var G = {
    version: VERSION,
    cfg: null,
    backend: MockBackend,
    user: null,
    pass: null,
    state: { name: 'loading' },
    ui: { screen: null, planId: null, reason: '', msg: '', removed: [] },
    _listeners: [],
    _ready: null,

    now: function () { return this.backend.now(); },

    init: function (cfg) {
      var self = this;
      if (this._ready) return this._ready;
      cfg = cfg || {};
      if (!cfg.toolId) throw new Error('AccessGate: חסר toolId');
      this.cfg = {
        toolId: cfg.toolId,
        toolName: cfg.toolName || cfg.toolId,
        trialDays: cfg.trialDays == null ? 7 : cfg.trialDays,
        trialStart: cfg.trialStart || 'open',          // 'open' | 'manual'
        maxDevices: cfg.maxDevices || 2,
        plans: cfg.plans || DEFAULT_PLANS,
        currency: cfg.currency || '₪',
        features: cfg.features || [],
        freeNote: cfg.freeNote || 'החלקים הבסיסיים נשארים פתוחים.',
        provider: cfg.provider || '[ספק הסליקה]',
        theme: cfg.theme || 'dark',
        accent: cfg.accent || null,
        onAccent: cfg.onAccent || null,
        badge: cfg.badge === undefined ? 'top-left' : cfg.badge,
        trialReminderDays: cfg.trialReminderDays == null ? 2 : cfg.trialReminderDays,
        expiryReminderDays: cfg.expiryReminderDays == null ? 7 : cfg.expiryReminderDays,
        debug: cfg.debug || /[?&]gate-debug\b/.test(location.search)
      };
      this.ui.planId = (this.cfg.plans.filter(function (p) { return p.best; })[0] || this.cfg.plans[0]).id;
      this._mount();
      if (this.cfg.trialStart === 'open') this.beginTrial(true);
      this._ready = this.refresh().then(function () {
        self._remind();
        return self.status();
      });
      return this._ready;
    },

    /* ---------- מצב ---------- */
    _trialKey: function () { return 'ag_trial_' + this.cfg.toolId; },
    beginTrial: function (silent) {
      if (!LS.get(this._trialKey(), null)) {
        LS.set(this._trialKey(), this.now());
        if (!silent) this.refresh();
      }
    },

    refresh: function () {
      var self = this; var cfg = this.cfg; var dev = { id: deviceId(), name: deviceName() };
      return this.backend.currentUser().then(function (u) {
        if (!u) return null;
        return self.backend.isDeviceActive(u.email, dev.id).then(function (ok) {
          if (ok) return self.backend.registerDevice(u.email, dev, cfg.maxDevices).then(function () { return u; });
          /* המכשיר נותק ממכשיר אחר */
          return self.backend.signOut().then(function () {
            self.ui.kickedEmail = u.email;
            self._openSoon = 'kicked';
            return null;
          });
        });
      }).then(function (u) {
        self.user = u;
        return u ? self.backend.getPass(u.email, cfg.toolId) : null;
      }).then(function (pass) {
        self.pass = pass;
        self._compute();
        if (self._openSoon) { var s = self._openSoon; self._openSoon = null; self.open(s); }
        else if (self.ui.screen) self._render();
      });
    },

    _compute: function () {
      var now = this.now(); var cfg = this.cfg; var prev = this.state.name;
      var trialStart = LS.get(this._trialKey(), null);
      var trialEnd = trialStart ? trialStart + cfg.trialDays * DAY : null;
      var s;
      if (this.pass && this.pass.until > now) {
        s = { name: 'active', until: this.pass.until, daysLeft: daysBetween(now, this.pass.until) };
      } else if (trialEnd && now < trialEnd && cfg.trialDays > 0) {
        s = { name: 'trial', until: trialEnd, daysLeft: daysBetween(now, trialEnd) };
      } else if (this.pass) {
        s = { name: 'expired', until: this.pass.until };
      } else if (trialEnd) {
        s = { name: 'trial-ended', until: trialEnd };
      } else {
        s = { name: 'free' };
      }
      s.user = this.user ? this.user.email : null;
      this.state = s;
      this._renderBadge();
      this._renderDebug();
      if (prev !== s.name) { if (prev !== 'loading') this._drop('toast'); this._emit(); }
    },

    status: function () {
      var s = this.state;
      return { state: s.name, hasAccess: s.name === 'active' || s.name === 'trial', daysLeft: s.daysLeft || 0, until: s.until || null, user: s.user };
    },
    hasAccess: function () { return this.state.name === 'active' || this.state.name === 'trial'; },
    require: function (reason) {
      if (this.hasAccess()) return true;
      this.ui.reason = reason || '';
      this.open('plans');
      return false;
    },
    onChange: function (cb) { this._listeners.push(cb); return this; },
    _emit: function () {
      var st = this.status();
      this._listeners.forEach(function (cb) { try { cb(st); } catch (e) { console.error(e); } });
      try { window.dispatchEvent(new CustomEvent('accessgate:change', { detail: st })); } catch (e) {}
    },

    /* ---------- תשתית תצוגה ---------- */
    _mount: function () {
      var host = document.createElement('div');
      host.id = 'access-gate-root';
      document.body.appendChild(host);
      var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
      var style = document.createElement('style'); style.textContent = CSS; root.appendChild(style);
      var wrap = document.createElement('div');
      wrap.className = 'ag' + (this.cfg.theme === 'light' ? ' light' : '');
      if (this.cfg.accent) wrap.style.setProperty('--accent', this.cfg.accent);
      if (this.cfg.onAccent) wrap.style.setProperty('--onaccent', this.cfg.onAccent);
      root.appendChild(wrap);
      this._wrap = wrap;
      var self = this;
      wrap.addEventListener('click', function (e) {
        var t = e.target.closest('[data-a]');
        if (t) { e.preventDefault(); self._act(t.getAttribute('data-a'), t.getAttribute('data-v'), t); }
        else if (e.target.classList && e.target.classList.contains('scrim')) self.close();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && self.ui.screen) self.close();
      });
    },
    _layer: function (cls) {
      var el = this._wrap.querySelector('.' + cls);
      if (!el) { el = document.createElement('div'); el.className = cls; this._wrap.appendChild(el); }
      return el;
    },
    _drop: function (cls) { var el = this._wrap.querySelector('.' + cls); if (el) el.remove(); },

    _renderBadge: function () {
      var pos = this.cfg.badge;
      if (!pos || pos === 'none') return;
      var s = this.state; var txt;
      if (s.name === 'active') txt = 'גישה מלאה';
      else if (s.name === 'trial') txt = 'ניסיון · ' + (s.daysLeft === 1 ? 'יום אחרון' : 'עוד ' + s.daysLeft + ' ימים') + ' · <b>שדרוג</b>';
      else txt = 'גרסה חינמית · <b>פתיחת גישה</b>';
      var b = this._wrap.querySelector('.badge');
      if (!b) { b = document.createElement('button'); this._wrap.appendChild(b); }
      b.className = 'badge pos-' + pos;
      b.setAttribute('data-a', 'badge');
      b.setAttribute('aria-label', 'מצב הגישה: ' + txt.replace(/<[^>]+>/g, ''));
      b.innerHTML = txt;
    },

    open: function (screen) {
      this.ui.screen = screen || (this.user && this.state.name === 'active' ? 'account' : 'plans');
      this.ui.msg = '';
      this._render();
      var first = this._wrap.querySelector('.sheet button, .sheet input');
      if (first) try { first.focus({ preventScroll: true }); } catch (e) {}
    },
    close: function () { this.ui.screen = null; this.ui.reason = ''; this._drop('scrim'); },

    _plan: function () {
      var id = this.ui.planId;
      return this.cfg.plans.filter(function (p) { return p.id === id; })[0] || this.cfg.plans[0];
    },
    _price: function (p) {
      if (p.price == null || p.price === '') return '[מחיר]';
      return typeof p.price === 'number' ? this.cfg.currency + p.price : esc(p.price);
    },

    _render: function () {
      var scr = this.ui.screen; if (!scr) return;
      var scrim = this._layer('scrim');
      scrim.setAttribute('role', 'dialog'); scrim.setAttribute('aria-modal', 'true');
      var html = this['_s_' + scr] ? this['_s_' + scr]() : '';
      scrim.innerHTML = '<div class="sheet">' + html + '</div>';
    },
    _top: function (back) {
      return '<div class="top">' + (back ? '<button class="link" data-a="go" data-v="' + back + '">→ חזרה</button>' : '<span></span>') +
        '<button class="x" data-a="close" aria-label="סגירה">' + ICONS.x + '</button></div>';
    },

    /* ---------- מסכים ---------- */
    _s_plans: function () {
      var self = this; var cfg = this.cfg; var st = this.state;
      var head = st.name === 'active' ? 'הארכת הגישה' : 'פתיחת גישה מלאה';
      var plans = cfg.plans.map(function (p) {
        var on = p.id === self.ui.planId;
        return '<button class="plan' + (on ? ' on' : '') + '" data-a="plan" data-v="' + esc(p.id) + '" aria-pressed="' + on + '">' +
          '<span class="l"><span class="n">' + esc(p.label) + (p.best ? '<span class="tag">הכי משתלם</span>' : '') + '</span>' +
          (p.sub ? '<span class="s">' + esc(p.sub) + '</span>' : '') + '</span>' +
          '<span class="p">' + self._price(p) + '</span></button>';
      }).join('');
      var feats = cfg.features.length ? '<div class="card">' + cfg.features.map(function (f) { return '<div>✓ ' + esc(f) + '</div>'; }).join('') +
        '<div>✓ ' + (cfg.maxDevices === 2 ? 'מחשב ונייד באותו חשבון' : 'עד ' + cfg.maxDevices + ' מכשירים בחשבון אחד') + '</div></div>' : '';
      var reason = this.ui.reason ? '<div class="reason">«' + esc(this.ui.reason) + '» זמין בגישה המלאה</div>' : '';
      var extra = st.name === 'active' ? '<p class="sub">הגישה שלך בתוקף עד ' + fmtDate(st.until) + '. התקופה החדשה תתווסף לסופה.</p>' : '';
      var p = this._plan();
      return this._top(st.name === 'active' && this.user ? 'account' : null) +
        '<div><h2>' + head + '</h2><p class="sub">' + esc(cfg.toolName) + ' · תשלום חד־פעמי, בלי חידוש אוטומטי</p>' + extra + '</div>' +
        reason + '<div class="plans">' + plans + '</div>' + feats +
        '<button class="btn" data-a="continue">המשך · ' + esc(p.label) + ' ' + this._price(p) + '</button>' +
        '<div class="fine">תשלום מאובטח דרך ' + esc(cfg.provider) + ' · חשבונית נשלחת למייל</div>' +
        (this.user ? '' : '<button class="link" data-a="go" data-v="login-only" style="align-self:center">כבר קנית? התחבר</button>');
    },

    _s_login: function (only) {
      var p = this._plan();
      return this._top(only ? null : 'plans') +
        (only ? '' : '<div class="card"><div class="row"><span class="k">התוכנית שבחרת</span><span>' + esc(p.label) + ' · ' + this._price(p) + '</span></div></div>') +
        '<div><h2>' + (only ? 'התחברות' : 'כדי לשמור את הגישה שלך') + '</h2><p class="sub">הגישה נשמרת לחשבון, לא למכשיר. אפשר להתאמן מהטלפון ומהמחשב.</p></div>' +
        '<button class="btn white" data-a="google">' + ICONS.g + ' המשך עם Google</button>' +
        '<div class="or"><i></i>או<i></i></div>' +
        '<label for="ag-email">כתובת מייל</label>' +
        '<input id="ag-email" type="email" autocomplete="email" placeholder="name@example.com">' +
        (this.ui.msg ? '<div class="err" role="alert">' + esc(this.ui.msg) + '</div>' : '') +
        '<button class="btn ghost" data-a="email">שלחו לי קישור התחברות</button>' +
        '<div class="chk"><input id="ag-news" type="checkbox"><label for="ag-news">אשמח לקבל במייל עדכונים ותכנים חדשים (אפשר להסיר בכל עת)</label></div>' +
        (only ? '' : '<div class="card" style="flex-direction:row;gap:10px">' + ICONS.lock + '<span>בשלב הבא תעבור לעמוד התשלום המאובטח של ' + esc(this.cfg.provider) + '. פרטי האשראי לא עוברים דרכנו.</span></div>') +
        '<div class="mock">מצב בדיקה: ההתחברות מדומה. Google מתחבר כמשתמש לדוגמה, ומייל מתחבר מיד בלי לשלוח קישור.</div>';
    },
    '_s_login-only': function () { return this._s_login(true); },

    _s_checkout: function () {
      var p = this._plan();
      return this._top('plans') +
        '<div><h2>עמוד התשלום</h2><p class="sub">' + esc(this.user ? this.user.email : '') + '</p></div>' +
        '<div class="card"><div class="row"><span class="k">כלי</span><span>' + esc(this.cfg.toolName) + '</span></div>' +
        '<div class="row"><span class="k">תוכנית</span><span>' + esc(p.label) + '</span></div>' +
        '<div class="row"><span class="k">סכום</span><span>' + this._price(p) + '</span></div></div>' +
        '<div class="mock"><b>סליקה מדומה · לא מתבצע שום חיוב.</b><br>בגרסה האמיתית המשתמש יעבור כאן לעמוד התשלום של ' + esc(this.cfg.provider) +
        ', והגישה תיפתח אוטומטית כשהתשלום יאושר.</div>' +
        '<button class="btn" data-a="pay-ok">סמלץ תשלום מוצלח</button>' +
        '<button class="btn plain" data-a="pay-fail">סמלץ תשלום שבוטל</button>';
    },

    _s_failed: function () {
      return this._top(null) +
        '<div class="center"><h2>התשלום לא הושלם</h2><p class="sub">לא חויבת. אפשר לנסות שוב בכל רגע.</p></div>' +
        '<button class="btn" data-a="go" data-v="checkout">לנסות שוב</button>' +
        '<button class="btn plain" data-a="close">חזרה ל' + esc(this.cfg.toolName) + '</button>';
    },

    _s_success: function () {
      var st = this.state; var self = this;
      return this._top(null) +
        '<div class="center"><div class="icon">' + ICONS.check + '</div><h2>הגישה פתוחה!</h2>' +
        '<p class="sub">כל ' + esc(this.cfg.toolName) + ' זמין לך עכשיו. החשבונית נשלחה למייל.</p></div>' +
        '<div class="card"><div class="row"><span class="k">בתוקף עד</span><span>' + fmtDate(st.until) + '</span></div>' +
        '<div class="row"><span class="k">מכשירים מחוברים</span><span data-devcount>…</span></div></div>' +
        '<button class="btn" data-a="close">חזרה ל' + esc(this.cfg.toolName) + '</button>' +
        (function () { self._fillDevCount(); return ''; })();
    },
    _fillDevCount: function () {
      var self = this; if (!this.user) return;
      this.backend.listDevices(this.user.email).then(function (ds) {
        var el = self._wrap.querySelector('[data-devcount]');
        if (el) el.textContent = ds.length + ' מתוך ' + self.cfg.maxDevices;
      });
    },

    _s_newdevice: function () {
      var rem = this.ui.removed.map(function (d) {
        return '<div class="dev"><span><span>' + esc(d.name) + '</span><br><span class="meta">פעיל לאחרונה ' + fmtDate(d.lastSeen) + '</span></span><span class="meta">נותק</span></div>';
      }).join('');
      return this._top(null) +
        '<div class="center"><div class="icon">' + ICONS.phone + '</div><h2>התחברת ממכשיר חדש</h2>' +
        '<p class="sub">החשבון פעיל על ' + this.cfg.maxDevices + ' מכשירים לכל היותר, לכן המכשיר הוותיק ביותר נותק.</p></div>' +
        rem + '<button class="btn" data-a="after-newdevice">אישור, המשך</button>';
    },

    _s_kicked: function () {
      return this._top(null) +
        '<div class="center"><div class="icon">' + ICONS.phone + '</div><h2>המכשיר הזה נותק</h2>' +
        '<p class="sub">מישהו התחבר לחשבון ' + esc(this.ui.kickedEmail || '') + ' ממכשיר נוסף, ולכן המכשיר הזה נותק. אם זה אתה, אפשר להתחבר שוב — המכשיר הוותיק ביותר ינותק במקומו.</p></div>' +
        '<button class="btn" data-a="go" data-v="login-only">התחברות מחדש</button>' +
        '<button class="btn plain" data-a="close">המשך בגרסה החינמית</button>';
    },

    _s_account: function () {
      var self = this; var st = this.state;
      var line = st.name === 'active' ? 'גישה מלאה עד ' + fmtDate(st.until) :
        st.name === 'trial' ? 'ניסיון · עוד ' + st.daysLeft + ' ימים' : 'גרסה חינמית';
      setTimeout(function () { self._fillDevices(); }, 0);
      return this._top(null) +
        '<div><h2>החשבון שלי</h2><p class="sub">' + esc(this.user ? this.user.email : '') + '</p></div>' +
        '<div class="card"><div class="row"><span class="k">' + esc(this.cfg.toolName) + '</span><span>' + line + '</span></div></div>' +
        '<div><div class="sub" style="margin-bottom:8px">מכשירים מחוברים (עד ' + this.cfg.maxDevices + ')</div><div data-devices style="display:flex;flex-direction:column;gap:8px"></div></div>' +
        '<button class="btn" data-a="go" data-v="plans">' + (st.name === 'active' ? 'הארכת הגישה' : 'פתיחת גישה מלאה') + '</button>' +
        '<button class="btn plain" data-a="signout">התנתקות מהמכשיר הזה</button>';
    },
    _fillDevices: function () {
      var self = this; if (!this.user) return; var me = deviceId();
      this.backend.listDevices(this.user.email).then(function (ds) {
        var el = self._wrap.querySelector('[data-devices]'); if (!el) return;
        ds.sort(function (a, b) { return b.lastSeen - a.lastSeen; });
        el.innerHTML = ds.map(function (d) {
          var mine = d.id === me;
          return '<div class="dev"><span><span>' + esc(d.name) + (mine ? ' (המכשיר הזה)' : '') + '</span><br><span class="meta">פעיל לאחרונה ' + fmtDate(d.lastSeen) + '</span></span>' +
            (mine ? '' : '<button class="act" data-a="rmdev" data-v="' + esc(d.id) + '">ניתוק</button>') + '</div>';
        }).join('');
      });
    },

    /* ---------- פעולות ---------- */
    _act: function (a, v, el) {
      var self = this;
      switch (a) {
        case 'close': return this.close();
        case 'badge': return this.open(this.user ? 'account' : 'plans');
        case 'go': this.ui.screen = v; this.ui.msg = ''; return this._render();
        case 'plan': this.ui.planId = v; return this._render();
        case 'continue': this.ui.screen = this.user ? 'checkout' : 'login'; return this._render();
        case 'google': return this._signIn({ method: 'google' });
        case 'email': {
          var em = (this._wrap.querySelector('#ag-email') || {}).value || '';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.trim())) { this.ui.msg = 'נא להזין כתובת מייל תקינה'; return this._render(); }
          return this._signIn({ method: 'email', email: em });
        }
        case 'after-newdevice': return this._afterLogin();
        case 'pay-ok':
          el.disabled = true;
          return this.backend.mockCompletePurchase(this.user.email, this.cfg.toolId, this._plan()).then(function () {
            return self.refresh();
          }).then(function () { self.ui.screen = 'success'; self._render(); });
        case 'pay-fail': this.ui.screen = 'failed'; return this._render();
        case 'rmdev':
          return this.backend.removeDevice(this.user.email, v).then(function () { self._fillDevices(); });
        case 'signout':
          return this.backend.signOut().then(function () { self.close(); return self.refresh(); });
        case 'toast-close': return this._drop('toast');
        case 'toast-open': this._drop('toast'); return this.open(v);
        default: if (a.indexOf('dbg-') === 0) return this._debugAct(a.slice(4));
      }
    },
    _signIn: function (opts) {
      var self = this; var cfg = this.cfg;
      opts.marketing = !!(this._wrap.querySelector('#ag-news') || {}).checked;
      this._fromLoginOnly = this.ui.screen === 'login-only';
      return this.backend.signIn(opts).then(function (u) {
        self.user = u;
        return self.backend.registerDevice(u.email, { id: deviceId(), name: deviceName() }, cfg.maxDevices);
      }).then(function (r) {
        return self.refresh().then(function () {
          if (r.removed.length) { self.ui.removed = r.removed; self.ui.screen = 'newdevice'; return self._render(); }
          self._afterLogin();
        });
      });
    },
    _afterLogin: function () {
      if (this._fromLoginOnly || this.state.name === 'active') {
        this.ui.screen = this.state.name === 'active' ? 'account' : 'plans';
      } else this.ui.screen = 'checkout';
      this._render();
    },

    /* ---------- תזכורות (פעם ביום לכל היותר) ---------- */
    _remind: function () {
      var st = this.state; var cfg = this.cfg;
      var key = 'ag_toast_' + cfg.toolId; var today = new Date(this.now()).toDateString();
      var seen = LS.get(key, {});
      var msg = null, action = null, screen = 'plans', id = null;
      if (st.name === 'trial' && st.daysLeft <= cfg.trialReminderDays) {
        id = 'trial-' + today; msg = st.daysLeft === 1 ? 'היום האחרון של תקופת הניסיון' : 'נשארו ' + st.daysLeft + ' ימי ניסיון'; action = 'פתיחת גישה';
      } else if (st.name === 'active' && st.daysLeft <= cfg.expiryReminderDays) {
        id = 'exp-' + today; msg = 'עוד ' + st.daysLeft + ' ימים הגישה מסתיימת'; action = 'חידוש';
      } else if (st.name === 'trial-ended' && !seen.trialEnded) {
        id = 'trialEnded'; msg = 'תקופת הניסיון הסתיימה. ' + cfg.freeNote; action = 'פתיחת גישה';
      } else if (st.name === 'expired' && !seen['expired-' + st.until]) {
        id = 'expired-' + st.until; msg = 'הגישה המלאה הסתיימה. ' + cfg.freeNote; action = 'חידוש';
      }
      if (!msg) return;
      if (id === 'trialEnded') { if (seen.trialEnded) return; seen.trialEnded = true; }
      else { if (seen[id]) return; seen[id] = true; }
      LS.set(key, seen);
      var t = this._layer('toast'); t.setAttribute('role', 'status');
      t.innerHTML = '<span class="t">' + esc(msg) + '</span><span style="display:flex;gap:4px;align-items:center">' +
        '<button class="act" data-a="toast-open" data-v="' + screen + '">' + action + '</button>' +
        '<button class="close" data-a="toast-close" aria-label="סגירה">' + ICONS.x + '</button></span>';
    },

    /* ---------- לוח בדיקה (?gate-debug) ---------- */
    _renderDebug: function () {
      if (!this.cfg.debug) return;
      var s = this.state; var shift = Math.round(LS.get('ag_mock_timeshift', 0) / DAY);
      var d = this._layer('debug');
      d.innerHTML = '<div class="h"><span>Access Gate · בדיקה</span><span>v' + VERSION + '</span></div>' +
        '<div>מצב: <b>' + s.name + '</b>' + (s.daysLeft != null ? ' · ' + s.daysLeft + ' ימים' : '') + '</div>' +
        '<div>משתמש: ' + esc(s.user || '—') + '</div><div>הזזת זמן: ' + shift + ' ימים</div>' +
        '<div class="g"><button data-a="dbg-d1">+1 יום</button><button data-a="dbg-d6">+6 ימים</button>' +
        '<button data-a="dbg-d30">+30 ימים</button><button data-a="dbg-d0">איפוס זמן</button>' +
        '<button data-a="dbg-dev">מכשיר אחר התחבר</button><button data-a="dbg-reset">איפוס מלא</button></div>';
    },
    _debugAct: function (cmd) {
      var self = this;
      if (cmd.charAt(0) === 'd' && /^d\d+$/.test(cmd)) {
        var n = +cmd.slice(1);
        LS.set('ag_mock_timeshift', n === 0 ? 0 : LS.get('ag_mock_timeshift', 0) + n * DAY);
        LS.del('ag_toast_' + this.cfg.toolId);
        return this.refresh().then(function () { self._remind(); });
      }
      if (cmd === 'dev') {
        if (!this.user) { alert('קודם צריך להתחבר (דרך התג בפינה)'); return; }
        /* מסמלץ שהמכשיר הזה לא היה בשימוש זמן מה, ואז מכשיר אחר מתחבר.
           כשהחשבון מלא — המכשיר הזה (הוותיק) ינותק. */
        var db = this.backend._db(); var u = db.users[this.user.email]; var me = deviceId();
        if (u) u.devices.forEach(function (d) { if (d.id === me) d.lastSeen -= 30 * DAY; });
        this.backend._save(db);
        var fake = { id: 'fake' + Date.now(), name: 'מכשיר בדיקה ' + new Date().toLocaleTimeString('he-IL') };
        return this.backend.registerDevice(this.user.email, fake, this.cfg.maxDevices).then(function () { return self.refresh(); });
      }
      if (cmd === 'reset') {
        Object.keys(localStorage).forEach(function (k) { if (k.indexOf('ag_') === 0) LS.del(k); });
        location.reload();
      }
    }
  };

  window.AccessGate = G;
})();
