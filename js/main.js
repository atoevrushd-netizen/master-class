(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function drawGridLines() {
    const svg = document.querySelector(".grid-lines");
    if (!svg) return;
    const ns = "http://www.w3.org/2000/svg";
    const w = window.innerWidth;
    const h = window.innerHeight;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    while (svg.lastChild && svg.lastChild.nodeName === "line") {
      svg.removeChild(svg.lastChild);
    }
    const count = Math.min(20, Math.floor(w / 80) + 6);
    const step = w / count;
    for (let i = 0; i <= count; i++) {
      const line = document.createElementNS(ns, "line");
      const x = Math.round(i * step) + 0.5;
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
  let gridT;
  window.addEventListener(
    "resize",
    function () {
      clearTimeout(gridT);
      gridT = setTimeout(drawGridLines, 120);
    },
    { passive: true }
  );

  if (reduced || typeof gsap === "undefined") {
    document.querySelectorAll("[data-anim]").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const ease = "power4.out";
  const easeSoft = "power3.out";

  // Background orbs drift
  gsap.fromTo(
    ".orb--1",
    { x: 0, y: 0, scale: 1 },
    { x: 40, y: 30, scale: 1.08, duration: 22, repeat: -1, yoyo: true, ease: "sine.inOut" }
  );
  gsap.fromTo(
    ".orb--2",
    { x: 0, y: 0, scale: 1 },
    { x: -35, y: -25, scale: 1.06, duration: 26, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 }
  );
  gsap.fromTo(
    ".orb--3",
    { x: 0, y: 0, opacity: 0.45 },
    { x: 25, y: -40, opacity: 0.6, duration: 18, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 }
  );

  // Decorative triangle shapes float & rotate
  gsap.to(".shape--1", {
    y: 30,
    rotation: 24,
    duration: 14,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
  gsap.to(".shape--2", {
    y: -25,
    rotation: -22,
    duration: 18,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    delay: 1.5,
  });
  gsap.to(".shape--3", {
    y: 20,
    rotation: 48,
    duration: 12,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    delay: 0.6,
  });

  // Intro timeline
  const tl = gsap.timeline({ defaults: { ease } });
  tl.from(".top-bar", { opacity: 0, y: -16, duration: 0.9 }, 0)
    .from(
      ".hero__kicker",
      { opacity: 0, y: 24, duration: 0.8, ease: easeSoft },
      0.2
    )
    .fromTo(
      ".hero__title-line",
      { opacity: 0, y: 80, clipPath: "inset(0 0 100% 0)" },
      {
        opacity: 1,
        y: 0,
        clipPath: "inset(0 0 0% 0)",
        duration: 1.2,
        ease: easeSoft,
      },
      0.35
    )
    .to(
      ".hero__title-line",
      { backgroundPosition: "100% center", duration: 2, ease: "power2.inOut" },
      0.5
    )
    .from(
      ".hero__subtitle",
      { opacity: 0, y: 28, duration: 0.9, ease: easeSoft },
      0.65
    )
    .from(
      '[data-anim="stagger-item"]',
      {
        opacity: 0,
        y: 48,
        rotateX: -12,
        transformOrigin: "50% 50%",
        duration: 0.9,
        stagger: 0.16,
        ease: easeSoft,
      },
      0.75
    )
    .from(
      ".dates__connector",
      { opacity: 0, scaleX: 0, duration: 0.7, ease: easeSoft },
      0.95
    )
    .from(
      ".speaker",
      {
        opacity: 0,
        y: 32,
        scale: 0.97,
        duration: 1.1,
        ease: easeSoft,
      },
      0.6
    )
    .from(
      ".cta",
      { opacity: 0, y: 24, duration: 0.85, ease: easeSoft },
      1.05
    )
    .from(
      ".cta-hint",
      { opacity: 0, y: 12, duration: 0.6, ease: easeSoft },
      1.4
    );

  // Infinite gradient shimmer on title
  gsap.to(".hero__title-line", {
    backgroundPosition: "220% center",
    duration: 9,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    delay: 2.5,
  });

  // Repeating CTA shine
  gsap.to(".cta__shine", {
    x: "200%",
    duration: 2.6,
    repeat: -1,
    repeatDelay: 3.5,
    ease: "power2.inOut",
  });

  // Grid lines fade in
  document.querySelectorAll(".grid-lines line").forEach(function (line, i) {
    gsap.fromTo(
      line,
      { opacity: 0 },
      { opacity: 0.28, duration: 1.2, delay: 0.02 * i, ease: "power2.out" }
    );
    gsap.to(line, {
      opacity: 0.08,
      duration: 3 + (i % 5) * 0.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: i * 0.08,
    });
  });

  // Scroll-triggered details list
  gsap.utils
    .toArray(".details [data-anim='fade-up'], .footer [data-anim='fade-up']")
    .forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 28,
        duration: 0.85,
        ease: easeSoft,
      });
    });

  gsap.utils.toArray('[data-anim="scale-in"]').forEach(function (el) {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        toggleActions: "play none none reverse",
      },
      scaleX: 0,
      opacity: 0,
      duration: 0.9,
      ease: easeSoft,
    });
  });

  ScrollTrigger.refresh();
})();
