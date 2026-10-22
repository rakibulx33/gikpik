(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: solid once you leave the top ---------- */
  const header = $("#site-header");
  const setHeader = () => header.classList.toggle("is-solid", window.scrollY > 24);

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("#menu-btn");
  const nav = $("#main-nav");
  const closeMenu = () => {
    menuBtn.setAttribute("aria-expanded", "false");
    nav.dataset.open = "false";
    document.body.style.overflow = "";
  };
  menuBtn.addEventListener("click", () => {
    const open = menuBtn.getAttribute("aria-expanded") !== "true";
    menuBtn.setAttribute("aria-expanded", String(open));
    nav.dataset.open = String(open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  window.matchMedia("(min-width: 861px)").addEventListener("change", closeMenu);

  /* ---------- Altitude rail ---------- */
  const rail = $("#rail");
  const railList = $("#rail-list");
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
    const y = window.scrollY + window.innerHeight * 0.45;
    let idx = 0;
    stops.forEach((s, i) => { if (s.el.offsetTop <= y) idx = i; });
    const cur = stops[idx];
    const f = clamp((y - cur.el.offsetTop) / cur.el.offsetHeight, 0, 1);
    const p = idx >= stops.length - 1 ? 1 : (idx + f) / (stops.length - 1);
    rail.style.setProperty("--p", p.toFixed(4));
    rail.dataset.tone = cur.el.dataset.tone === "light" ? "light" : "dark";
    stops.forEach((s, i) => s.li.classList.toggle("is-on", i === idx));
  };

  /* ---------- Process route: fills as you read ---------- */
  const route = $("#route");
  const routeItems = $$("li", route);
  const updateRoute = () => {
    const vh = window.innerHeight;
    const r = route.getBoundingClientRect();
    const p = clamp((vh * 0.6 - r.top) / r.height, 0, 1);
    route.style.setProperty("--p", p.toFixed(4));
    routeItems.forEach((li) => li.classList.toggle("is-lit", li.getBoundingClientRect().top < vh * 0.6));
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      setHeader(); updateRail(); updateRoute();
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Work filters ---------- */
  const featured = $("#featured");
  const indexWrap = $("#index-wrap");
  const empty = $("#empty");
  const filterBtns = $$(".filter");
  const items = $$("[data-cat]");
  const hasCat = (el, cat) => cat === "all" || el.dataset.cat.split(" ").includes(cat);

  filterBtns.forEach((b) => {
    const n = items.filter((el) => hasCat(el, b.dataset.filter)).length;
    $(".count", b).textContent = n;
  });

  const applyFilter = (cat) => {
    let shownFeatured = 0, shownIndex = 0;
    items.forEach((el) => {
      const show = hasCat(el, cat);
      el.hidden = !show;
      if (show) (el.classList.contains("project") ? shownFeatured++ : shownIndex++);
    });
    featured.classList.toggle("is-filtered", cat !== "all");
    featured.hidden = shownFeatured === 0;
    indexWrap.hidden = shownIndex === 0;
    empty.hidden = shownFeatured + shownIndex > 0;
    filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === cat)));
  };
  filterBtns.forEach((b) => b.addEventListener("click", () => applyFilter(b.dataset.filter)));

  /* ---------- Who we help: tabs ---------- */
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
    data.flow.forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      flow.appendChild(li);
    });
    if (!reduced) {
      panel.classList.remove("swap");
      void panel.offsetWidth;
      panel.classList.add("swap");
    }
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => showSegment(t, false));
    t.addEventListener("keydown", (e) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (e.key in keys) {
        e.preventDefault();
        showSegment(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true);
      } else if (e.key === "Home") { e.preventDefault(); showSegment(tabs[0], true); }
      else if (e.key === "End") { e.preventDefault(); showSegment(tabs[tabs.length - 1], true); }
    });
  });
  showSegment(tabs[0], false);

  /* ---------- Hero mark: leans toward the pointer ---------- */
  const hero = $("#top");
  const mark = $("#mark");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine && !reduced) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      mark.style.setProperty("--ry", (nx * 12).toFixed(2) + "deg");
      mark.style.setProperty("--rx", (-ny * 9).toFixed(2) + "deg");
    });
    hero.addEventListener("pointerleave", () => {
      mark.style.setProperty("--ry", "0deg");
      mark.style.setProperty("--rx", "0deg");
    });
  }

  /* ---------- Offers fill the brief ---------- */
  const form = $("#brief");
  const select = $("#f-start");
  $$("[data-offer]").forEach((b) => {
    b.addEventListener("click", () => {
      const opt = Array.from(select.options).find((o) => o.text.startsWith(b.dataset.offer));
      if (opt) select.value = opt.value || opt.text;
      $("#contact").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      setTimeout(() => $("#f-problem").focus({ preventScroll: true }), reduced ? 0 : 650);
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
      `Name: ${v("f-name")}`,
      `Email: ${v("f-email")}`,
      `Business: ${v("f-biz") || "-"}`,
      `Starting point: ${select.value}`,
      `Timeline or budget: ${v("f-when") || "-"}`,
      "",
      "What takes the most time, or what I want to build:",
      v("f-problem")
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
    try {
      await navigator.clipboard.writeText(text);
    } catch {
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
})();
