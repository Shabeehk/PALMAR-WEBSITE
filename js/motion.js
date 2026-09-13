// Palmar — scroll-driven prayer motion animation (original SVG figure, no video)
(function(){
  // Captions for this section, merged into the site's translation table.
  const MOTION_STRINGS = {
    en: {
      "motion.eyebrow": "The Prayer, Step by Step",
      "motion.title": "Every posture, without the pain",
      "motion.hint": "Scroll to see how it works",
      "motion.s1_title": "Standing in prayer",
      "motion.s1_text": "Qiyam — where every rak'ah begins.",
      "motion.s2_title": "Bowing down",
      "motion.s2_text": "Ruku — the knees start to take the strain.",
      "motion.s3_title": "In sujood",
      "motion.s3_text": "The hardest part for aching knees and backs.",
      "motion.s4_title": "Rising up",
      "motion.s4_text": "Getting back up is where most people struggle.",
      "motion.s5_title": "Resting on Palmar",
      "motion.s5_text": "Tashahhud in comfort — the stool takes the weight, not your knees."
    },
    ml: {
      "motion.eyebrow": "നിസ്കാരം, ഘട്ടം ഘട്ടമായി",
      "motion.title": "എല്ലാ നിലയിലും, വേദനയില്ലാതെ",
      "motion.hint": "സ്ക്രോൾ ചെയ്ത് കാണൂ",
      "motion.s1_title": "നിസ്കാരത്തിൽ നിൽക്കുന്നു",
      "motion.s1_text": "ഖിയാം — ഓരോ റക്അത്തും തുടങ്ങുന്നത് ഇവിടെ.",
      "motion.s2_title": "റുകൂഇൽ കുനിയുന്നു",
      "motion.s2_text": "മുട്ടുകൾക്ക് ഭാരം തുടങ്ങുന്നത് ഇവിടെ നിന്നാണ്.",
      "motion.s3_title": "സുജൂദിൽ",
      "motion.s3_text": "വേദനിക്കുന്ന മുട്ടിനും നടുവിനും ഏറ്റവും പ്രയാസമുള്ള ഭാഗം.",
      "motion.s4_title": "എഴുന്നേൽക്കുമ്പോൾ",
      "motion.s4_text": "പലർക്കും ഏറ്റവും ബുദ്ധിമുട്ട് ഇവിടെയാണ്.",
      "motion.s5_title": "Palmar-ൽ ഇരിക്കുന്നു",
      "motion.s5_text": "തശഹുദ് സുഖമായി — ഭാരം മുട്ടിനല്ല, സ്റ്റൂളിന്."
    },
    hi: {
      "motion.eyebrow": "नमाज़, कदम दर कदम",
      "motion.title": "हर हालत, बिना दर्द के",
      "motion.hint": "स्क्रॉल करके देखें",
      "motion.s1_title": "नमाज़ में खड़े होना",
      "motion.s1_text": "क़ियाम — हर रकअत यहीं से शुरू होती है।",
      "motion.s2_title": "रुकू में झुकना",
      "motion.s2_text": "घुटनों पर दबाव यहीं से शुरू होता है।",
      "motion.s3_title": "सजदे में",
      "motion.s3_text": "दर्द भरे घुटनों और पीठ के लिए सबसे मुश्किल हिस्सा।",
      "motion.s4_title": "उठते हुए",
      "motion.s4_text": "ज़्यादातर लोगों के लिए सबसे मुश्किल यही है।",
      "motion.s5_title": "Palmar पर आराम से",
      "motion.s5_text": "तशह्हुद आराम से — बोझ आपके घुटनों पर नहीं, स्टूल पर।"
    }
  };
  if(typeof translations === "object" && translations){
    for(const lang in MOTION_STRINGS){
      if(translations[lang]) Object.assign(translations[lang], MOTION_STRINGS[lang]);
    }
  }

  const GROUND = 432;
  const TORSO = 108, NECK_HEAD = 46, UPARM = 60, FOREARM = 58, THIGH = 95, SHIN = 92, FOOT = 40;

  // Pose keyframes: qiyam -> ruku -> sujood -> rising -> seated on Palmar
  const POSES = [
    { // 0 qiyam (standing)
      hipX:400, hipY:245, torsoA:268, headA:266,
      upArmA:104, foreArmA:18, thighA:90, shinA:90, footA:2,
      pain:0, comfort:0, stoolX:-185, stoolOp:0.25
    },
    { // 1 ruku (bowing)
      hipX:352, hipY:250, torsoA:16, headA:22,
      upArmA:112, foreArmA:100, thighA:86, shinA:92, footA:2,
      pain:0.5, comfort:0, stoolX:-185, stoolOp:0.25
    },
    { // 2 sujood (prostration)
      hipX:395, hipY:333, torsoA:25, headA:27,
      upArmA:30, foreArmA:4, thighA:93, shinA:178, footA:12,
      pain:1, comfort:0, stoolX:-170, stoolOp:0.35
    },
    { // 3 rising
      hipX:390, hipY:372, torsoA:302, headA:296,
      upArmA:96, foreArmA:58, thighA:40, shinA:178, footA:12,
      pain:0.85, comfort:0, stoolX:-70, stoolOp:0.75
    },
    { // 4 tashahhud, seated on the Palmar stool
      hipX:395, hipY:360, torsoA:272, headA:268,
      upArmA:100, foreArmA:44, thighA:45, shinA:180, footA:-8,
      pain:0, comfort:1, stoolX:0, stoolOp:1
    }
  ];

  const rad = d => d * Math.PI / 180;
  const from = (p, angle, len) => [p[0] + len*Math.cos(rad(angle)), p[1] + len*Math.sin(rad(angle))];
  const lerp = (a,b,t) => a + (b-a)*t;
  const smooth = t => t*t*(3-2*t);

  function blend(a, b, t){
    const out = {};
    for(const k in a) out[k] = lerp(a[k], b[k], t);
    return out;
  }

  function setLine(el, p1, p2){
    if(!el) return;
    el.setAttribute("x1", p1[0].toFixed(1)); el.setAttribute("y1", p1[1].toFixed(1));
    el.setAttribute("x2", p2[0].toFixed(1)); el.setAttribute("y2", p2[1].toFixed(1));
  }

  function draw(pose){
    const hip = [pose.hipX, pose.hipY];
    const shoulder = from(hip, pose.torsoA, TORSO);
    const head = from(shoulder, pose.headA, NECK_HEAD);
    const elbow = from(shoulder, pose.upArmA, UPARM);
    const hand = from(elbow, pose.foreArmA, FOREARM);
    const knee = from(hip, pose.thighA, THIGH);
    const ankle = from(knee, pose.shinA, SHIN);
    const toe = from(ankle, pose.footA, FOOT);

    setLine(document.getElementById("mThigh"), hip, knee);
    setLine(document.getElementById("mShin"), knee, ankle);
    setLine(document.getElementById("mFoot"), ankle, toe);
    setLine(document.getElementById("mTorso"), hip, shoulder);
    setLine(document.getElementById("mUpArm"), shoulder, elbow);
    setLine(document.getElementById("mForeArm"), elbow, hand);

    const h = document.getElementById("mHead");
    if(h){ h.setAttribute("cx", head[0].toFixed(1)); h.setAttribute("cy", head[1].toFixed(1)); }

    // taqiyah (cap) sits on the crown, following the direction the head points
    const cap = document.getElementById("mCap");
    if(cap){
      const capPos = from(head, pose.headA, 19);
      cap.setAttribute("cx", capPos[0].toFixed(1));
      cap.setAttribute("cy", capPos[1].toFixed(1));
    }

    const painEl = document.getElementById("mPain");
    if(painEl){
      painEl.setAttribute("cx", knee[0].toFixed(1));
      painEl.setAttribute("cy", knee[1].toFixed(1));
      painEl.setAttribute("opacity", (pose.pain * 0.85).toFixed(2));
    }
    const comfortEl = document.getElementById("mComfort");
    if(comfortEl) comfortEl.setAttribute("opacity", pose.comfort.toFixed(2));
    const stoolEl = document.getElementById("mStool");
    if(stoolEl){
      stoolEl.setAttribute("opacity", pose.stoolOp.toFixed(2));
      stoolEl.setAttribute("transform", `translate(${pose.stoolX.toFixed(1)} 0)`);
    }
  }

  function poseAt(progress){
    const segs = POSES.length - 1;
    const scaled = Math.max(0, Math.min(0.9999, progress)) * segs;
    const i = Math.floor(scaled);
    const t = smooth(scaled - i);
    return { pose: blend(POSES[i], POSES[i+1], t), index: scaled };
  }

  function updateCaptions(index){
    const caps = document.querySelectorAll(".motion-caption");
    const nearest = Math.round(index);
    caps.forEach((el, i) => {
      const dist = Math.abs(index - i);
      // the nearest caption always stays readable; the others fade out quickly
      const op = i === nearest
        ? 1 - Math.min(dist, 0.5) * 0.7
        : Math.max(0, 1 - dist * 2.6);
      el.style.opacity = op.toFixed(2);
      el.style.transform = `translateY(${((1-op) * 14).toFixed(1)}px)`;
      el.setAttribute("aria-hidden", op < 0.5 ? "true" : "false");
    });
    document.querySelectorAll(".motion-dot").forEach((d, i) => {
      d.classList.toggle("active", Math.round(index) === i);
    });
  }

  function init(){
    const section = document.getElementById("motion");
    if(!section) return;

    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduced){
      section.classList.add("reduced");
      draw(POSES[POSES.length-1]);
      updateCaptions(POSES.length-1);
      return;
    }

    let ticking = false;
    function onScroll(){
      if(ticking) return;
      ticking = true;
      requestAnimationFrame(()=>{
        const rect = section.getBoundingClientRect();
        const total = section.offsetHeight - window.innerHeight;
        const progress = total > 0 ? (-rect.top) / total : 0;
        const { pose, index } = poseAt(progress);
        draw(pose);
        updateCaptions(index);
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive:true });
    window.addEventListener("resize", onScroll);
    onScroll();
    draw(POSES[0]);
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
