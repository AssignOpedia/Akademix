import { useState } from 'react'
import { Search } from 'lucide-react'
import { courses } from '../../data/courses'
import CourseCard from '../../components/CourseCard/CourseCard'
import { Link } from 'react-router-dom'

export default function Courses() {
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('')
  const levels = [...new Set(courses.map((course) => course.level))].sort()
  const normalizedQuery = query.trim().toLowerCase()
  const filteredCourses = courses.filter((course) =>
    (!level || course.level === level) &&
    (!normalizedQuery || `${course.title} ${course.subject} ${course.instructor}`.toLowerCase().includes(normalizedQuery))
  )

  return (
    <div className="container-content py-14">
      <p className="eyebrow mb-2">Learn with Akademix</p>
      <h1 className="font-display text-4xl text-ink mb-3">Courses</h1>
      <p className="text-slate max-w-xl mb-8">
        Structured courses across school, undergraduate and postgraduate levels, taught by
        Akademix experts.
      </p>

      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="font-display text-xl text-ink">Need help with an assignment?</h2><p className="mt-1 text-sm text-slate">Get guidance with understanding the brief, planning research, and clarifying concepts.</p></div>
        <Link to="/assignment-guidance" className="btn-primary shrink-0">Explore assignment guidance</Link>
      </div>

      <div className="card mb-8 grid gap-3 p-4 sm:grid-cols-[1fr_220px_auto] sm:items-center">
        <label className="relative block">
          <span className="sr-only">Search courses</span>
          <Search aria-hidden="true" size={17} className="absolute left-3.5 top-3.5 text-slate" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses or subjects" className="h-11 w-full rounded-lg border border-line bg-white pl-10 pr-3 text-sm outline-none focus:border-brass" />
        </label>
        <label className="sr-only" htmlFor="course-level">Filter courses by level</label>
        <select id="course-level" value={level} onChange={(event) => setLevel(event.target.value)} className="h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:border-brass">
          <option value="">All levels</option>
          {levels.map((courseLevel) => <option key={courseLevel} value={courseLevel}>{courseLevel}</option>)}
        </select>
        {(query || level) && <button type="button" onClick={() => { setQuery(''); setLevel('') }} className="text-sm font-medium text-brass-dark hover:text-ink">Clear filters</button>}
      </div>

      <p className="mb-4 text-sm text-slate" aria-live="polite">{filteredCourses.length} course{filteredCourses.length === 1 ? '' : 's'} found</p>
      {filteredCourses.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div> : <div className="card p-8 text-center"><p className="font-display text-xl text-ink">No courses match these filters.</p><p className="mt-2 text-sm text-slate">Try another search or select a different course level.</p><button type="button" onClick={() => { setQuery(''); setLevel('') }} className="btn-secondary mt-5">Show all courses</button></div>}
    </div>
  )
}
