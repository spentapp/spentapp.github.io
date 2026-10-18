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
  const valid = !location.search && entries.length === 1 && entries[0][0] === 'ref' && /^[0-9a-f]{32}$/.test(code || '');
  if (!valid) {
    put('title', english ? 'Invitation unavailable' : 'ההזמנה אינה זמינה');
    put('description', english ? 'Ask the sender for a new invitation link.' : 'בקשו ממי שהזמין אתכם לשלוח קישור חדש.');
    document.getElementById('steps').hidden = true;
    document.getElementById('note').hidden = true;
    return;
  }
  const open = document.getElementById('open');
  open.href = 'spentapp://referral?ref=' + code;
  open.hidden = false;
})();
