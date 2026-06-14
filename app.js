/* ============================================================
   Career Launch Academy — shared scripts
   ============================================================ */

/* ---- Citations registry: single source of truth ----
   Every source chip on the site pulls from here, so dates and
   attributions stay consistent and maintainable. */
const CITATIONS = {
  ladders: {
    label: "Ladders eye-tracking study",
    detail: "Ladders Inc., 2012 & 2018 — eye-tracking, 30 recruiters",
    url: "https://www.hrdive.com/news/eye-tracking-study-shows-recruiters-look-at-resumes-for-7-seconds/541582/"
  },
  resumego: {
    label: "ResumeGo recruiter survey",
    detail: "ResumeGo, 2024 — recruiter survey",
    url: "https://standout-cv.com/stats/how-long-recruiters-spend-looking-at-cv"
  },
  tegze: {
    label: "Tegze independent study",
    detail: "Jan Tegze — 114 recruiters, real CVs",
    url: "https://standout-cv.com/stats/how-long-recruiters-spend-looking-at-cv"
  },
  enhancv: {
    label: "Enhancv recruiter study",
    detail: "Enhancv, 2025 — interviews with 25 US recruiters",
    url: "https://hr-gazette.com/debunking-the-ats-rejection-myth/"
  },
  itbrief: {
    label: "Enhancv / ITBrief",
    detail: "ITBrief, 2025 — reporting on Enhancv study",
    url: "https://itbrief.co.uk/story/study-reveals-ats-rarely-auto-rejects-cvs-debunks-75-myth"
  },
  interviewguys: {
    label: "The Interview Guys investigation",
    detail: "The Interview Guys, 2025 — Preptel origin of the 75% claim",
    url: "https://blog.theinterviewguys.com/ats-resume-rejection-myth/"
  },
  bu: {
    label: "Boston University / Ladders",
    detail: "Ladders eye-tracking report (hosted by BU)",
    url: "https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf"
  },
  jobcannon: {
    label: "JobCannon AI resume stats",
    detail: "JobCannon, 2026 — verified AI/ATS statistics",
    url: "https://jobcannon.io/blog/ai-resume-statistics-2026"
  }
};

/* Render the full source list into any [data-sources] container */
function renderSourceList() {
  document.querySelectorAll("[data-sources]").forEach(el => {
    const items = Object.values(CITATIONS).map(c =>
      `<a href="${c.url}" target="_blank" rel="noopener">${c.label} <span class="muted" style="font-size:.85em">— ${c.detail}</span></a>`
    ).join("");
    el.innerHTML = items;
  });
}

/* ---- Mobile nav ---- */
function initNav() {
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelector(".nav__links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  links.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
}

/* ---- Scroll reveal (respects reduced motion; fails safe) ---- */
function initReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Only now that JS is running do we allow the hidden start-state.
  document.documentElement.classList.add("js-reveal");

  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(i => i.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });
  items.forEach(i => io.observe(i));

  // Safety net: reveal anything still hidden shortly after load so content
  // is never stuck (observer quirks, slow paint, print, off-screen at load).
  setTimeout(() => items.forEach(i => i.classList.add("is-visible")), 1200);
}

/* ---- Set current-year + last-reviewed stamps ---- */
function initStamps() {
  const now = new Date();
  const fmt = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  document.querySelectorAll("[data-reviewed]").forEach(el => el.textContent = fmt);
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = now.getFullYear());
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initReveal();
  initStamps();
  renderSourceList();
});
