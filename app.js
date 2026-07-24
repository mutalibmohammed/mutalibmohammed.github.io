/* Zone 1 Pub Crawl — map renderer + picker */
(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const STORE_KEY = "pubcrawl-visited-v1";

  const mapWrap = document.getElementById("map-wrap");
  const mapHost = document.getElementById("map");
  const pickBtn = document.getElementById("pick");
  const card = document.getElementById("card");
  const cardBody = document.getElementById("card-body");
  const cardClose = document.getElementById("card-close");
  const counterEl = document.getElementById("counter");
  const resetBtn = document.getElementById("reset");
  const toastEl = document.getElementById("toast");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let visited = loadVisited();
  let current = null;
  let picking = false;

  /* ---------------------------------------------------------- svg helpers */
  function el(name, attrs, parent) {
    const node = document.createElementNS(SVG_NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }
  const pts = (arr) => arr.map((p) => p.join(",")).join(" ");

  /* ---------------------------------------------------------- build map */
  const svg = el("svg", {
    viewBox: `${MAP_BOUNDS.x} ${MAP_BOUNDS.y} ${MAP_BOUNDS.width} ${MAP_BOUNDS.height}`,
    role: "img",
    "aria-label": "Schematic map of Zone 1 tube stations with their crawl pubs",
  });
  svg.id = "tube-map";
  const viewport = el("g", {}, svg);

  function buildMap() {
    // Thames
    el("polyline", {
      points: pts(RIVER.points), fill: "none", stroke: RIVER.color,
      "stroke-width": RIVER.width, "stroke-linejoin": "round", "stroke-linecap": "round",
    }, viewport);
    el("text", {
      x: RIVER.label.x, y: RIVER.label.y, class: "river-label",
    }, viewport).textContent = RIVER.label.text;

    // Lines
    for (const line of MAP_LINES) {
      el("polyline", {
        points: pts(line.points), fill: "none", stroke: LINE_META[line.id].color,
        "stroke-width": line.width, "stroke-linejoin": "round", "stroke-linecap": "round",
      }, viewport);
    }

    // Bank–Monument pedestrian link (casing then core)
    for (const link of LINKS) {
      const a = STATIONS.find((s) => s.id === link.from);
      const b = STATIONS.find((s) => s.id === link.to);
      el("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: "#1a1a1a", "stroke-width": 15, "stroke-linecap": "round" }, viewport);
      el("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: "#ffffff", "stroke-width": 8, "stroke-linecap": "round" }, viewport);
    }

    // Highlight ring (kept under markers' labels but over lines)
    const ring = el("g", { id: "ring", opacity: 0 }, viewport);
    el("circle", { r: 26, fill: "none", stroke: "#C77E1F", "stroke-width": 3, class: "ring-outer" }, ring);
    el("circle", { r: 15, fill: "rgba(199,126,31,.14)", stroke: "#C77E1F", "stroke-width": 4 }, ring);

    // Stations
    for (const s of STATIONS) {
      const g = el("g", { class: "station", "data-id": s.id }, viewport);

      // generous invisible hit area so stations are easy to tap on phones
      el("circle", { cx: s.x, cy: s.y, r: 26, fill: "transparent" }, g);

      if (s.marker === "tick") {
        const [dx, dy] = s.tick;
        const n = Math.hypot(dx, dy);
        const ux = dx / n, uy = dy / n;
        el("line", {
          x1: s.x - ux * 2, y1: s.y - uy * 2, x2: s.x + ux * 13, y2: s.y + uy * 13,
          stroke: LINE_META[s.lines.find((l) => MAP_LINES.some((m) => m.id === l))].color,
          "stroke-width": 7,
        }, g);
      } else {
        el("circle", { cx: s.x, cy: s.y, r: 9, fill: "#ffffff", stroke: "#1a1a1a", "stroke-width": 3.2 }, g);
      }

      const lb = s.label;
      const bx = s.x + lb.dx, by = s.y + lb.dy;
      const stnY = lb.flip ? by : by;
      const pubY = lb.flip ? by - 15 : by + 15;
      const t1 = el("text", { x: bx, y: stnY, class: "stn-label", "text-anchor": lb.anchor }, g);
      t1.textContent = s.mapName || s.name;
      const t2 = el("text", { x: bx, y: pubY, class: "pub-label", "text-anchor": lb.anchor }, g);
      t2.textContent = s.pub.mapName || s.pub.name;
    }

    mapHost.appendChild(svg);
    refreshVisitedStyles();
  }

  /* ---------------------------------------------------------- pan / zoom */
  const view = { x: 0, y: 0, k: 1 };       // translate (screen px) + scale
  let baseScale = 1;                        // viewBox → screen at k=1
  let anim = null;

  function containerSize() {
    return { w: mapWrap.clientWidth, h: mapWrap.clientHeight };
  }
  function computeBase() {
    const { w, h } = containerSize();
    baseScale = Math.min(w / MAP_BOUNDS.width, h / MAP_BOUNDS.height);
    svg.setAttribute("width", MAP_BOUNDS.width * baseScale);
    svg.setAttribute("height", MAP_BOUNDS.height * baseScale);
  }
  function apply() {
    svg.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.k})`;
  }
  function clampView() {
    // the map must always cover the centre of the screen
    const { w, h } = containerSize();
    const mw = MAP_BOUNDS.width * baseScale * view.k;
    const mh = MAP_BOUNDS.height * baseScale * view.k;
    view.x = Math.max(w / 2 - mw, Math.min(w / 2, view.x));
    view.y = Math.max(h / 2 - mh, Math.min(h / 2, view.y));
  }
  // zoom level that shows roughly `units` map-units across the screen width
  function kForUnits(units) {
    const { w } = containerSize();
    return Math.max(1, Math.min(6, w / (units * baseScale)));
  }
  function setView(x, y, k) {
    if (!isFinite(x) || !isFinite(y) || !isFinite(k)) return;
    view.x = x; view.y = y; view.k = Math.max(0.8, Math.min(6, k));
    clampView();
    apply();
  }
  function stopAnim() { if (anim) { cancelAnimationFrame(anim); anim = null; } }
  function animateTo(target, ms) {
    stopAnim();
    if (reducedMotion || ms === 0) { setView(target.x, target.y, target.k); return Promise.resolve(); }
    const from = { ...view };
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    return new Promise((resolve) => {
      const step = (now) => {
        const t = Math.min(1, (now - t0) / ms);
        const e = ease(t);
        setView(
          from.x + (target.x - from.x) * e,
          from.y + (target.y - from.y) * e,
          from.k + (target.k - from.k) * e
        );
        if (t < 1) anim = requestAnimationFrame(step);
        else { anim = null; resolve(); }
      };
      anim = requestAnimationFrame(step);
    });
  }
  function fitTarget() {
    const { w, h } = containerSize();
    return { x: (w - MAP_BOUNDS.width * baseScale) / 2, y: (h - MAP_BOUNDS.height * baseScale) / 2, k: 1 };
  }
  function centerOn(mx, my, k, yBias) {
    const { w, h } = containerSize();
    const bias = yBias || 0.5; // 0.5 = center; smaller = station sits higher
    return {
      x: w / 2 - (mx - MAP_BOUNDS.x) * baseScale * k,
      y: h * bias - (my - MAP_BOUNDS.y) * baseScale * k,
      k,
    };
  }

  // pointer gestures: drag pan + pinch zoom
  const pointers = new Map();
  let gestureStart = null;
  mapWrap.addEventListener("pointerdown", (e) => {
    if (e.target.closest("#card") || e.target.closest(".map-controls")) return;
    try { mapWrap.setPointerCapture(e.pointerId); } catch {}
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    stopAnim();
    if (pointers.size === 1) {
      const hitStation = e.target.closest ? e.target.closest(".station") : null;
      gestureStart = {
        view: { ...view }, cx: e.clientX, cy: e.clientY, moved: false,
        stationHit: hitStation ? hitStation.getAttribute("data-id") : null,
      };
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      gestureStart = {
        view: { ...view },
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        pinch: true, moved: true,
      };
    }
  });
  mapWrap.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId) || !gestureStart) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (gestureStart.pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const rect = mapWrap.getBoundingClientRect();
      const scale = dist / gestureStart.dist;
      const k = Math.max(0.8, Math.min(6, gestureStart.view.k * scale));
      const eff = k / gestureStart.view.k;
      const sx = gestureStart.mid.x - rect.left, sy = gestureStart.mid.y - rect.top;
      setView(
        sx - (sx - gestureStart.view.x) * eff + (mid.x - gestureStart.mid.x),
        sy - (sy - gestureStart.view.y) * eff + (mid.y - gestureStart.mid.y),
        k
      );
    } else if (pointers.size === 1) {
      const dx = e.clientX - gestureStart.cx, dy = e.clientY - gestureStart.cy;
      if (Math.abs(dx) + Math.abs(dy) > 6) gestureStart.moved = true;
      setView(gestureStart.view.x + dx, gestureStart.view.y + dy, gestureStart.view.k);
    }
  });
  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size === 0) {
      gestureStart = null;
    } else if (pointers.size === 1) {
      // pinch ended with one finger still down: hand over to a fresh drag
      const rest = [...pointers.values()][0];
      gestureStart = { view: { ...view }, cx: rest.x, cy: rest.y, moved: true, stationHit: null };
    }
  }
  let lastTapOnStation = false;
  mapWrap.addEventListener("pointerup", (e) => {
    // taps are resolved here rather than via click events, which are
    // unreliable while the wrap holds pointer capture during gestures
    const cleanTap = gestureStart && !gestureStart.pinch && !gestureStart.moved;
    lastTapOnStation = !!(cleanTap && gestureStart.stationHit);
    if (cleanTap && !picking) {
      if (gestureStart.stationHit) {
        const s = STATIONS.find((x) => x.id === gestureStart.stationHit);
        if (s) showStation(s, { zoom: true });
      } else if (!card.hidden) {
        hideCard(); // tapping empty map dismisses the card; panning keeps it
      }
    }
    endPointer(e);
  });
  mapWrap.addEventListener("pointercancel", endPointer);

  // wheel zoom (desktop)
  mapWrap.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = mapWrap.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const k = Math.max(0.8, Math.min(6, view.k * Math.exp(-e.deltaY * 0.0015)));
    const eff = k / view.k;
    setView(sx - (sx - view.x) * eff, sy - (sy - view.y) * eff, k);
  }, { passive: false });

  // double-tap / double-click: toggle fit ↔ 2.2×
  let lastTap = 0;
  mapWrap.addEventListener("pointerup", (e) => {
    if (e.target.closest("#card") || e.target.closest(".map-controls")) return;
    if (gestureStartMovedRecently) return;
    if (lastTapOnStation) { lastTap = 0; return; } // station taps open cards, not zoom
    const now = Date.now();
    if (now - lastTap < 320) {
      const rect = mapWrap.getBoundingClientRect();
      const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
      if (view.k > 1.4) animateTo(fitTarget(), 420);
      else {
        const k = 2.2, eff = k / view.k;
        animateTo({ x: sx - (sx - view.x) * eff, y: sy - (sy - view.y) * eff, k }, 420);
      }
      lastTap = 0;
    } else lastTap = now;
  });
  let gestureStartMovedRecently = false;
  mapWrap.addEventListener("pointerdown", () => { gestureStartMovedRecently = false; });
  mapWrap.addEventListener("pointermove", () => { if (gestureStart && gestureStart.moved) gestureStartMovedRecently = true; });

  // zoom controls
  document.querySelectorAll(".map-controls button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { w, h } = containerSize();
      const sx = w / 2, sy = h / 2;
      if (btn.dataset.zoom === "fit") { animateTo(fitTarget(), 380); return; }
      const k = Math.max(0.8, Math.min(6, view.k * (btn.dataset.zoom === "in" ? 1.45 : 1 / 1.45)));
      const eff = k / view.k;
      animateTo({ x: sx - (sx - view.x) * eff, y: sy - (sy - view.y) * eff, k }, 260);
    });
  });

  /* ---------------------------------------------------------- ring */
  const ringEl = () => svg.querySelector("#ring");
  function ringAt(s, on) {
    const r = ringEl();
    r.setAttribute("transform", `translate(${s.x}, ${s.y})`);
    r.setAttribute("opacity", on ? 1 : 0);
    r.classList.toggle("pulsing", !!on && !reducedMotion);
  }

  /* ---------------------------------------------------------- state */
  function loadVisited() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
      return new Set(raw.filter((id) => STATIONS.some((s) => s.id === id)));
    } catch { return new Set(); }
  }
  function saveVisited() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify([...visited])); } catch {}
  }
  function refreshVisitedStyles() {
    for (const s of STATIONS) {
      const g = svg.querySelector(`.station[data-id="${s.id}"]`);
      if (g) g.classList.toggle("visited", visited.has(s.id) && (!current || current.id !== s.id));
    }
    counterEl.textContent = `${visited.size} / ${STATIONS.length}`;
    resetBtn.hidden = visited.size === 0;
  }

  /* ---------------------------------------------------------- card */
  function lineChips(s) {
    return s.lines.map((id) => {
      const m = LINE_META[id];
      return `<span class="chip"><i style="background:${m.color}"></i>${m.name}</span>`;
    }).join("");
  }
  function showStation(s, opts) {
    current = s;
    ringAt(s, true);
    const q = encodeURIComponent(`${s.pub.name}, ${s.pub.address}, London`);
    cardBody.innerHTML = `
      <div class="card-title">
        <h2>${s.pub.name}</h2>
        <span class="rating" title="Indicative Google rating">★ ${s.pub.rating.toFixed(1)}</span>
      </div>
      <p class="desc">${s.pub.desc}</p>
      <p class="drink">🍺 Reviewers' pick: <b>${s.pub.drink}</b></p>
      <div class="stn-row">
        <span class="stn-icon" aria-hidden="true"></span>
        <b>${s.name}</b>
      </div>
      <div class="chips">${lineChips(s)}</div>
      <p class="walk">🚶 ${s.pub.walk} min from the station · ${s.pub.address}</p>
      <a class="maps-btn" target="_blank" rel="noopener"
         href="https://www.google.com/maps/search/?api=1&query=${q}">Open in Maps</a>`;
    card.hidden = false;
    requestAnimationFrame(() => card.classList.add("open"));
    if (opts && opts.zoom) {
      animateTo(centerOn(s.x, s.y, Math.max(view.k, kForUnits(520)), 0.34), 650);
    }
    refreshVisitedStyles();
  }
  function hideCard() {
    card.classList.remove("open");
    const r = ringEl();
    r.setAttribute("opacity", 0);
    r.classList.remove("pulsing");
    current = null;
    setTimeout(() => { if (!card.classList.contains("open")) card.hidden = true; }, 250);
    refreshVisitedStyles();
  }
  cardClose.addEventListener("click", hideCard);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !card.hidden) hideCard();
  });

  /* ---------------------------------------------------------- toast */
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  /* ---------------------------------------------------------- pick! */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function pick() {
    if (picking) return;
    picking = true;
    pickBtn.disabled = true;
    try {
      hideCard();
      let pool = STATIONS.filter((s) => !visited.has(s.id));
      if (pool.length === 0) {
        visited.clear(); saveVisited(); refreshVisitedStyles();
        toast("Crawl complete — starting a fresh round! 🍻");
        pool = [...STATIONS];
      }
      const choice = pool[Math.floor(Math.random() * pool.length)];

      if (!reducedMotion) {
        await animateTo(fitTarget(), 380);
        const delays = [70, 70, 80, 90, 100, 115, 135, 160, 195, 240, 300];
        for (const d of delays) {
          const s = STATIONS[Math.floor(Math.random() * STATIONS.length)];
          ringAt(s, true);
          await sleep(d);
        }
      }
      visited.add(choice.id);
      saveVisited();
      showStation(choice, { zoom: true });
      pickBtn.querySelector("span").textContent = "PICK THE NEXT PUB";
    } finally {
      picking = false;
      pickBtn.disabled = false;
    }
  }
  pickBtn.addEventListener("click", pick);

  resetBtn.addEventListener("click", () => {
    visited.clear(); saveVisited();
    hideCard();
    refreshVisitedStyles();
    pickBtn.querySelector("span").textContent = "PICK A PUB";
    toast("Fresh crawl — all 37 pubs back in the hat.");
  });

  /* ---------------------------------------------------------- boot */
  buildMap();
  computeBase();
  // opening view: gently zoomed on the heart of the map
  const opening = centerOn(760, 440, kForUnits(640), 0.5);
  setView(opening.x, opening.y, opening.k);

  window.addEventListener("resize", () => {
    const c = current;
    computeBase();
    if (c) {
      const t = centerOn(c.x, c.y, view.k, 0.34);
      setView(t.x, t.y, t.k);
    } else {
      setView(view.x, view.y, view.k);
    }
  });
})();
