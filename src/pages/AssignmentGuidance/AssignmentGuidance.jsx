import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'

const guidanceAreas = [
  {
    title: 'Programming and data',
    topics: ['Python', 'R programming', 'Data analysis', 'Statistics', 'Power BI', 'SQL', 'Microsoft Access', 'Data visualization'],
    description: 'Work through code, datasets, queries, reports, and analytical methods.',
  },
  {
    title: 'Computer science and networking',
    topics: ['Computer networking', 'Cybersecurity', 'Databases', 'Operating systems', 'Web development', 'Algorithms', 'Cloud computing'],
    description: 'Clarify technical concepts, plan practical work, and troubleshoot your own approach.',
  },
  {
    title: 'Business and finance',
    topics: ['Accounting', 'Business reports', 'Economics', 'Financial analysis', 'Marketing', 'Management', 'Spreadsheets'],
    description: 'Get help structuring case studies, calculations, reports, and business research.',
  },
  {
    title: 'Science and engineering',
    topics: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering', 'Lab reports', 'Environmental science'],
    description: 'Break down problem sets, explain concepts, and organize lab or project reports.',
  },
  {
    title: 'Research and academic writing',
    topics: ['Research questions', 'Literature reviews', 'Essay planning', 'Citations', 'Academic writing', 'Research methods'],
    description: 'Plan your work, evaluate sources, organize evidence, and improve clarity.',
  },
  {
    title: 'Humanities and social sciences',
    topics: ['History', 'Psychology', 'Sociology', 'Political science', 'Geography', 'Education', 'Law'],
    description: 'Develop arguments, interpret sources, and structure subject-specific assignments.',
  },
  {
    title: 'Health and creative subjects',
    topics: ['Public health', 'Nursing', 'Medicine', 'Design', 'Media', 'Architecture', 'Presentations'],
    description: 'Shape project plans, explain course concepts, and prepare clear presentations.',
  },
]

export default function AssignmentGuidance() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const normalizedQuery = query.trim().toLowerCase()
  const filteredAreas = useMemo(() => guidanceAreas.filter((area) =>
    !normalizedQuery || `${area.title} ${area.description} ${area.topics.join(' ')}`.toLowerCase().includes(normalizedQuery)
  ), [normalizedQuery])

  return (
    <div className="container-content py-14">
      <p className="eyebrow mb-2">Assignment guidance</p>
      <h1 className="max-w-3xl font-display text-4xl text-ink md:text-5xl">Get help understanding your assignment</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-slate">Explore guidance across technical, research, business, science, and creative subjects. Work through the brief and concepts so you can complete your own work with confidence.</p>

      <label className="relative mt-8 block max-w-xl">
        <span className="sr-only">Search assignment topics</span>
        <Search aria-hidden="true" size={18} className="absolute left-3.5 top-3.5 text-slate" />
        <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setSearchParams(event.target.value ? { q: event.target.value } : {}, { replace: true }) }} placeholder="Search Python, Power BI, networking..." className="h-12 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-sm outline-none focus:border-brass" />
      </label>
      <p className="mt-3 text-sm text-slate" aria-live="polite">{filteredAreas.length} guidance area{filteredAreas.length === 1 ? '' : 's'} found</p>

      {filteredAreas.length ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAreas.map((area) => (
            <article key={area.title} className="card flex flex-col p-6">
              <h2 className="font-display text-xl text-ink">{area.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate">{area.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {area.topics.map((topic) => <span key={topic} className="rounded-full border border-line bg-stone px-3 py-1 text-xs text-ink">{topic}</span>)}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card mt-5 p-7 text-center">
          <p className="font-medium text-ink">No matching topic found.</p>
          <p className="mt-1 text-sm text-slate">Try a broader subject or contact a student mentor to discuss what you need.</p>
          <button type="button" onClick={() => { setQuery(''); setSearchParams({}, { replace: true }) }} className="btn-secondary mt-4">Clear search</button>
        </div>
      )}

      <div className="mt-10 rounded-2xl bg-ink p-6 text-paper sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div><p className="font-display text-2xl">Talk through your assignment</p><p className="mt-2 max-w-xl text-sm text-paper/70">Tell a student mentor what subject and guidance you are looking for.</p></div>
        <Link to="/mentoring" className="btn-primary mt-5 inline-flex shrink-0 sm:mt-0">Meet the mentors</Link>
      </div>
    </div>
  )
}
