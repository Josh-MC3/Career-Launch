/* ============================================================
   Start Here — diagnostic engine
   Maps stage + answers -> a diagnosed bottleneck -> ordered roadmap.
   Progress persists in localStorage. No account, no gate.
   ============================================================ */

const STAGES = [
  { id:"grad",    title:"Recent graduate",        blurb:"Little formal experience, few callbacks." },
  { id:"mid",     title:"Mid-career professional", blurb:"Experienced, but stuck or overlooked." },
  { id:"changer", title:"Career changer",          blurb:"Proving I can do a job I haven't held." },
  { id:"leader",  title:"Manager → leader",        blurb:"Ready to present as executive material." },
  { id:"veteran", title:"Veteran in transition",   blurb:"Translating service into civilian terms." },
  { id:"active",  title:"Actively searching",      blurb:"Applying into what feels like a void." }
];

/* Shared question bank. `q` is the prompt, options carry a `tag` used by the
   scoring logic. Some questions are stage-aware via `skipFor`. */
const QUESTIONS = [
  {
    id:"outcome", q:"When you apply, what usually happens?",
    options:[
      { label:"No response at all", tag:"top" },
      { label:"Some screening calls, but no interviews", tag:"fit" },
      { label:"Interviews, but no offers", tag:"interview" },
      { label:"I'm not really applying yet", tag:"early" }
    ]
  },
  {
    id:"volume", q:"How many roles have you applied to in the last month?",
    options:[
      { label:"None yet", tag:"early" },
      { label:"1–10", tag:"low" },
      { label:"11–30", tag:"mid" },
      { label:"30+", tag:"high" }
    ]
  },
  {
    id:"tailor", q:"Are you tailoring each application, or sending one general version?",
    options:[
      { label:"Tailoring most of them", tag:"tailor" },
      { label:"A mix", tag:"mixed" },
      { label:"Mostly one general version", tag:"general" }
    ]
  },
  {
    id:"profile", q:"How would a stranger describe your LinkedIn in 5 seconds?",
    options:[
      { label:"They couldn't — it's bare", tag:"profile-weak" },
      { label:"Vague — they'd get the gist", tag:"profile-mid" },
      { label:"Clear and specific", tag:"profile-strong" }
    ]
  },
  {
    id:"network", q:"Do you have anyone inside your target companies?",
    options:[
      { label:"No one", tag:"net-weak" },
      { label:"A few loose connections", tag:"net-mid" },
      { label:"A solid network", tag:"net-strong" }
    ]
  },
  {
    id:"confidence", q:"Where do you feel least confident?",
    options:[
      { label:"My resume", tag:"c-resume" },
      { label:"My LinkedIn", tag:"c-profile" },
      { label:"Interviewing", tag:"c-interview" },
      { label:"Networking", tag:"c-network" },
      { label:"Knowing where to apply", tag:"c-strategy" }
    ]
  }
];

/* Roadmap step library, keyed by id. Each step deep-links into a hub. */
const STEPS = {
  diagnose:   { title:"You're here — bottleneck diagnosed", why:"We've identified your biggest lever. Work down the list in order.", href:null },
  truth:      { title:"Read the Recruiter Truth hub", why:"Understand what hiring actually rewards before you change anything.", href:"truth.html" },
  profile:    { title:"Fix your Profile & Presence", why:"A recruiter-readable profile is working for you even when you're not applying.", href:"profile.html" },
  resumeTgt:  { title:"Tailor your resume per role", why:"Relevance beats volume. Stop sending one general version.", href:"resume.html#targeting" },
  resumeLab:  { title:"Rebuild your resume in the Lab", why:"See weak vs. excellent side by side, then score your own.", href:"resume.html" },
  resumeScore:{ title:"Score your current resume", why:"A quick rubric check surfaces the obvious fixes first.", href:"resume.html#scorer" },
  funnel:     { title:"Run the funnel calculator", why:"See exactly where your search is leaking and why.", href:"strategy.html#funnel" },
  hidden:     { title:"Work the hidden job market", why:"Referrals sidestep the volume problem entirely.", href:"strategy.html#hidden" },
  network:    { title:"Start networking (templates inside)", why:"The highest-leverage activity most people avoid. Copy-ready messages.", href:"strategy.html#networking" },
  interview:  { title:"Prepare in the Interview Center", why:"Structured reps for the format you're facing.", href:"interview.html" },
  star:       { title:"Drill the STAR method", why:"Turn 'tell me about a time' from panic into a story.", href:"interview.html#star" },
  veteran:    { title:"Visit the Veteran Transition Hub", why:"Translate service into civilian terms recruiters recognize.", href:"strategy.html#veteran" },
  strategy:   { title:"Build a smarter search strategy", why:"Know where to apply and how to stand out before you do.", href:"strategy.html" }
};

const BOTTLENECKS = {
  visibility: "getting seen at all (a top-of-funnel and presence problem)",
  relevance:  "relevance — your applications aren't matching the roles closely enough",
  fit:        "the resume-to-role match and your screening-call story",
  interview:  "interview execution — you're getting in the room but not converting",
  foundation: "building the foundation before you start applying in earnest"
};

const LS_KEY = "cla_roadmap_v1";

/* ---------- scoring ---------- */
function diagnose(stage, answers) {
  const tags = Object.values(answers);
  const has = t => tags.includes(t);

  let bottleneck, steps;

  // Not applying yet / early -> foundation
  if (has("early") || answers.outcome === "early") {
    bottleneck = "foundation";
    steps = ["diagnose","truth","profile","resumeLab","interview","strategy"];
  }
  // Interviews but no offers -> interview execution
  else if (answers.outcome === "interview") {
    bottleneck = "interview";
    steps = ["diagnose","interview","star","truth"];
  }
  // Screens but no interviews -> fit
  else if (answers.outcome === "fit") {
    bottleneck = "fit";
    steps = ["diagnose","resumeLab","resumeScore","interview","truth"];
  }
  // No response at all -> split between relevance and visibility
  else if (answers.outcome === "top") {
    if (has("general") && (has("high") || has("mid"))) {
      bottleneck = "relevance";
      steps = ["diagnose","truth","resumeTgt","resumeLab","funnel"];
    } else if (has("profile-weak") || has("net-weak")) {
      bottleneck = "visibility";
      steps = ["diagnose","profile","hidden","network","funnel"];
    } else {
      bottleneck = "relevance";
      steps = ["diagnose","truth","resumeLab","funnel","hidden"];
    }
  }
  // fallback
  else {
    bottleneck = "visibility";
    steps = ["diagnose","profile","resumeLab","network","funnel"];
  }

  // Confidence + stage nudges: ensure the user's self-identified weak spot is covered
  if (answers.confidence === "c-profile" && !steps.includes("profile")) steps.splice(1,0,"profile");
  if (answers.confidence === "c-network" && !steps.includes("network")) steps.push("network");
  if (answers.confidence === "c-interview" && !steps.includes("interview")) steps.push("interview");
  if (answers.confidence === "c-strategy" && !steps.includes("funnel")) steps.push("funnel");

  // Veteran stage always gets the transition hub near the top
  if (stage === "veteran" && !steps.includes("veteran")) steps.splice(2,0,"veteran");
  // Career changers benefit from targeting + truth
  if (stage === "changer" && !steps.includes("resumeTgt")) steps.splice(2,0,"resumeTgt");
  // Leaders: make sure interview (executive track) is present
  if (stage === "leader" && !steps.includes("interview")) steps.push("interview");

  // de-dupe while preserving order
  steps = steps.filter((s,i)=>steps.indexOf(s)===i);

  return { bottleneck, steps };
}

/* ---------- state ---------- */
let state = { stage:null, answers:{}, qIndex:0, result:null, done:{} };

function save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch(e){}
}
function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) state = Object.assign(state, JSON.parse(raw));
  } catch(e){}
}

/* ---------- rendering ---------- */
const app = () => document.getElementById("diagnostic");

function renderStages() {
  const el = app();
  el.innerHTML = `
    <div class="d-head">
      <span class="eyebrow">Step 1 of 3</span>
      <h2>Let's find what's actually stopping you.</h2>
      <p class="lede">First — where are you right now?</p>
    </div>
    <div class="stage-grid">
      ${STAGES.map(s=>`
        <button class="stage-card" data-stage="${s.id}">
          <span class="stage-card__title">${s.title}</span>
          <span class="stage-card__blurb">${s.blurb}</span>
        </button>`).join("")}
    </div>`;
  el.querySelectorAll("[data-stage]").forEach(b=>{
    b.addEventListener("click",()=>{ state.stage=b.dataset.stage; state.qIndex=0; state.answers={}; save(); renderQuestion(); window.scrollTo({top:el.offsetTop-80,behavior:"smooth"}); });
  });
}

function renderQuestion() {
  const el = app();
  const q = QUESTIONS[state.qIndex];
  const total = QUESTIONS.length;
  const pct = Math.round((state.qIndex)/total*100);
  el.innerHTML = `
    <div class="d-head">
      <span class="eyebrow">Step 2 of 3 — question ${state.qIndex+1} of ${total}</span>
      <div class="progress"><div class="progress__bar" style="width:${pct}%"></div></div>
      <h2>${q.q}</h2>
    </div>
    <div class="opt-grid">
      ${q.options.map(o=>`<button class="opt" data-tag="${o.tag}">${o.label}</button>`).join("")}
    </div>
    <div class="d-foot">
      ${state.qIndex>0 ? `<button class="btn btn--ghost" data-back>← Back</button>` : `<button class="btn btn--ghost" data-restart>← Change stage</button>`}
    </div>`;
  el.querySelectorAll("[data-tag]").forEach(b=>{
    b.addEventListener("click",()=>{
      state.answers[q.id]=b.dataset.tag;
      if (state.qIndex < total-1){ state.qIndex++; save(); renderQuestion(); }
      else { state.result = diagnose(state.stage, state.answers); save(); renderRoadmap(); }
      window.scrollTo({top:el.offsetTop-80,behavior:"smooth"});
    });
  });
  const back = el.querySelector("[data-back]");
  if (back) back.addEventListener("click",()=>{ state.qIndex--; save(); renderQuestion(); });
  const restart = el.querySelector("[data-restart]");
  if (restart) restart.addEventListener("click",()=>{ state.stage=null; save(); renderStages(); });
}

function renderRoadmap() {
  const el = app();
  const stage = STAGES.find(s=>s.id===state.stage);
  const { bottleneck, steps } = state.result;
  const doneCount = steps.filter(s=>s!=="diagnose" && state.done[s]).length;
  const actionable = steps.filter(s=>s!=="diagnose").length;

  el.innerHTML = `
    <div class="d-head">
      <span class="eyebrow">Step 3 of 3 — your roadmap</span>
      <h2>Here's your path, ${stage.title.toLowerCase()}.</h2>
      <p class="lede">Based on your answers, your biggest lever right now is <strong>${BOTTLENECKS[bottleneck]}</strong>. Start at the top and work down.</p>
      <div class="rm-progress">
        <div class="progress"><div class="progress__bar" style="width:${actionable?Math.round(doneCount/actionable*100):0}%"></div></div>
        <span class="rm-progress__label">${doneCount} of ${actionable} steps done</span>
      </div>
    </div>
    <ol class="roadmap">
      ${steps.map((id,i)=>{
        const s = STEPS[id];
        const isDiag = id==="diagnose";
        const checked = state.done[id] ? "checked":"";
        return `
        <li class="rm-step ${isDiag?'rm-step--here':''} ${state.done[id]?'is-done':''}">
          <div class="rm-step__num">${i+1}</div>
          <div class="rm-step__body">
            <h3>${s.title}</h3>
            <p>${s.why}</p>
            ${s.href ? `<a class="rm-step__link" href="${s.href}">Go to this step →</a>` : `<span class="rm-step__badge">Diagnosis complete</span>`}
          </div>
          ${!isDiag ? `<label class="rm-check"><input type="checkbox" data-done="${id}" ${checked}><span>Done</span></label>` : ``}
        </li>`;
      }).join("")}
    </ol>
    <div class="d-foot">
      <button class="btn btn--ghost" data-redo>↺ Start over</button>
      <p class="note" style="margin-top:1rem">This is a starting point, not a guarantee. Hiring has real luck and timing in it — these steps stack the odds, they don't bypass them.</p>
    </div>`;

  el.querySelectorAll("[data-done]").forEach(cb=>{
    cb.addEventListener("change",()=>{ state.done[cb.dataset.done]=cb.checked; save(); renderRoadmap(); });
  });
  el.querySelector("[data-redo]").addEventListener("click",()=>{
    state={ stage:null, answers:{}, qIndex:0, result:null, done:{} }; save(); renderStages();
    window.scrollTo({top:el.offsetTop-80,behavior:"smooth"});
  });
}

document.addEventListener("DOMContentLoaded",()=>{
  if (!app()) return;
  load();
  if (state.result && state.stage) renderRoadmap();
  else if (state.stage) renderQuestion();
  else renderStages();
});
