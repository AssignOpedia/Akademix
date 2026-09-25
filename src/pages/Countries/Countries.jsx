import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search, X } from 'lucide-react'
import { countries } from '../../data/countries'
import CountryFlag from '../../components/UI/CountryFlag'

export default function Countries() {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('All regions')
  const regions = ['All regions', ...new Set(countries.map((country) => country.region))]
  const filteredCountries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return countries.filter((country) => {
      const matchesRegion = region === 'All regions' || country.region === region
      const matchesQuery = !normalizedQuery || `${country.name} ${country.region} ${country.popularFields.join(' ')}`.toLowerCase().includes(normalizedQuery)
      return matchesRegion && matchesQuery
    })
  }, [query, region])

  const clearFilters = () => {
    setQuery('')
    setRegion('All regions')
  }

  return (
    <div className="overflow-hidden">
      <section className="bg-ink text-paper">
        <div className="container-content py-16 md:py-20">
          <p className="eyebrow text-brass-light mb-3">Global reach</p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <h1 className="font-display text-4xl md:text-6xl leading-tight">Find your next academic horizon.</h1>
              <p className="text-paper/80 max-w-xl mt-5 leading-relaxed">
                Explore {countries.length} study destinations, each with a growing guide to universities,
                professors and academic pathways.
              </p>
            </div>
            <p className="text-sm text-paper/75 max-w-xs">Every country has a story worth studying.</p>
          </div>
        </div>
      </section>

      <div className="container-content py-10 md:py-14">
        <div className="flex flex-col md:flex-row gap-3 mb-10">
          <label className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search countries or fields"
              aria-label="Search countries or fields"
              className="w-full h-12 rounded-xl border border-line bg-white pl-11 pr-10 text-sm text-ink outline-none transition-shadow focus:border-brass focus:ring-4 focus:ring-brass/10"
            />
            {query && <button onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate hover:text-ink"><X size={17} /></button>}
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {regions.map((item) => (
              <button
                key={item}
                onClick={() => setRegion(item)}
                className={`whitespace-nowrap rounded-xl border px-4 py-3 text-sm transition-colors ${region === item ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-slate hover:border-ink/40 hover:text-ink'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate"><span className="font-medium text-ink">{filteredCountries.length}</span> destinations</p>
          {(query || region !== 'All regions') && <button onClick={clearFilters} className="text-sm text-brass-dark hover:text-ink transition-colors">Clear filters</button>}
        </div>

        {filteredCountries.length > 0 ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCountries.map((c, index) => (
          <Link
            key={c.code}
            to={`/countries/${c.code}`}
            className="card group p-6 flex flex-col min-h-64 animate-fade-up hover:-translate-y-1 hover:border-brass/60 hover:shadow-xl hover:shadow-ink/5 transition-all duration-300"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <CountryFlag country={c} size="lg" />
              <span className="text-xs uppercase tracking-wider text-slate-light">{c.region}</span>
            </div>
            <p className="mt-6 text-xl text-ink font-display">{c.name}</p>
            <p className="text-sm text-slate mt-2 leading-relaxed line-clamp-3">{c.overview}</p>
            <span className="mt-auto pt-5 flex items-center gap-2 text-sm text-brass-dark group-hover:text-ink transition-colors">Explore destination <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" /></span>
          </Link>
        ))}
        </div> : <div className="border border-dashed border-line rounded-2xl py-16 text-center"><p className="font-display text-2xl text-ink">No destinations found</p><p className="text-sm text-slate mt-2">Try another country, region or subject.</p><button onClick={clearFilters} className="btn-secondary mt-6">Reset search</button></div>}
      </div>
    </div>
  )
}
