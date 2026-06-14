/* ============================================================
   Resource Directory — honest, non-promotional guidance.
   Lives in the Truth & Resources hub. No affiliate links,
   no rankings-for-pay. Just what each tool is for and whether
   it's worth your money. Prices are as of mid-2026 and change —
   always verify at the source.
   ============================================================ */

const FREE_RESOURCES = {
  "Job boards & search": [
    { name:"LinkedIn", purpose:"The default professional network and job board; also where recruiters search for you.",
      pro:"Huge reach; recruiters actively source here; easy apply.", con:"Easy-apply roles are crowded; volume is brutal.",
      use:"Keep your profile sharp (see Profile & Presence) and use it for networking, not just applying." },
    { name:"Indeed", purpose:"The largest general job aggregator across industries and levels.",
      pro:"Enormous volume; broad coverage.", con:"Lots of duplicate and stale postings; high competition.",
      use:"Set focused alerts rather than scrolling endlessly." },
    { name:"Google Jobs", purpose:"Aggregates postings from across the web into search results.",
      pro:"Pulls from many sources at once; fast.", con:"Sends you off-site to apply; coverage varies.",
      use:"A quick way to scan everything in one query." },
    { name:"Glassdoor", purpose:"Jobs plus company reviews, salary data, and interview reports.",
      pro:"Reviews and salary ranges help you vet employers.", con:"Reviews skew toward extremes; data can be dated.",
      use:"Use the reviews and interview Q&A to prep, not just to apply." },
    { name:"ZipRecruiter", purpose:"Job board that matches and distributes your application to many roles.",
      pro:"Fast matching; mobile-friendly.", con:"Can feel spammy; quality varies by field.",
      use:"Good for casting a wide early net." }
  ],
  "Remote-focused": [
    { name:"Wellfound", purpose:"Startup-focused jobs (formerly AngelList Talent), many remote.",
      pro:"Direct access to startups; salary/equity shown up front.", con:"Startup risk; fewer senior corporate roles.",
      use:"Best if you want startup or early-stage roles." },
    { name:"We Work Remotely", purpose:"One of the largest remote-only job boards.",
      pro:"Curated remote roles; no on-site noise.", con:"High competition; skews tech/marketing.",
      use:"A focused remote board beats filtering a giant aggregator." },
    { name:"Remote OK", purpose:"Remote-only listings across tech, design, marketing, and support.",
      pro:"Clean, remote-first; tags by skill.", con:"Tech-heavy; some reposts.",
      use:"Pair with We Work Remotely for remote coverage." }
  ],
  "Specialized": [
    { name:"USAJobs", purpose:"The official federal government job portal.",
      pro:"The only place for most federal roles; veteran preference applies.", con:"Long applications; rigid process.",
      use:"Read our Federal jobs guide first — the resume rules are different." },
    { name:"ClearanceJobs", purpose:"Roles requiring an active U.S. security clearance.",
      pro:"Your clearance is a premium asset here.", con:"Only relevant if you hold (or held) a clearance.",
      use:"Essential for cleared candidates leaving the military or gov." },
    { name:"Hiring Our Heroes", purpose:"Military transition programs, hiring events, and fellowships.",
      pro:"Built for the veteran transition specifically.", con:"Program-based; timing matters.",
      use:"Pair with SkillBridge in the Veteran Transition Hub." },
    { name:"Handshake", purpose:"Early-career and university recruiting platform.",
      pro:"Built for students and new grads; employers expect less experience.", con:"Limited once you're a few years out.",
      use:"The first stop for current students and recent graduates." },
    { name:"Built In", purpose:"Tech-company jobs organized by major city tech hubs.",
      pro:"Strong for tech roles; good company profiles.", con:"Tech-focused; city-centric.",
      use:"Good for tech roles in a specific metro." }
  ],
  "Research & salary": [
    { name:"Levels.fyi", purpose:"Crowd-sourced compensation data, strongest for tech.",
      pro:"Detailed, level-by-level pay data for negotiation.", con:"Best coverage is tech; thinner elsewhere.",
      use:"Anchor your salary ask with real numbers (see Salary negotiation)." },
    { name:"Blind / TeamBlind", purpose:"Anonymous professional community for company-insider takes.",
      pro:"Candid insider perspective on culture and pay.", con:"Anonymous means unverified and often negative-skewed.",
      use:"A gut-check, not gospel — weigh it accordingly." }
  ]
};

const PAID_RESOURCES = [
  { name:"LinkedIn Premium (Career)", cost:"~$30–40/mo (≈$240/yr); LinkedIn is mid-rollout of a price increase",
    purpose:"Adds InMail to message recruiters, applicant insights, who-viewed-you, and bundled LinkedIn Learning.",
    verdict:"Worth a month or two only during an active, intensive search — the InMail and applicant insights can help. The free profile does most of the real work. Cancel between searches." },
  { name:"Jobscan", cost:"~$50/mo, ~$90/quarter, ~$300/yr; free tier = 5 scans/mo",
    purpose:"Compares your resume to a job description and returns a keyword 'match score' plus formatting checks.",
    verdict:"The keyword-gap feedback is genuinely useful; the match score is not hiring science. Remember an ATS doesn't auto-reject below a score — that's the very myth this category's marketing leans on. The free tier covers selective applying; cheaper tools do the core check." },
  { name:"Teal (Teal+)", cost:"Free tier is generous; Teal+ ~$9/wk or ~$30/mo (opt-in, no surprise renewals)",
    purpose:"Resume builder, job tracker, and application manager with keyword matching.",
    verdict:"The free plan alone (unlimited resumes, job tracking) is one of the best free tools here. Upgrade only if you want unlimited advanced analysis during a heavy search." },
  { name:"Resume Worded", cost:"~$19/mo",
    purpose:"Line-by-line resume and LinkedIn feedback against general best practices.",
    verdict:"Reasonable for structured resume feedback at a lower price than Jobscan — but our free Resume Lab scorer covers the same fundamentals (quantified impact, verbs, sections)." },
  { name:"TopResume & professional writers", cost:"Varies widely; often $150–500+ for a rewrite",
    purpose:"A human writes or rewrites your resume.",
    verdict:"Only worth it if you genuinely can't get your own accomplishments onto the page. Most people get more from learning the pattern (Resume Lab) than from outsourcing it once." },
  { name:"Interview practice (Interviewing.io, Pramp, etc.)", cost:"Free peer options exist; paid mock interviews can run $100–300+ per session",
    purpose:"Live mock interviews, often technical, sometimes with real interviewers.",
    verdict:"High-value if you face a tough technical loop and want live reps. For behavioral prep, our STAR trainer plus a friend covers most of it for free." }
];

function renderResourceDirectory() {
  const wrap = document.getElementById("resource-directory");
  if (!wrap) return;
  const toggle = wrap.querySelector(".res-toggle");
  const panel = wrap.querySelector("[data-res-panel]");

  function freeHTML() {
    return Object.entries(FREE_RESOURCES).map(([group, items]) => `
      <div class="res-group-label">${group}</div>
      <div class="res-grid">
        ${items.map(r => `
          <div class="res-card">
            <div class="res-card__head">
              <span class="res-card__name">${r.name}</span>
              <span class="res-card__cost res-card__cost--free">Free</span>
            </div>
            <p class="res-card__purpose">${r.purpose}</p>
            <div class="res-card__row res-card__row--pro"><span class="lbl">Pro</span><span>${r.pro}</span></div>
            <div class="res-card__row res-card__row--con"><span class="lbl">Con</span><span>${r.con}</span></div>
            <div class="res-card__row res-card__row--use"><span class="lbl">Use</span><span>${r.use}</span></div>
          </div>`).join("")}
      </div>`).join("");
  }

  function paidHTML() {
    return `
      <div class="res-group-label">Paid tools — is it worth it?</div>
      <div class="res-grid">
        ${PAID_RESOURCES.map(r => `
          <div class="res-card">
            <div class="res-card__head">
              <span class="res-card__name">${r.name}</span>
              <span class="res-card__cost res-card__cost--paid">Paid</span>
            </div>
            <p class="res-card__purpose"><b>${r.cost}.</b> ${r.purpose}</p>
            <div class="res-verdict"><b>Worth it?</b> ${r.verdict}</div>
          </div>`).join("")}
      </div>
      <p class="note" style="margin-top:1rem">Prices are as of mid-2026 and change often — verify at the source. We earn nothing from these listings; several paid tools sell against an ATS fear the research doesn't support, so we list them with that context, not a referral link.</p>`;
  }

  function show(which) {
    panel.innerHTML = which === "paid" ? paidHTML() : freeHTML();
    toggle.querySelectorAll("button").forEach(b =>
      b.setAttribute("aria-selected", b.dataset.res === which ? "true" : "false"));
  }
  toggle.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b) show(b.dataset.res);
  });
  show("free");
}

document.addEventListener("DOMContentLoaded", renderResourceDirectory);
