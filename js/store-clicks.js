/* SPENT: at most one outbound click per store per browser in 24 hours. */
(function () {
  "use strict";
  var endpoint = "https://zufkxkcsazkxxavnpdms.supabase.co/functions/v1/website-store-click";
  var storagePrefix = "spent:store-clicks:";
  var optOutKey = storagePrefix + "opt-out";
  var cooldownMs = 24 * 60 * 60 * 1000;
  var params = new URLSearchParams(location.search);

  try {
    var preference = params.get("spent_analytics");
    if (preference === "off") localStorage.setItem(optOutKey, "1");
    if (preference === "on") localStorage.removeItem(optOutKey);
  } catch (_) { /* Browsers that block storage are excluded from counting. */ }

  function reserveClick(store) {
    var key = storagePrefix + store;
    var now = Date.now();
    try {
      if (localStorage.getItem(optOutKey) === "1" || params.get("spent_analytics") === "off") return null;
      var previous = Number(localStorage.getItem(key));
      if (previous > 0 && previous <= now && now - previous < cooldownMs) return null;
      var value = String(now);
      localStorage.setItem(key, value);
      return function release() {
        try {
          if (localStorage.getItem(key) === value) localStorage.removeItem(key);
        } catch (_) { /* Analytics must never interfere with navigation. */ }
      };
    } catch (_) {
      return null;
    }
  }

  function safeCampaign(value) {
    return value && /^[a-zA-Z0-9_-]{1,80}$/.test(value) ? value : null;
  }
  function storeFor(link) {
    var url;
    try { url = new URL(link.href, location.href); } catch (_) { return null; }
    if (url.hostname === "apps.apple.com" && /\/app\/.*id6809588178(?:\/|$)/.test(url.pathname)) return "apple";
    if (url.hostname === "play.google.com" && url.pathname === "/store/apps/details" &&
        url.searchParams.get("id") === "com.biniwis.spent") return "google";
    return null;
  }
  function recordClick(event) {
    var element = event.target;
    if (!element || typeof element.closest !== "function") return;
    var link = element.closest("a[href]");
    if (!link) return;
    var store = storeFor(link);
    if (!store) return;
    var release = reserveClick(store);
    if (!release) return;
    var body = JSON.stringify({
      store: store,
      page_path: location.pathname,
      utm_source: safeCampaign(params.get("utm_source")),
      utm_campaign: safeCampaign(params.get("utm_campaign"))
    });
    var blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
    // No preventDefault: the user opens the store normally, without a redirect or delay.
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(endpoint, blob)) return;
    } catch (_) { /* Try fetch if the browser rejects a beacon. */ }
    try {
      fetch(endpoint, { method: "POST", mode: "cors", credentials: "omit",
        body: blob, keepalive: true }).then(function (response) {
        if (!response.ok) release();
      }, release);
    } catch (_) {
      release();
    }
  }
  document.addEventListener("click", recordClick, true);
  document.addEventListener("auxclick", function (event) {
    if (event.button === 1) recordClick(event);
  }, true);
}());
