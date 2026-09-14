(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Reveal on scroll ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showAll() {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  }

  if (reduced || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });

    /* Safety net: never leave content hidden */
    setTimeout(showAll, 2500);
  }

  /* ---------- Sticky CTA (mobile): visible when no other CTA is on screen ---------- */
  var sticky = document.querySelector("[data-sticky-cta]");
  var mainCtas = document.querySelectorAll(".cta-wrap .cta, .final .cta");

  if (sticky && mainCtas.length && "IntersectionObserver" in window) {
    var stickyLink = sticky.querySelector("a");
    var visibleCtas = new Set();
    var heroPassed = false;

    function updateSticky() {
      var show = heroPassed && visibleCtas.size === 0;
      sticky.classList.toggle("is-shown", show);
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
      if (stickyLink) stickyLink.tabIndex = show ? 0 : -1;
    }

    var ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          visibleCtas.add(entry.target);
        } else {
          visibleCtas.delete(entry.target);
        }
        if (entry.target === mainCtas[0] && !entry.isIntersecting) {
          heroPassed = entry.boundingClientRect.top < 0;
        }
      });
      updateSticky();
    });

    Array.prototype.forEach.call(mainCtas, function (el) { ctaObserver.observe(el); });
    updateSticky();
  }
})();
