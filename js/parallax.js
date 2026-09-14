/* Speaker card depth effects
   - all devices: scroll parallax (card, background and character move at different rates)
   - mouse devices: page-wide pointer parallax + 3D hover tilt
   Transforms only, eased in a single rAF loop that sleeps when nothing moves. */
(function () {
  var card = document.querySelector("[data-tilt]");
  if (!card || !window.requestAnimationFrame || !window.matchMedia) return;

  var frame = card.parentElement; // untransformed box, used for all measurements
  var layerBg = card.querySelector('[data-depth="bg"]');
  var layerFg = card.querySelector('[data-depth="fg"]');

  var mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqFine = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* Motion budget, px / deg. Layers overscan the frame by 12% (≥45px on phones, ≥60px vertically
     on desktop); the largest combined offset stays inside it. */
  var TILT = 7;                                  // max rotation while hovering the card
  var SCROLL = { card: -9, bg: -26, fg: 10 };    // at the edges of the viewport
  var POINTER = { card: 6, bg: -16, fg: 10 };    // cursor at the edges of the window
  var HOVER = { bg: -12, fg: 8 };                // extra depth while the cursor is on the card
  var PERSPECTIVE = 1100;
  var SMOOTHING = 0.085;                         // share of the remaining distance per 60fps frame

  var KEYS = ["cx", "cy", "rx", "ry", "bx", "by", "fx", "fy"];
  var cur = {};
  var tgt = {};

  var pointer = { x: 0, y: 0 };
  var hover = { on: false, x: 0, y: 0 };
  var inView = true;
  var enabled = false;
  var rafId = 0;
  var lastTime = 0;

  function reset(obj) {
    KEYS.forEach(function (k) { obj[k] = 0; });
  }

  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  function updateTargets() {
    var r = frame.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    /* +1 when the card enters from the bottom, 0 at the centre, -1 when it leaves at the top */
    var p = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);

    var fine = mqFine.matches;
    var mx = fine ? pointer.x : 0;
    var my = fine ? pointer.y : 0;
    var hx = hover.on ? hover.x : 0;
    var hy = hover.on ? hover.y : 0;

    tgt.cx = mx * POINTER.card;
    tgt.cy = my * POINTER.card + p * SCROLL.card;
    tgt.bx = mx * POINTER.bg + hx * HOVER.bg;
    tgt.by = my * POINTER.bg + p * SCROLL.bg + hy * HOVER.bg;
    tgt.fx = mx * POINTER.fg + hx * HOVER.fg;
    tgt.fy = my * POINTER.fg + p * SCROLL.fg + hy * HOVER.fg;
    /* The card turns to face the cursor: the hovered corner recedes */
    tgt.ry = hx * TILT;
    tgt.rx = -hy * TILT;
  }

  function px(v) {
    return v.toFixed(2) + "px";
  }

  function render() {
    card.style.transform =
      "perspective(" + PERSPECTIVE + "px) translate3d(" + px(cur.cx) + "," + px(cur.cy) + ",0) " +
      "rotateX(" + cur.rx.toFixed(3) + "deg) rotateY(" + cur.ry.toFixed(3) + "deg)";
    if (layerBg) layerBg.style.transform = "translate3d(" + px(cur.bx) + "," + px(cur.by) + ",0)";
    if (layerFg) layerFg.style.transform = "translate3d(" + px(cur.fx) + "," + px(cur.fy) + ",0)";
  }

  function tick(time) {
    rafId = 0;
    var dt = lastTime ? Math.min(time - lastTime, 64) : 16.7;
    lastTime = time;

    updateTargets();
    var k = 1 - Math.pow(1 - SMOOTHING, dt / 16.7);
    var moving = false;
    KEYS.forEach(function (key) {
      var d = tgt[key] - cur[key];
      if (Math.abs(d) > 0.005) {
        cur[key] += d * k;
        moving = true;
      } else {
        cur[key] = tgt[key];
      }
    });
    render();

    if (moving) {
      rafId = requestAnimationFrame(tick);
    } else {
      lastTime = 0;
    }
  }

  function wake() {
    if (enabled && inView && !rafId) rafId = requestAnimationFrame(tick);
  }

  /* ---------- Input ---------- */

  function onScroll() {
    wake();
  }

  function onPointerMove(e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    pointer.x = clamp((e.clientX / (window.innerWidth || 1)) * 2 - 1, -1, 1);
    pointer.y = clamp((e.clientY / (window.innerHeight || 1)) * 2 - 1, -1, 1);
    wake();
  }

  function onCardMove(e) {
    if (!mqFine.matches || (e.pointerType && e.pointerType !== "mouse")) return;
    var r = frame.getBoundingClientRect();
    hover.x = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    hover.y = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    if (!hover.on) {
      hover.on = true;
      card.classList.add("is-hover");
    }
    wake();
  }

  function onCardLeave() {
    if (!hover.on) return;
    hover.on = false;
    card.classList.remove("is-hover");
    wake();
  }

  function onPageLeave() {
    pointer.x = 0;
    pointer.y = 0;
    onCardLeave();
    wake();
  }

  /* ---------- Lifecycle ---------- */

  function enable() {
    if (enabled) return;
    enabled = true;
    reset(cur);
    reset(tgt);
    card.classList.add("is-motion");
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPageLeave);
    frame.addEventListener("pointermove", onCardMove, { passive: true });
    frame.addEventListener("pointerleave", onCardLeave);
    wake();
  }

  function disable() {
    if (!enabled) return;
    enabled = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    lastTime = 0;
    hover.on = false;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    window.removeEventListener("pointermove", onPointerMove);
    document.documentElement.removeEventListener("pointerleave", onPageLeave);
    frame.removeEventListener("pointermove", onCardMove);
    frame.removeEventListener("pointerleave", onCardLeave);
    card.classList.remove("is-motion", "is-hover");
    card.style.transform = "";
    if (layerBg) layerBg.style.transform = "";
    if (layerFg) layerFg.style.transform = "";
  }

  function sync() {
    if (mqReduced.matches) disable();
    else enable();
  }

  /* Only run the loop while the card is (nearly) on screen */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[entries.length - 1].isIntersecting;
      wake();
    }, { rootMargin: "15% 0px" }).observe(frame);
  }

  function listen(mq, fn) {
    if (mq.addEventListener) mq.addEventListener("change", fn);
    else if (mq.addListener) mq.addListener(fn);
  }

  listen(mqReduced, sync);
  listen(mqFine, function () {
    onCardLeave();
    wake();
  });

  sync();
})();
