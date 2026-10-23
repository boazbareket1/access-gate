/*!
 * Tools Analytics v1.0.0 — מדידת שימוש משותפת לכל הכלים של בועז ברקת
 * Google Analytics (G-R1LC6L4T1J), נכס אחד לכל הכלים ב-boazbareket1.github.io
 *
 * שימוש (שורה אחת בכל כלי, בתוך <head>):
 *   <script src="https://boazbareket1.github.io/access-gate/analytics.js" data-tool="election-matchmaker"></script>
 *
 * אירועים מותאמים:
 *   ToolsAnalytics.event('quiz_complete', { party_count: 3 });
 *
 * הכניסות שלך לא ייספרו: פתח כל כלי פעם אחת עם ?no-track בסוף הכתובת
 * (נשמר בדפדפן הזה). לביטול: ?track
 */
(function () {
  'use strict';
  if (window.ToolsAnalytics) return;

  var ID = 'G-R1LC6L4T1J';
  var script = document.currentScript;
  var tool = (script && script.getAttribute('data-tool')) ||
    location.pathname.split('/').filter(Boolean)[0] || 'home';

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }

  var q = location.search;
  if (/[?&]no-track\b/.test(q)) lsSet('ta_optout', '1');
  if (/[?&]track\b/.test(q)) lsSet('ta_optout', null);

  var isLive = location.hostname === 'boazbareket1.github.io';
  var enabled = isLive && lsGet('ta_optout') !== '1';

  var api = {
    tool: tool,
    enabled: enabled,
    event: function (name, params) {
      if (!enabled || !name) return;
      var p = { tool_name: tool };
      for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) p[k] = params[k];
      window.gtag('event', name, p);
    }
  };
  window.ToolsAnalytics = api;

  if (!enabled) {
    if (isLive) console.info('[analytics] הכניסות מהדפדפן הזה לא נספרות (?track לביטול)');
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', ID, { tool_name: tool });

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  (document.head || document.documentElement).appendChild(s);
})();
