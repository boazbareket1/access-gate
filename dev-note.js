/*
 * dev-note.js — הודעת "כלי בפיתוח" משותפת לכל הכלים של בועז ברקת.
 *
 * חיבור לכלי (לפני </body>):
 *   <script src="https://boazbareket1.github.io/access-gate/dev-note.js" data-tool="fill-drill" defer></script>
 *
 * מה זה עושה:
 * - תג קטן בפינה: "בפיתוח · אשמח להערות". לחיצה עליו פותחת את ההסבר.
 * - מי שנכנס מקישור ששותף בוואטסאפ (?s=wa) רואה את ההסבר המלא פעם אחת, בכניסה הראשונה.
 *
 * שינוי סטטוס לכל הכלים או לכלי אחד: משנים את STATUS כאן בלבד.
 *   "dev"  – בפיתוח: תג + הסבר על משוב
 *   "off"  – לא מציג כלום
 * כשיוגדר סטטוס חדש (למשל בטא או פתוח לכולם), מוסיפים אותו ל-TEXTS.
 */
(function () {
  if (window.__devNoteLoaded) return;
  window.__devNoteLoaded = true;

  var STATUS = {
    _default: "dev",
    politikalpi: "off"
  };

  var TEXTS = {
    dev: {
      pill: "בפיתוח · אשמח להערות",
      title: "תודה שבאת לנסות",
      body: [
        "הכלי הזה עדיין בשלב פיתוח.",
        "קיבלת את הקישור כי אני מאוד מעריך את הדעה שלך, ומשוב כמו שלך הוא בדיוק מה שיעזור לכלי לגדול.",
        "כל הערה תתקבל באהבה: מה עבד, מה היה מבלבל, ומה חסר."
      ],
      how: "איך שולחים הערה? פשוט עונים לי בוואטסאפ, בהודעה שבה קיבלת את הקישור.",
      later: "בהמשך הכלי יעבור לשלב הבא, ואעדכן.",
      sign: "בועז ברקת",
      ok: "יאללה, לכלי"
    }
  };

  var me = document.currentScript;
  var tool = (me && me.getAttribute("data-tool")) || location.pathname.split("/")[1] || "tool";
  var status = STATUS[tool] || STATUS._default;
  var t = TEXTS[status];
  if (!t) return;

  var KEY = "devnote-seen:" + tool + ":" + status;
  var seen = false;
  try { seen = localStorage.getItem(KEY) === "1"; } catch (e) {}
  var fromShare = /[?&]s=wa(&|$)/.test(location.search);

  function start() {
    var host = document.createElement("div");
    host.setAttribute("data-dev-note", "");
    host.style.cssText = "position:fixed;z-index:2147483000;inset:auto auto 0 0;pointer-events:none";
    document.body.appendChild(host);
    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

    var css =
      ":host{all:initial}" +
      "*{box-sizing:border-box;font-family:'Assistant','Rubik','Heebo',system-ui,'Segoe UI',Arial,sans-serif}" +
      ".pill{pointer-events:auto;position:fixed;left:max(12px,env(safe-area-inset-left,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));" +
      "direction:rtl;display:inline-flex;align-items:center;gap:7px;border:0;cursor:pointer;border-radius:999px;padding:7px 13px 7px 12px;" +
      "font-size:13px;font-weight:600;line-height:1;color:#1d2a24;background:rgba(255,248,232,.94);box-shadow:0 4px 14px rgba(0,0,0,.22),0 0 0 1px rgba(0,0,0,.06);opacity:.9}" +
      ".pill:hover,.pill:focus-visible{opacity:1}" +
      ".pill:focus-visible,.ok:focus-visible,.x:focus-visible{outline:3px solid #d98a1f;outline-offset:2px}" +
      ".dot{width:8px;height:8px;border-radius:50%;background:#e0a21c;box-shadow:0 0 6px #e0a21c}" +
      ".back{pointer-events:auto;position:fixed;inset:0;background:rgba(10,14,20,.55);display:flex;align-items:center;justify-content:center;padding:16px}" +
      ".card{direction:rtl;text-align:right;position:relative;width:min(420px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#fffaf0;color:#1d2a24;border-radius:18px;padding:26px 24px 22px;" +
      "box-shadow:0 24px 60px rgba(0,0,0,.35);display:grid;gap:12px}" +
      ".tag{justify-self:start;display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;color:#8a5a12;background:#f6e6c4;border-radius:999px;padding:4px 11px}" +
      "h2{margin:0;font-size:24px;line-height:1.2;font-weight:700}" +
      "p{margin:0;font-size:16px;line-height:1.55}" +
      ".how{background:#f1ebdc;border-radius:10px;padding:10px 12px;font-size:15px}" +
      ".later{font-size:14px;color:#5d6a64}" +
      ".sign{font-size:14.5px;font-weight:700;color:#5d6a64}" +
      ".ok{justify-self:start;margin-top:4px;border:0;cursor:pointer;border-radius:999px;padding:10px 22px;font-size:16px;font-weight:700;color:#fffaf0;background:#1d2a24}" +
      ".x{position:absolute;top:10px;left:10px;border:0;background:none;cursor:pointer;font-size:20px;line-height:1;color:#5d6a64;padding:6px;border-radius:8px}" +
      "@media (prefers-color-scheme:dark){.card{background:#1f2724;color:#ece6d8}.how{background:#2a3330}.later,.sign,.x{color:#a9b4ae}.tag{background:#3a3220;color:#f0c068}.ok{background:#ece6d8;color:#1f2724}}" +
      "@media (prefers-reduced-motion:no-preference){.card{animation:in .25s ease-out}@keyframes in{from{transform:translateY(8px);opacity:0}}}";

    var style = document.createElement("style");
    style.textContent = css;
    root.appendChild(style);

    var pill = document.createElement("button");
    pill.className = "pill";
    pill.type = "button";
    pill.setAttribute("aria-label", t.pill + " – פתיחת הסבר");
    pill.innerHTML = '<span class="dot" aria-hidden="true"></span><span></span>';
    pill.lastChild.textContent = t.pill;
    root.appendChild(pill);

    var back = null;
    function close() {
      if (!back) return;
      back.remove(); back = null;
      try { localStorage.setItem(KEY, "1"); } catch (e) {}
      pill.focus({ preventScroll: true });
    }
    function open() {
      if (back) return;
      back = document.createElement("div");
      back.className = "back";
      var card = document.createElement("div");
      card.className = "card";
      card.setAttribute("role", "dialog");
      card.setAttribute("aria-modal", "true");
      card.setAttribute("aria-labelledby", "dn-title");
      var html = '<button class="x" type="button" aria-label="סגירה">×</button>' +
        '<span class="tag"><span class="dot" aria-hidden="true"></span>גרסת פיתוח</span>' +
        '<h2 id="dn-title"></h2>';
      t.body.forEach(function () { html += "<p></p>"; });
      html += '<p class="how"></p><p class="later"></p><p class="sign"></p><button class="ok" type="button"></button>';
      card.innerHTML = html;
      card.querySelector("h2").textContent = t.title;
      var ps = card.querySelectorAll("p");
      t.body.forEach(function (s, i) { ps[i].textContent = s; });
      card.querySelector(".how").textContent = t.how;
      card.querySelector(".later").textContent = t.later;
      card.querySelector(".sign").textContent = "— " + t.sign;
      card.querySelector(".ok").textContent = t.ok;
      back.appendChild(card);
      root.appendChild(back);
      back.addEventListener("click", function (e) { if (e.target === back) close(); });
      card.querySelector(".x").addEventListener("click", close);
      card.querySelector(".ok").addEventListener("click", close);
      card.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
      card.querySelector(".ok").focus({ preventScroll: true });
    }
    pill.addEventListener("click", open);
    if (fromShare && !seen) setTimeout(open, 600);
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start);
})();
