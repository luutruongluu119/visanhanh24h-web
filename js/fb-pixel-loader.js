// ==========================================================
// FACEBOOK PIXEL LOADER
// ==========================================================
// Khong sua file nay. De cau hinh Pixel ID, sua js/fb-pixel-config.js
(function () {
  var id = window.FB_PIXEL_ID;
  if (!id || id === "XXXXXXXXXXXXXXX") return; // chua cau hinh ID that -> khong lam gi

  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = true; n.version = "2.0";
    n.queue = [];
    t = b.createElement(e); t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  fbq("init", id);
  fbq("track", "PageView");
})();
