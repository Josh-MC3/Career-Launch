/* ============================================================
   Profile & Presence — dark studio interactions
   - Headline example swapper (6 personas)
   - Experience weak/strong toggle
   No frameworks; progressive enhancement (content is in the HTML).
   ============================================================ */

/* Headline examples, by persona. Each has a weak and a strong version. */
const HEADLINES = {
  entry: {
    label: "Entry level",
    weak: "Student at State University",
    strong: "Recent CS Graduate · Python & React · Built 3 full-stack apps · Seeking software engineering roles"
  },
  pm: {
    label: "Project Manager",
    weak: "PM at Acme Corp",
    strong: "Project Manager · Delivering complex programs on time & under budget · PMP · Cross-functional team leadership"
  },
  veteran: {
    label: "Veteran",
    weak: "Former U.S. Army",
    strong: "Operations Leader · U.S. Army Veteran · Logistics, team leadership & process improvement · Moving into supply chain"
  },
  exec: {
    label: "Executive",
    weak: "Executive",
    strong: "VP of Operations · Scaling teams & revenue in SaaS · Drove $50M+ in growth · Board advisor"
  },
  engineer: {
    label: "Engineer",
    weak: "Engineer at a manufacturing company",
    strong: "Mechanical Engineer · Product design & manufacturing · Cut production costs 22% · SolidWorks, GD&T"
  },
  remote: {
    label: "Remote worker",
    weak: "CSM, remote",
    strong: "Remote Customer Success Manager · Async communication pro · 95% retention across distributed accounts"
  }
};

function initHeadlineSwapper() {
  const root = document.getElementById("headline-swapper");
  if (!root) return;
  const tabs = root.querySelector(".swapper__tabs");
  const weakEl = root.querySelector("[data-weak]");
  const strongEl = root.querySelector("[data-strong]");
  const liveHeadline = document.querySelector("#mock-headline"); // mirror into the mock profile

  const keys = Object.keys(HEADLINES);
  tabs.innerHTML = keys.map((k, i) =>
    `<button class="swap-tab" role="tab" data-key="${k}" aria-selected="${i === 0}">${HEADLINES[k].label}</button>`
  ).join("");

  function select(key) {
    const h = HEADLINES[key];
    weakEl.textContent = h.weak;
    strongEl.textContent = h.strong;
    if (liveHeadline) liveHeadline.textContent = h.strong;
    tabs.querySelectorAll(".swap-tab").forEach(t =>
      t.setAttribute("aria-selected", t.dataset.key === key ? "true" : "false")
    );
  }
  tabs.addEventListener("click", e => {
    const btn = e.target.closest(".swap-tab");
    if (btn) select(btn.dataset.key);
  });
  select(keys[0]);
}

/* Experience weak/strong toggle */
function initExperienceToggle() {
  const root = document.getElementById("xp-toggle");
  if (!root) return;
  const sw = root.querySelector(".toggle-switch");
  const weak = root.querySelector("[data-xp-weak]");
  const strong = root.querySelector("[data-xp-strong]");

  function show(which) {
    const showStrong = which === "strong";
    strong.hidden = !showStrong;
    weak.hidden = showStrong;
    sw.querySelectorAll("button").forEach(b =>
      b.setAttribute("aria-selected", b.dataset.which === which ? "true" : "false")
    );
  }
  sw.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b) show(b.dataset.which);
  });
  show("weak");
}

document.addEventListener("DOMContentLoaded", () => {
  initHeadlineSwapper();
  initExperienceToggle();
});
