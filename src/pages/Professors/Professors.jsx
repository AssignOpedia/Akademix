import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { setProfessorFilters, clearProfessorFilters } from '../../features/professors/professorSlice'
import { countries } from '../../data/countries'
import { departments } from '../../data/departments'
import ProfessorGrid from '../../components/ProfessorGrid/ProfessorGrid'
import CountryFlag from '../../components/UI/CountryFlag'

export default function Professors() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { professors, professorFilters, favoriteExperts } = useSelector((s) => s.professors)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const queryDepartment = departments.find((department) => department.slug === searchParams.get('department'))?.name
  const activeDepartment = queryDepartment || professorFilters.department

  const filtered = useMemo(() => {
    const result = professors.filter((p) => {
      if (favoritesOnly && !favoriteExperts.includes(p.id)) return false
      const query = professorFilters.query.trim().toLowerCase()
      if (query && !`${p.name} ${p.title} ${p.university} ${p.subjects.join(' ')} ${p.expertise.join(' ')}`.toLowerCase().includes(query)) return false
      if (professorFilters.country && p.country !== professorFilters.country) return false
      if (activeDepartment && p.department !== activeDepartment) return false
      if (professorFilters.subject && !p.subjects.includes(professorFilters.subject)) return false
      if (professorFilters.university && p.university !== professorFilters.university) return false
      if (professorFilters.guidance && !p.guidance.includes(professorFilters.guidance)) return false
      if (professorFilters.language && !p.languages.includes(professorFilters.language)) return false
      if (p.experience < professorFilters.minExperience) return false
      return true
    })
    if (professorFilters.sort === 'experience') return [...result].sort((a, b) => b.experience - a.experience)
    if (professorFilters.sort === 'name') return [...result].sort((a, b) => a.name.localeCompare(b.name))
    return result
  }, [professors, professorFilters, activeDepartment, favoritesOnly, favoriteExperts])

  const universities = [...new Set(professors.map((professor) => professor.university))]
  const subjects = [...new Set(professors.flatMap((professor) => professor.subjects))].sort()
  const guidanceTypes = [...new Set(professors.flatMap((professor) => professor.guidance))].sort()
  const languages = [...new Set(professors.flatMap((professor) => professor.languages))].sort()

  return (
    <div className="container-content py-14">
      <p className="eyebrow mb-2">Find a professor</p>
      <h1 className="font-display text-4xl text-ink mb-3">Meet our experts</h1>
      <p className="text-slate max-w-xl mb-8">
        Search by academic fit, compare experts, and choose the kind of guidance you need.
      </p>

      <div className="card p-4 md:p-5 mb-8 grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        <input value={professorFilters.query} onChange={(event) => dispatch(setProfessorFilters({ query: event.target.value }))} placeholder="Search professors, subjects..." aria-label="Search professors" className="h-11 rounded-lg border border-line px-3 text-sm outline-none focus:border-brass" />
        <select value={professorFilters.subject || ''} onChange={(event) => dispatch(setProfessorFilters({ subject: event.target.value || null }))} className="h-11 rounded-lg border border-line px-3 text-sm bg-white"><option value="">All subjects</option>{subjects.map((subject) => <option key={subject}>{subject}</option>)}</select>
        <select value={professorFilters.university || ''} onChange={(event) => dispatch(setProfessorFilters({ university: event.target.value || null }))} className="h-11 rounded-lg border border-line px-3 text-sm bg-white"><option value="">All universities</option>{universities.map((university) => <option key={university}>{university}</option>)}</select>
        <select value={professorFilters.guidance || ''} onChange={(event) => dispatch(setProfessorFilters({ guidance: event.target.value || null }))} className="h-11 rounded-lg border border-line px-3 text-sm bg-white"><option value="">All guidance types</option>{guidanceTypes.map((guidance) => <option key={guidance}>{guidance}</option>)}</select>
        <select value={professorFilters.language || ''} onChange={(event) => dispatch(setProfessorFilters({ language: event.target.value || null }))} className="h-11 rounded-lg border border-line px-3 text-sm bg-white"><option value="">All languages</option>{languages.map((language) => <option key={language}>{language}</option>)}</select>
        <select value={professorFilters.minExperience} onChange={(event) => dispatch(setProfessorFilters({ minExperience: Number(event.target.value) }))} className="h-11 rounded-lg border border-line px-3 text-sm bg-white"><option value="0">Any experience</option><option value="5">5+ years</option><option value="10">10+ years</option><option value="15">15+ years</option></select>
        <select value={professorFilters.sort} onChange={(event) => dispatch(setProfessorFilters({ sort: event.target.value }))} className="h-11 rounded-lg border border-line px-3 text-sm bg-white"><option value="recommended">Recommended</option><option value="experience">Most experience</option><option value="name">Name A-Z</option></select>
        <button onClick={() => { dispatch(clearProfessorFilters()); setSearchParams({}); setFavoritesOnly(false) }} className="btn-secondary h-11">Clear filters</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => { dispatch(clearProfessorFilters()); setSearchParams({}); setFavoritesOnly(false) }}
          className={`rounded-full border px-4 py-2 text-sm ${
            !professorFilters.country && !activeDepartment
              ? 'border-brass bg-brass/5'
              : 'border-line text-slate hover:text-ink'
          }`}
        >
          All
        </button>
        {departments.map((d) => (
          <button
            key={d.slug}
            onClick={() => { dispatch(setProfessorFilters({ department: null })); setSearchParams({ department: d.slug }) }}
            className={`rounded-full border px-4 py-2 text-sm ${
              activeDepartment === d.name
                ? 'border-brass bg-brass/5'
                : 'border-line text-slate hover:text-ink'
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {countries.map((c) => (
          <button
            key={c.code}
            onClick={() =>
              dispatch(
                setProfessorFilters({
                  country: professorFilters.country === c.name ? null : c.name,
                })
              )
            }
            className={`rounded-full border px-3.5 py-1.5 text-xs ${
              professorFilters.country === c.name
                ? 'border-brass bg-brass/5'
                : 'border-line text-slate hover:text-ink'
            }`}
          >
            <span className="inline-flex items-center gap-2"><CountryFlag country={c} /> {c.name}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-sm text-slate"><span className="font-medium text-ink">{filtered.length}</span> experts found</p>
        <div className="flex items-center gap-4">
          <button type="button" aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly((value) => !value)} className={`text-xs font-medium ${favoritesOnly ? 'text-brass-dark underline underline-offset-4' : 'text-slate hover:text-ink'}`}>
            {favoritesOnly ? 'Showing favorites' : `My favorites (${favoriteExperts.length})`}
          </button>
          <p className="text-xs text-slate">Use the compare icon to shortlist up to three</p>
        </div>
      </div>
      <ProfessorGrid professors={filtered} />
    </div>
  )
}
