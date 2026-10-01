import { useEffect, useRef, useState } from 'react';

/* ===== EDIT YOUR DATA HERE ===== */
const BARS = [
  { l: 'Wk 2', v: 6 },
  { l: 'Wk 4', v: 11 },
  { l: 'Wk 6', v: 17 },
  { l: 'Wk 8', v: 22 },
  { l: 'Wk 10', v: 27 },
  { l: 'Wk 12', v: 33 },
];

const GOALS = [
  { l: 'Top university admission', v: 38, c: '#d97706' },
  { l: 'Exam score boost', v: 34, c: '#e11d48' },
  { l: 'Research & publishing', v: 20, c: '#4f46e5' },
  { l: 'Career readiness', v: 8, c: '#059669' },
];

// [month, new students that month]
const ENROL = [
  ['Jan', 310], ['Feb', 260], ['Mar', 280], ['Apr', 340], ['May', 420], ['Jun', 380],
  ['Jul', 240], ['Aug', 330], ['Sep', 450], ['Oct', 520], ['Nov', 480], ['Dec', 300],
];
const ENROL_LABEL_AT = [0, 2, 4, 6, 8, 10]; // which points get a month label underneath
const Y_MIN = 200;
const Y_MAX = 600;
const GRID = [300, 400, 500];

const RINGS = [
  { l: 'Student retention', v: 92 },
  { l: 'Goals reached', v: 81 },
  { l: 'Would recommend', v: 96 },
];
/* ================================= */

/* true while the element is on screen, false when it leaves (so animations restart) */
function useInView(threshold = 0.3) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function CountUp({ to, active, suffix = '%', duration = 1600 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) { setV(0); return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(to); return; }
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      setV(Math.round(to * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, to, duration]);
  return <>{v}{suffix}</>;
}

function Card({ title, className = '', children }) {
  const [ref, inView] = useInView(0.3);
  return (
    <div ref={ref} className={`adb-card ${inView ? 'in' : ''} ${className}`}>
      <h4 className="adb-title">{title}</h4>
      {children}
    </div>
  );
}

export default function AnalyticsDashboard() {
  /* line chart geometry */
  const n = ENROL.length;
  const xs = (i) => 26 + (i / (n - 1)) * 264;
  const ys = (v) => 105 - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * 85;
  const pts = ENROL.map(([, v], i) => `${xs(i).toFixed(1)},${ys(v).toFixed(1)}`);
  const peakIdx = ENROL.reduce((best, [, v], i) => (v > ENROL[best][1] ? i : best), 0);
  const peakMonth = ENROL[peakIdx][0];

  /* donut geometry */
  let offset = 0;
  const arcs = GOALS.map((g) => {
    const arc = { ...g, off: -offset * 2.64, d: Math.max(g.v * 2.64 - 3, 1) };
    offset += g.v;
    return arc;
  });

  return (
    <section className="relative z-10 py-24 border-t border-stone-300/60 bg-white/40 backdrop-blur-xl">
      <style>{`
        .adb-card{
          border-radius:1.5rem;border:1px solid rgba(253,230,138,.7);
          background:linear-gradient(135deg,rgba(255,255,255,.95),rgba(255,251,235,.85) 50%,rgba(255,241,242,.75));
          padding:1.75rem;overflow:hidden;
          box-shadow:0 20px 40px rgba(168,162,158,.25);
          transition:transform .35s ease,box-shadow .35s ease,border-color .35s ease;
        }
        .adb-card:hover{transform:translateY(-6px);border-color:rgba(251,191,36,.8);box-shadow:0 22px 50px rgba(217,119,6,.18)}
        .adb-title{margin:0 0 1.25rem;font-size:.75rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#b45309}

        /* bar chart */
        .adb-bars{display:flex;align-items:flex-end;gap:14px;height:250px}
        .adb-bar{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;font-size:12px;font-weight:600;color:#475569}
        .adb-bar i{display:block;width:100%;height:0;border-radius:10px 10px 4px 4px;
          background:linear-gradient(180deg,#f59e0b,rgba(245,158,11,.18));
          box-shadow:0 0 18px rgba(245,158,11,.25);
          transition:height 1.2s cubic-bezier(.2,.9,.3,1) calc(var(--k)*.12s)}
        .adb-card.in .adb-bar i{height:calc(var(--v)*1%)}
        .adb-bar b{font-family:inherit;font-weight:800;font-size:18px;color:#0f172a;margin-bottom:6px}
        .adb-bar span{margin-top:8px}

        /* donut */
        .adb-donut-wrap{display:flex;align-items:center;gap:22px;flex-wrap:wrap}
        .adb-donut{width:150px;height:150px;transform:rotate(-90deg)}
        .adb-sg{stroke-dasharray:0 264;transition:stroke-dasharray 1.4s cubic-bezier(.2,.9,.3,1)}
        .adb-card.in .adb-sg{stroke-dasharray:var(--d) 264}
        .adb-leg{font-size:13px;font-weight:600;color:#334155}
        .adb-leg div{display:flex;align-items:center;gap:8px;padding:3px 0}
        .adb-leg i{width:10px;height:10px;border-radius:3px;flex:none}

        /* line chart: slow draw, restarts each time it scrolls into view */
        .adb-lp{fill:none;stroke:#d97706;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;
          stroke-dasharray:1;stroke-dashoffset:1;filter:drop-shadow(0 0 5px rgba(217,119,6,.5))}
        .adb-card.in .adb-lp{animation:adbDraw 4.5s cubic-bezier(.4,0,.2,1) forwards}
        .adb-la{opacity:0}
        .adb-card.in .adb-la{animation:adbFade 1.6s 3s ease forwards}
        .adb-pk{fill:#d97706;opacity:0}
        .adb-card.in .adb-pk{animation:adbFade .6s 4.2s ease forwards,adbBlink 1.6s 4.8s infinite}
        .adb-txt{fill:#64748b;font-size:8px;font-weight:600}
        @keyframes adbDraw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
        @keyframes adbFade{from{opacity:0}to{opacity:1}}
        @keyframes adbBlink{50%{opacity:.3}}

        /* progress rings */
        .adb-rings{display:flex;justify-content:space-around;gap:20px;flex-wrap:wrap}
        .adb-rg{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center}
        .adb-rg svg{display:block;width:120px;height:120px;transform:rotate(-90deg)}
        .adb-rp{stroke-dasharray:214;stroke-dashoffset:214;stroke-linecap:round;
          transition:stroke-dashoffset 1.6s cubic-bezier(.2,.9,.3,1);filter:drop-shadow(0 0 4px rgba(217,119,6,.45))}
        .adb-card.in .adb-rp{stroke-dashoffset:var(--o)}
        .adb-rg em{position:absolute;top:0;left:50%;width:120px;height:120px;margin-left:-60px;
          display:flex;align-items:center;justify-content:center;line-height:1;
          font-style:normal;font-weight:800;font-size:28px;color:#0f172a}
        .adb-rg small{display:block;margin-top:10px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#334155}

        @media(max-width:640px){.adb-bars{gap:8px;height:220px}.adb-bar b{font-size:14px}}
        @media(prefers-reduced-motion:reduce){
          .adb-bar i,.adb-sg,.adb-rp{transition:none!important}
          .adb-lp,.adb-la,.adb-pk{animation:none!important}
          .adb-card.in .adb-lp{stroke-dashoffset:0}
          .adb-card.in .adb-la,.adb-card.in .adb-pk{opacity:1}
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs uppercase tracking-widest text-amber-700 font-bold mb-3 block">
            Platform Insights
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-slate-900 mb-4">
            The numbers speak for themselves.
          </h2>
          <p className="text-slate-700 text-sm sm:text-base">
            What consistent one-to-one guidance does for a student in twelve weeks.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Bar chart */}
          <Card title="Average score improvement" className="lg:col-span-2">
            <div className="adb-bars">
              {BARS.map((b, i) => (
                <div key={b.l} className="adb-bar" style={{ '--k': i, '--v': b.v * 2 }}>
                  <b>+{b.v}%</b>
                  <i />
                  <span>{b.l}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Donut */}
          <Card title="Student goals">
            <div className="adb-donut-wrap">
              <svg className="adb-donut" viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(15,23,42,.07)" strokeWidth="14" />
                {arcs.map((a) => (
                  <circle
                    key={a.l}
                    className="adb-sg"
                    cx="60" cy="60" r="42" fill="none"
                    stroke={a.c} strokeWidth="14"
                    strokeDashoffset={a.off}
                    style={{ '--d': a.d }}
                  />
                ))}
              </svg>
              <div className="adb-leg">
                {GOALS.map((g) => (
                  <div key={g.l}><i style={{ background: g.c }} />{g.l} {g.v}%</div>
                ))}
              </div>
            </div>
          </Card>

          {/* Line chart: new students each month (replaces Busiest hours) */}
          <Card title="New students each month">
            <svg viewBox="0 0 300 124" className="w-full" aria-hidden="true">
              <defs>
                <linearGradient id="adbArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#d97706" stopOpacity=".3" />
                  <stop offset="1" stopColor="#d97706" stopOpacity="0" />
                </linearGradient>
              </defs>

              {GRID.map((g) => (
                <g key={g}>
                  <line
                    x1="26" x2="290" y1={ys(g)} y2={ys(g)}
                    stroke="rgba(15,23,42,.08)" strokeDasharray="3 4"
                  />
                  <text className="adb-txt" x="0" y={ys(g) + 3}>{g}</text>
                </g>
              ))}

              <polygon className="adb-la" fill="url(#adbArea)" points={`26,105 ${pts.join(' ')} 290,105`} />
              <path className="adb-lp" pathLength="1" d={`M${pts.join(' L')}`} />
              <circle className="adb-pk" cx={xs(peakIdx)} cy={ys(ENROL[peakIdx][1])} r="4" />

              {ENROL_LABEL_AT.map((i) => (
                <text key={ENROL[i][0]} className="adb-txt" x={xs(i)} y="120" textAnchor="middle">
                  {ENROL[i][0]}
                </text>
              ))}
            </svg>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Peaks in {peakMonth}, as application deadlines and exams approach.
            </p>
          </Card>

          {/* Rings */}
          <Card title="Student results" className="lg:col-span-2">
            <RingsInner />
          </Card>
        </div>
      </div>
    </section>
  );
}

/* rings read their own in-view state so the numbers count up each time */
function RingsInner() {
  const [ref, inView] = useInView(0.3);
  return (
    <div ref={ref} className="adb-rings">
      {RINGS.map((r) => (
        <div key={r.l} className="adb-rg">
          <svg viewBox="0 0 80 80" aria-hidden="true">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(15,23,42,.08)" strokeWidth="7" />
            <circle
              className="adb-rp"
              cx="40" cy="40" r="34" fill="none"
              stroke="#d97706" strokeWidth="7"
              style={{ '--o': (214 * (1 - r.v / 100)).toFixed(1) }}
            />
          </svg>
          <em><CountUp to={r.v} active={inView} /></em>
          <small>{r.l}</small>
        </div>
      ))}
    </div>
  );
}