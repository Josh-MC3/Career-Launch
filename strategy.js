/* ============================================================
   Job Search Strategy — funnel calculator + template copy
   ============================================================ */

/* ---- Application funnel calculator ----
   The user sets total applications and three conversion rates.
   We model the funnel and diagnose where it's leaking.
   Rates are illustrative, adjustable defaults — real numbers vary
   widely by field, level, and timing. The point is the *shape*. */
function initFunnel() {
  const root = document.getElementById("funnel-calc");
  if (!root) return;

  const appsEl    = root.querySelector("#f-apps");
  const screenEl  = root.querySelector("#f-screen");
  const intEl     = root.querySelector("#f-int");
  const offerEl   = root.querySelector("#f-offer");
  const viz       = root.querySelector("[data-funnel-viz]");
  const diag      = root.querySelector("[data-funnel-diagnosis]");

  function pct(el){ return parseInt(el.value,10); }

  function render() {
    const apps = Math.max(0, parseInt(appsEl.value,10) || 0);
    const sr = pct(screenEl), ir = pct(intEl), or = pct(offerEl);

    // reflect slider values in their labels
    root.querySelector("#f-screen-val").textContent = sr + "%";
    root.querySelector("#f-int-val").textContent = ir + "%";
    root.querySelector("#f-offer-val").textContent = or + "%";

    const screens   = Math.round(apps * sr/100);
    const interviews= Math.round(screens * ir/100);
    const offers    = Math.round(interviews * or/100);

    const stages = [
      ["apps","Applications submitted",apps],
      ["screens","Recruiter screens",screens],
      ["interviews","Interviews",interviews],
      ["offers","Offers",offers]
    ];
    const max = Math.max(apps,1);
    viz.innerHTML = stages.map(([cls,label,n],i) => {
      const w = Math.max(12, Math.round(n/max*100)); // min width so labels stay readable
      const rate = i>0 ? `<div class="funnel-rate">↓ ${stages[i-1][2] ? Math.round(n/stages[i-1][2]*100) : 0}% convert</div>` : "";
      return `${rate}<div class="funnel-stage funnel-stage--${cls}" style="width:${w}%">
        <div class="funnel-stage__label">${label}</div>
        <div class="funnel-stage__num">${n.toLocaleString()}</div>
      </div>`;
    }).join("");

    // diagnosis: find the weakest stage relative to healthy ranges
    let title, body;
    if (apps === 0) {
      title = "Enter your numbers above";
      body = "Set how many applications you've sent and adjust the conversion rates to match your reality.";
    } else if (offers >= 1 && apps <= 30) {
      title = "This funnel is working";
      body = "You're converting at a healthy rate on modest volume. Keep doing what you're doing — and protect your energy for tailored applications.";
    } else if (sr < 10) {
      title = "Your leak is at the top of the funnel";
      body = "Few applications turn into screens. That's almost always a relevance or visibility problem — not your interview skills. Tailor harder, and work referrals so a human sees you. Start with the Resume Lab and the hidden-market section below.";
    } else if (ir < 35) {
      title = "Your leak is screen → interview";
      body = "You're getting screens but they stall. That points to the resume-to-role match and your screening-call story. Sharpen relevance in the Resume Lab and rehearse your phone-screen narrative.";
    } else if (or < 20) {
      title = "Your leak is interview → offer";
      body = "You're getting into the room but not converting. That's interview execution — head to the Interview Center and drill STAR answers for the format you're facing.";
    } else {
      title = "A mostly healthy funnel";
      body = "No single stage is badly broken. If offers are still thin, the fastest lever is usually volume of well-targeted applications plus referrals.";
    }
    diag.innerHTML = `<h4>${title}</h4><p>${body}</p>`;
  }

  [appsEl,screenEl,intEl,offerEl].forEach(el => {
    el.addEventListener("input", render);
  });
  render();
}

/* ---- Copy-to-clipboard for networking templates ---- */
function initTemplateCopy() {
  document.querySelectorAll(".tmpl__copy").forEach(btn => {
    btn.addEventListener("click", async () => {
      const body = btn.closest(".tmpl").querySelector(".tmpl__body");
      const text = body ? body.textContent.trim() : "";
      try {
        await navigator.clipboard.writeText(text);
      } catch(e) {
        // fallback for older/blocked clipboard
        const ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch(_){}
        document.body.removeChild(ta);
      }
      const orig = btn.textContent;
      btn.textContent = "Copied ✓";
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = orig; btn.classList.remove("copied"); }, 1600);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initFunnel();
  initTemplateCopy();
});
