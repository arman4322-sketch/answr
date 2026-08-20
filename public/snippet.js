/* Answr referral snippet — drop one line on any site:
     <script defer src="https://answr-ruby.vercel.app/snippet.js"
             data-endpoint="https://answr-ruby.vercel.app/api/collect"></script>

   Reports first-touch referrer + utm_source so Answr can attribute visits that
   came from an AI assistant. No cookies, no fingerprinting, no personal data —
   just the referring hostname, the campaign tag, and the landing path.

   Crawler activity is NOT captured here: AI crawlers don't run JavaScript.
   That needs the server-side path (proxy/middleware package or a CDN log
   drain) — see INTEGRATIONS.md. */
(function () {
  try {
    var s = document.currentScript;
    var endpoint = (s && s.getAttribute("data-endpoint")) || "/api/collect";

    // First touch per tab only — avoids double-counting SPA navigations.
    var KEY = "answr:first-touch";
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, "1");

    var utm = "";
    try {
      utm = new URLSearchParams(location.search).get("utm_source") || "";
    } catch (e) {}

    var payload = JSON.stringify({
      referrer: document.referrer || "",
      utm: utm,
      path: location.pathname,
    });

    // sendBeacon survives the page unload that often follows a click-through.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
    } else {
      fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: payload, keepalive: true });
    }
  } catch (e) {
    /* never break the host page */
  }
})();
