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

  // Hero slider
  var slider = document.getElementById("heroSlider");
  if (slider) {
    var slides = slider.querySelectorAll(".hero-slide");
    var dots = slider.querySelectorAll(".slider-dots button");
    var current = 0;
    var timer;

    function goTo(index) {
      slides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("active");
      dots[current].classList.add("active");
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }
    function startAutoplay() { timer = setInterval(next, 6000); }
    function stopAutoplay() { clearInterval(timer); }

    var nextBtn = slider.querySelector(".slider-arrow.next");
    var prevBtn = slider.querySelector(".slider-arrow.prev");
    if (nextBtn) nextBtn.addEventListener("click", function () { next(); stopAutoplay(); startAutoplay(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); stopAutoplay(); startAutoplay(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { goTo(i); stopAutoplay(); startAutoplay(); });
    });
    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);
    startAutoplay();
  }

  // Contact form — gui that qua /api/contact.js (Resend), co xu ly thanh cong/that bai ro rang
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var successBox = document.querySelector("#form-success");
      var errorBox = document.querySelector("#form-error");
      var submitBtn = form.querySelector("button[type=submit]");
      var visaType = form.querySelector("#visa-type");
      var payload = {
        name: form.querySelector("#name") ? form.querySelector("#name").value : "",
        phone: form.querySelector("#phone") ? form.querySelector("#phone").value : "",
        "visa-type": visaType ? visaType.value : "",
        note: form.querySelector("#note") ? form.querySelector("#note").value : "",
      };

      if (errorBox) errorBox.style.display = "none";
      if (successBox) successBox.style.display = "none";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.dataset.originalText || submitBtn.textContent;
        submitBtn.textContent = "Đang gửi...";
      }

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Gui khong thanh cong");
          if (successBox) successBox.style.display = "block";
          // GA4 recommended event — hien trong bao cao Events/Conversions cua GA4 ngay ca khi chua noi Google Ads
          if (typeof gtag === "function") {
            gtag("event", "generate_lead", {
              form_id: "contact-form",
              visa_type: payload["visa-type"],
            });
            // Google Ads conversion event — replace AW-XXXXXXX/label with real IDs from Google Ads
            gtag("event", "conversion", {
              send_to: "AW-XXXXXXXXX/xxxxxxxxxxxxxxxxx",
            });
          }
          form.reset();
          if (submitBtn) submitBtn.textContent = "Đã gửi — cảm ơn bạn!";
        })
        .catch(function () {
          if (errorBox) errorBox.style.display = "block";
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText;
          }
        });
    });
  }

  // Track hotline / Zalo clicks as conversions (wire real Ads IDs before launch)
  document.querySelectorAll("a[href^='tel:'], a.js-zalo-click").forEach(function (el) {
    el.addEventListener("click", function () {
      if (typeof gtag === "function") {
        // GA4 event rieng cho tung kenh — de bao cao Events biet hotline hay Zalo hieu qua hon
        var isZalo = el.classList.contains("js-zalo-click");
        gtag("event", isZalo ? "contact_zalo_click" : "contact_hotline_click", {
          link_url: el.getAttribute("href"),
          page_path: window.location.pathname,
        });
        gtag("event", "conversion", {
          send_to: "AW-XXXXXXXXX/yyyyyyyyyyyyyyyyy",
        });
      }
    });
  });
});
