import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, Search, Wallet, BriefcaseBusiness, X, Repeat2 } from 'lucide-react'
import { getSubjectComparisonProfile } from '../../data/subjectComparison'
import { countries } from '../../data/countries'
import { studyEstimates } from '../../data/studyEstimates'

function SubjectSelector({ label, value, otherValue, search, subjects, onSearch, onSelect, accent }) {
  const results = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return subjects.filter((subject) => subject.name.toLowerCase().includes(needle) && subject.name !== otherValue).slice(0, 6)
  }, [subjects, search, otherValue])

  return <div className={`rounded-2xl border bg-white/85 p-4 shadow-lg backdrop-blur-xl sm:p-5 ${accent === 'cyan' ? 'border-cyan-100 shadow-cyan-950/5' : 'border-violet-100 shadow-violet-950/5'}`}>
    <div className="flex min-h-14 items-start justify-between gap-3"><div><p className={`text-xs font-semibold uppercase tracking-[.16em] ${accent === 'cyan' ? 'text-cyan-800' : 'text-violet-800'}`}>{label}</p><h3 className="mt-1 font-display text-xl text-ink sm:text-2xl">{value || 'Choose a subject'}</h3></div>{value && <Check aria-label="Selected" size={19} className={accent === 'cyan' ? 'text-cyan-700' : 'text-violet-700'} />}</div>
    <label className="relative mt-4 block"><Search size={16} className="absolute left-3.5 top-3.5 text-slate" /><input type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder={`Search ${label.toLowerCase()}...`} aria-label={`Search ${label}`} className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-sm text-ink outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" /></label>
    <div className="mt-3 max-h-52 space-y-1 overflow-auto" role="listbox" aria-label={`${label} search results`}>
      {results.map((subject) => <button key={subject.slug} type="button" role="option" aria-selected={value === subject.name} onClick={() => onSelect(subject.name)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${value === subject.name ? 'bg-indigo-50 font-semibold text-indigo-950' : 'text-slate hover:bg-slate-50 hover:text-ink'}`}><span>{subject.name}</span>{value === subject.name && <Check size={15} className="text-indigo-700" />}</button>)}
      {!results.length && <p className="px-3 py-2 text-sm text-slate">No other subjects match.</p>}
    </div>
  </div>
}   

function Detail({ icon: Icon, title, children, tint = 'indigo' }) {
  const colors = tint === 'cyan' ? 'border-cyan-100 from-cyan-50/70' : tint === 'violet' ? 'border-violet-100 from-violet-50/70' : 'border-indigo-100 from-indigo-50/70'
  return <section className={`rounded-2xl border bg-gradient-to-br ${colors} to-white p-4 sm:p-5`}><h4 className="flex items-center gap-2 text-sm font-semibold text-ink"><Icon size={16} className="text-indigo-700" />{title}</h4><div className="mt-3 text-sm leading-relaxed text-slate">{children}</div></section>
}

function SubjectResult({ profile, accent, costEstimate, countryName }) {
  return <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .32 }} className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/80 shadow-xl shadow-indigo-950/[.06] backdrop-blur-xl">
    <div className={`border-b border-white/20 bg-gradient-to-r ${accent === 'cyan' ? 'from-cyan-950 via-blue-950 to-indigo-950' : 'from-indigo-950 via-violet-950 to-fuchsia-950'} p-5 text-white sm:p-6`}><p className={`text-xs font-semibold uppercase tracking-[.16em] ${accent === 'cyan' ? 'text-cyan-200' : 'text-violet-200'}`}>Subject overview</p><h3 className="mt-2 font-display text-2xl sm:text-3xl">{profile.name}</h3><p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85">{profile.coreFocus}</p></div>
    <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
      <Detail icon={Wallet} title={`Estimated study cost · ${countryName}`} tint={accent}><p className="font-semibold text-indigo-950">{costEstimate.label}</p><p className="mt-2 text-xs">{costEstimate.detail}</p><a href={costEstimate.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-semibold text-indigo-800 underline underline-offset-2">Source: {costEstimate.source}<ArrowRight size={12} className="ml-1" /></a></Detail>
      <Detail icon={BriefcaseBusiness} title="Future scope" tint={accent}>{profile.careerDirections.length ? <><p className="mb-2 text-xs">Possible directions connected to this subject or its field:</p><ul className="flex flex-wrap gap-2">{profile.careerDirections.map((career) => <li key={career} className="rounded-full border border-indigo-100 bg-white/80 px-2.5 py-1 text-xs font-medium text-indigo-950">{career}</li>)}</ul><p className="mt-3 text-xs">These are example career directions, not a prediction of job availability or salary.</p></> : <p>Career directions are not listed for this subject in the current Akademix catalogue.</p>}</Detail>
    </div>
  </motion.article>
}

export default function SubjectComparePanel({ subjects, subjectA, subjectB, activeSlot, onSelect, onSetActiveSlot, onSwap, onClear }) {
  const [searchA, setSearchA] = useState('')
  const [searchB, setSearchB] = useState('')
  const [studyCountry, setStudyCountry] = useState('US')
  const profileA = useMemo(() => subjectA ? getSubjectComparisonProfile(subjectA) : null, [subjectA])
  const profileB = useMemo(() => subjectB ? getSubjectComparisonProfile(subjectB) : null, [subjectB])
  const ready = Boolean(subjectA && subjectB && subjectA !== subjectB)
  const countryName = countries.find((country) => country.code === studyCountry)?.name ?? 'United States'
  const costEstimate = studyEstimates[studyCountry] ?? studyEstimates.US

  return <section id="compare-subjects" className="mt-14 scroll-mt-8">
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-5 text-white shadow-2xl shadow-indigo-950/15 sm:p-8 md:p-10"><div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" /><div className="pointer-events-none absolute -bottom-28 left-1/3 h-60 w-60 rounded-full bg-violet-400/25 blur-3xl" /><div className="relative"><p className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-cyan-100">Academic path comparison</p><h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">Compare subjects</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-indigo-100">Compare a short overview, estimated study cost, and future scope for each subject.</p></div></div>

    <div className="mt-6 grid gap-4 md:grid-cols-2"><SubjectSelector label="Subject A" value={subjectA} otherValue={subjectB} search={searchA} subjects={subjects} onSearch={setSearchA} onSelect={(name) => { onSelect('A', name); setSearchA('') }} accent="cyan" /><SubjectSelector label="Subject B" value={subjectB} otherValue={subjectA} search={searchB} subjects={subjects} onSearch={setSearchB} onSelect={(name) => { onSelect('B', name); setSearchB('') }} accent="violet" /></div>
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-indigo-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl"><label htmlFor="compare-study-country" className="text-sm font-semibold text-ink">Study destination</label><select id="compare-study-country" value={studyCountry} onChange={(event) => setStudyCountry(event.target.value)} className="h-10 min-w-52 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100">{countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}</select><p className="text-xs text-slate">International undergraduate tuition benchmarks; details and study level affect the actual cost.</p></div>
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/70 bg-white/65 p-3 shadow-sm backdrop-blur-xl"><span className="mr-1 text-xs font-semibold uppercase tracking-wider text-slate">Card compare fills</span><button type="button" onClick={() => onSetActiveSlot('A')} aria-pressed={activeSlot === 'A'} className={`rounded-full border px-3 py-2 text-xs font-semibold ${activeSlot === 'A' ? 'border-cyan-300 bg-cyan-50 text-cyan-950' : 'border-line text-slate hover:text-ink'}`}>Replace Subject A</button><button type="button" onClick={() => onSetActiveSlot('B')} aria-pressed={activeSlot === 'B'} className={`rounded-full border px-3 py-2 text-xs font-semibold ${activeSlot === 'B' ? 'border-violet-300 bg-violet-50 text-violet-950' : 'border-line text-slate hover:text-ink'}`}>Replace Subject B</button><div className="ml-auto flex gap-2"><button type="button" onClick={onSwap} disabled={!subjectA || !subjectB} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs font-semibold text-slate hover:border-indigo-200 hover:text-indigo-900 disabled:opacity-40"><Repeat2 size={14} />Swap</button><button type="button" onClick={onClear} disabled={!subjectA && !subjectB} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs font-semibold text-slate hover:border-rose-200 hover:text-rose-800 disabled:opacity-40"><X size={14} />Clear</button></div></div>

    {!ready && <div className="mt-6 rounded-2xl border border-dashed border-indigo-200 bg-white/70 p-6 text-center"><p className="font-display text-xl text-ink">Choose two different subjects to compare</p><p className="mt-2 text-sm text-slate">Use the selectors above or Compare on a subject card.</p></div>}
    <AnimatePresence mode="wait">{ready && profileA && profileB && <motion.div key={`${subjectA}-${subjectB}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .25 }} className="mt-7"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-indigo-900"><span>{subjectA}</span><ArrowRight size={16} /><span>{subjectB}</span></div><div className="grid items-start gap-4 lg:grid-cols-2"><SubjectResult profile={profileA} accent="cyan" costEstimate={costEstimate} countryName={countryName} /><SubjectResult profile={profileB} accent="violet" costEstimate={costEstimate} countryName={countryName} /></div><p className="mt-4 text-xs leading-relaxed text-slate">Cost figures are published country or institution benchmarks, not a personalized quote; most show tuition only and exclude living expenses. Future scope lists example career directions and is not a prediction of job availability or salary.</p></motion.div>}</AnimatePresence>
  </section>
}
