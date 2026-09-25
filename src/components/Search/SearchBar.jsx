import { useMemo, useRef, useState } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { setSearchQuery } from '../../features/search/searchSlice'
import { professors } from '../../data/professors'
import { allSubjects } from '../../data/subjects'
import { universities } from '../../data/universities'
import { countries } from '../../data/countries'
import { departments } from '../../data/departments'
import { courses } from '../../data/courses'
import { mentorProfiles } from '../../data/mentors'
import CountryFlag from '../UI/CountryFlag'

const normalizeSearchText = (value) => value.toLowerCase().replace(/[^\p{L}\p{N}+#]+/gu, ' ').trim().split(/\s+/).filter(Boolean)

const matchesSearch = (value, query) => {
  const queryWords = normalizeSearchText(query)
  const valueWords = normalizeSearchText(value)
  return queryWords.length > 0 && queryWords.every((word) =>
    valueWords.some((candidate) => candidate === word || (word.length > 1 && candidate.startsWith(word)))
  )
}

export default function SearchBar() {
  const dispatch = useDispatch()
  const query = useSelector((s) => s.search.searchQuery)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return {
      professors: professors.filter((p) => matchesSearch(`${p.name} ${p.title} ${p.university} ${p.subjects.join(' ')} ${p.expertise.join(' ')}`, q)).slice(0, 4),
      subjects: allSubjects.filter((s) => matchesSearch(s.name, q)).slice(0, 4),
      departments: departments.filter((d) => matchesSearch(d.name, q)).slice(0, 4),
      universities: universities.filter((u) => matchesSearch(`${u.name} ${u.city} ${u.country}`, q)).slice(0, 4),
      courses: courses.filter((course) => matchesSearch(`${course.title} ${course.subject} ${course.level}`, q)).slice(0, 4),
      mentors: mentorProfiles.filter((mentor) => matchesSearch(`${mentor.name} ${mentor.role} ${mentor.focus} ${mentor.description}`, q)).slice(0, 4),
      countries: countries.filter((c) => matchesSearch(c.name, q)).slice(0, 4),
      assignmentGuidance: ['Assignment Guidance', 'Python assignment help', 'R programming assignments', 'Data analysis', 'Power BI reports', 'SQL and Microsoft Access', 'Computer networking'].filter((topic) => matchesSearch(topic, q)).slice(0, 1),
    }
  }, [query])

  const hasResults =
    results &&
    (results.professors.length ||
      results.subjects.length ||
      results.departments.length ||
      results.universities.length ||
      results.courses.length ||
      results.mentors.length ||
      results.countries.length ||
      results.assignmentGuidance.length)

  const clearSearch = () => {
    dispatch(setSearchQuery(''))
    setFocused(false)
    inputRef.current?.blur()
  }

  return (
    <div id="global-search" className="relative max-w-xl scroll-mt-28">
      <div className="flex items-center gap-2 border border-line rounded-full px-4 py-2.5 bg-white">
        <SearchIcon size={16} className="text-slate flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search subjects, professors, universities, courses..."
          aria-label="Search Akademix"
          onKeyDown={(event) => { if (event.key === 'Escape') clearSearch() }}
          className="w-full bg-transparent outline-none text-sm placeholder:text-slate-light"
        />
        {query && <button type="button" onClick={clearSearch} aria-label="Clear search and close results" title="Clear search" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate hover:bg-stone hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"><X size={16} /></button>}
      </div>

      {focused && query.trim() && (
        <div className="absolute mt-2 w-full card shadow-lg p-4 z-30 max-h-96 overflow-y-auto">
          {!hasResults && <p className="text-sm text-slate">No matches yet.</p>}

          {results.professors.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-slate mb-1.5">Professors</p>
              {results.professors.map((p) => (
                <Link
                  key={p.id}
                  to={`/professors/${p.id}`}
                  className="block text-sm text-ink py-1 hover:text-brass-dark"
                >
                  {p.name}
                </Link>
              ))}
            </div>
          )}

          {results.subjects.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-slate mb-1.5">Subjects</p>
              {results.subjects.map((s) => (
                <Link
                  key={s.slug}
                  to={`/subjects/${s.slug}`}
                  className="block text-sm text-ink py-1 hover:text-brass-dark"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          )}

          {results.departments.length > 0 && (
            <div className="mb-3"><p className="text-xs text-slate mb-1.5">Departments</p>{results.departments.map((department) => <Link key={department.slug} to={`/professors?department=${department.slug}`} className="block text-sm text-ink py-1 hover:text-brass-dark">{department.name}</Link>)}</div>
          )}

          {results.universities.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-slate mb-1.5">Universities</p>
              {results.universities.map((u) => <Link key={u.id} to={`/universities/${u.id}`} className="block text-sm text-ink py-1 hover:text-brass-dark">{u.name}</Link>)}
            </div>
          )}

          {results.courses.length > 0 && <div className="mb-3"><p className="text-xs text-slate mb-1.5">Courses</p>{results.courses.map((course) => <Link key={course.id} to={`/courses/${course.id}`} className="block text-sm text-ink py-1 hover:text-brass-dark">{course.title}</Link>)}</div>}

          {results.mentors.length > 0 && <div className="mb-3"><p className="text-xs text-slate mb-1.5">Mentors</p>{results.mentors.map((mentor) => <Link key={mentor.id} to="/mentoring" className="block text-sm text-ink py-1 hover:text-brass-dark">{mentor.name}</Link>)}</div>}

          {results.countries.length > 0 && (
            <div>
              <p className="text-xs text-slate mb-1.5">Countries</p>
              {results.countries.map((c) => (
                <Link
                  key={c.code}
                  to={`/countries/${c.code}`}
                  className="block text-sm text-ink py-1 hover:text-brass-dark"
                >
                  <span className="inline-flex items-center gap-2"><CountryFlag country={c} /> {c.name}</span>
                </Link>
              ))}
            </div>
          )}

          {results.assignmentGuidance.length > 0 && (
            <div className="border-t border-line pt-3">
              <p className="text-xs text-slate mb-1.5">Assignment support</p>
              <Link to={`/assignment-guidance?q=${encodeURIComponent(query.trim())}`} onClick={() => setFocused(false)} className="block text-sm text-ink py-1 hover:text-brass-dark">{results.assignmentGuidance[0]} →</Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
