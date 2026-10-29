(() => {
  const english = !navigator.language.toLowerCase().startsWith('he');
  const put = (id, value) => { document.getElementById(id).textContent = value; };
  if (english) {
    document.documentElement.lang = 'en'; document.documentElement.dir = 'ltr';
    document.title = 'An invitation to SPENT';
    put('title', "You're invited to SPENT");
    put('description', 'Joining helps the person who invited you unlock a new world.');
    ['Install SPENT.', 'Return to the message and reopen the invitation link.',
      'Choose “Open SPENT”. No sign-in or friend request needed.'].forEach((text, i) => {
        document.querySelectorAll('#steps li')[i].textContent = text;
      });
    put('download', 'Get SPENT on the App Store');
    put('open', 'Already installed — Open SPENT');
    put('note', 'Each new installation counts once. Clicking or downloading alone does not earn a reward.');
  }
  const parts = new URLSearchParams(location.hash.slice(1));
  const entries = [...parts.entries()];
  const code = parts.get('ref');
  const action = parts.get('action');
  const gift = ['gift', 'request'].includes(action) && parts.get('map') === 'arctic';
  const valid = !location.search && new Set(entries.map(([key]) => key)).size === entries.length &&
    /^[0-9a-f]{32}$/.test(code || '') &&
    ((entries.length === 1 && entries[0][0] === 'ref') || (entries.length === 3 && gift));
  if (!valid) {
    put('title', english ? 'Invitation unavailable' : 'ההזמנה אינה זמינה');
    put('description', english ? 'Ask the sender for a new invitation link.' : 'בקשו ממי שהזמין אתכם לשלוח קישור חדש.');
    document.getElementById('steps').hidden = true;
    document.getElementById('note').hidden = true;
    return;
  }
  if (/Android/i.test(navigator.userAgent)) {
    const dl = document.getElementById('download');
    dl.href = 'https://play.google.com/store/apps/details?id=com.biniwis.spent';
    dl.textContent = english ? 'Get SPENT on Google Play' : 'להורדה ב־Google Play';
  }
  const open = document.getElementById('open');
  open.href = 'spentapp://referral?ref=' + code + (gift ? '&action=' + action + '&map=arctic' : '');
  if (gift) {
    document.title = english ? 'An Arctic world gift' : 'מפת הקרח במתנה';
    put('title', action === 'request'
      ? (english ? 'Send a friend the Arctic world' : 'שלחו לחבר את מפת הקרח')
      : (english ? 'An Arctic world gift for you' : 'מפת הקרח במתנה בשבילכם'));
    put('description', action === 'request'
      ? (english ? 'Open SPENT and confirm the gift. You can send it even while yours is locked.' : 'פתחו את SPENT ואשרו שליחת מתנה. אפשר לשלוח גם כשהמפה שלכם נעולה.')
      : (english ? 'Open this link in SPENT to receive your world.' : 'פתחו את הקישור ב־SPENT כדי לקבל את המפה.'));
    document.querySelectorAll('#steps li')[2].textContent = english
      ? 'Choose “Open SPENT”. Update the app first if gifts are not available.'
      : 'בוחרים ״פתיחה ב־SPENT״. אם המתנות לא מופיעות, עדכנו קודם את האפליקציה.';
    put('note', english ? 'After installing, return to this link. Gifts are saved on this device.' : 'אחרי ההתקנה חוזרים לקישור הזה. המתנה נשמרת במכשיר הזה.');
  }
  open.hidden = false;
})();
