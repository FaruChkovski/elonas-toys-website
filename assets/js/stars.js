/* =========================================
   Elona's Toys — Glowing Stars (minimal)
   ========================================= */

(function (root) {
  'use strict';

  var doc = root.document;
  var docEl = doc && doc.documentElement;
  var body = doc && doc.body;

  var DEFAULTS = {
    starCount: 60,
    mobileStarCount: 20,
    mobileBreakpoint: 768,
    intensity: 1.0
  };

  var state = {
    opts: {},
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    dpr: 1,
    stars: [],
    rafId: null,
    started: false,
    destroyCalled: false,
    _onResize: null,
    _onVisibilityChange: null
  };

  function isMobile() {
    return root.innerWidth < DEFAULTS.mobileBreakpoint;
  }

  function rand(lo, hi) {
    return lo + Math.random() * (hi - lo);
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function createStar() {
    var w = state.width;
    var h = state.height;
    return {
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.15, 0.15),
      vy: rand(-0.25, 0.05),
      size: rand(0.5, 2.5),
      alpha: rand(0.3, 0.9),
      life: rand(0.6, 1.4),
      age: rand(0, 1.4)
    };
  }

  function initStars() {
    state.stars = [];
    var count = isMobile() ? state.opts.mobileStarCount : state.opts.starCount;
    for (var i = 0; i < count; i++) {
      var s = createStar();
      s.age = s.life * Math.random();
      state.stars.push(s);
    }
  }

  function updateStars(intensity) {
    var count = isMobile() ? state.opts.mobileStarCount : state.opts.starCount;
    while (state.stars.length > count) state.stars.pop();
    while (state.stars.length < count) state.stars.push(createStar());

    var speed = 0.35 * intensity;
    for (var i = 0; i < state.stars.length; i++) {
      var s = state.stars[i];
      s.x += s.vx * speed;
      s.y += s.vy * speed;
      s.age += 0.01 * intensity;

      if (s.x < -30) s.x = state.width + 30;
      if (s.x > state.width + 30) s.x = -30;
      if (s.y < -30) s.y = state.height + 30;
      if (s.y > state.height + 30) s.y = -30;

      if (s.age >= s.life) {
        s.x = rand(0, state.width);
        s.y = rand(0, state.height);
        s.age = 0;
        s.life = rand(0.8, 1.6);
      }
    }
  }

  function drawStars(ctx) {
    if (state.stars.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < state.stars.length; i++) {
      var s = state.stars[i];
      var t = s.age / s.life;
      var alpha = s.alpha * (1 - t) * 0.9;
      if (alpha <= 0) continue;

      var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 2);
      g.addColorStop(0, 'rgba(255, 255, 255, ' + alpha + ')');
      g.addColorStop(0.5, 'rgba(255, 255, 255, ' + alpha * 0.4 + ')');
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function ensureContainer() {
    var el = doc.getElementById('stars-canvas');
    if (!el) {
      el = doc.createElement('canvas');
      el.id = 'stars-canvas';
      el.style.position = 'fixed';
      el.style.inset = '0';
      el.style.width = '100vw';
      el.style.height = '100vh';
      el.style.zIndex = '-1';
      el.style.pointerEvents = 'none';
      el.style.overflow = 'hidden';
      el.style.display = 'block';
      body.appendChild(el);
    }
    state.canvas = el;
    state.ctx = el.getContext('2d', { alpha: true });
  }

  function resize() {
    if (!state.canvas || !state.ctx) return;
    var dpr = Math.min(root.devicePixelRatio || 1, 2);
    var w = root.innerWidth;
    var h = root.innerHeight;
    if (w === state.width && h === state.height && dpr === state.dpr) return;
    state.width = w;
    state.height = h;
    state.dpr = dpr;
    state.canvas.width = Math.max(1, w * dpr);
    state.canvas.height = Math.max(1, h * dpr);
    state.canvas.style.width = w + 'px';
    state.canvas.style.height = h + 'px';
    state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function isPaused() {
    return state.destroyCalled;
  }

  function startLoop() {
    if (state.rafId !== null) return;
    state.rafId = root.requestAnimationFrame(loop);
  }

  function stopLoop() {
    if (state.rafId !== null) {
      root.cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
  }

  function loop() {
    if (!isPaused()) {
      var intensity = clamp(state.opts.intensity, 0, 1);
      updateStars(intensity);

      var ctx = state.ctx;
      ctx.clearRect(0, 0, state.width, state.height);
      drawStars(ctx);
    }
    state.rafId = root.requestAnimationFrame(loop);
  }

  function onVisibilityChange() {
    if (state.destroyCalled) return;
    if (root.document.visibilityState === 'hidden') {
      stopLoop();
    } else {
      startLoop();
    }
  }

  function teardown() {
    stopLoop();
    root.removeEventListener('visibilitychange', onVisibilityChange);
    if (state.canvas && state.canvas.parentNode) {
      state.canvas.parentNode.removeChild(state.canvas);
    }
    state.canvas = null;
    state.ctx = null;
    state.stars = [];
    state.rafId = null;
    state.started = false;
    state.destroyCalled = true;
  }

  function init(opts) {
    if (state.started && !state.destroyCalled) return state.api;
    state.destroyCalled = false;
    state.started = true;

    state.opts = Object.assign({}, DEFAULTS, opts || {});
    state.opts.intensity = clamp(state.opts.intensity, 0, 1);

    ensureContainer();
    resize();
    initStars();
    startLoop();

    root.addEventListener('visibilitychange', onVisibilityChange);

    return state.api;
  }

  function setIntensity(v) {
    state.opts.intensity = clamp(Number(v), 0, 1);
    return state.opts.intensity;
  }

  function destroy() {
    teardown();
  }

  state.api = {
    init: init,
    setIntensity: setIntensity,
    destroy: destroy
  };

  root.ElonaStars = state.api;

  // Auto-initialize on DOM ready
  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', function () { state.api.init(); });
  } else {
    state.api.init();
  }

})(window);
