/* SPENT: anonymous outbound app-store click counts (no cookies or user IDs). */
(function () {
  "use strict";
  var endpoint = "https://zufkxkcsazkxxavnpdms.supabase.co/functions/v1/website-store-click";
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
    var params = new URLSearchParams(location.search);
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
      fetch(endpoint, { method: "POST", mode: "cors", credentials: "omit",
        body: blob, keepalive: true }).catch(function () {});
    } catch (_) { /* Analytics must never interfere with navigation. */ }
  }
  document.addEventListener("click", recordClick, true);
  document.addEventListener("auxclick", function (event) {
    if (event.button === 1) recordClick(event);
  }, true);
}());
