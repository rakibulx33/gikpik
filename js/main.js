(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const animate = hasGsap && !reduced;
  if (!hasGsap) root.classList.add("fallback");
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  const loader = $("#loader");
  if (loader && !animate) loader.remove();

  /* ---------- Smooth scroll (Lenis) wired to ScrollTrigger ---------- */
  let lenis = null;
  if (animate && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = (el, offset = -72) => {
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  /* ---------- Header ---------- */
  const header = $("#site-header");
  const setHeader = () => header.classList.toggle("is-solid", window.scrollY > 24);

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("#menu-btn");
  const nav = $("#main-nav");
  const closeMenu = () => {
    menuBtn.setAttribute("aria-expanded", "false");
    nav.dataset.open = "false";
    document.body.style.overflow = "";
    if (lenis) lenis.start();
  };
  menuBtn.addEventListener("click", () => {
    const open = menuBtn.getAttribute("aria-expanded") !== "true";
    menuBtn.setAttribute("aria-expanded", String(open));
    nav.dataset.open = String(open);
    document.body.style.overflow = open ? "hidden" : "";
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  window.matchMedia("(min-width: 861px)").addEventListener("change", closeMenu);

  /* in-page anchors */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    const wasOpen = nav.dataset.open === "true";
    if (wasOpen) closeMenu();
    scrollToEl(id === "#top" ? 0 : target, id === "#top" ? 0 : -60);
    history.replaceState(null, "", id);
  });

  /* ---------- Altitude rail + progress bar ---------- */
  const rail = $("#rail");
  const railList = $("#rail-list");
  const progress = $("#progress");
  const stops = [{ el: $("#top"), label: "Top" }]
    .concat($$("section[data-label]").map((el) => ({ el, label: el.dataset.label })));
  railList.style.setProperty("--n", stops.length);
  stops.forEach((s, i) => {
    const li = document.createElement("li");
    li.style.setProperty("--i", i);
    li.innerHTML = `<span>${s.label}</span>`;
    railList.appendChild(li);
    s.li = li;
  });

  const updateRail = () => {
    const sy = window.scrollY;
    const y = sy + window.innerHeight * 0.45;
    const tops = stops.map((s) => s.el.getBoundingClientRect().top + sy);
    let idx = 0;
    tops.forEach((t, i) => { if (t <= y) idx = i; });
    const h = stops[idx].el.offsetHeight || 1;
    const f = clamp((y - tops[idx]) / h, 0, 1);
    const p = idx >= stops.length - 1 ? 1 : (idx + f) / (stops.length - 1);
    rail.style.setProperty("--p", p.toFixed(4));
    stops.forEach((s, i) => s.li.classList.toggle("is-on", i === idx));
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? clamp(sy / max, 0, 1) : 0})`;
  };

  /* ---------- Process route fills as you read ---------- */
  const route = $("#route");
  const routeItems = $$("li", route);
  const updateRoute = () => {
    const vh = window.innerHeight;
    const r = route.getBoundingClientRect();
    route.style.setProperty("--p", clamp((vh * 0.6 - r.top) / r.height, 0, 1).toFixed(4));
    routeItems.forEach((li) => li.classList.toggle("is-lit", li.getBoundingClientRect().top < vh * 0.6));
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { setHeader(); updateRail(); updateRoute(); ticking = false; });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Gates light up one after another ---------- */
  const gateItems = $$("#gates li");
  gateItems.forEach((li, i) => li.style.setProperty("--k", i));
  if ("IntersectionObserver" in window) {
    const gio = new IntersectionObserver((en) => {
      if (en[0].isIntersecting) { gateItems.forEach((li, i) => setTimeout(() => li.classList.add("is-lit"), reduced ? 0 : i * 260)); gio.disconnect(); }
    }, { threshold: 0.35 });
    gio.observe($("#gates"));
  } else gateItems.forEach((li) => li.classList.add("is-lit"));

  /* ---------- Work index filters ---------- */
  const filterBtns = $$(".filter");
  const rows = $$("#index > li");
  const indexList = $("#index");
  const empty = $("#empty");
  const hasCat = (el, cat) => cat === "all" || el.dataset.cat.split(" ").includes(cat);
  filterBtns.forEach((b) => { $(".count", b).textContent = rows.filter((el) => hasCat(el, b.dataset.filter)).length; });
  const applyFilter = (cat) => {
    let shown = 0;
    rows.forEach((el) => {
      const show = hasCat(el, cat);
      el.hidden = !show;
      if (show) shown++;
      if (show && animate) gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", clearProps: "all" });
    });
    indexList.hidden = shown === 0;
    empty.hidden = shown > 0;
    filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === cat)));
    if (hasGsap) setTimeout(() => ScrollTrigger.refresh(), 60);
  };
  filterBtns.forEach((b) => b.addEventListener("click", () => applyFilter(b.dataset.filter)));

  /* ---------- Solutions explorer ---------- */
  const SEGMENTS = {
    clinic: {
      today: "Patient serials, bills and receipts are written by hand, and entries go wrong.",
      flow: ["Appointment", "Billing", "Receipt print", "Daily report"],
      foot: "A good first project: a simple receipt system with patient details, service selection, billing, printing and a daily report. Demos use sample data, never real patient information."
    },
    shop: {
      today: "Stock, sales and what customers owe are kept in a ledger notebook.",
      flow: ["POS", "Inventory", "Invoice", "Low-stock alert"],
      foot: "We would start with whichever part costs you the most time each day."
    },
    seller: {
      today: "Orders from Messenger and forms are handled one by one, in separate places.",
      flow: ["Order panel", "Status update", "Inventory tracking"],
      foot: "Payment and delivery integrations follow each provider's rules."
    },
    agency: {
      today: "Leads, follow-ups and repeated tasks depend on someone remembering them.",
      flow: ["CRM workflow", "Automated reminders", "Reporting"],
      foot: "We start by mapping the steps your team repeats most."
    },
    startup: {
      today: "You have an idea, but no complete in-house team.",
      flow: ["Feasibility", "MVP", "Iteration", "Support"],
      foot: "We check that the idea is feasible before building anything, then ship a first version you can put in front of users."
    }
  };
  const tabs = $$('[role="tab"]');
  const panel = $("#panel");
  const showSegment = (tab, focus) => {
    const data = SEGMENTS[tab.dataset.key];
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", tab.id);
    $("#panel-today").textContent = data.today;
    $("#panel-foot").textContent = data.foot;
    const flow = $("#panel-flow");
    flow.innerHTML = "";
    data.flow.forEach((step, i) => {
      const li = document.createElement("li");
      li.textContent = step;
      li.style.setProperty("--k", i);
      flow.appendChild(li);
    });
    if (!reduced) { panel.classList.remove("swap"); void panel.offsetWidth; panel.classList.add("swap"); }
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => showSegment(t, false));
    t.addEventListener("keydown", (e) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (e.key in keys) { e.preventDefault(); showSegment(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true); }
      else if (e.key === "Home") { e.preventDefault(); showSegment(tabs[0], true); }
      else if (e.key === "End") { e.preventDefault(); showSegment(tabs[tabs.length - 1], true); }
    });
  });
  showSegment(tabs[0], false);

  /* ---------- Team: render roster if supplied ---------- */
  const team = Array.isArray(window.GIKPIK_TEAM) ? window.GIKPIK_TEAM : [];
  if (team.length) {
    const people = $("#people");
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    people.innerHTML = team.map((p) => {
      const initials = esc(p.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase());
      const avatar = p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}" width="480" height="480" loading="lazy">` : initials;
      const links = Object.entries(p.links || {}).map(([k, u]) => `<a href="${esc(u)}" rel="noopener">${esc(k.charAt(0).toUpperCase() + k.slice(1))}</a>`).join("");
      const tags = (p.tags || []).map((t) => `<li>${esc(t)}</li>`).join("");
      return `<li class="person cut glow"><div class="avatar${p.photo ? " photo" : ""}"${p.photo ? "" : ' aria-hidden="true"'}>${avatar}</div><div class="pbody"><h3>${esc(p.name)}</h3>${p.role ? `<p class="role">${esc(p.role)}</p>` : ""}${p.blurb ? `<p class="blurb">${esc(p.blurb)}</p>` : ""}${tags ? `<ul class="tags">${tags}</ul>` : ""}${links ? `<p class="links">${links}</p>` : ""}</div></li>`;
    }).join("");
    people.hidden = false;
    $(".principles").before(people);
  }

  /* ---------- Section eyebrows: 01 Services, 02 Solutions ... ---------- */
  $$("section[data-label]").forEach((sec, i) => {
    const h2 = $("h2", sec);
    if (!h2) return;
    const eb = document.createElement("p");
    eb.className = "eyebrow";
    eb.setAttribute("aria-hidden", "true");
    eb.innerHTML = `<b>${String(i + 1).padStart(2, "0")}</b>${sec.dataset.label}`;
    h2.before(eb);
  });

  /* ---------- Offers fill the brief ---------- */
  const form = $("#brief");
  const select = $("#f-start");
  $$("[data-offer]").forEach((b) => {
    b.addEventListener("click", () => {
      const opt = Array.from(select.options).find((o) => o.text.startsWith(b.dataset.offer));
      if (opt) select.value = opt.value || opt.text;
      scrollToEl($("#contact"), 0);
      setTimeout(() => $("#f-problem").focus({ preventScroll: true }), reduced ? 0 : 1500);
    });
  });

  /* ---------- Brief: opens the visitor's email app ---------- */
  const note = $("#form-note");
  const TO = form.getAttribute("action").replace("mailto:", "");
  const required = [["f-name", "Add your name."], ["f-email", "Add an email address we can reply to."], ["f-problem", "Tell us a little about the task or project."]];
  const clearErrors = () => {
    $$(".err", form).forEach((n) => n.remove());
    $$("[aria-invalid]", form).forEach((n) => n.removeAttribute("aria-invalid"));
  };
  const validate = () => {
    clearErrors();
    let first = null;
    required.forEach(([id, msg]) => {
      const el = document.getElementById(id);
      const bad = !el.value.trim() || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(el.value.trim()));
      if (bad) {
        el.setAttribute("aria-invalid", "true");
        const span = document.createElement("span");
        span.className = "err";
        span.textContent = el.type === "email" && el.value.trim() ? "That email address looks incomplete." : msg;
        el.insertAdjacentElement("afterend", span);
        first = first || el;
      }
    });
    if (first) { first.focus(); note.textContent = "A few details are missing. Check the highlighted fields."; }
    return !first;
  };
  const brief = () => {
    const v = (id) => document.getElementById(id).value.trim();
    return [
      `Name: ${v("f-name")}`, `Email: ${v("f-email")}`, `Business: ${v("f-biz") || "-"}`,
      `Starting point: ${select.value}`, `Timeline or budget: ${v("f-when") || "-"}`, "",
      "What takes the most time, or what I want to build:", v("f-problem")
    ].join("\n");
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    const subject = `Project brief from ${$("#f-name").value.trim()}`;
    window.location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brief())}`;
    note.textContent = `Your email app should open with the brief ready to send. If nothing happens, use Copy brief and email ${TO}.`;
  });
  $("#copy-brief").addEventListener("click", async () => {
    if (!validate()) return;
    const text = brief();
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
    note.textContent = `Brief copied. Paste it into an email to ${TO}.`;
  });

  /* ---------- Dhaka clock + year ---------- */
  const clock = $("#dhaka-time");
  const tick = () => {
    try {
      const t = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Dhaka" }).format(new Date());
      clock.textContent = `It is ${t} in Dhaka right now.`;
    } catch { clock.textContent = ""; }
  };
  tick(); setInterval(tick, 30000);
  $("#year").textContent = new Date().getFullYear();

  /* ======================================================================
     Motion
     ====================================================================== */

  /* Counters: show the real number without motion, count up with it */
  const counters = $$("[data-count]");

  if (!animate) {
    // everything is already visible; nothing else to do
    return;
  }

  /* split headings into word masks */
  const splitWords = (el) => {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span"); w.className = "w";
            const wi = document.createElement("span"); wi.className = "wi"; wi.textContent = tok;
            w.appendChild(wi); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    walk(el);
    $$(".w", el).forEach((w) => w.setAttribute("aria-hidden", "true"));
  };
  $$(".split").forEach((h) => {
    splitWords(h);
    gsap.set($$(".wi", h), { y: 0, yPercent: 112 });
    gsap.to($$(".wi", h), {
      yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.055,
      scrollTrigger: { trigger: h, start: "top 88%", once: true }
    });
  });

  /* hero intro */
  const intro = gsap.timeline({ defaults: { ease: "power4.out" }, paused: true });
  gsap.set(".display .li", { y: 0, yPercent: 112 });
  intro
    .to(".display .li", { yPercent: 0, duration: 1.1, stagger: 0.14 })
    .fromTo(".status-pill", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, clearProps: "transform" }, 0.05)
    .fromTo(".lede", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.8, clearProps: "transform" }, 0.55)
    .fromTo(".actions", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.8, clearProps: "transform" }, 0.7)
    .fromTo(".hero-note", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, clearProps: "transform" }, 0.85)
    .fromTo(".hero-foot", { opacity: 0 }, { opacity: 1, duration: 0.9 }, 1.1)
    .fromTo(".float", { opacity: 0, yPercent: 40, scale: 0.86 }, { opacity: 1, yPercent: 0, scale: 1, duration: 1.2, stagger: 0.16, ease: "expo.out" }, 0.9)
    .fromTo(".grid-floor", { opacity: 0 }, { opacity: 1, duration: 1.6, ease: "power2.out" }, 0.2);

  const playIntro = () => { window.dispatchEvent(new Event("gk:intro")); intro.play(); };
  if (loader) {
    // full intro on the first load of a visit, a quicker one on every refresh after that
    const quick = root.classList.contains("gk-quick");
    try { sessionStorage.setItem("gk-intro", "1"); } catch (e) { /* storage blocked */ }
    if (lenis) lenis.stop();
    const minWait = new Promise((r) => setTimeout(r, quick ? 650 : 1550));
    const loaded = new Promise((r) => {
      if (document.readyState === "complete") r();
      else window.addEventListener("load", r, { once: true });
      setTimeout(r, quick ? 1800 : 2600);
    });
    Promise.all([minWait, loaded]).then(() => {
      gsap.timeline({ onComplete: () => { loader.remove(); if (lenis) lenis.start(); } })
        .to(loader.children, { opacity: 0, y: -24, duration: quick ? 0.2 : 0.35, ease: "power2.in", stagger: 0.05 })
        .to(loader, { clipPath: "inset(0 0 100% 0)", duration: quick ? 0.6 : 0.9, ease: "power4.inOut" }, "-=0.05")
        .add(playIntro, "-=0.45");
    });
  } else playIntro();

  /* eyebrows slide in */
  $$(".eyebrow").forEach((eb) => gsap.fromTo(eb, { opacity: 0, x: -28 }, { opacity: 1, x: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: eb, start: "top 92%", once: true } }));

  /* hero parallax on scroll */
  gsap.to(".hero .aurora", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-stage", { yPercent: -10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* counters */
  counters.forEach((c) => {
    const end = Number(c.dataset.count);
    const o = { v: 0 };
    c.textContent = "0";
    ScrollTrigger.create({
      trigger: c, start: "top 90%", once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: "power3.out", onUpdate: () => { c.textContent = Math.round(o.v); } })
    });
  });
  gsap.fromTo(".stat", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", clearProps: "transform", scrollTrigger: { trigger: ".stats", start: "top 85%", once: true } });

  /* marquee: speeds up with scroll velocity */
  const marquees = $$(".marquee").map((m) => ({ anim: (m.getAnimations()[0]) || null }));
  let rate = 1;
  gsap.ticker.add(() => {
    const v = lenis ? Math.abs(lenis.velocity) : 0;
    const target = 1 + Math.min(v * 0.35, 7);
    rate += (target - rate) * 0.08;
    marquees.forEach((m) => { if (m.anim) m.anim.playbackRate = rate; });
  });
  gsap.fromTo(".band-mint", { xPercent: -3 }, { xPercent: 3, ease: "none", scrollTrigger: { trigger: ".bands", start: "top bottom", end: "bottom top", scrub: true } });

  /* generic stagger-in for blocks (not the pinned track) */
  const reveal = (sel, opts = {}) => {
    const els = $$(sel);
    if (!els.length) return;
    gsap.set(els, { opacity: 0, y: opts.y ?? 36 });
    ScrollTrigger.batch(els, {
      start: "top 90%", once: true,
      onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.1, clearProps: "opacity,transform" })
    });
  };
  reveal(".service-primary .service");
  reveal(".service-secondary article", { y: 24 });
  reveal(".offers");
  reveal(".fit-grid > *");
  reveal(".principles li", { y: 28 });
  reveal(".disciplines article", { y: 28 });
  reveal(".people .person", { y: 28 });
  reveal(".index-wrap");
  reveal(".process-intro > *:not(h2):not(.eyebrow)", { y: 24 });
  reveal(".gates header > *", { y: 24 });
  reveal(".contact-copy > *:not(h2):not(.eyebrow)", { y: 24 });
  reveal(".brief");

  /* the route items keep their dimming via .is-lit, so restore after reveal */
  /* pinned horizontal work showcase (desktop only) */
  /* project plates draw themselves in, line by line */
  const prepPlate = (svg) => {
    const shapes = $$("path, rect, circle, ellipse, line, polyline, polygon", svg).filter((el) => {
      if (el.hasAttribute("stroke-dasharray") || typeof el.getTotalLength !== "function") return false;
      const cs = getComputedStyle(el);
      return cs.stroke !== "none" && parseFloat(cs.strokeWidth) > 0;
    });
    shapes.forEach((el) => {
      const len = Math.ceil(el.getTotalLength()) + 2;
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
    });
    const fills = $$(".p-solid, .p-dot", svg);
    const tl = gsap.timeline({ paused: true });
    if (shapes.length) tl.to(shapes, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut", stagger: 0.025 });
    if (fills.length) { gsap.set(fills, { opacity: 0 }); tl.to(fills, { opacity: 1, duration: 0.6, stagger: 0.06 }, "-=0.7"); }
    return tl;
  };
  const plateTl = new Map();
  $$(".htrack .project").forEach((card) => {
    const svg = $(".plate", card);
    if (svg) plateTl.set(card, prepPlate(svg));
  });
  const drawCard = (card) => { const tl = plateTl.get(card); if (tl) tl.play(); };

  const mm = gsap.matchMedia();
  const workSec = $("#work");
  const hpin = $("#hpin");
  const track = $("#htrack");
  const hprog = $("#hprog i");
  mm.add("(min-width: 1024px) and (min-height: 700px)", () => {
    workSec.classList.add("is-pinned");
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, { x: () => -dist(), ease: "none" });
    ScrollTrigger.create({
      trigger: hpin, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.6, animation: tween,
      anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: (st) => { hprog.style.transform = `scaleX(${st.progress})`; }
    });
    // cards lift as they enter the viewport from the right
    $$(".project", track).forEach((card) => {
      if (card.offsetLeft < window.innerWidth * 0.8) {
        ScrollTrigger.create({ trigger: hpin, start: "top 70%", once: true, onEnter: () => drawCard(card) });
      } else {
        ScrollTrigger.create({ trigger: card, containerAnimation: tween, start: "left 82%", once: true, onEnter: () => drawCard(card) });
      }
      gsap.fromTo(card, { opacity: 0.35, scale: 0.94 }, {
        opacity: 1, scale: 1, ease: "none",
        scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 96%", end: "left 62%", scrub: true }
      });
    });
    return () => { workSec.classList.remove("is-pinned"); hprog.style.transform = ""; };
  });
  mm.add("(max-width: 1023px), (max-height: 699px)", () => {
    reveal(".htrack .project", { y: 40 });
    $$(".htrack .project").forEach((card) => ScrollTrigger.create({ trigger: card, start: "top 78%", once: true, onEnter: () => drawCard(card) }));
  });

  /* pointer effects */
  if (fine) {
    // spotlight on .glow cards
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest && e.target.closest(".glow");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px");
      el.style.setProperty("--my", e.clientY - r.top + "px");
    }, { passive: true });

    // page cursor glow
    const glow = $("#cursor-glow");
    const gx = gsap.quickTo(glow, "x", { duration: 0.6, ease: "power3.out" });
    const gy = gsap.quickTo(glow, "y", { duration: 0.6, ease: "power3.out" });
    window.addEventListener("pointermove", (e) => { glow.classList.add("on"); gx(e.clientX); gy(e.clientY); }, { passive: true });
    document.addEventListener("pointerleave", () => glow.classList.remove("on"));

    // hero demo cards drift with the pointer, at different depths
    const heroEl = $("#top");
    const floats = $$(".float").map((el) => ({
      d: Number(el.dataset.depth) || 1,
      x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power3.out" })
    }));
    heroEl.addEventListener("pointermove", (e) => {
      const r = heroEl.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      floats.forEach((f) => { f.x(nx * 34 * f.d); f.y(ny * 26 * f.d); });
    });
    heroEl.addEventListener("pointerleave", () => floats.forEach((f) => { f.x(0); f.y(0); }));

    // tilt on service cards
    $$(".service").forEach((card) => {
      const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
      const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 8);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
      });
      card.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });

    // magnetic buttons
    $$(".btn-primary, .btn-ghost").forEach((b) => {
      const bx = gsap.quickTo(b, "x", { duration: 0.4, ease: "power3.out" });
      const by = gsap.quickTo(b, "y", { duration: 0.4, ease: "power3.out" });
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        bx((e.clientX - (r.left + r.width / 2)) * 0.25);
        by((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      b.addEventListener("pointerleave", () => { bx(0); by(0); });
    });
  }

  /* giant footer wordmark rises */
  gsap.fromTo(".mega", { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".site-footer", start: "top bottom", end: "bottom bottom", scrub: true } });

  window.addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
