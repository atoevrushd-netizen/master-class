(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 860px)").matches ||
                 window.matchMedia("(pointer: coarse)").matches;

  /* ---------- SVG grid lines (drawn once, no per-line GSAP on mobile) ---------- */
  function drawGridLines() {
    var svg = document.querySelector(".grid-lines");
    if (!svg) return;
    var ns = "http://www.w3.org/2000/svg";
    var w = window.innerWidth;
    var h = window.innerHeight;
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    while (svg.lastChild && svg.lastChild.nodeName === "line") {
      svg.removeChild(svg.lastChild);
    }
    var count = isMobile ? 0 : Math.min(18, Math.floor(w / 90) + 4);
    var step = w / (count || 1);
    for (var i = 0; i <= count; i++) {
      var line = document.createElementNS(ns, "line");
      var x = Math.round(i * step) + 0.5;
      line.setAttribute("x1", x);
      line.setAttribute("y1", 0);
      line.setAttribute("x2", x);
      line.setAttribute("y2", h);
      line.setAttribute("stroke", "url(#lineGrad)");
      line.setAttribute("stroke-width", "1");
      line.setAttribute("opacity", "0.22");
      svg.appendChild(line);
    }
  }

  drawGridLines();
  var gridT;
  window.addEventListener("resize", function () {
    clearTimeout(gridT);
    gridT = setTimeout(function () {
      isMobile = window.matchMedia("(max-width: 860px)").matches ||
                 window.matchMedia("(pointer: coarse)").matches;
      drawGridLines();
    }, 150);
  }, { passive: true });

  /* ---------- No GSAP — show elements immediately ---------- */
  if (reduced || typeof gsap === "undefined") {
    document.querySelectorAll("[data-anim]").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var ease = "power4.out";
  var easeSoft = "power3.out";

  /* ---------- Background animations — desktop only ---------- */
  if (!isMobile) {
    gsap.fromTo(".orb--1",
      { x: 0, y: 0, scale: 1 },
      { x: 40, y: 30, scale: 1.08, duration: 22, repeat: -1, yoyo: true, ease: "sine.inOut" }
    );
    gsap.fromTo(".orb--2",
      { x: 0, y: 0, scale: 1 },
      { x: -35, y: -25, scale: 1.06, duration: 26, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 }
    );
    gsap.fromTo(".orb--3",
      { x: 0, y: 0, opacity: 0.45 },
      { x: 25, y: -40, opacity: 0.6, duration: 18, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 }
    );

    gsap.to(".shape--1", { y: 30, rotation: 24, duration: 14, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(".shape--2", { y: -25, rotation: -22, duration: 18, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.5 });
    gsap.to(".shape--3", { y: 20, rotation: 48, duration: 12, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.6 });

    /* Grid lines individual animations — desktop only */
    document.querySelectorAll(".grid-lines line").forEach(function (line, i) {
      gsap.fromTo(line,
        { opacity: 0 },
        { opacity: 0.28, duration: 1.2, delay: 0.02 * i, ease: "power2.out" }
      );
      gsap.to(line, {
        opacity: 0.08,
        duration: 3 + (i % 5) * 0.4,
        repeat: -1, yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.08,
      });
    });

    /* Title shimmer — desktop only */
    gsap.to(".hero__title-line", {
      backgroundPosition: "220% center",
      duration: 9, repeat: -1, yoyo: true,
      ease: "sine.inOut", delay: 2.5,
    });

    /* CTA shine — desktop only */
    gsap.to(".cta__shine", {
      x: "200%", duration: 2.6,
      repeat: -1, repeatDelay: 3.5,
      ease: "power2.inOut",
    });
  }

  /* ---------- Intro timeline (runs on all devices, once) ---------- */
  var tl = gsap.timeline({ defaults: { ease: ease } });
  tl.from(".top-bar", { opacity: 0, y: -16, duration: 0.9 }, 0)
    .from(".hero__kicker",   { opacity: 0, y: 20, duration: 0.7, ease: easeSoft }, 0.15)
    .fromTo(".hero__title-line",
      { opacity: 0, y: isMobile ? 40 : 80, clipPath: "inset(0 0 100% 0)" },
      { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: isMobile ? 0.9 : 1.2, ease: easeSoft },
      0.28
    )
    .from(".hero__subtitle", { opacity: 0, y: 20, duration: 0.7, ease: easeSoft }, 0.52)
    .from('[data-anim="stagger-item"]', {
      opacity: 0, y: 36,
      duration: 0.75, stagger: 0.14,
      ease: easeSoft,
    }, 0.68)
    .from(".speaker", { opacity: 0, y: 24, duration: 0.9, ease: easeSoft }, isMobile ? 0.55 : 0.6)
    .from(".cta",     { opacity: 0, y: 20, duration: 0.75, ease: easeSoft }, 1.0)
    .from(".cta-hint",{ opacity: 0, y: 10, duration: 0.5,  ease: easeSoft }, 1.2);

  if (!isMobile) {
    tl.from(".dates__connector", { opacity: 0, scaleX: 0, duration: 0.6, ease: easeSoft }, 0.88);
  }

  /* ---------- Scroll-triggered footer ---------- */
  gsap.utils.toArray(".footer [data-anim='fade-up']").forEach(function (el) {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none reverse" },
      opacity: 0, y: 20, duration: 0.7, ease: easeSoft,
    });
  });

  /* ---------- Pause all tweens when tab is hidden ---------- */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      gsap.globalTimeline.pause();
    } else {
      gsap.globalTimeline.resume();
    }
  });

  ScrollTrigger.refresh();
})();
