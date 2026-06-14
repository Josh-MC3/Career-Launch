/* ============================================================
   Interview Center — STAR trainer + question bank
   Runs entirely in the browser. Drafts saved to localStorage.
   ============================================================ */

/* ---- STAR trainer: a model answer per competency, plus a scaffold ---- */
const STAR_EXAMPLES = {
  leadership: {
    label: "Leadership",
    prompt: "Tell me about a time you led a team through a difficult situation.",
    s: "My team inherited a behind-schedule product launch with low morale after a reorg.",
    t: "As the new lead, I had to rebuild momentum and ship within the quarter.",
    a: "I reset priorities to the three features that mattered, ran short daily check-ins to unblock people fast, and shielded the team from churn above us.",
    r: "We shipped on time, and two team members later told me it was the project that rebuilt their confidence."
  },
  conflict: {
    label: "Conflict",
    prompt: "Describe a conflict with a coworker and how you handled it.",
    s: "A peer and I disagreed sharply on whether to rebuild or patch a failing system.",
    t: "We had to land on one approach without poisoning the working relationship.",
    a: "I asked to hear his reasoning in full, mapped both options against cost and risk on a shared doc, and we let the data decide rather than rank or volume.",
    r: "We chose a phased rebuild, shipped it together, and worked better as a pair afterward."
  },
  failure: {
    label: "Failure",
    prompt: "Tell me about a time you failed.",
    s: "I owned a launch that missed its date because I underestimated a vendor dependency.",
    t: "I had to limit the damage and make sure it didn't recur.",
    a: "I told stakeholders early with a revised plan, renegotiated the vendor timeline, and added a dependency-risk step to our intake process.",
    r: "We shipped three weeks late but with no surprises, and the new step caught two future risks before they bit."
  },
  ambiguity: {
    label: "Ambiguity",
    prompt: "Describe a time you had to act without clear direction.",
    s: "Leadership asked us to 'improve retention' with no target, owner, or starting point.",
    t: "I needed to turn a vague mandate into something the team could actually execute.",
    a: "I pulled the churn data, found the biggest drop-off point, set a concrete goal around it, and proposed a focused fix rather than waiting for perfect clarity.",
    r: "We cut early-stage churn 12% in a quarter, and the approach became the template for ambiguous asks."
  },
  impact: {
    label: "Measurable impact",
    prompt: "Tell me about an accomplishment you're proud of.",
    s: "Our order-processing was slow and error-prone, costing us customers.",
    t: "I wanted to fix throughput without adding headcount.",
    a: "I mapped the workflow, found the two manual steps causing most delays, and automated them with a simple internal tool.",
    r: "Processing time dropped 22% and error rates halved — and it scaled with no new hires."
  }
};

const STAR_LS = "cla_star_drafts_v1";

function loadStarDrafts() {
  try { return JSON.parse(localStorage.getItem(STAR_LS) || "{}"); } catch(e){ return {}; }
}
function saveStarDrafts(d) {
  try { localStorage.setItem(STAR_LS, JSON.stringify(d)); } catch(e){}
}

function initStarTrainer() {
  const root = document.getElementById("star-trainer");
  if (!root) return;
  const tabs = root.querySelector(".star__tabs");
  const promptEl = root.querySelector("[data-star-prompt]");
  const grid = root.querySelector("[data-star-grid]");
  const fields = root.querySelector("[data-star-fields]");
  const keys = Object.keys(STAR_EXAMPLES);
  let drafts = loadStarDrafts();

  tabs.innerHTML = keys.map((k,i) =>
    `<button class="star-tab" role="tab" data-key="${k}" aria-selected="${i===0}">${STAR_EXAMPLES[k].label}</button>`
  ).join("");

  const ROWS = [["s","Situation"],["t","Task"],["a","Action"],["r","Result"]];

  function render(key) {
    const ex = STAR_EXAMPLES[key];
    promptEl.innerHTML = `Model question: <span>“${ex.prompt}”</span>`;
    grid.innerHTML = ROWS.map(([k,name]) => `
      <div class="star-row star-row--${k}">
        <div class="star-letter">${k.toUpperCase()}</div>
        <div>
          <span class="star-row__k">${name}</span>
          <span class="star-row__text">${ex[k]}</span>
        </div>
      </div>`).join("");

    const saved = drafts[key] || {};
    fields.innerHTML = ROWS.map(([k,name]) => `
      <div class="star-field">
        <label for="sf-${k}">Your ${name}</label>
        <textarea id="sf-${k}" data-field="${k}" placeholder="Write your own ${name.toLowerCase()}…">${saved[k] ? saved[k].replace(/</g,"&lt;") : ""}</textarea>
      </div>`).join("");

    fields.querySelectorAll("textarea").forEach(ta => {
      ta.addEventListener("input", () => {
        drafts[key] = drafts[key] || {};
        drafts[key][ta.dataset.field] = ta.value;
        saveStarDrafts(drafts);
      });
    });

    tabs.querySelectorAll(".star-tab").forEach(t =>
      t.setAttribute("aria-selected", t.dataset.key === key ? "true" : "false"));
  }

  tabs.addEventListener("click", e => {
    const b = e.target.closest(".star-tab");
    if (b) render(b.dataset.key);
  });
  render(keys[0]);
}

/* ---- Question bank: filterable, with "what they're really asking" ---- */
const QUESTIONS_BANK = [
  { cat:"All-purpose", q:"Tell me about yourself.", sub:"They want a 60-second relevant arc, not your life story. Present → past proof → why this role." },
  { cat:"All-purpose", q:"Why do you want to leave your current job?", sub:"They're scanning for red flags. Stay forward-looking; never bitter about a past employer." },
  { cat:"All-purpose", q:"What's your greatest weakness?", sub:"They want self-awareness plus a fix — not a humblebrag and not a real confession." },
  { cat:"All-purpose", q:"Why do you want to work here?", sub:"They're testing whether you researched them. Name something specific to the company, not generic praise." },
  { cat:"All-purpose", q:"Where do you see yourself in five years?", sub:"They're checking fit and ambition. Show direction that's plausible in this role." },
  { cat:"All-purpose", q:"Do you have any questions for us?", sub:"Never say no. Thoughtful questions read as genuine interest and preparation." },

  { cat:"Leadership", q:"Tell me about a time you led without formal authority.", sub:"They want influence, not a title. Show how you moved people who didn't report to you." },
  { cat:"Leadership", q:"How do you handle an underperforming team member?", sub:"They're checking for directness plus care — diagnosis, support, and a clear bar." },
  { cat:"Leadership", q:"Describe leading a team through a major change.", sub:"They want to see you absorb uncertainty and keep a team steady and shipping." },
  { cat:"Leadership", q:"How do you give difficult feedback?", sub:"They want specifics and timeliness, not 'I'm just honest.' Show a real example." },

  { cat:"Management", q:"How do you prioritize when everything is urgent?", sub:"They want a framework — impact vs. effort, or tied to a goal — not 'I work hard.'" },
  { cat:"Management", q:"How do you delegate?", sub:"They're checking that you scale through others and don't bottleneck the team." },
  { cat:"Management", q:"Tell me about a time you missed a target.", sub:"They want ownership and what you changed, not blame shifted to circumstances." },
  { cat:"Management", q:"How do you run a one-on-one?", sub:"They want evidence you develop people, not just track tasks." },

  { cat:"Entry-level", q:"Walk me through a project you're proud of.", sub:"Internships and coursework count. Lead with what changed because of your work." },
  { cat:"Entry-level", q:"How do you handle feedback?", sub:"They're de-risking coachability. Show you act on it, with an example." },
  { cat:"Entry-level", q:"Tell me about a time you worked on a team.", sub:"They want your specific contribution, not 'we' for everything." },
  { cat:"Entry-level", q:"Why this field?", sub:"They want genuine motivation that will survive the hard early months." },

  { cat:"Project Management", q:"How do you keep a project on track?", sub:"They want concrete mechanisms — intake, status, risk — and a number you can point to." },
  { cat:"Project Management", q:"Tell me about a project that went off the rails.", sub:"They want how you detected it early and recovered, not that it never happens." },
  { cat:"Project Management", q:"How do you manage stakeholders who disagree?", sub:"They want alignment skills — surfacing trade-offs and driving a decision." },
  { cat:"Project Management", q:"How do you handle scope creep?", sub:"They want a process answer: change control, cost-in-days, re-prioritization." },

  { cat:"Remote Work", q:"How do you stay productive without supervision?", sub:"They're de-risking the remote bet. Show systems and outcomes, not 'I'm disciplined.'" },
  { cat:"Remote Work", q:"How do you communicate across time zones?", sub:"They want async habits — clear writing, documentation, respect for handoffs." },
  { cat:"Remote Work", q:"How do you build relationships on a distributed team?", sub:"They want intentional connection, since it won't happen by hallway accident." },
  { cat:"Remote Work", q:"How do you handle a problem when no one's online?", sub:"They want judgment and initiative under genuine independence." },

  { cat:"Veteran Hiring", q:"How does your military experience apply to this role?", sub:"Translate to their language — leadership, logistics, performing under pressure. Drop the acronyms." },
  { cat:"Veteran Hiring", q:"How will you adjust to a civilian workplace?", sub:"They may worry about culture fit. Show adaptability and what you've already learned." },
  { cat:"Veteran Hiring", q:"Tell me about leading under pressure.", sub:"A genuine strength — make the stakes legible to a civilian without jargon." },
  { cat:"Veteran Hiring", q:"What does teamwork mean to you?", sub:"Connect service teamwork to business outcomes they care about." }
];

function initQuestionBank() {
  const filtersEl = document.getElementById("qbank-filters");
  const listEl = document.getElementById("qbank-list");
  const countEl = document.getElementById("qbank-count");
  if (!filtersEl || !listEl) return;

  const cats = ["All", ...Array.from(new Set(QUESTIONS_BANK.map(q => q.cat)))];
  filtersEl.innerHTML = cats.map((c,i) =>
    `<button class="qfilter" role="tab" data-cat="${c}" aria-selected="${i===0}">${c}</button>`
  ).join("");

  function show(cat) {
    const items = cat === "All" ? QUESTIONS_BANK : QUESTIONS_BANK.filter(q => q.cat === cat);
    countEl.textContent = `${items.length} question${items.length===1?"":"s"}${cat==="All"?"":" · "+cat}`;
    listEl.innerHTML = items.map(q => `
      <div class="qitem">
        <span class="qitem__cat">${q.cat}</span>
        <div class="qitem__q">${q.q}</div>
        <div class="qitem__sub"><b>What they're really asking:</b> ${q.sub}</div>
      </div>`).join("");
    filtersEl.querySelectorAll(".qfilter").forEach(f =>
      f.setAttribute("aria-selected", f.dataset.cat === cat ? "true" : "false"));
  }
  filtersEl.addEventListener("click", e => {
    const b = e.target.closest(".qfilter");
    if (b) show(b.dataset.cat);
  });
  show("All");
}

document.addEventListener("DOMContentLoaded", () => {
  initStarTrainer();
  initQuestionBank();
});
