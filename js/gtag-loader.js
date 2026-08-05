// ==========================================================
// GOOGLE ANALYTICS 4 LOADER
// ==========================================================
// Khong sua file nay. De cau hinh Measurement ID, sua js/gtag-config.js
(function () {
  var id = window.GA_MEASUREMENT_ID;
  if (!id || id === "G-XXXXXXXXXX") return; // chua cau hinh ID that -> khong lam gi

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id);
})();
