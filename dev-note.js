/*
 * dev-note.js — כרטיס "ברוכים הבאים" משותף לכל הכלים של בועז ברקת.
 *
 * חיבור לכלי (לפני </body>):
 *   <script src="https://boazbareket1.github.io/access-gate/dev-note.js" data-tool="fill-drill" defer></script>
 *
 * מה זה עושה:
 * - בכניסה הראשונה לכלי נפתח כרטיס קצר: מה הכלי מציע, איך משתמשים בו בכמה צעדים,
 *   ואם הכלי בפיתוח – הזמנה למשוב.
 * - תג קטן ("?") פותח את הכרטיס שוב בכל רגע. אחרי הכניסה הראשונה הוא מתכווץ לעיגול קטן
 *   באמצע הצד השמאלי, כדי לא להסתיר כפתורים. מיקום אחר: data-pos="top-left" / "top-right" / "bottom-right".
 * - מצב בעלים: ?owner=on בכתובת של כלי כלשהו מכבה את הכרטיס והתג בכל הכלים בדפדפן הזה (?owner=off מבטל).
 *
 * עריכה:
 * - GUIDES: ההסבר לכל כלי. כלי חדש = מוסיפים כאן רשומה.
 * - STATUS: הסטטוס של כל כלי. "dev" = בפיתוח, "live" = בלי הודעת פיתוח, "off" = לא מציג כלום.
 *   כשיוגדר סטטוס חדש (למשל בטא), מוסיפים אותו ל-STAGE.
 */
(function () {
  if (window.__devNoteLoaded) return;
  window.__devNoteLoaded = true;

  var STATUS = {
    _default: "dev",
    politikalpi: "off"
  };

  var STAGE = {
    dev: {
      tag: "גרסת פיתוח",
      pill: "איך משתמשים · בפיתוח",
      lines: [
        "הכלי עדיין בשלב פיתוח. אם קיבלת אותו ממני, זה כי אני מאוד מעריך את הדעה שלך.",
        "כל הערה תתקבל באהבה: מה עבד, מה היה מבלבל, ומה חסר. פשוט עונים לי בוואטסאפ, בהודעה שבה קיבלת את הקישור.",
        "בהמשך הכלי יעבור לשלב הבא, ואעדכן."
      ]
    },
    live: { tag: "", pill: "איך משתמשים", lines: [] }
  };

  var GUIDES = {
    "fill-drill": {
      pro: "לשיעור: בונים מעבר יחד עם התלמיד, מגדירים סטיקינג ומורידים טמפו לתרגול איטי. אפשר לשלוח את הקישור כשיעורי בית, והתלמיד מתרגל לבד.",
      name: "Fill Drill",
      offer: "מאמן לתרגול מעברים בתופים: בונים ביט ומעבר על גריד, ומתרגלים אותם בלופ עם מטרונום.",
      steps: [
        "בוחרים ביט ומעבר מהספרייה, או בונים לבד: בוחרים יד (R או L) ומקישים על התאים בגריד.",
        "קובעים טמפו ולוחצים נגן ▶.",
        "מתרגלים את המבנה: הביט חוזר שלוש פעמים, ואחריו המעבר וקראש על 1.",
        "כשזה יושב טוב, מעלים את הטמפו בהדרגה."
      ]
    },
    "loop-lab": {
      pro: "לשיעור אלתור: בוחרים מהלך לפי רמת התלמיד, ומתקדמים מהשכבה הבטוחה לצבעונית ומשם החוצה. מצב \"סולם אחד לכל הלופ\" מתאים למתחילים.",
      name: "Loop Lab",
      offer: "מחולל לופים הרמוניים לתרגול אלתור, שמראה לכל אקורד אילו סולמות מתאים לנגן מעליו.",
      steps: [
        "בוחרים מהלך מספריית המהלכים, או בונים מהלך משלכם.",
        "בוחרים טונליות וטמפו ולוחצים נגן ▶.",
        "מאלתרים מעל הלופ. לכל אקורד מוצגים סולמות בשלוש רמות: בטוח, צבעוני ומחוץ לקופסה.",
        "מסתכלים על הקלידים או על צוואר הגיטרה כדי לראות אילו צלילים לנגן."
      ]
    },
    "tanpura-stage": {
      pro: "להופעה ולסדנה: מכינים מראש את הסא והשכבות, ובזמן אמת משנים רמה ואווירה. מתאים לליווי שירה, מדיטציה ואלתור מודאלי.",
      name: "במת הטנפורה",
      offer: "ליווי חי להופעה ולאלתור: טנפורה, פדים וביט, כולם באותו סולם.",
      steps: [
        "בוחרים את צליל הבסיס (סא) של השיר.",
        "לוחצים נגן ▶, ומדליקים או מכבים שכבות: טנפורה, פדים וביט.",
        "משנים אווירה תוך כדי נגינה בכפתורי הרמה ▲▼, בלי לצאת מהסולם.",
        "מכוונים עוצמה, בהירות וזמזום לפי החדר."
      ]
    },
    "fruty-beat": {
      pro: "לשיעור קצב לילדים ולמתחילים: כל פרי מייצג תבנית קצבית, כמו רבעים, שמיניות, שש־עשריות, טריולה ואנקרוזיס. מתאים לעבודה קבוצתית מול מסך.",
      name: "Beat It",
      offer: "משחק קצב שבו כל פרי הוא מקצב: כשאומרים את שמו, שומעים את הקצב שלו.",
      steps: [
        "גוררים פרי לאחת מארבע הפעמות, או מקישים על פרי ואז על פעמה.",
        "ממלאים את התיבה, לוחצים נגן ▶ ואומרים את שמות הפירות בקצב.",
        "מנסים צליל אחר (תופים, ויברפון, אקורדיון), טמפו אחר או שתי תיבות.",
        "משתפים את הביט בקישור, או מורידים אותו כקובץ."
      ]
    },
    "emotion-toolbox": {
      pro: "הכניסה בקוד מיועדת לצוות מטפלים. כל כלי בערכה עומד בפני עצמו, ואפשר לשלב כמה כלים באותה פגישה.",
      name: "ערכת כלים לעיבוד רגשי",
      offer: "שער אחד לכל משחקי העיבוד הרגשי, לעבודה טיפולית ולהתבוננות אישית.",
      steps: [
        "מקלידים את קוד הכניסה שקיבלתם ממני.",
        "קוראים על הכלים ובוחרים אחד שמתאים לכם עכשיו.",
        "פותחים אותו ומנסים. בכרטיס של כל כלי אפשר לכתוב לי הערה."
      ]
    },
    "mah-korgesh": {
      pro: "מבוסס על מודל CBT (אירוע, פרשנות, רגש, תוצאה). בפגישה המטופל בונה את השרשרת, והמטפל מנחה את תחנת המחשבה החלופית. אפשר להוסיף קלפים אישיים.",
      name: "מה קו-רגש?",
      offer: "משחק קלפים שמפרק אירוע לשרשרת: אירוע, מחשבה, רגש ותוצאה, ומזמין לבחור מחשבה אחרת.",
      steps: [
        "בשורה העליונה בוחרים קלפים למה שקרה באמת: האירוע, המחשבה האוטומטית, הרגשות ומה עשיתם.",
        "עוצרים בתחנת המחשבה ושואלים: איזו מחשבה אחרת אפשרית?",
        "בשורה התחתונה בונים את המציאות שבוחרים: מחשבה חלופית, רגש חדש ותוצאה רצויה.",
        "יוצרים כרטיס מציאות חדשה, ושומרים או משתפים אותו."
      ]
    },
    "qualitystars": {
      pro: "מתאים לעבודה בתוך פגישה או בין פגישות: איכות כמשאב, תרגול גופני קצר ושאלות רפלקטיביות. אפשר לערוך חדרים ולהוסיף איכויות שמתאימות למטופל.",
      name: "גלקסיית האיכויות",
      offer: "גלקסיה של חדרים, ובכל חדר איכות אחת כמו רוך, אמון או קבלה. דרכה מסתכלים מחדש על אירוע שהפעיל אתכם.",
      steps: [
        "נכנסים לגלקסיה ובוחרים חדר של איכות.",
        "כותבים בקצרה מה קרה, ובוחרים את הרגשות שהאירוע עורר.",
        "עושים תרגול קצר בגוף ועונים על שאלות למחשבה.",
        "שומרים את הסיכום ביומן, או שולחים אותו בוואטסאפ."
      ]
    },
    "emotion-combo": {
      pro: "מתאים לשלב הזיהוי והשיום של רגשות, במיוחד כשהרגשות מעורבים. הסיכום משמש בסיס לשיחה או ליומן רגשי בין הפגישות.",
      name: "קומבינציית רגשות",
      offer: "מרכיבים מקלפים את התמונה הרגשית של הרגע: מה מרגישים, ומה עוד מתערבב בזה.",
      steps: [
        "עוברים על משפחות הרגשות שבתחתית הדף.",
        "גוררים לשורה \"הרגשתי…\" את הרגשות הכי נוכחים, ואפשר להוסיף \"אבל גם הרגשתי…\".",
        "רגש שלא רלוונטי עכשיו? לוחצים − והוא מתעמעם.",
        "לוחצים \"סיכום לשיתוף\" ושומרים או שולחים."
      ]
    },
    "values-galaxy": {
      pro: "כלי חוויתי לפתיחת שיחה על ערכים, אי־ודאות וצמיחה. מתאים לפתיחת מפגש או לעבודה עצמאית בין פגישות.",
      name: "מפת התובנות",
      offer: "מסע תלת־ממדי בין כוכבים, שבכל אחד מהם מחכה ערך או תובנה.",
      steps: [
        "לוחצים \"מסכים/ה לצעוד אל הלא־נודע\".",
        "לוחצים על צומת מואר כדי לנוע אליו, וגוררים כדי להביט סביב.",
        "בכל צומת מתגלה ערך עם משפט למחשבה.",
        "בסוף כותבים מה כל ערך פותח בכם, ויוצרים תמונה לשיתוף."
      ]
    },
    "oganim": {
      pro: "מתאים להפנמת משפט מפתח שעלה בטיפול: יוצרים חידה עם המשפט, ושולחים אותה למטופל בקישור. השאלה למחשבה ממשיכה את העבודה בבית.",
      name: "עוגנים",
      offer: "פאזל אותיות שבו מרכיבים משפט מפתח מחזק, ומקבלים שאלה למחשבה בסוף.",
      steps: [
        "בוחרים חידה מהרשימה.",
        "גוררים את האותיות, או מקישים עליהן, כדי להחזיר את המשפט למקומו.",
        "נתקעתם? לוחצים רמז, ואות נוספת נופלת למקומה.",
        "אפשר גם ליצור חידה משלכם ולשלוח אותה בקישור."
      ]
    },
    "chakra-compass": {
      pro: "בנוסף לשבע הצ'אקרות יש תחנות של מקלעת הלב, שני חצאי המוח והאיצטרובל. מתאים לבניית מסלול קשב סביב נושא שהמטופל מביא.",
      name: "נתיב האור",
      offer: "מסע תלת־ממדי בין מרכזי האנרגיה בגוף, שבסופו נבנה מסע אנרגטי אישי סביב נושא שמעסיק אתכם.",
      steps: [
        "כותבים נושא שאתם חוקרים, או מתחילים בלי נושא.",
        "יוצאים למסע מודרך, או מסובבים את הדמות ומקישים על נקודת אור.",
        "בכל תחנה מסמנים את האיכויות שמדברות אליכם.",
        "בסוף כותבים משפט לכל איכות, ושומרים או משתפים את המסע."
      ]
    },
    "maagal-hagashama": {
      pro: "ארבע המשבצות הן שלבי עבודה: זיהוי, פיענוח, הכלה רגשית ופעולה מעשית. מתאים להובלת מטופל משלב לשלב בתוך פגישה.",
      name: "מעגל הגשמה",
      offer: "משחק קלפים להתבוננות עצמית: ארבע משבצות וארבעים קלפים, שמובילים ממה שעל פני השטח אל מה שמתחתיו.",
      steps: [
        "לוחצים \"התחל\" ובוחרים משבצת: זיהוי, פיענוח, הכלה או פעולה.",
        "לוחצים על קלף הפוך מהמגש, והוא מתגלה במשבצת.",
        "מוסיפים קלף הרחבה בכפתור + ומעמיקים בכל משבצת."
      ]
    },
    "meeting-sync": {
      pro: "למטפלים ולמנחים: יוצרים לוח חדש לכל קבוצה ושולחים קישור. אין הרשמה, ואפשר לשנות את מספר המשתתפים.",
      name: "מתאם הזמנים",
      offer: "לוח זמינות שבועי משותף: כל אחד מסמן מתי הוא פנוי, ורואים מיד מתי כולם יכולים.",
      steps: [
        "כותבים את השם ולוחצים \"הצטרפות\". אין צורך בהרשמה.",
        "מסמנים בלוח את השעות שבהן אתם פנויים.",
        "בלשונית \"חפיפה\" רואים מתי כולם יכולים להיפגש.",
        "שולחים את הקישור לשאר המשתתפים."
      ]
    },
    "grapholog": {
      pro: "גרפולוגיה היא שיטה פרשנית, לא כלי אבחוני. מתאים כפתח לשיחה על דימוי עצמי, עם שאלות הרפלקציה כבסיס.",
      name: "הגרפולוג",
      offer: "כותבים דף ביד, מצלמים, ומקבלים קריאה של הכתב והאישיות ונקודות למחשבה.",
      steps: [
        "כותבים דף אחד לפי ההנחיות, על דף לבן חלק.",
        "מצלמים ומעלים את הצילום.",
        "מקבלים ניתוח: תכונות הכתב, דיוקן אישיות ושאלות למחשבה.",
        "אפשר לבקש הכוונה בנושא שמעסיק אתכם, ולייצא סיכום."
      ]
    },
    "numerology": {
      pro: "הניתוח מציג את שתי השיטות להשוואה. מתאים כפתח לשיחה ולהתבוננות, לא כאבחון.",
      name: "מפת המספרים",
      offer: "ניתוח נומרולוגי לפי תאריך הלידה והשם, בגימטריה עברית ובשיטה הפיתגוראית.",
      steps: [
        "כותבים שם מלא מהלידה ותאריך לידה.",
        "בוחרים שיטת חישוב ומיקוד, למשל אהבה, קריירה או שפע.",
        "לוחצים \"נתחו\" וקוראים את המפה. אפשר להוסיף בן או בת זוג להתאמה.",
        "משתפים או שומרים את הניתוח."
      ]
    },
    "shminiot": {
      pro: "למנחים: אחורי הקלעים (מקש M) מציגים תזמון, רציונל ומיקוד לכל תחנה. מומלץ לעבור על המפגש מראש.",
      name: "סדנת השמיניות",
      offer: "שלד מפגשים להנחיית מעגל: לכל מפגש נושא, טקסטים, שירים, קלפים ושאלות לשיחה.",
      steps: [
        "בוחרים את המפגש של היום.",
        "עוברים בין התחנות בפרח לפי הסדר, ומקרינים לקבוצה.",
        "בתוך כל תחנה פותחים שירים, קלפים ושאלות לדיון.",
        "מקש M פותח את אחורי הקלעים, עם הערות למנחה."
      ]
    }
  };

  /* מצב בעלים: פותחים פעם אחת כל כלי עם ?owner=on (ומבטלים עם ?owner=off).
   * נשמר בדפדפן לכל הכלים באתר: בלי כרטיס פתיחה, בלי תג, ורמת "איש מקצוע" כברירת מחדל. */
  var OWNER_KEY = "bb-owner";
  try {
    var om = new URLSearchParams(location.search).get("owner");
    if (om === "on") localStorage.setItem(OWNER_KEY, "1");
    if (om === "off") localStorage.removeItem(OWNER_KEY);
  } catch (e) {}
  var owner = false;
  try { owner = localStorage.getItem(OWNER_KEY) === "1"; } catch (e) {}
  window.BBOwner = owner;

  var me = document.currentScript;
  var tool = (me && me.getAttribute("data-tool")) || location.pathname.split("/")[1] || "tool";
  var pos = (me && me.getAttribute("data-pos")) || "edge";
  var status = STATUS[tool] || STATUS._default;
  if (owner) {
    var setOwnerLevel = function () {
      var lv = "pro";
      try { lv = sessionStorage.getItem("tool-level:" + tool) || localStorage.getItem("tool-level:" + tool) || "pro"; } catch (e) {}
      document.documentElement.setAttribute("data-user-level", lv);
      window.ToolLevel = { get: function () { return lv; }, set: function (v) {
        lv = v; document.documentElement.setAttribute("data-user-level", v);
        try { localStorage.setItem("tool-level:" + tool, v); window.dispatchEvent(new CustomEvent("toollevel", { detail: { level: v } })); } catch (e) {}
      } };
    };
    setOwnerLevel();
    return;
  }
  if (status === "off") return;
  var stage = STAGE[status] || STAGE.dev;
  var guide = GUIDES[tool];
  if (!guide && !stage.lines.length) return;

  var KEY = "welcome-seen:v2:" + tool + ":" + status;
  var seen = false;
  try { seen = localStorage.getItem(KEY) === "1"; } catch (e) {}

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function start() {
    var host = document.createElement("div");
    host.setAttribute("data-dev-note", "");
    host.style.cssText = "position:fixed;z-index:2147483000;inset:auto auto 0 0;pointer-events:none";
    document.body.appendChild(host);
    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

    var style = document.createElement("style");
    style.textContent =
      "*{box-sizing:border-box;font-family:'Assistant','Rubik','Heebo',system-ui,'Segoe UI',Arial,sans-serif}" +
      ".pill{pointer-events:auto;position:fixed;left:max(12px,env(safe-area-inset-left,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));" +
      "direction:rtl;display:inline-flex;align-items:center;gap:7px;border:0;cursor:pointer;border-radius:999px;padding:7px 13px 7px 12px;" +
      "font-size:13px;font-weight:600;line-height:1;color:#1d2a24;background:rgba(255,248,232,.94);box-shadow:0 4px 14px rgba(0,0,0,.22),0 0 0 1px rgba(0,0,0,.06);opacity:.9}" +
      ".pill:hover,.pill:focus-visible{opacity:1}" +
      /* תג מכווץ: עיגול קטן בצד, כדי לא להסתיר כפתורים של הכלי */
      ".pill.mini{padding:0;width:30px;height:30px;justify-content:center;gap:0;opacity:.75}" +
      ".pill.mini .lbl{display:none}" +
      ".pill.mini.edge{bottom:auto;top:50%;transform:translateY(-50%);left:max(6px,env(safe-area-inset-left,0px))}" +
      ".pill.mini.top-left{bottom:auto;top:calc(12px + env(safe-area-inset-top,0px))}" +
      ".pill.mini.top-right,.pill.bottom-right{left:auto;right:max(12px,env(safe-area-inset-right,0px))}" +
      ".pill.mini.top-right{bottom:auto;top:calc(12px + env(safe-area-inset-top,0px))}" +
      ".pill:focus-visible,.ok:focus-visible,.x:focus-visible{outline:3px solid #d98a1f;outline-offset:2px}" +
      ".dot{width:8px;height:8px;border-radius:50%;background:#e0a21c;box-shadow:0 0 6px #e0a21c;flex:none}" +
      ".q{width:16px;height:16px;border-radius:50%;background:#1d2a24;color:#fff8e8;display:grid;place-items:center;font-size:11px;font-weight:700;flex:none}" +
      ".back{pointer-events:auto;position:fixed;inset:0;background:rgba(10,14,20,.55);display:flex;align-items:center;justify-content:center;padding:16px}" +
      ".card{direction:rtl;text-align:right;position:relative;width:min(460px,100%);max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);overflow:auto;background:#fffaf0;color:#1d2a24;border-radius:18px;padding:24px 22px 20px;" +
      "box-shadow:0 24px 60px rgba(0,0,0,.35);display:grid;gap:12px}" +
      ".tag{justify-self:start;display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;color:#8a5a12;background:#f6e6c4;border-radius:999px;padding:4px 11px}" +
      "h2{margin:0;font-size:24px;line-height:1.2;font-weight:700}" +
      "p{margin:0;font-size:16px;line-height:1.55}" +
      ".offer{font-size:16.5px}" +
      ".howt{font-size:13px;font-weight:700;letter-spacing:.04em;color:#5d6a64;margin-top:2px}" +
      "ol{margin:0;padding:0;list-style:none;display:grid;gap:8px;counter-reset:s}" +
      "li{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:start;font-size:15.5px;line-height:1.5}" +
      "li::before{counter-increment:s;content:counter(s);width:24px;height:24px;border-radius:50%;background:#1d2a24;color:#fffaf0;display:grid;place-items:center;font-size:13px;font-weight:700;margin-top:1px}" +
      ".seg{display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#efe7d6;border-radius:12px;padding:4px}" +
      ".seg button{border:0;border-radius:9px;padding:9px 8px;font-size:14px;font-weight:600;cursor:pointer;background:transparent;color:#5d6a64;line-height:1.25}" +
      ".seg button.on{background:#fffaf0;color:#1d2a24;box-shadow:0 1px 4px rgba(0,0,0,.12)}" +
      ".seg button:focus-visible{outline:3px solid #d98a1f;outline-offset:1px}" +
      ".probox{background:#eef4ef;border-inline-start:3px solid #2f7d55;border-radius:8px;padding:10px 12px;font-size:15px}" +
      ".probox[hidden]{display:none}" +
      ".dev{background:#f1ebdc;border-radius:12px;padding:12px 14px;display:grid;gap:6px}" +
      ".dev p{font-size:14.5px;line-height:1.5}" +
      ".sign{font-size:14px;font-weight:700;color:#5d6a64}" +
      ".ok{justify-self:start;margin-top:2px;border:0;cursor:pointer;border-radius:999px;padding:10px 22px;font-size:16px;font-weight:700;color:#fffaf0;background:#1d2a24}" +
      ".x{position:absolute;top:10px;left:10px;border:0;background:none;cursor:pointer;font-size:22px;line-height:1;color:#5d6a64;padding:6px;border-radius:8px}" +
      "@media (prefers-color-scheme:dark){.card{background:#1f2724;color:#ece6d8}.dev{background:#2a3330}.howt,.sign,.x{color:#a9b4ae}.tag{background:#3a3220;color:#f0c068}" +
      ".ok,li::before{background:#ece6d8;color:#1f2724}.seg{background:#2a3330}.seg button{color:#a9b4ae}.seg button.on{background:#1f2724;color:#ece6d8}.probox{background:#24312a}}" +
      "@media (prefers-reduced-motion:no-preference){.card{animation:in .25s ease-out}@keyframes in{from{transform:translateY(8px);opacity:0}}}";
    root.appendChild(style);

    var pill = el("button", "pill");
    pill.type = "button";
    pill.appendChild(el("span", "q", "?"));
    pill.appendChild(el("span", "lbl", guide ? stage.pill : "בפיתוח · אשמח להערות"));
    pill.setAttribute("aria-label", guide ? stage.pill : "פתיחת הסבר על הכלי");
    pill.title = guide ? stage.pill : "בפיתוח · אשמח להערות";
    pill.classList.add(pos);
    function shrink() { pill.classList.add("mini"); }
    if (seen) shrink();
    root.appendChild(pill);

    // רמת השימוש לכניסה הנוכחית: נשמרת לסשן, וברירת המחדל היא הבחירה הקודמת
    var LKEY = "tool-level:" + tool, level = "basic";
    try { level = sessionStorage.getItem(LKEY) || localStorage.getItem(LKEY) || "basic"; } catch (e) {}
    function setLevel(v) {
      level = v;
      try { sessionStorage.setItem(LKEY, v); localStorage.setItem(LKEY, v); } catch (e) {}
      document.documentElement.setAttribute("data-user-level", v);
      try { window.dispatchEvent(new CustomEvent("toollevel", { detail: { level: v } })); } catch (e) {}
    }
    document.documentElement.setAttribute("data-user-level", level);
    window.ToolLevel = { get: function () { return level; }, set: setLevel };

    var back = null;
    function close() {
      if (!back) return;
      back.remove(); back = null;
      try { localStorage.setItem(KEY, "1"); } catch (e) {}
      shrink();
      pill.focus({ preventScroll: true });
    }
    function open() {
      if (back) return;
      back = el("div", "back");
      var card = el("div", "card");
      card.setAttribute("role", "dialog");
      card.setAttribute("aria-modal", "true");
      card.setAttribute("aria-labelledby", "dn-title");
      var x = el("button", "x", "×"); x.type = "button"; x.setAttribute("aria-label", "סגירה");
      card.appendChild(x);
      if (stage.tag) { var tg = el("span", "tag"); tg.appendChild(el("span", "dot")); tg.appendChild(el("span", "", stage.tag)); card.appendChild(tg); }
      if (guide) card.appendChild(el("div", "howt", "ברוכים הבאים"));
      var h = el("h2", "", guide ? guide.name : "תודה שבאת לנסות");
      h.id = "dn-title"; card.appendChild(h);
      if (guide) {
        card.appendChild(el("p", "offer", guide.offer));
        if (guide.pro) {
          card.appendChild(el("div", "howt", "באיזו רמה נכנסים הפעם?"));
          var seg = el("div", "seg"); seg.setAttribute("role", "radiogroup"); seg.setAttribute("aria-label", "רמת שימוש");
          var proBox = el("p", "probox", guide.pro);
          [["basic", "בפעם הראשונה / לשימוש אישי"], ["pro", "איש/אשת מקצוע"]].forEach(function (o) {
            var b = el("button", "", o[1]); b.type = "button"; b.setAttribute("role", "radio");
            function sync() { var on = level === o[0]; b.setAttribute("aria-checked", on); b.classList.toggle("on", on); }
            b.addEventListener("click", function () { setLevel(o[0]); [].forEach.call(seg.children, function (c) { c._sync(); }); proBox.hidden = level !== "pro"; });
            b._sync = sync; sync(); seg.appendChild(b);
          });
          card.appendChild(seg);
          proBox.hidden = level !== "pro";
          card.appendChild(proBox);
        }
        card.appendChild(el("div", "howt", "איך משתמשים"));
        var ol = el("ol");
        guide.steps.forEach(function (s) { ol.appendChild(el("li", "", s)); });
        card.appendChild(ol);
      }
      if (stage.lines.length) {
        var dev = el("div", "dev");
        stage.lines.forEach(function (s) { dev.appendChild(el("p", "", s)); });
        dev.appendChild(el("p", "sign", "— בועז ברקת"));
        card.appendChild(dev);
      }
      var ok = el("button", "ok", "בואו נתחיל"); ok.type = "button";
      card.appendChild(ok);
      back.appendChild(card);
      root.appendChild(back);
      back.addEventListener("click", function (e) { if (e.target === back) close(); });
      x.addEventListener("click", close);
      ok.addEventListener("click", close);
      card.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
      ok.focus({ preventScroll: true });
    }
    pill.addEventListener("click", open);
    if (!seen) setTimeout(open, 700);
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start);
})();
