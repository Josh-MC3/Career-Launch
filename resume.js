/* ============================================================
   Resume Lab — client-side scorer + example library
   Everything runs in the browser. Nothing is uploaded.
   ============================================================ */

/* ------------------------------------------------------------
   1) THE SCORER
   A transparent rubric. We deliberately DON'T pretend to be an
   "ATS scanner" (see Recruiter Truth). We check the things the
   research says actually matter to a skimming human:
   quantified impact, action verbs, length fit, clear sections,
   contact basics, and relevance signals.
   ------------------------------------------------------------ */

const ACTION_VERBS = [
  "led","built","launched","drove","grew","cut","reduced","increased","improved",
  "delivered","managed","created","designed","developed","implemented","negotiated",
  "scaled","streamlined","optimized","spearheaded","owned","shipped","mentored",
  "automated","secured","generated","saved","accelerated","turned","redesigned",
  "established","coordinated","directed","executed","overhauled","transformed"
];

const WEAK_OPENERS = [
  "responsible for","duties included","tasked with","worked on","helped with",
  "in charge of","assisted with","involved in","participated in","handled"
];

const SECTION_HINTS = {
  experience: ["experience","employment","work history","professional experience"],
  education:  ["education","degree","university","college","b.s.","b.a.","bachelor","master","mba"],
  skills:     ["skills","technical skills","core competencies","proficiencies"],
  summary:    ["summary","profile","objective","about"]
};

function countMatches(text, list) {
  const lower = text.toLowerCase();
  return list.reduce((n, term) => n + (lower.includes(term) ? 1 : 0), 0);
}

function scoreResume(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = text.toLowerCase();
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);

  const checks = [];

  // 1. Quantified impact — numbers, %, $, time
  const numberHits = (text.match(/\b\d[\d,.]*\s?%|\$\s?\d|\b\d{2,}\b|\b\d+\s?(?:x|hours?|days?|weeks?|months?|years?|people|users?|clients?|customers?)\b/gi) || []).length;
  if (numberHits >= 5) checks.push(["Quantified impact", "good", 20, `${numberHits} quantified results — strong. Numbers turn claims into evidence.`]);
  else if (numberHits >= 2) checks.push(["Quantified impact", "ok", 12, `${numberHits} numbers found. Add more — aim for a metric on most bullets.`]);
  else checks.push(["Quantified impact", "bad", 3, "Almost no numbers. This is the #1 fix: quantify outcomes (%, $, time, scale)."]);

  // 2. Action verbs vs weak openers
  const verbHits = countMatches(lower, ACTION_VERBS);
  const weakHits = countMatches(lower, WEAK_OPENERS);
  if (verbHits >= 5 && weakHits <= 1) checks.push(["Action verbs", "good", 18, `Strong, active phrasing (${verbHits} action verbs). Keep leading bullets with verbs.`]);
  else if (weakHits >= 2) checks.push(["Action verbs", "bad", 5, `Found ${weakHits} weak openers like "responsible for." Replace with action verbs + a result.`]);
  else checks.push(["Action verbs", "ok", 11, "Some active phrasing. Lead every bullet with a strong verb."]);

  // 3. Length fit
  let lengthScore, lengthState, lengthMsg;
  if (wordCount < 150) { lengthState="bad"; lengthScore=5; lengthMsg=`Only ~${wordCount} words. This reads as thin — add accomplishment bullets with detail.`; }
  else if (wordCount <= 900) { lengthState="good"; lengthScore=16; lengthMsg=`~${wordCount} words — a healthy one-page-ish length for most candidates.`; }
  else if (wordCount <= 1400) { lengthState="ok"; lengthScore=11; lengthMsg=`~${wordCount} words — fine for 10+ years of relevant history; trim if you're earlier-career.`; }
  else { lengthState="bad"; lengthScore=6; lengthMsg=`~${wordCount} words is long. Unless this is a federal or academic CV, cut to the most relevant.`; }
  checks.push(["Length fit", lengthState, lengthScore, lengthMsg]);

  // 4. Clear sections
  const sectionsFound = Object.keys(SECTION_HINTS).filter(k => countMatches(lower, SECTION_HINTS[k]) > 0);
  if (sectionsFound.length >= 3) checks.push(["Clear sections", "good", 16, `Found ${sectionsFound.join(", ")}. Clear headings help recruiters skim.`]);
  else if (sectionsFound.length === 2) checks.push(["Clear sections", "ok", 10, `Found ${sectionsFound.join(", ")}. Add clear headings for any missing sections.`]);
  else checks.push(["Clear sections", "bad", 4, "Few clear section headings detected. Use Experience / Education / Skills headings."]);

  // 5. Contact basics
  const hasEmail = /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/.test(text);
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(text);
  const hasLink = /(linkedin\.com|github\.com|http|\.io|\.dev|portfolio)/i.test(text);
  const contactBits = [hasEmail, hasPhone, hasLink].filter(Boolean).length;
  if (contactBits >= 2) checks.push(["Contact basics", "good", 10, "Contact details present. Make sure they're at the top and current."]);
  else checks.push(["Contact basics", "ok", 4, "Add clear contact info: email, phone, and a LinkedIn/portfolio link."]);

  // 6. Bullet structure
  const bulletLines = lines.filter(l => /^[-•*▪◦·]|^\d+\./.test(l)).length;
  if (bulletLines >= 4) checks.push(["Bullet structure", "good", 10, `${bulletLines} bullet lines — bulleted accomplishments outperform paragraphs.`]);
  else if (bulletLines >= 1) checks.push(["Bullet structure", "ok", 6, "Some bullets. Convert dense paragraphs into scannable bullets."]);
  else checks.push(["Bullet structure", "ok", 5, "No clear bullets detected (paste may have stripped them). Use bullets for accomplishments."]);

  // 7. Filler / cliché check
  const cliches = ["team player","hard worker","go-getter","results-driven","detail-oriented","think outside the box","self-starter","synergy","fast learner"];
  const clicheHits = countMatches(lower, cliches);
  if (clicheHits === 0) checks.push(["Specificity", "good", 10, "No empty clichés — good. Specifics beat buzzwords."]);
  else checks.push(["Specificity", "ok", 5, `Found ${clicheHits} cliché(s) like "team player." Replace with a specific proof point.`]);

  const total = checks.reduce((s, c) => s + c[2], 0);
  const max = 20+18+16+16+10+10+10; // 100
  const pct = Math.round(total / max * 100);

  let verdict;
  if (pct >= 80) verdict = { label: "Strong", tone: "good", note: "This resume does the fundamentals well. Polish the weakest area below and tailor it per role." };
  else if (pct >= 60) verdict = { label: "Solid, with gaps", tone: "ok", note: "A decent base. The fixes below are where the easy points are." };
  else verdict = { label: "Needs work", tone: "bad", note: "There's real upside here. Start at the top of the fix list — quantified impact usually moves the needle most." };

  return { pct, verdict, checks };
}

function renderScore(result) {
  const out = document.getElementById("score-output");
  if (!out) return;
  const { pct, verdict, checks } = result;
  const toneColor = { good: "var(--success)", ok: "#B8860B", bad: "var(--warning)" };

  out.innerHTML = `
    <div class="score-head score-head--${verdict.tone}">
      <div class="score-dial" style="--p:${pct}">
        <span class="score-dial__num">${pct}</span>
      </div>
      <div>
        <div class="score-verdict">${verdict.label}</div>
        <p class="score-note">${verdict.note}</p>
      </div>
    </div>
    <h3 style="margin:1.5rem 0 .5rem">Your fix list, worst first</h3>
    <ul class="check-list">
      ${[...checks].sort((a,b)=>a[2]/maxFor(a[0]) - b[2]/maxFor(b[0])).map(c => `
        <li class="check check--${c[1]}">
          <span class="check__icon">${c[1]==="good"?"✓":c[1]==="ok"?"~":"✕"}</span>
          <div>
            <span class="check__name">${c[0]}</span>
            <span class="check__msg">${c[3]}</span>
          </div>
        </li>`).join("")}
    </ul>
    <p class="note" style="margin-top:1.25rem">This is a heuristic guide for a <em>skimming human</em>, not an "ATS score" — those mostly don't exist the way people claim (<a href="truth.html#ats">here's why</a>). Pasting strips formatting, so layout checks are approximate.</p>
  `;
  out.hidden = false;
  out.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// max points per check (for sorting "worst first" by ratio)
function maxFor(name){
  return { "Quantified impact":20,"Action verbs":18,"Length fit":16,"Clear sections":16,
           "Contact basics":10,"Bullet structure":10,"Specificity":10 }[name] || 10;
}

function initScorer() {
  const btn = document.getElementById("score-btn");
  const ta = document.getElementById("resume-input");
  const clear = document.getElementById("score-clear");
  if (!btn || !ta) return;
  btn.addEventListener("click", () => {
    const text = ta.value;
    if (text.trim().split(/\s+/).filter(Boolean).length < 30) {
      const out = document.getElementById("score-output");
      out.hidden = false;
      out.innerHTML = `<div class="note">Paste a bit more — at least a few lines of your resume — and we'll score it. Nothing leaves your browser.</div>`;
      return;
    }
    renderScore(scoreResume(text));
  });
  if (clear) clear.addEventListener("click", () => {
    ta.value = ""; const out = document.getElementById("score-output");
    out.hidden = true; out.innerHTML = ""; ta.focus();
  });
}

/* ------------------------------------------------------------
   2) THE EXAMPLE LIBRARY
   10 personas × 3 quality levels, each with a short annotation
   explaining WHY, plus a recruiter-style commentary line.
   Bullets are illustrative teaching samples.
   ------------------------------------------------------------ */

const PERSONAS = [
  {
    id:"grad", name:"College graduate", role:"Entry-level Marketing",
    levels:{
      poor:{ bullets:["Responsible for social media","Helped with marketing campaigns","Did various tasks for the team"],
        why:"Pure duties, zero outcomes, vague scope. Nothing tells a recruiter what changed because this person was there." },
      average:{ bullets:["Managed Instagram and TikTok accounts","Created content for marketing campaigns","Tracked engagement metrics weekly"],
        why:"Better verbs and specifics, but still no results. 'Managed accounts' — and what happened?" },
      excellent:{ bullets:["Grew Instagram following 140% (2.1k→5k) in 6 months with a student-led content series","Ran 3 campaigns that lifted event attendance 35% over the prior year","Built a weekly analytics report adopted by the whole 5-person team"],
        why:"Same experience, now with numbers, scope, and outcomes. A new grad with thin experience competes on demonstrated impact." }
    },
    commentary:"For entry-level, I'm looking for evidence you can produce results, even from internships or student projects. Numbers prove it."
  },
  {
    id:"veteran", name:"Veteran → civilian", role:"Operations / Supply Chain",
    levels:{
      poor:{ bullets:["E-7 responsible for platoon logistics","Oversaw supply for the unit","Various leadership duties across deployments"],
        why:"Rank and acronyms civilians can't parse, plus duty language. The real scope is invisible." },
      average:{ bullets:["Led logistics for a 40-person unit","Managed equipment and supplies across two deployments","Trained junior team members"],
        why:"Translated out of jargon — good. Still missing the budget, the scale, and the outcomes that would land." },
      excellent:{ bullets:["Directed logistics and readiness for a 40-person team and $2M in equipment across two overseas deployments","Cut supply-shortfall incidents 30% by redesigning the inventory tracking process","Trained and mentored 12 junior personnel, 4 promoted ahead of peers"],
        why:"Service translated into civilian business language: people, budget, process improvement, measurable results. Recruiters instantly get it." }
    },
    commentary:"Translate everything out of military jargon. Lead with scope — people, budget, outcomes. That's the language I hire in."
  },
  {
    id:"pm", name:"Project Manager", role:"Program / Project Management",
    levels:{
      poor:{ bullets:["Responsible for managing projects","Coordinated with stakeholders","Ensured deliverables were met"],
        why:"Could describe any PM anywhere. No scale, no domain, no results." },
      average:{ bullets:["Managed multiple cross-functional projects","Worked with stakeholders to keep timelines on track","Delivered projects within budget"],
        why:"Slightly more specific, but 'multiple' and 'within budget' are still vague claims." },
      excellent:{ bullets:["Led 6 cross-functional programs worth $3M combined, all delivered on or ahead of schedule","Cut average delivery time 18% by restructuring the work-intake process","Turned around 2 at-risk launches that had slipped twice before"],
        why:"Quantified scope, a process-improvement metric, and a turnaround story. This is a PM who clearly drives outcomes." }
    },
    commentary:"Every PM says 'on time and on budget.' Show me the dollar scope and a number I can repeat to the hiring manager."
  },
  {
    id:"tpm", name:"Technical Program Manager", role:"Technical PM",
    levels:{
      poor:{ bullets:["Managed technical projects","Worked with engineering teams","Helped ship product features"],
        why:"No technical depth, no scale, no impact — reads like a non-technical PM." },
      average:{ bullets:["Coordinated engineering teams to deliver features","Managed sprints and release schedules","Tracked technical dependencies"],
        why:"Shows process awareness, but no scale or measurable result." },
      excellent:{ bullets:["Drove a 4-team, 25-engineer platform migration delivered 3 weeks early with zero downtime","Reduced release cycle from 3 weeks to 5 days by automating the deploy pipeline","Owned the dependency map across 9 services feeding a $40M product line"],
        why:"Technical scale, a hard before/after metric, and business context. Clearly operates at a senior technical level." }
    },
    commentary:"I need to see technical scale and a real engineering outcome — team size, systems, cycle time. Vague 'coordination' won't cut it."
  },
  {
    id:"ops", name:"Operations Manager", role:"Operations",
    levels:{
      poor:{ bullets:["Responsible for daily operations","Managed staff","Handled process issues as they came up"],
        why:"Reactive, generic, unquantified. No sense of scale or improvement." },
      average:{ bullets:["Managed a team of 15 in daily operations","Improved some processes to reduce delays","Oversaw inventory and scheduling"],
        why:"Team size helps. 'Improved some processes' and 'reduce delays' still need numbers." },
      excellent:{ bullets:["Ran daily operations for a 15-person team across 2 sites, hitting 98% on-time fulfillment","Cut order-processing time 22% by redesigning the scheduling workflow","Reduced annual inventory waste $120k through tighter demand forecasting"],
        why:"Scope, a quality metric, a time metric, and a dollar saving. Operations is a numbers game and this resume plays it." }
    },
    commentary:"Operations is measurable by definition. If there's no throughput, cost, or quality number, I assume there wasn't one."
  },
  {
    id:"exec", name:"Executive leader", role:"VP / Director",
    levels:{
      poor:{ bullets:["Responsible for the department","Led strategy","Managed budgets and people"],
        why:"At the executive level this is alarming — no scale, no business outcomes, no vision." },
      average:{ bullets:["Led a department of 40","Set strategy and managed a large budget","Drove growth across the business"],
        why:"Headcount is a start, but 'drove growth' with no number is exactly what execs must avoid." },
      excellent:{ bullets:["Scaled a 40→90 person org while growing ARR from $12M to $34M in 3 years","Repositioned the product line, lifting gross margin 11 points","Built the leadership bench: hired 6 directors, 3 promoted from within"],
        why:"Org scale, revenue trajectory, margin impact, and team-building. This is a P&L-level story told in outcomes." }
    },
    commentary:"At the exec level I'm reading for business impact — revenue, margin, org scale. Activity without outcomes is a red flag here."
  },
  {
    id:"remote", name:"Remote worker", role:"Remote Customer Success",
    levels:{
      poor:{ bullets:["Worked remotely with customers","Responsible for account management","Answered customer questions"],
        why:"Nothing here addresses the remote-specific concern: can this person self-manage and communicate async?" },
      average:{ bullets:["Managed a book of remote accounts","Kept customers happy and engaged","Communicated across time zones"],
        why:"Gestures at remote skills but proves none of them with results." },
      excellent:{ bullets:["Managed 60 accounts fully remote with 95% retention across 4 time zones","Cut response time to under 2 hours using an async triage system I built","Ran quarterly business reviews over video that expanded 12 accounts"],
        why:"Retention number, an async-systems proof point, and outcomes — directly answering 'can they thrive remote?'" }
    },
    commentary:"For remote roles I de-risk self-management. Show me systems, async communication, and outcomes you owned without hand-holding."
  },
  {
    id:"it", name:"IT professional", role:"Systems / IT Admin",
    levels:{
      poor:{ bullets:["Responsible for IT support","Fixed computers and systems","Helped users with issues"],
        why:"Help-desk language with no scale or impact. Reads as junior regardless of actual level." },
      average:{ bullets:["Provided IT support for the company","Managed servers and networks","Resolved tickets and user issues"],
        why:"Broader scope, but no environment size or measurable reliability." },
      excellent:{ bullets:["Administered 200+ endpoints and 15 servers at 99.9% uptime","Cut average ticket resolution from 8 hours to 2 with a new triage + knowledge base","Led a Microsoft 365 migration for 180 users with zero data loss"],
        why:"Environment scale, uptime, resolution metric, and a clean migration. Demonstrates reliability and project capability." }
    },
    commentary:"In IT I want environment size and reliability numbers — uptime, ticket times, users supported. 'Fixed issues' tells me nothing."
  },
  {
    id:"health", name:"Healthcare professional", role:"Registered Nurse",
    levels:{
      poor:{ bullets:["Responsible for patient care","Worked in a busy hospital","Administered medications"],
        why:"Every nurse does these. No setting, specialty, volume, or outcome." },
      average:{ bullets:["Provided care for patients on a busy unit","Administered medications and treatments","Worked with the care team"],
        why:"Confirms the basics but doesn't distinguish this nurse from any other applicant." },
      excellent:{ bullets:["Managed care for up to 6 acute patients per shift in a 30-bed med-surg unit","Maintained a 0 medication-error record across 3 years","Precepted 8 new-grad nurses; unit raised patient-satisfaction scores 12%"],
        why:"Patient load, specialty, a safety record, and teaching/outcomes. Specific, credible, and reassuring to a clinical hiring manager." }
    },
    commentary:"Clinical hiring is about safety and volume. Patient load, specialty, error/satisfaction records — that's what tells me you're ready."
  },
  {
    id:"eng", name:"Engineer", role:"Mechanical Engineer",
    levels:{
      poor:{ bullets:["Responsible for engineering tasks","Designed parts","Used CAD software"],
        why:"No domain, no tools named, no outcomes. Could be a student or a 20-year veteran." },
      average:{ bullets:["Designed mechanical components in CAD","Worked on product development","Tested prototypes"],
        why:"Names the activity but not the tools, scale, or results that prove capability." },
      excellent:{ bullets:["Designed injection-molded components (SolidWorks, GD&T) for a product line shipping 50k units/yr","Cut part cost 22% through a design-for-manufacture redesign","Led DFM reviews that reduced prototype iterations from 5 to 2"],
        why:"Named tools, production scale, a cost metric, and a process improvement. Reads as a capable, results-oriented engineer." }
    },
    commentary:"Engineers should name the tools and the numbers — tolerances, cost, volume, cycle count. Specifics are how I gauge real depth."
  }
];

function renderLibrary() {
  const tabsEl = document.getElementById("persona-tabs");
  const panelEl = document.getElementById("persona-panel");
  if (!tabsEl || !panelEl) return;

  tabsEl.innerHTML = PERSONAS.map((p,i) =>
    `<button class="persona-tab" role="tab" data-id="${p.id}" aria-selected="${i===0}">${p.name}</button>`
  ).join("");

  function show(id) {
    const p = PERSONAS.find(x => x.id === id);
    tabsEl.querySelectorAll(".persona-tab").forEach(t =>
      t.setAttribute("aria-selected", t.dataset.id === id ? "true" : "false"));
    const col = (key, cls, label) => {
      const lv = p.levels[key];
      return `
        <div class="ex-col ex-col--${cls}">
          <span class="ex-col__label">${label}</span>
          <ul class="ex-bullets">${lv.bullets.map(b=>`<li>${b}</li>`).join("")}</ul>
          <p class="ex-why"><b>Why:</b> ${lv.why}</p>
        </div>`;
    };
    panelEl.innerHTML = `
      <div class="ex-role">${p.role}</div>
      <div class="ex-grid">
        ${col("poor","poor","Poor")}
        ${col("average","avg","Average")}
        ${col("excellent","exc","Excellent")}
      </div>
      <div class="ex-commentary">
        <span class="ex-commentary__tag">Recruiter's take</span>
        <p>“${p.commentary}”</p>
      </div>`;
  }
  tabsEl.addEventListener("click", e => {
    const b = e.target.closest(".persona-tab");
    if (b) show(b.dataset.id);
  });
  show(PERSONAS[0].id);
}

document.addEventListener("DOMContentLoaded", () => {
  initScorer();
  renderLibrary();
});
