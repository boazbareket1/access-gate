# Access Gate

תוסף גישה בתשלום לכלים של בועז ברקת: תקופת ניסיון, התחברות, רכישת גישה לתקופה, הגבלת מכשירים ותזכורות. קובץ JavaScript אחד שמחברים לכל כלי.

**גרסה 0.1.0, שלב 1:** ההתחברות, השרת והסליקה **מדומים** בתוך הדפדפן. אין חיוב ואין התחברות אמיתית. ההחלפה ל־Supabase ולספק סליקה אמיתי תיעשה בתוך `gate.js`, בלי לשנות את הכלים.

## חיבור לכלי

מוסיפים לפני `</body>`:

```html
<script src="https://boazbareket1.github.io/access-gate/gate.js"></script>
<script>
  AccessGate.init({
    toolId: 'fill-drill',              // מזהה קבוע ייחודי לכלי (באנגלית, בלי רווחים)
    toolName: 'Fill Drill',            // השם שמוצג למשתמש
    trialDays: 7,                      // ימי ניסיון (0 = בלי ניסיון)
    maxDevices: 2,                     // מכשירים פעילים במקביל
    features: ['כל ספריית המעברים', 'שמירת תרגולים אישיים'],
    plans: [
      { id: '1m',  label: 'חודש',     months: 1,  price: 29, sub: 'לטעום ברצינות' },
      { id: '3m',  label: '3 חודשים', months: 3,  price: 69, sub: 'המשתלם ביותר', best: true },
      { id: '12m', label: 'שנה',      months: 12, price: 199, sub: 'לשימוש קבוע' }
    ]
  });
</script>
```

ולפני כל פעולה שדורשת גישה מלאה:

```js
if (!AccessGate.require('ספריית המעברים המלאה')) return;  // פותח את חלון הרכישה ועוצר
```

## הגדרות נוספות (כולן אופציונליות)

| הגדרה | ברירת מחדל | מה עושה |
|---|---|---|
| `theme` | `'dark'` | `'light'` לכלים עם רקע בהיר |
| `accent` / `onAccent` | כתום / כהה | צבע הכפתורים וצבע הטקסט עליהם |
| `badge` | `'top-left'` | מיקום התג (`top-right`, `bottom-left`, `bottom-right`, `'none'`) |
| `trialStart` | `'open'` | `'manual'` = הניסיון מתחיל רק כשהכלי קורא `AccessGate.beginTrial()` |
| `freeNote` | "החלקים הבסיסיים נשארים פתוחים." | הטקסט שמופיע כשהניסיון או הגישה מסתיימים |
| `currency` | `'₪'` | סימן המטבע |
| `provider` | `'[ספק הסליקה]'` | שם ספק הסליקה שמוצג למשתמש |
| `trialReminderDays` | `2` | כמה ימים לפני סוף הניסיון להציג תזכורת |
| `expiryReminderDays` | `7` | כמה ימים לפני סוף הגישה להציג תזכורת |
| `debug` | `false` | לוח בדיקה. אפשר גם להוסיף `?gate-debug` לכתובת |

## API

- `AccessGate.status()` מחזיר `{ state, hasAccess, daysLeft, until, user }`. `state` הוא אחד מ־`trial`, `active`, `trial-ended`, `expired`, `free`.
- `AccessGate.hasAccess()` מחזיר `true` בניסיון או בגישה בתוקף.
- `AccessGate.require(reason)` מחזיר `true` אם יש גישה, ואחרת פותח את חלון הרכישה.
- `AccessGate.onChange(cb)` נקרא בכל שינוי מצב. נשלח גם אירוע `accessgate:change` על `window`.
- `AccessGate.open('plans' | 'account')` פותח מסך ידנית.

## בדיקה

`index.html` הוא דף הדגמה עם לוח בדיקה: הזזת זמן קדימה, סימולציה של התחברות ממכשיר אחר, ואיפוס.

## הוראות ל־Claude: חיבור התוסף לכלי חדש

1. להוסיף את שתי תגי ה־script לפני `</body>`, עם `toolId` חדש וייחודי.
2. לזהות בכלי מה נשאר חינמי ומה דורש גישה, ולשאול את בועז אם זה לא ברור.
3. לעטוף כל פעולה בתשלום ב־`if (!AccessGate.require('…')) return;`.
4. אם יש בכלי ממשק שמסמן תוכן נעול, לעדכן אותו דרך `AccessGate.onChange`.
5. להתאים `theme` ו־`accent` לעיצוב הכלי, ואת מיקום התג כך שלא יסתיר כפתורים.
6. לא לשנות את `gate.js` בשביל כלי בודד. התאמות נעשות רק דרך ההגדרות.
