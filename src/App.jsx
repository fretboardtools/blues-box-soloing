import { useState } from "react";

// ─── Themes ───────────────────────────────────────────────────────────────────

const THEMES = {
  dark: {
    bg:"#0a0d12", surface:"#111520", surface2:"#0a0d12",
    border:"#1a2030", borderHi:"#252f40",
    text:"#dde3ed", textHi:"#f0f4ff", textMid:"#b0bcc8",
    textLo:"#6b7280", textMute:"#4a5568", textDead:"#252f40",
    fretStr:"#1e2d40", fretBar:"#1a2030", fretHi:"#2d4060",
    fretMark:"#1a2535", fretNum:"#3d5070",
    nutColor:"#7a8fa8", badge:"#451a03",
    scrollBg:"#111520", scrollTh:"#1a2030",
  },
  light: {
    bg:"#f3f5f8", surface:"#ffffff", surface2:"#eef1f5",
    border:"#dde1eb", borderHi:"#c5ccd8",
    text:"#1a2030", textHi:"#0a0c12", textMid:"#2d3748",
    textLo:"#4a5568", textMute:"#6b7280", textDead:"#c5ccd8",
    fretStr:"#c0c8d8", fretBar:"#d0d8e8", fretHi:"#9aa3b8",
    fretMark:"#c0c8d8", fretNum:"#8899aa",
    nutColor:"#5a6880", badge:"#fef3c7",
    scrollBg:"#eef1f5", scrollTh:"#c5ccd8",
  },
};

// ─── Music Theory ─────────────────────────────────────────────────────────────

const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const FLAT  = {"C#":"Db","D#":"Eb","F#":"Gb","G#":"Ab","A#":"Bb"};
const noteLabel = n => FLAT[n] ? `${n}/${FLAT[n]}` : n;
const addSemi   = (note, n) => NOTES[(NOTES.indexOf(note) + n + 120) % 12];
const semiDiff  = (a, b) => (NOTES.indexOf(b) - NOTES.indexOf(a) + 12) % 12;

const INTERVAL_NAME = {
  0:"R", 1:"b2", 2:"2", 3:"b3", 4:"3", 5:"4",
  6:"b5", 7:"5", 8:"b6", 9:"6", 10:"b7", 11:"7"
};

const OPEN_STRINGS = ["E","A","D","G","B","E"]; // low to high
const BOX_FRETS    = 4;
const MINOR_PENTA  = [0, 3, 5, 7, 10];
const SEMIS_FOR_ROLE = { I:0, IV:5, V:7, im:0, IVm:5 };

// ─── Role colours — defined early so everything can reference them ─────────────

const ROLE_COLORS = {
  I:"#F59E0B", IV:"#06B6D4", V:"#EF4444", im:"#6366F1", IVm:"#8B5CF6",
};

const ROLE_SUFFIX = { I:"7", IV:"7", V:"7", im:"m7", IVm:"m7" };
const ROLE_LABELS = {
  I:"I7 (Tonic)", IV:"IV7 (Subdominant)", V:"V7 (Dominant)",
  im:"im7 (Minor i)", IVm:"IVm7 (Minor iv)",
};

// ─── Blues Forms ──────────────────────────────────────────────────────────────

const FORMS = {
  standard: {
    name: "Standard 12-Bar Blues",
    description: "Three dominant 7th chords — I7, IV7, V7. Stay in your box and outline each change.",
    chordOrder: ["I","IV","V"],
    bars: [
      {bar:1,  role:"I",  chord:"I7"},   {bar:2,  role:"I",  chord:"I7"},
      {bar:3,  role:"I",  chord:"I7"},   {bar:4,  role:"I",  chord:"I7"},
      {bar:5,  role:"IV", chord:"IV7"},  {bar:6,  role:"IV", chord:"IV7"},
      {bar:7,  role:"I",  chord:"I7"},   {bar:8,  role:"I",  chord:"I7"},
      {bar:9,  role:"V",  chord:"V7"},   {bar:10, role:"IV", chord:"IV7"},
      {bar:11, role:"I",  chord:"I7"},   {bar:12, role:"V",  chord:"V7"},
    ],
  },
  minor: {
    name: "Minor Blues (12-Bar)",
    description: "Minor i and iv chords, dominant V. Same box — darker palette.",
    chordOrder: ["im","IVm","V"],
    bars: [
      {bar:1,  role:"im",  chord:"im7"},  {bar:2,  role:"im",  chord:"im7"},
      {bar:3,  role:"im",  chord:"im7"},  {bar:4,  role:"im",  chord:"im7"},
      {bar:5,  role:"IVm", chord:"IVm7"}, {bar:6,  role:"IVm", chord:"IVm7"},
      {bar:7,  role:"im",  chord:"im7"},  {bar:8,  role:"im",  chord:"im7"},
      {bar:9,  role:"V",   chord:"V7"},   {bar:10, role:"IVm", chord:"IVm7"},
      {bar:11, role:"im",  chord:"im7"},  {bar:12, role:"V",   chord:"V7"},
    ],
  },
};

// ─── Step Definitions — defined before the functions that reference them ──────

const STEP_INFO = {
  standard: [
    {
      label: "Step 1 — The minor pentatonic shell",
      headline: "You already know these notes.",
      desc: "The minor pentatonic of the key is your base layer — every dot you see is already in your fingers. But here's the problem: play only these notes and every chord change sounds the same. To outline the changes you need one extra note per chord. We'll add them one at a time.",
      activeRoles: ["I"],
      highlightRole: "I",
      showOutliner: false,
    },
    {
      label: "Step 2 — Outlining the I chord",
      headline: "One new note changes everything.",
      desc: "",
      activeRoles: ["I"],
      highlightRole: "I",
      showOutliner: true,
    },
    {
      label: "Step 3 — Outlining the IV chord",
      headline: "Same idea, different chord.",
      desc: "",
      activeRoles: ["I","IV"],
      highlightRole: "IV",
      showOutliner: true,
    },
    {
      label: "Step 4 — Outlining the V chord",
      headline: "The sharpest note in the box.",
      desc: "",
      activeRoles: ["I","IV","V"],
      highlightRole: "V",
      showOutliner: true,
    },
  ],
  minor: [
    {
      label: "Step 1 — The minor pentatonic shell",
      headline: "You already know these notes.",
      desc: "In minor blues the minor pentatonic of the key fits the im chord perfectly — no extra notes needed. Every grey dot already outlines the i chord. The skill is knowing what to ADD when the iv and V arrive. We'll do that one chord at a time.",
      activeRoles: ["im"],
      highlightRole: "im",
      showOutliner: false,
    },
    {
      label: "Step 2 — Outlining the iv chord",
      headline: "Find the new root.",
      desc: "",
      activeRoles: ["im","IVm"],
      highlightRole: "IVm",
      showOutliner: true,
    },
    {
      label: "Step 3 — Outlining the V chord",
      headline: "The one note that doesn't fit — until it does.",
      desc: "",
      activeRoles: ["im","IVm","V"],
      highlightRole: "V",
      showOutliner: true,
    },
  ],
};

// ─── Note Logic ───────────────────────────────────────────────────────────────

function getPentaSet(keyRoot) {
  return new Set(MINOR_PENTA.map(s => addSemi(keyRoot, s)));
}

function getOutliningNote(keyRoot, chordRole, formKey) {
  const chordRoot = addSemi(keyRoot, SEMIS_FOR_ROLE[chordRole]);

  if (formKey === "standard") {
    const note = addSemi(chordRoot, 4); // major 3rd of each dominant chord
    const descriptions = {
      I:  `The major 3rd of the I chord. This note is NOT in the minor pentatonic — it's what makes the I sound dominant (major) rather than minor. Land on it when the I chord is playing and the change speaks for itself.`,
      IV: `The major 3rd of the IV chord. In this key it may already sit in the minor pentatonic, but over the IV chord it becomes the 3rd. Same note, completely different meaning. Context is everything.`,
      V:  `The major 3rd of the V chord — the most tension-loaded note in the box. It sits outside the minor pentatonic and demands resolution back to the I. Land on it in bar 9 and you'll hear exactly what chord outlining means.`,
    };
    return { note, semi:4, iname:"3", chordRoot, desc: descriptions[chordRole] || "" };
  }

  if (formKey === "minor") {
    if (chordRole === "im") return null; // pentatonic IS the im chord
    if (chordRole === "IVm") {
      const note = addSemi(chordRoot, 0);
      return {
        note, semi:0, iname:"R", chordRoot,
        desc: `The root of the iv chord. It's already in the minor pentatonic (the 4th degree of the key) — but now it becomes your target note. When the iv chord hits, resolve to this. Same note, new meaning.`,
      };
    }
    if (chordRole === "V") {
      const note = addSemi(chordRoot, 4);
      return {
        note, semi:4, iname:"3", chordRoot,
        desc: `The major 3rd of the V chord — the only note in this entire box that sits outside the minor pentatonic. That contrast is exactly what makes it so powerful. One note, completely outside the minor sound, and it defines the entire chord change.`,
      };
    }
  }
  return null;
}

function getDisplayNotes(keyRoot, formKey, step) {
  const stepInfo = STEP_INFO[formKey][step];
  const pentaSet = getPentaSet(keyRoot);
  const result = {};

  // Always: minor pentatonic as grey shell
  pentaSet.forEach(note => {
    const semi = semiDiff(keyRoot, note);
    result[note] = {
      noteRole: "penta",
      iname: INTERVAL_NAME[semi],
      isKeyRoot: note === keyRoot,
    };
  });

  // Add outlining notes for each active role revealed so far
  if (stepInfo.showOutliner) {
    stepInfo.activeRoles.forEach((role, idx) => {
      const outliner = getOutliningNote(keyRoot, role, formKey);
      if (!outliner) return;
      const isLatest = idx === stepInfo.activeRoles.length - 1;
      result[outliner.note] = {
        noteRole: "outliner",
        iname: outliner.iname,
        chordRole: role,
        chordColor: ROLE_COLORS[role],
        isLatest,
      };
    });
  }

  return result;
}

// ─── Fretboard Component ──────────────────────────────────────────────────────

function BoxFretboard({ keyRoot, position, formKey, step, T }) {
  const displayNotes = getDisplayNotes(keyRoot, formKey, step);
  const displayStrings = [...OPEN_STRINGS].reverse(); // high E at top
  const frets = Array.from({ length: BOX_FRETS }, (_, i) => position + i);

  return (
    <div style={{ overflowX:"auto", paddingBottom:"4px" }}>
      <div style={{ minWidth:"480px" }}>

        {/* Fret numbers */}
        <div style={{ display:"flex", marginLeft:"44px", marginBottom:"6px" }}>
          {frets.map(fret => (
            <div key={fret} style={{
              width:"72px", textAlign:"center", fontSize:"11px", flexShrink:0,
              color:[3,5,7,9,12].includes(fret) ? T.fretHi : T.fretNum,
              fontWeight:[3,5,7,9,12].includes(fret) ? "700" : "400",
              fontFamily:"'JetBrains Mono',monospace",
            }}>{fret}</div>
          ))}
        </div>

        {/* Strings */}
        {displayStrings.map((openNote, di) => {
          const isOuter = di === 0 || di === 5;
          return (
            <div key={di} style={{ display:"flex", alignItems:"center", marginBottom:"4px" }}>
              <div style={{
                width:"40px", textAlign:"right", paddingRight:"8px",
                fontSize:"11px", color:T.fretHi,
                fontFamily:"'JetBrains Mono',monospace", flexShrink:0,
              }}>{openNote}</div>

              {frets.map((fret, fi) => {
                const note = addSemi(openNote, fret);
                const info = displayNotes[note];
                const isFirst = fi === 0;

                let dotColor = null;
                let dotOpacity = 1;
                let dotLabel = "";
                let glowColor = null;
                let dotBorder = "none";

                if (info) {
                  if (info.noteRole === "outliner") {
                    dotColor = info.chordColor;
                    dotOpacity = info.isLatest ? 1 : 0.6;
                    glowColor = info.isLatest ? info.chordColor : null;
                    dotLabel = info.iname;
                    dotBorder = info.isLatest ? "2px solid #fff" : "none";
                  } else if (info.noteRole === "penta") {
                    dotColor = info.isKeyRoot ? "#94a3b8" : "#475569";
                    dotOpacity = info.isKeyRoot ? 0.9 : 0.5;
                    dotLabel = info.isKeyRoot ? "R" : "";
                    dotBorder = info.isKeyRoot ? "1.5px solid #94a3b8" : "none";
                  }
                }

                return (
                  <div key={fret} style={{
                    width:"72px", height:"38px",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    position:"relative", flexShrink:0,
                  }}>
                    {/* String line */}
                    <div style={{
                      position:"absolute", top:"50%", left:0, right:0,
                      height: isOuter ? "1.5px" : "2.5px",
                      background: T.fretStr,
                      transform:"translateY(-50%)",
                    }}/>
                    {/* Left nut/fret bar */}
                    {isFirst && (
                      <div style={{
                        position:"absolute", top:0, bottom:0, left:0,
                        width: position === 1 ? "4px" : "2px",
                        background: position === 1 ? T.nutColor : T.fretBar,
                      }}/>
                    )}
                    {/* Right fret bar */}
                    <div style={{
                      position:"absolute", top:0, bottom:0, right:0,
                      width: fret === 12 ? "3px" : "1.5px",
                      background: fret === 12 ? T.fretHi : T.fretBar,
                    }}/>
                    {/* Dot */}
                    {dotColor && (
                      <div style={{
                        position:"relative", zIndex:2,
                        width:"28px", height:"28px", borderRadius:"50%",
                        background: dotColor,
                        opacity: dotOpacity,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:"8px", fontWeight:"700", color:"#fff",
                        fontFamily:"'JetBrains Mono',monospace",
                        border: dotBorder,
                        boxShadow: glowColor ? `0 0 12px ${glowColor}88` : "none",
                        transition:"all 0.3s ease",
                        animation: info.noteRole==="outliner" && info.isLatest ? "popIn 0.25s ease" : "none",
                      }}>
                        {dotLabel}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Fret position markers */}
        <div style={{ display:"flex", marginLeft:"44px", marginTop:"4px" }}>
          {frets.map(fret => (
            <div key={fret} style={{ width:"72px", textAlign:"center", flexShrink:0 }}>
              {[3,5,7,9].includes(fret) && (
                <div style={{ width:"8px",height:"8px",borderRadius:"50%",background:T.fretMark,margin:"0 auto" }}/>
              )}
              {fret===12 && (
                <div style={{ display:"flex",gap:"6px",justifyContent:"center" }}>
                  <div style={{ width:"8px",height:"8px",borderRadius:"50%",background:T.fretMark }}/>
                  <div style={{ width:"8px",height:"8px",borderRadius:"50%",background:T.fretMark }}/>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Bar Grid Component ───────────────────────────────────────────────────────

function BarGrid({ formKey, keyRoot, activeRoles, T }) {
  const form = FORMS[formKey];
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
      {form.bars.map((b, i) => {
        const isActive = activeRoles.includes(b.role);
        const col = ROLE_COLORS[b.role];
        const root = addSemi(keyRoot, SEMIS_FOR_ROLE[b.role]);
        const suffix = ROLE_SUFFIX[b.role];
        return (
          <div key={i} style={{
            padding:"7px 8px 5px", borderRadius:"8px",
            border: isActive ? `1.5px solid ${col}` : `1px solid ${T.border}`,
            background: isActive ? `${col}18` : T.surface2,
            minWidth:"46px", textAlign:"center",
            opacity: isActive ? 1 : 0.3,
            transition:"all 0.3s ease",
          }}>
            <div style={{ fontSize:"8px", color:isActive?col:T.textMute, fontFamily:"'JetBrains Mono',monospace", marginBottom:"2px" }}>
              Bar {b.bar}
            </div>
            <div style={{ fontSize:"12px", fontWeight:"700", color:isActive?col:T.textDead, fontFamily:"'JetBrains Mono',monospace" }}>
              {root}{suffix}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────

function SL({ children, style, T }) {
  return (
    <div style={{ fontSize:"10px", color:T.textMute, letterSpacing:"1.5px", marginBottom:"8px", fontFamily:"'JetBrains Mono',monospace", fontWeight:"600", ...style }}>
      {children}
    </div>
  );
}

function DotLegend({ color, label, solid, opacity=1 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
      <div style={{
        width:"12px", height:"12px", borderRadius:"50%",
        background: color, opacity,
        border: solid ? "1.5px solid rgba(255,255,255,0.4)" : "none",
        flexShrink:0,
      }}/>
      <span style={{ fontSize:"10px", color:"#6b7280", fontFamily:"'JetBrains Mono',monospace" }}>{label}</span>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

const POSITIONS = [1,3,5,7,9,12];

export default function BluesBoxSoloing() {
  const [selectedKey,  setSelectedKey]  = useState("A");
  const [selectedForm, setSelectedForm] = useState("standard");
  const [position,     setPosition]     = useState(5);
  const [step,         setStep]         = useState(0);
  const [isDark,       setIsDark]       = useState(false);

  const T = isDark ? THEMES.dark : THEMES.light;
  const form      = FORMS[selectedForm];
  const steps     = STEP_INFO[selectedForm];
  const stepInfo  = steps[step];
  const totalSteps = steps.length;
  const isDone    = step >= totalSteps - 1;
  const progressPct = Math.round(((step + 1) / totalSteps) * 100);

  const highlightColor = ROLE_COLORS[stepInfo.highlightRole];

  const handleFormChange = (f) => { setSelectedForm(f); setStep(0); };
  const handleKeyChange  = (k) => { setSelectedKey(k); };
  const advance = () => { if (!isDone) setStep(s => s + 1); };
  const reset   = () => setStep(0);

  // Get the dynamic outliner note for the current step's description
  const currentOutliner = stepInfo.showOutliner
    ? getOutliningNote(selectedKey, stepInfo.highlightRole, selectedForm)
    : null;
  const stepDesc = currentOutliner ? currentOutliner.desc : stepInfo.desc;
  const outlineNoteLabel = currentOutliner
    ? `${currentOutliner.note} (${currentOutliner.iname})`
    : null;

  const chordLabels = form.chordOrder.map(role => {
    const root = addSemi(selectedKey, SEMIS_FOR_ROLE[role]);
    return `${root}${ROLE_SUFFIX[role]}`;
  });

  return (
    <div style={{
      minHeight:"100vh", background:T.bg, color:T.text,
      fontFamily:"'DM Sans',sans-serif", padding:"24px 18px 48px",
      transition:"background 0.2s, color 0.2s",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing:border-box; }
        button { cursor:pointer; font-family:inherit; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.82)} to{opacity:1;transform:scale(1)} }
        .nav-btn:hover:not(:disabled) { filter:brightness(1.15); }
        .nav-btn:disabled { opacity:0.3; cursor:not-allowed; }
        ::-webkit-scrollbar { height:5px; background:${T.scrollBg}; }
        ::-webkit-scrollbar-thumb { background:${T.scrollTh}; border-radius:3px; }
      `}</style>

      <div style={{ maxWidth:"820px", margin:"0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom:"22px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px" }}>
          <div>
            <div style={{ display:"flex", alignItems:"baseline", gap:"10px", marginBottom:"4px" }}>
              <h1 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"clamp(22px,5vw,32px)", fontWeight:"700", margin:0, color:T.textHi, letterSpacing:"-0.5px" }}>
                Blues Box Soloing
              </h1>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"#F59E0B", background:T.badge, padding:"2px 7px", borderRadius:"4px", letterSpacing:"1px" }}>UNLOCK THE GUITAR</span>
            </div>
            <p style={{ color:T.textMute, fontSize:"13px", margin:0 }}>
              Stay in 4 frets. Minor pentatonic as your shell. One note per chord change outlines the whole progression.
            </p>
          </div>
          <button onClick={() => setIsDark(d => !d)} style={{
            flexShrink:0, padding:"8px 14px", borderRadius:"20px",
            border:`1.5px solid ${T.border}`, background:T.surface, color:T.textMid,
            fontSize:"13px", display:"flex", alignItems:"center", gap:"6px",
            transition:"all 0.15s", whiteSpace:"nowrap",
          }}>
            <span style={{ fontSize:"16px" }}>{isDark ? "☀️" : "🌙"}</span>
            <span style={{ fontSize:"11px", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.5px" }}>{isDark ? "Light" : "Dark"}</span>
          </button>
        </div>

        {/* Key + Form + Position */}
        <div style={{ background:T.surface, borderRadius:"14px", padding:"18px", border:`1px solid ${T.border}`, marginBottom:"12px" }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"20px" }}>

            <div>
              <SL T={T}>KEY</SL>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
                {NOTES.map(n => (
                  <button key={n} onClick={() => handleKeyChange(n)} style={{
                    padding:"5px 10px", borderRadius:"6px", fontSize:"11px", fontWeight:"700",
                    fontFamily:"'JetBrains Mono',monospace",
                    border: selectedKey===n ? `2px solid ${highlightColor}` : `2px solid ${T.border}`,
                    background: selectedKey===n ? `${highlightColor}20` : T.surface2,
                    color: selectedKey===n ? highlightColor : T.textMute,
                    transition:"all 0.1s",
                  }}>{n}</button>
                ))}
              </div>
            </div>

            <div>
              <SL T={T}>BLUES FORM</SL>
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                {Object.entries(FORMS).map(([id, f]) => (
                  <button key={id} onClick={() => handleFormChange(id)} style={{
                    padding:"7px 14px", borderRadius:"8px", fontSize:"12px", fontWeight:"600",
                    border: selectedForm===id ? `1.5px solid #F59E0B` : `1.5px solid ${T.border}`,
                    background: selectedForm===id ? (isDark?"#451a03":"#fef3c7") : T.surface2,
                    color: selectedForm===id ? "#F59E0B" : T.textMute,
                    transition:"all 0.1s",
                  }}>{f.name}</button>
                ))}
              </div>
            </div>

            <div>
              <SL T={T}>NECK POSITION</SL>
              <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
                {POSITIONS.map(p => (
                  <button key={p} onClick={() => setPosition(p)} style={{
                    padding:"6px 12px", borderRadius:"7px", fontSize:"11px", fontWeight:"700",
                    fontFamily:"'JetBrains Mono',monospace",
                    border: position===p ? `2px solid #22C55E` : `2px solid ${T.border}`,
                    background: position===p ? (isDark?"#052e16":"#f0fdf4") : T.surface2,
                    color: position===p ? "#22C55E" : T.textMute,
                    transition:"all 0.1s",
                  }}>Fret {p}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop:"12px", paddingTop:"12px", borderTop:`1px solid ${T.border}`, fontSize:"12px", color:T.textLo, fontStyle:"italic" }}>
            {form.description} &nbsp;·&nbsp; Key of <strong style={{ color:T.textMid, fontStyle:"normal" }}>{noteLabel(selectedKey)}</strong> &nbsp;·&nbsp; Frets {position}–{position+3}
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom:"12px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"5px" }}>
            <span style={{ fontSize:"11px", color:T.textMute, fontFamily:"'JetBrains Mono',monospace" }}>{stepInfo.label}</span>
            <span style={{ fontSize:"11px", color:isDone?"#22C55E":T.textMute, fontFamily:"'JetBrains Mono',monospace" }}>
              {isDone ? "✓ complete" : `${step+1} / ${totalSteps}`}
            </span>
          </div>
          <div style={{ height:"4px", background:T.border, borderRadius:"2px", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${progressPct}%`, background:highlightColor, transition:"width 0.4s ease", borderRadius:"2px", boxShadow:isDone?`0 0 8px ${highlightColor}`:"none" }}/>
          </div>
        </div>

        {/* 12-bar grid */}
        <div style={{ background:T.surface, borderRadius:"14px", padding:"16px 18px", border:`1px solid ${T.border}`, marginBottom:"12px" }}>
          <SL T={T}>THE PROGRESSION — active changes lit up</SL>
          <BarGrid formKey={selectedForm} keyRoot={selectedKey} activeRoles={stepInfo.activeRoles} T={T} />
          <div style={{ display:"flex", flexWrap:"wrap", gap:"12px", marginTop:"12px", paddingTop:"12px", borderTop:`1px solid ${T.border}` }}>
            {form.chordOrder.map((role, i) => {
              const active = stepInfo.activeRoles.includes(role);
              return (
                <div key={role} style={{ display:"flex", alignItems:"center", gap:"5px", opacity:active?1:0.35, transition:"opacity 0.3s" }}>
                  <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:ROLE_COLORS[role], flexShrink:0 }}/>
                  <span style={{ fontSize:"10px", color:T.textMute, fontFamily:"'JetBrains Mono',monospace" }}>{chordLabels[i]} — {ROLE_LABELS[role]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fretboard */}
        <div style={{ background:T.surface, borderRadius:"14px", padding:"18px", border:`1px solid ${T.border}`, marginBottom:"12px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px", flexWrap:"wrap", gap:"8px" }}>
            <SL T={T} style={{ marginBottom:0 }}>BOX — FRETS {position} TO {position+3}</SL>
            <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
              <DotLegend color="#475569" label="Minor pentatonic" opacity={0.6} />
              <DotLegend color="#94a3b8" label="Key root" opacity={0.9} solid />
              <DotLegend color={highlightColor} label="Outlining note" solid />
            </div>
          </div>
          <BoxFretboard keyRoot={selectedKey} position={position} formKey={selectedForm} step={step} T={T} />
        </div>

        {/* Step explanation card */}
        <div style={{
          background:T.surface, borderRadius:"14px", padding:"18px 20px",
          border:`1px solid ${highlightColor}44`, marginBottom:"16px",
          animation:"fadeUp 0.25s ease",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px", flexWrap:"wrap" }}>
            <div style={{
              padding:"4px 12px", borderRadius:"20px",
              background:`${highlightColor}20`, border:`1px solid ${highlightColor}55`,
              fontFamily:"'JetBrains Mono',monospace", fontSize:"11px", fontWeight:"700", color:highlightColor,
            }}>
              {(() => {
                const root = addSemi(selectedKey, SEMIS_FOR_ROLE[stepInfo.highlightRole]);
                const suffix = ROLE_SUFFIX[stepInfo.highlightRole];
                return `${root}${suffix}`;
              })()}
            </div>
            {outlineNoteLabel && (
              <div style={{
                padding:"4px 12px", borderRadius:"20px",
                background:`${highlightColor}12`, border:`1px solid ${highlightColor}44`,
                fontFamily:"'JetBrains Mono',monospace", fontSize:"11px", color:highlightColor,
              }}>+ {outlineNoteLabel}</div>
            )}
            <div style={{ fontSize:"14px", fontWeight:"700", color:T.textHi }}>{stepInfo.headline}</div>
          </div>
          <p style={{ fontSize:"14px", lineHeight:"1.8", color:T.textMid, margin:0 }}>{stepDesc}</p>
          {isDone && (
            <div style={{ marginTop:"14px", paddingTop:"12px", borderTop:`1px solid ${highlightColor}22`, fontSize:"13px", color:"#22C55E", fontStyle:"italic" }}>
              ✓ Box complete. Minor pentatonic as your base, one outlining note per chord change. Now practise over a backing track — don't move your hand. Let those target notes do the talking.
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div style={{ display:"flex", gap:"10px" }}>
          <button className="nav-btn" onClick={reset} style={{ padding:"12px 20px", borderRadius:"10px", border:`1.5px solid ${T.border}`, background:T.surface2, color:T.textMute, fontSize:"13px", fontWeight:"600", transition:"all 0.12s" }}>↺ Reset</button>
          <button className="nav-btn" onClick={() => setStep(s => Math.max(0, s-1))} disabled={step===0} style={{ padding:"12px 18px", borderRadius:"10px", border:`1.5px solid ${T.border}`, background:T.surface2, color:T.textLo, fontSize:"13px", fontWeight:"600", transition:"all 0.12s" }}>← Back</button>
          <button className="nav-btn" onClick={advance} disabled={isDone} style={{
            flex:1, padding:"12px", borderRadius:"10px",
            border:`1.5px solid ${isDone ? "#22C55E" : highlightColor}`,
            background: isDone ? (isDark?"#052e16":"#f0fdf4") : `${highlightColor}15`,
            color: isDone ? "#22C55E" : highlightColor,
            fontSize:"14px", fontWeight:"700", transition:"all 0.12s",
          }}>
            {isDone
              ? "Box complete — try a different position or key ✓"
              : `${steps[step+1]?.label || "Next"} →`
            }
          </button>
        </div>

        <div style={{ textAlign:"center", marginTop:"24px", color:T.border, fontSize:"10px", fontFamily:"'JetBrains Mono',monospace" }}>
          unlocktheguitar.net
        </div>
      </div>
    </div>
  );
}
