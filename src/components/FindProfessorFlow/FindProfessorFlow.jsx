import { useState, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { departments } from '../../data/departments'
import { countries } from '../../data/countries'
import { professors } from '../../data/professors'
import { selectExpertForGuidance } from '../../features/professors/professorSlice'
import ProfessorCard from '../ProfessorCard/ProfessorCard'
import CountryFlag from '../UI/CountryFlag'

const levels = ['School', 'Undergraduate', 'Postgraduate', 'Professional']
const guidanceByLevel = {
  School: ['Subject Guidance', 'Academic Guidance'],
  Undergraduate: ['Academic Guidance', 'Assignment Guidance'],
  Postgraduate: ['Research Guidance', 'Higher Study Guidance'],
  Professional: ['Career Guidance', 'Subject Guidance'],
}

export default function FindProfessorFlow() {
  const dispatch = useDispatch()
  const [step, setStep] = useState(1)
  const [level, setLevel] = useState(null)
  const [department, setDepartment] = useState(null)
  const [subject, setSubject] = useState(null)
  const [country, setCountry] = useState(null)
  const [confirmedProfessor, setConfirmedProfessor] = useState(null)

  const subjectsForDept = department ? department.subjects : []

  const results = useMemo(() => {
    if (!subject) return []
    const relevantGuidance = guidanceByLevel[level] ?? []
    let list = professors.filter((professor) =>
      professor.subjects.includes(subject) &&
      professor.guidance.some((guidance) => relevantGuidance.includes(guidance))
    )
    if (!list.length) list = professors.filter((professor) => professor.subjects.includes(subject))
    if (country) list = list.filter((p) => p.countryCode === country.code)
    return list.slice(0, 3)
  }, [level, subject, country])

  const goStep = (n) => setStep(n)

  const reset = () => {
    setStep(1)
    setLevel(null)
    setDepartment(null)
    setSubject(null)
    setCountry(null)
    setConfirmedProfessor(null)
  }

  const handleSelect = (prof) => {
    dispatch(selectExpertForGuidance(prof.id))
    setConfirmedProfessor(prof)
  }

  return (
    <section id="find-professor" className="border-b border-line bg-white">
      <div className="container-content py-16">
        <p className="eyebrow mb-2">Find your professor</p>
        <h2 className="font-display text-3xl md:text-4xl text-ink mb-2">
          Find the right expert for your path.
        </h2>
        <p className="text-slate max-w-xl mb-10">
          Answer four short questions and we'll surface professors whose expertise matches where
          you are headed.
        </p>

        <div className="flex items-center gap-2 mb-10">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`h-1 flex-1 rounded-full ${
                n <= step ? 'bg-brass' : 'bg-line'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div>
            <p className="text-ink font-medium mb-4">What are you studying?</p>
            <div className="grid sm:grid-cols-4 gap-3">
              {levels.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLevel(l)
                    goStep(2)
                  }}
                  className={`rounded-xl border px-4 py-4 text-sm text-left transition-colors ${
                    level === l ? 'border-brass bg-brass/5' : 'border-line hover:border-ink/30'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-ink font-medium mb-4">Choose a department</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {departments.map((d) => (
                <button
                  key={d.slug}
                  onClick={() => {
                    setDepartment(d)
                    setSubject(null)
                    goStep(3)
                  }}
                  className={`rounded-xl border px-4 py-4 text-sm text-left transition-colors ${
                    department?.slug === d.slug
                      ? 'border-brass bg-brass/5'
                      : 'border-line hover:border-ink/30'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
            <button onClick={() => goStep(1)} className="mt-6 text-sm text-slate hover:text-ink">
              ← Back
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-ink font-medium mb-4">Choose a subject</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjectsForDept.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSubject(s)
                    goStep(4)
                  }}
                  className={`rounded-xl border px-4 py-4 text-sm text-left transition-colors ${
                    subject === s ? 'border-brass bg-brass/5' : 'border-line hover:border-ink/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button onClick={() => goStep(2)} className="mt-6 text-sm text-slate hover:text-ink">
              ← Back
            </button>
          </div>
        )}

        {step === 4 && !confirmedProfessor && (
          <div>
            <p className="text-ink font-medium mb-4">Choose a country (optional)</p>
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setCountry(null)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  !country ? 'border-brass bg-brass/5' : 'border-line hover:border-ink/30'
                }`}
              >
                Any country
              </button>
              {countries.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCountry(c)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    country?.code === c.code
                      ? 'border-brass bg-brass/5'
                      : 'border-line hover:border-ink/30'
                  }`}
                >
                  <span className="inline-flex items-center gap-2"><CountryFlag country={c} /> {c.name}</span>
                </button>
              ))}
            </div>

            <p className="text-ink font-medium mb-1">Recommended experts</p>
            <p className="text-xs text-slate mb-4">Matches for {level} study in {subject}{country ? ` in ${country.name}` : ''}.</p>
            {results.length ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.map((p) => (
                  <div key={p.id} className="flex flex-col gap-3">
                    <ProfessorCard professor={p} />
                    <button
                      onClick={() => handleSelect(p)}
                      className="btn-primary self-start"
                    >
                      Select Professor
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate">
                No professors match this exact combination yet — try "Any country" or a different
                subject.
              </p>
            )}

            <button onClick={() => goStep(3)} className="mt-6 text-sm text-slate hover:text-ink">
              ← Back
            </button>
          </div>
        )}

        {confirmedProfessor && (
          <div className="card p-8 max-w-lg">
            <p className="eyebrow mb-2">Selection confirmed</p>
            <h3 className="font-display text-2xl text-ink mb-3">
              You selected {confirmedProfessor.name} for academic guidance.
            </h3>
            <p className="text-slate mb-6">
              Your selection is saved for this visit. No request has been sent yet.
            </p>
            <div className="flex items-center gap-4">
              <Link
                to={`/professors/${confirmedProfessor.id}`}
                className="btn-primary"
              >
                Continue
              </Link>
              <button onClick={reset} className="text-sm text-slate hover:text-ink">
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
