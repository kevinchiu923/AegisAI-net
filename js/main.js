(function () {
  var LS_KEY = "aegisai-lang";
  var originals = {};

  function applyLang(lang) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      // innerHTML, not textContent: copy in both languages carries inline emphasis
      // (<strong>, <em>) on the load-bearing phrases. With textContent the tags
      // rendered as literal text in Chinese, and — worse — switching to Chinese and
      // back stripped the emphasis out of the English permanently, because the
      // "original" had been cached as plain text. Both dictionaries are our own
      // static content; nothing user-supplied reaches here.
      if (!(key in originals)) originals[key] = el.innerHTML;
      if (lang === "zh" && window.AEGIS_I18N[key]) el.innerHTML = window.AEGIS_I18N[key];
      else el.innerHTML = originals[key];
    });
    document.querySelectorAll("[data-href-en]").forEach(function (el) {
      var h = lang === "zh" ? el.getAttribute("data-href-zh") : el.getAttribute("data-href-en");
      if (h) el.setAttribute("href", h);
    });
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    var t = document.getElementById("lang-toggle");
    if (t) t.textContent = lang === "zh" ? "EN" : "繁中";
    try { localStorage.setItem(LS_KEY, lang); } catch (e) {}
  }

  var saved = "en";
  try { saved = localStorage.getItem(LS_KEY) || "en"; } catch (e) {}
  document.addEventListener("DOMContentLoaded", function () {
    if (saved === "zh") applyLang("zh");
    var t = document.getElementById("lang-toggle");
    if (t) t.addEventListener("click", function () {
      applyLang(document.documentElement.lang === "en" ? "zh" : "en");
    });

    var srModal = document.getElementById("sample-modal");
    if (srModal) {
      var srFrame = document.getElementById("sample-modal-frame");
      var srClose = document.getElementById("sample-modal-close");
      var closeSR = function () {
        srModal.hidden = true;
        srFrame.src = "about:blank";
        document.body.classList.remove("modal-open");
      };
      srFrame.addEventListener("load", function () {
        try {
          srFrame.contentWindow.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !srModal.hidden) closeSR();
          });
        } catch (err) { /* cross-origin: parent-level Escape still works */ }
      });
      document.querySelectorAll("[data-frame-en]").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          var zh = document.documentElement.lang !== "en";
          srFrame.src = btn.getAttribute(zh ? "data-frame-zh" : "data-frame-en");
          srModal.hidden = false;
          document.body.classList.add("modal-open");
        });
      });
      srClose.addEventListener("click", closeSR);
      srModal.addEventListener("click", function (e) { if (e.target === srModal) closeSR(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !srModal.hidden) closeSR(); });
    }

    var mb = document.getElementById("menu-btn");
    var nav = document.querySelector(".nav");
    if (mb && nav) mb.addEventListener("click", function () { nav.classList.toggle("open"); });

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        if (e.target.hasAttribute("data-count")) countUp(e.target);
        if (e.target.classList.contains("needle-target")) {
          var n = e.target.querySelector(".needle");
          if (n) setTimeout(function () { n.style.left = n.getAttribute("data-to"); }, 200);
        }
        io.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    document.querySelectorAll(".reveal, [data-count], .needle-target").forEach(function (el) { io.observe(el); });

    function countUp(el) {
      var to = parseInt(el.getAttribute("data-count"), 10);
      if (reduced) { el.textContent = to.toLocaleString("en-US"); return; }
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / 1200, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var top = document.getElementById("to-top");
    if (top) {
      window.addEventListener("scroll", function () {
        top.classList.toggle("show", window.scrollY > window.innerHeight);
      }, { passive: true });
      top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); });
    }
  });
})();
