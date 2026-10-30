/* ====== CONFIG ======
   Paste your deployed Google Apps Script Web App URL below (see README.md).
   Until you do, the form runs in demo mode: it shows the confirmation but
   does not save to Google Sheets or send the auto-reply email. */
const SHEET_WEBAPP_URL = "";

document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();

  // Mobile menu
  const toggle = document.querySelector(".nav-toggle"), nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }));
  }

  // Scroll reveal
  const targets = document.querySelectorAll(".card, .menu-card, .scroll-card, .stat, .gal-item");
  targets.forEach(t => t.classList.add("reveal"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
    targets.forEach(t => io.observe(t));
  } else targets.forEach(t => t.classList.add("in"));

  // Count-up numbers
  document.querySelectorAll(".num[data-target]").forEach(el => {
    if (el.dataset.plain) return;
    const end = +el.dataset.target, suffix = el.dataset.suffix || "";
    const run = () => { let n = 0; const step = Math.max(1, Math.ceil(end / 60));
      const t = setInterval(() => { n = Math.min(end, n + step); el.textContent = n + suffix; if (n >= end) clearInterval(t); }, 25); };
    if ("IntersectionObserver" in window) {
      const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { run(); o.disconnect(); } }); o.observe(el);
    }
  });

  // Gallery lightbox
  const lb = document.getElementById("lightbox");
  if (lb) {
    const content = document.getElementById("lb-content");
    const close = () => { lb.hidden = true; content.innerHTML = ""; };
    document.querySelectorAll(".gal-item").forEach(it => {
      const open = () => { content.innerHTML = it.innerHTML; lb.hidden = false; };
      it.addEventListener("click", open);
      it.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    lb.addEventListener("click", e => { if (e.target === lb || e.target.classList.contains("lb-close")) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  }

  // Contact form
  const form = document.getElementById("contact-form");
  if (form) {
    const params = new URLSearchParams(location.search);
    if (params.get("kit")) { const sel = form.interest; [...sel.options].forEach(o => { if (o.value.startsWith(params.get("kit"))) sel.value = o.value; }); }
    const status = document.getElementById("form-status"), btn = document.getElementById("submit-btn");
    const setErr = (n, m) => { const el = form.querySelector(`.err[data-for="${n}"]`); if (el) el.textContent = m; };
    const show = (cls, msg) => { status.className = "form-status show " + cls; status.innerHTML = msg; };

    form.addEventListener("submit", async e => {
      e.preventDefault();
      ["name", "email", "message"].forEach(n => setErr(n, ""));
      let ok = true;
      if (form.name.value.trim().length < 2) { setErr("name", "Please tell us your name."); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim())) { setErr("email", "Please enter a valid email address."); ok = false; }
      if (form.message.value.trim().length < 5) { setErr("message", "Please write a short message."); ok = false; }
      if (!ok) return;
      if (form.website.value) return; // honeypot: bots only

      const data = { name: form.name.value.trim(), email: form.email.value.trim(), phone: form.phone.value.trim(),
        interest: form.interest.value, message: form.message.value.trim(), page: location.href };
      btn.disabled = true; btn.textContent = "Sending…";
      try {
        if (SHEET_WEBAPP_URL) {
          // text/plain avoids a CORS preflight; Apps Script reads it from e.postData.contents
          await fetch(SHEET_WEBAPP_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) });
        } else {
          console.warn("Demo mode: set SHEET_WEBAPP_URL in js/main.js to save to Google Sheets.");
        }
        show("ok", `✦ Thank you, <strong>${data.name.replace(/[<>&]/g, "")}</strong>! Your message has reached our apothecary. ` +
          `A confirmation has been sent to <strong>${data.email.replace(/[<>&]/g, "")}</strong>. We’ll reply shortly.`);
        form.reset();
      } catch (err) {
        show("bad", "The raven lost its way. Please try again, or message us on WhatsApp.");
      } finally { btn.disabled = false; btn.textContent = "Send Message"; }
    });
  }
});
