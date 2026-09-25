import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import { universities } from '../../data/universities'
import { countries } from '../../data/countries'
import { professors } from '../../data/professors'
import UniversityCard from '../../components/UniversityCard/UniversityCard'
import ProfessorCard from '../../components/ProfessorCard/ProfessorCard'
import CountryFlag from '../../components/UI/CountryFlag'

export default function Universities() {
  const { id } = useParams()
  const [country, setCountry] = useState(null)
  const [query, setQuery] = useState('')

  if (id) {
    const university = universities.find((item) => item.id === id)
    if (!university) return <Navigate to="/universities" replace />
    const countryData = countries.find((item) => item.code === university.countryCode)
    const relatedProfessors = professors.filter((professor) => professor.university === university.name)
    return <div className="container-content py-14"><Link to="/universities" className="inline-flex items-center gap-2 text-sm text-slate hover:text-ink"><ArrowLeft size={15} /> All universities</Link><div className="mt-8 max-w-3xl"><p className="eyebrow mb-2">University profile</p><div className="flex items-start gap-4"><CountryFlag country={countryData} size="lg" /><div><h1 className="font-display text-4xl text-ink">{university.name}</h1><p className="text-slate mt-2">{university.city}, {university.country} · {university.type}</p></div></div></div><div className="mt-12 grid lg:grid-cols-[1fr_320px] gap-10"><main><section><h2 className="font-display text-2xl text-ink mb-4">Academic areas</h2><div className="flex flex-wrap gap-2">{university.departments.map((department) => <span key={department} className="rounded-full border border-line bg-stone px-3 py-1.5 text-sm text-ink">{department}</span>)}</div><h2 className="font-display text-2xl text-ink mt-10 mb-4">Popular subjects</h2><div className="flex flex-wrap gap-2">{university.popularSubjects.map((subject) => <Link key={subject} to={`/subjects/${subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="rounded-full border border-line px-3 py-1.5 text-sm text-slate hover:text-ink hover:border-ink/30">{subject}</Link>)}</div></section><section className="mt-12"><h2 className="font-display text-2xl text-ink mb-6">Related professors</h2>{relatedProfessors.length ? <div className="grid sm:grid-cols-2 gap-5">{relatedProfessors.map((professor) => <ProfessorCard key={professor.id} professor={professor} />)}</div> : <p className="text-slate">Related professor profiles are being added to our directory.</p>}</section></main><aside className="card bg-stone p-6 h-fit"><p className="eyebrow mb-2">International pathway</p><h2 className="font-display text-2xl text-ink">Plan your next step</h2><p className="text-sm text-slate mt-3">Explore professors, subjects, and country guidance connected to this university.</p><Link to={`/countries/${university.countryCode}`} className="btn-primary mt-6">Explore {university.country}</Link></aside></div></div>
  }

  const filtered = universities.filter((university) => {
      if (country && university.countryCode !== country) return false
      const normalizedQuery = query.trim().toLowerCase()
      return !normalizedQuery || `${university.name} ${university.city} ${university.country} ${university.departments.join(' ')} ${university.popularSubjects.join(' ')}`.toLowerCase().includes(normalizedQuery)
    })

  return (
    <div className="container-content py-14">
      <p className="eyebrow mb-2">Explore universities</p>
      <h1 className="font-display text-4xl text-ink mb-3">Global universities</h1>
      <p className="text-slate max-w-xl mb-10">
        Explore a curated starting point of established universities across our supported countries.
        Always confirm current programmes, entry requirements, and deadlines with each university.
      </p>

      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setCountry(null)}
          className={`rounded-full border px-4 py-2 text-sm ${
            !country ? 'border-brass bg-brass/5' : 'border-line text-slate hover:text-ink'
          }`}
        >
          All countries
        </button>
        {countries.map((c) => (
          <button
            key={c.code}
            onClick={() => setCountry(c.code)}
            className={`rounded-full border px-4 py-2 text-sm ${
              country === c.code ? 'border-brass bg-brass/5' : 'border-line text-slate hover:text-ink'
            }`}
          >
            <span className="inline-flex items-center gap-2"><CountryFlag country={c} /> {c.name}</span>
          </button>
        ))}
      </div>

      <div className="relative mb-5 max-w-md">
        <Search aria-hidden="true" size={17} className="absolute left-3.5 top-3.5 text-slate" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by university, city, subject..." aria-label="Search universities" className="h-11 w-full rounded-lg border border-line bg-white pl-10 pr-3 text-sm outline-none focus:border-brass" />
      </div>
      <p className="mb-4 text-sm text-slate" aria-live="polite">{filtered.length} universit{filtered.length === 1 ? 'y' : 'ies'} found</p>

      {filtered.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((u) => (
          <UniversityCard key={u.id} university={u} />
        ))}
      </div> : <div className="card p-8 text-center"><p className="font-display text-xl text-ink">No universities match these filters.</p><button type="button" onClick={() => { setCountry(null); setQuery('') }} className="btn-secondary mt-5">Clear filters</button></div>}
    </div>
  )
}
