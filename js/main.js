(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  /* ---------- Language: English at /, Bangla at /bn/ ---------- */
  const BN = root.lang === "bn";
  const num = (v) => (BN ? String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]) : String(v));
  // site root, so data paths (team photos) resolve from /bn/ as well
  const BASE = document.currentScript && document.currentScript.src ? new URL("../", document.currentScript.src).href : "";
  const T = BN ? {
    segments: {
      clinic: {
        today: "রোগীর সিরিয়াল, বিল আর রসিদ হাতে লেখা হয়, আর এন্ট্রিতে ভুল হয়।",
        flow: ["অ্যাপয়েন্টমেন্ট", "বিলিং", "রসিদ প্রিন্ট", "দৈনিক রিপোর্ট"],
        foot: "প্রথম প্রজেক্ট হিসেবে ভালো: রোগীর তথ্য, সেবা নির্বাচন, বিলিং, প্রিন্ট আর দৈনিক রিপোর্টসহ একটি সহজ রসিদ সিস্টেম। ডেমোতে শুধু নমুনা ডেটা ব্যবহার হয়, কখনো রোগীর আসল তথ্য নয়।"
      },
      shop: {
        today: "স্টক, বিক্রি আর কার কাছে কত বাকি, সব খাতায় লেখা থাকে।",
        flow: ["পিওএস", "ইনভেন্টরি", "ইনভয়েস", "স্টক কমার অ্যালার্ট"],
        foot: "যে অংশে আপনার প্রতিদিন সবচেয়ে বেশি সময় যায়, সেখান থেকেই শুরু করব।"
      },
      seller: {
        today: "মেসেঞ্জার আর ফর্মের অর্ডার আলাদা আলাদা জায়গায় আসে, একটা একটা করে সামলাতে হয়।",
        flow: ["অর্ডার প্যানেল", "স্ট্যাটাস আপডেট", "ইনভেন্টরি ট্র্যাকিং"],
        foot: "পেমেন্ট আর ডেলিভারি ইন্টিগ্রেশন প্রতিটি প্রোভাইডারের নিয়ম মেনে করা হয়।"
      },
      agency: {
        today: "লিড, ফলো-আপ আর বারবার করা কাজ নির্ভর করে কারো মনে রাখার ওপর।",
        flow: ["সিআরএম ওয়ার্কফ্লো", "অটোমেটেড রিমাইন্ডার", "রিপোর্টিং"],
        foot: "আপনার টিম সবচেয়ে বেশি যে ধাপগুলো বারবার করে, আগে সেগুলোর একটা ম্যাপ তৈরি করি।"
      },
      startup: {
        today: "আইডিয়া আছে, কিন্তু পুরো ইন-হাউস টিম নেই।",
        flow: ["সম্ভাব্যতা যাচাই", "এমভিপি", "ইটারেশন", "সাপোর্ট"],
        foot: "কিছু বানানোর আগে যাচাই করি আইডিয়াটা বাস্তবসম্মত কি না, তারপর এমন একটি প্রথম ভার্সন দিই যা ব্যবহারকারীদের সামনে রাখা যায়।"
      }
    },
    req: { "f-name": "আপনার নাম লিখুন।", "f-email": "উত্তর দেওয়ার জন্য একটি ইমেইল ঠিকানা দিন।", "f-problem": "কাজ বা প্রজেক্টটি সম্পর্কে একটু লিখুন।" },
    badEmail: "ইমেইল ঠিকানাটি অসম্পূর্ণ মনে হচ্ছে।",
    missing: "কিছু তথ্য বাকি আছে। চিহ্নিত ঘরগুলো দেখুন।",
    sent: (to) => `ব্রিফসহ আপনার ইমেইল অ্যাপ খুলে যাওয়ার কথা। কিছু না হলে "ব্রিফ কপি করুন" চাপুন এবং ${to} ঠিকানায় ইমেইল করুন।`,
    copied: (to) => `ব্রিফ কপি হয়েছে। ${to} ঠিকানায় একটি ইমেইলে পেস্ট করুন।`,
    subject: (n) => `প্রজেক্ট ব্রিফ: ${n}`,
    lines: { name: "নাম", email: "ইমেইল", biz: "ব্যবসা", start: "যেখান থেকে শুরু", when: "সময়সীমা বা বাজেট", problem: "যে কাজে সবচেয়ে বেশি সময় যায়, বা যা বানাতে চাই:" },
    clock: (t) => `ঢাকায় এখন সময় ${t}।`,
    locale: "bn-BD"
  } : {
    segments: {
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
    },
    req: { "f-name": "Add your name.", "f-email": "Add an email address we can reply to.", "f-problem": "Tell us a little about the task or project." },
    badEmail: "That email address looks incomplete.",
    missing: "A few details are missing. Check the highlighted fields.",
    sent: (to) => `Your email app should open with the brief ready to send. If nothing happens, use Copy brief and email ${to}.`,
    copied: (to) => `Brief copied. Paste it into an email to ${to}.`,
    subject: (n) => `Project brief from ${n}`,
    lines: { name: "Name", email: "Email", biz: "Business", start: "Starting point", when: "Timeline or budget", problem: "What takes the most time, or what I want to build:" },
    clock: (t) => `It is ${t} in Dhaka right now.`,
    locale: "en-GB"
  };
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const animate = hasGsap && !reduced;
  if (!hasGsap) root.classList.add("fallback");
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  root.classList.add("is-init");
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

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { setHeader(); updateRail(); ticking = false; });
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
  filterBtns.forEach((b) => { $(".count", b).textContent = num(rows.filter((el) => hasCat(el, b.dataset.filter)).length); });
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

  let refreshTimer;
  const refreshLater = () => {
    if (!hasGsap) return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 700);
  };

  /* ---------- Also built: compact rows that open on click ---------- */
  indexList.classList.add("ix-ready");
  rows.forEach((li, i) => {
    const btn = $(".ix-toggle", li);
    const desc = $(".ix-desc", li);
    if (!btn || !desc) return;
    desc.id = `ix-desc-${i + 1}`;
    btn.setAttribute("aria-controls", desc.id);
    const toggle = () => {
      const on = !li.classList.contains("is-open");
      li.classList.toggle("is-open", on);
      btn.setAttribute("aria-expanded", String(on));
      refreshLater();
    };
    btn.addEventListener("click", (e) => { e.stopPropagation(); toggle(); });
    li.addEventListener("click", (e) => { if (!e.target.closest("a, button")) toggle(); });
  });

  /* ---------- Expanding panels: services and selected work ---------- */
  const desktop = window.matchMedia("(min-width: 861px)");
  $$(".xp-wrap").forEach((xp) => {
    const panels = $$(".xp", xp);
    let autoOn = false, hovering = false, inView = false;

    const setWidth = () => {
      // width of an open panel, so its text never reflows while the panels resize
      const gap = parseFloat(getComputedStyle(xp).columnGap) || 12;
      const w = (xp.clientWidth - gap * (panels.length - 1)) * 5.2 / (5.2 + panels.length - 1);
      xp.style.setProperty("--xpw", Math.round(w) + "px");
    };
    const sync = () => {
      panels.forEach((p) => {
        const on = p.classList.contains("is-open");
        const hit = $(".xp-hit", p);
        hit.setAttribute("aria-expanded", String(on));
        hit.tabIndex = on && desktop.matches ? -1 : 0;
        $(".xp-body", p).inert = !on;
      });
    };
    const setOpen = (panel) => {
      if (panel && panel.classList.contains("is-open")) return;
      panels.forEach((p) => p.classList.toggle("is-open", p === panel));
      sync();
      if (panel) xp.dispatchEvent(new CustomEvent("xp:open", { detail: panel }));
      if (!desktop.matches) refreshLater();
    };
    const paint = () => {
      xp.classList.toggle("autoplay", autoOn && desktop.matches);
      xp.classList.toggle("paused", hovering || !inView);
    };
    const stopAuto = () => { autoOn = false; paint(); };

    panels.forEach((p) => {
      const hit = $(".xp-hit", p);
      hit.addEventListener("click", () => {
        stopAuto();
        if (!desktop.matches && p.classList.contains("is-open")) setOpen(null);
        else setOpen(p);
      });
      // small hover delay so sweeping the mouse across the row does not flicker every panel open
      let intent;
      p.addEventListener("pointerenter", (e) => {
        if (!desktop.matches || e.pointerType !== "mouse") return;
        intent = setTimeout(() => setOpen(p), 110);
      });
      p.addEventListener("pointerleave", () => clearTimeout(intent));
    });
    xp.addEventListener("pointerenter", () => { hovering = true; paint(); });
    xp.addEventListener("pointerleave", () => { hovering = false; paint(); });
    xp.addEventListener("animationend", (e) => {
      if (!e.target.classList.contains("xp-timer") || !autoOn) return;
      const i = panels.findIndex((p) => p.classList.contains("is-open"));
      setOpen(panels[(i + 1) % panels.length]);
    });

    if (!reduced && "IntersectionObserver" in window) {
      autoOn = true;
      new IntersectionObserver((en) => { inView = en[0].isIntersecting; paint(); }, { threshold: 0.45 }).observe(xp);
    }
    desktop.addEventListener("change", () => { sync(); paint(); setWidth(); });
    window.addEventListener("resize", setWidth);
    setWidth(); sync(); paint();
  });

  /* ---------- Compact expandable lists (team) ---------- */
  $$(".acc").forEach((list, i) => {
    list.classList.add("acc-ready");
    const items = $$(":scope > li", list);
    items.forEach((li, k) => {
      const btn = $(".acc-btn", li), body = $(".acc-body", li);
      if (!btn || !body) return;
      body.id = `acc-${i + 1}-${k + 1}`;
      btn.setAttribute("aria-controls", body.id);
      btn.addEventListener("click", () => {
        const on = !li.classList.contains("is-open");
        items.forEach((o) => {
          const open = o === li && on;
          o.classList.toggle("is-open", open);
          $(".acc-btn", o).setAttribute("aria-expanded", String(open));
        });
        refreshLater();
      });
    });
  });

  /* ---------- How we work: expanding timeline ---------- */
  const route = $("#route");
  if (route) {
    const steps = $$(":scope > li", route);
    let rAuto = false, rHover = false, rView = false;
    route.classList.add("route-ready");
    const measure = () => {
      // all steps but the open one are collapsed, so a collapsed row is just its title
      const closed = steps.find((li) => !li.classList.contains("is-open")) || steps[0];
      const h = $("h3", closed).offsetHeight;
      const bodies = steps.map((li) => $(".route-body > div", li).scrollHeight);
      const i = Math.max(0, steps.findIndex((li) => li.classList.contains("is-open")));
      const openBody = i < steps.length - 1 ? bodies[i] : 0;
      route.style.setProperty("--fill", h * i + "px");
      route.style.setProperty("--track", h * (steps.length - 1) + openBody + "px");
      // reserve the tallest state so the page below never jumps while steps change
      const minH = h * steps.length + Math.max(...bodies) + "px";
      if (route.style.minHeight !== minH) { route.style.minHeight = minH; refreshLater(); }
    };
    const setStep = (li) => {
      const idx = steps.indexOf(li);
      steps.forEach((st, k) => {
        st.classList.toggle("is-open", k === idx);
        st.classList.toggle("is-lit", k <= idx);
        $(".route-btn", st).setAttribute("aria-expanded", String(k === idx));
      });
      measure();
    };
    const paintR = () => {
      route.classList.toggle("autoplay", rAuto);
      route.classList.toggle("paused", rHover || !rView);
    };
    steps.forEach((li) => $(".route-btn", li).addEventListener("click", () => { rAuto = false; paintR(); setStep(li); }));
    route.addEventListener("pointerenter", () => { rHover = true; paintR(); });
    route.addEventListener("pointerleave", () => { rHover = false; paintR(); });
    route.addEventListener("animationend", (e) => {
      if (!e.target.classList.contains("route-timer") || !rAuto) return;
      const i = steps.findIndex((st) => st.classList.contains("is-open"));
      setStep(steps[(i + 1) % steps.length]);
    });
    if (!reduced && "IntersectionObserver" in window) {
      rAuto = true;
      new IntersectionObserver((en) => { rView = en[0].isIntersecting; paintR(); }, { threshold: 0.5 }).observe(route);
    }
    window.addEventListener("resize", measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    setStep(steps.find((st) => st.classList.contains("is-open")) || steps[0]);
    paintR();
  }

  /* ---------- Solutions explorer ---------- */
  const SEGMENTS = T.segments;
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
  const ACCENTS = ["0,235,138", "91,140,255", "214,128,200", "255,200,87"];
  const team = (Array.isArray(window.GIKPIK_TEAM) ? window.GIKPIK_TEAM : []).map((p, i) => {
    const d = BN && p.bn ? { ...p, ...p.bn } : { ...p };
    if (d.photo && BASE) d.photo = new URL(d.photo, BASE).href;
    return { ...d, ac: ACCENTS[i % ACCENTS.length] };
  });
  if (team.length) {
    const people = $("#people");
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    people.innerHTML = team.map((p) => {
      const initials = esc(p.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase());
      const avatar = p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}" width="480" height="480" loading="lazy">` : initials;
      const links = Object.entries(p.links || {}).map(([k, u]) => `<a href="${esc(u)}" rel="noopener">${esc(k.charAt(0).toUpperCase() + k.slice(1))}</a>`).join("");
      const tags = (p.tags || []).map((t) => `<li>${esc(t)}</li>`).join("");
      return `<li class="person cut glow" style="--ac:${p.ac}"><div class="avatar${p.photo ? " photo" : ""}"${p.photo ? "" : ' aria-hidden="true"'}>${avatar}</div><div class="pbody"><h3>${esc(p.name)}</h3>${p.role ? `<p class="role">${esc(p.role)}</p>` : ""}${p.blurb ? `<p class="blurb">${esc(p.blurb)}</p>` : ""}${tags ? `<ul class="tags">${tags}</ul>` : ""}${links ? `<p class="links">${links}</p>` : ""}</div></li>`;
    }).join("");
    people.hidden = false;
    const persons = $$(".person", people);
    persons.forEach((card) => {
      card.tabIndex = 0;
      const toggle = () => {
        const on = !card.classList.contains("is-open");
        persons.forEach((c) => c.classList.toggle("is-open", c === card && on));
        refreshLater();
      };
      card.addEventListener("click", (e) => { if (!e.target.closest("a")) toggle(); });
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
    });
  }

  /* ---------- Section eyebrows: 01 Services, 02 Solutions ... ---------- */
  $$("section[data-label]").forEach((sec, i) => {
    const h2 = $("h2", sec);
    if (!h2) return;
    const eb = document.createElement("p");
    eb.className = "eyebrow";
    eb.setAttribute("aria-hidden", "true");
    eb.innerHTML = `<b>${num(String(i + 1).padStart(2, "0"))}</b>${sec.dataset.label}`;
    h2.before(eb);
  });

  /* ---------- Offers fill the brief ---------- */
  const form = $("#brief");
  const select = $("#f-start");
  $$("[data-offer]").forEach((b) => {
    b.addEventListener("click", () => {
      if (Array.from(select.options).some((o) => o.value === b.dataset.offer)) select.value = b.dataset.offer;
      scrollToEl($("#contact"), 0);
      setTimeout(() => $("#f-problem").focus({ preventScroll: true }), reduced ? 0 : 1500);
    });
  });

  /* ---------- Brief: opens the visitor's email app ---------- */
  const note = $("#form-note");
  const TO = form.getAttribute("action").replace("mailto:", "");
  const required = Object.entries(T.req);
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
        span.textContent = el.type === "email" && el.value.trim() ? T.badEmail : msg;
        el.insertAdjacentElement("afterend", span);
        first = first || el;
      }
    });
    if (first) { first.focus(); note.textContent = T.missing; }
    return !first;
  };
  const brief = () => {
    const v = (id) => document.getElementById(id).value.trim();
    const L = T.lines;
    const start = select.options[select.selectedIndex] ? select.options[select.selectedIndex].text : select.value;
    return [
      `${L.name}: ${v("f-name")}`, `${L.email}: ${v("f-email")}`, `${L.biz}: ${v("f-biz") || "-"}`,
      `${L.start}: ${start}`, `${L.when}: ${v("f-when") || "-"}`, "",
      L.problem, v("f-problem")
    ].join("\n");
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    const subject = T.subject($("#f-name").value.trim());
    window.location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brief())}`;
    note.textContent = T.sent(TO);
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
    note.textContent = T.copied(TO);
  });

  /* ---------- Dhaka clock + year ---------- */
  const clock = $("#dhaka-time");
  const tick = () => {
    try {
      const t = new Intl.DateTimeFormat(T.locale, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Dhaka" }).format(new Date());
      clock.textContent = T.clock(t);
    } catch { clock.textContent = ""; }
  };
  tick(); setInterval(tick, 30000);
  $("#year").textContent = num(new Date().getFullYear());

  /* ======================================================================
     Motion
     ====================================================================== */

  /* Counters: show the real number without motion, count up with it */
  const counters = $$("[data-count]");

  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("is-init")));

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
    c.textContent = num(0);
    ScrollTrigger.create({
      trigger: c, start: "top 90%", once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: "power3.out", onUpdate: () => { c.textContent = num(Math.round(o.v)); } })
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
  reveal(".xp-svc .xp", { y: 44 });
  reveal(".offers");
  reveal(".fit-grid > *");
  reveal(".people .person", { y: 36 });
  reveal(".team-more .tm-col", { y: 28 });
  reveal(".route > li", { y: 20 });
  reveal(".index-wrap");
  reveal(".process-intro > *:not(h2):not(.eyebrow)", { y: 24 });
  reveal(".gates header > *", { y: 24 });
  reveal(".contact-copy > *:not(h2):not(.eyebrow)", { y: 24 });
  reveal(".brief");

  /* work panels: plates draw in, and redraw each time a panel opens */
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
    if (shapes.length) tl.to(shapes, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", stagger: 0.025 });
    if (fills.length) { gsap.set(fills, { opacity: 0 }); tl.to(fills, { opacity: 1, duration: 0.6, stagger: 0.06 }, "-=0.7"); }
    return tl;
  };
  const xpWrap = $("#xp");
  if (xpWrap) {
    const xpPanels = $$(".xp", xpWrap);
    const plateTl = new Map();
    xpPanels.forEach((panel) => {
      const svg = $(".plate", panel);
      if (!svg) return;
      const tl = prepPlate(svg);
      plateTl.set(panel, tl);
      if (!panel.classList.contains("is-open")) tl.progress(1); // closed panels keep their art, dimmed
    });
    const redraw = (panel) => { const tl = panel && plateTl.get(panel); if (tl) tl.restart(); };
    xpWrap.addEventListener("xp:open", (e) => redraw(e.detail));
    gsap.fromTo(xpPanels, { opacity: 0, y: 50 }, {
      opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, clearProps: "opacity,transform",
      scrollTrigger: { trigger: xpWrap, start: "top 85%", once: true, onEnter: () => redraw($(".xp.is-open", xpWrap)) }
    });
  }

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
  setTimeout(() => ScrollTrigger.refresh(), 900);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
