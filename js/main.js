// VISA NHANH 24H — site interactions
document.addEventListener("DOMContentLoaded", function () {
  // Mobile nav toggle
  var navToggle = document.querySelector(".nav-toggle");
  var navMobile = document.querySelector(".nav-mobile");
  var navClose = document.querySelector(".nav-mobile-close");
  if (navToggle && navMobile) {
    navToggle.addEventListener("click", function () {
      navMobile.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  }
  if (navClose && navMobile) {
    navClose.addEventListener("click", function () {
      navMobile.classList.remove("open");
      document.body.style.overflow = "";
    });
  }
  navMobile && navMobile.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      navMobile.classList.remove("open");
      document.body.style.overflow = "";
    });
  });

  // Accordion (FAQ)
  document.querySelectorAll(".accordion-item").forEach(function (item) {
    var q = item.querySelector(".accordion-q");
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      item.parentElement.querySelectorAll(".accordion-item").forEach(function (i) {
        i.classList.remove("open");
      });
      if (!isOpen) item.classList.add("open");
    });
  });

  // Scroll reveal
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  // Contact form (demo submit handler — wire to real backend / Google Sheet / CRM before launch)
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var successBox = document.querySelector("#form-success");
      if (successBox) successBox.style.display = "block";
      form.reset();
      // Google Ads conversion event — replace AW-XXXXXXX/label with real IDs from Google Ads
      if (typeof gtag === "function") {
        gtag("event", "conversion", {
          send_to: "AW-XXXXXXXXX/xxxxxxxxxxxxxxxxx",
        });
      }
      form.querySelector("button[type=submit]") &&
        (form.querySelector("button[type=submit]").textContent = "Đã gửi — cảm ơn bạn!");
    });
  }

  // Track hotline / Zalo clicks as conversions (wire real Ads IDs before launch)
  document.querySelectorAll("a[href^='tel:'], a.js-zalo-click").forEach(function (el) {
    el.addEventListener("click", function () {
      if (typeof gtag === "function") {
        gtag("event", "conversion", {
          send_to: "AW-XXXXXXXXX/yyyyyyyyyyyyyyyyy",
        });
      }
    });
  });
});
