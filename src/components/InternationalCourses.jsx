import { Link } from 'react-router-dom'
import { ExternalLink, X } from 'lucide-react'
import { internationalCourses } from '../data/internationalCourses'
import { countries } from '../data/countries'
import CountryFlag from './UI/CountryFlag'

const featuredCountries = ['Australia', 'New Zealand', 'Poland', 'Singapore', 'United Kingdom']
const priorityCountries = [...featuredCountries, ...countries.map(({ name }) => name).filter((name) => !featuredCountries.includes(name))]

export default function InternationalCourses() {
  const today = new Date().toISOString().slice(0, 10)
  const courses = internationalCourses
    .filter((course) => {
      const closed = /unavailable|applications? closed|intake full|deadline expired|no longer offered|not accepting applications/i.test(course.applicationStatus)
      const deadlinePassed = course.applicationDeadlineDate && course.applicationDeadlineDate < today
      return !closed && !deadlinePassed
    })
    .sort((a, b) => priorityCountries.indexOf(a.country) - priorityCountries.indexOf(b.country))

  return <section id="coaching" className="relative z-10 border-t border-stone-300/60 bg-white/45 py-16 backdrop-blur-xl">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-amber-700">Study around the world</span>
          <h2 className="font-serif text-3xl text-slate-900 sm:text-5xl">Live international courses</h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-700">Explore official course listings, current fee information and upcoming intakes from leading universities.</p>
        </div>
        <div className="rounded-full border border-amber-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700">{countries.length} countries | Australia to Bahrain</div>
      </div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-slate-600">{courses.length} course listings | closed or expired entries are removed automatically</p>
        <span className="text-xs text-slate-500">Pause by hovering over the cards</span>
      </div>
      <div className="overflow-hidden py-3" aria-label="International courses from Australia through Bahrain" style={{ maskImage: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)' }}>
        <div className="flex w-max shrink-0 gap-3 whitespace-nowrap animate-ticker transform-gpu hover:[animation-play-state:paused] motion-reduce:animate-none" style={{ animationDuration: '200s' }}>
          {[...courses, ...courses].map((course, index) => {
            const isDuplicate = index >= courses.length
            const countryInfo = countries.find((item) => item.code === course.countryCode)
            return <article key={`${course.id}-${index}`} aria-hidden={isDuplicate || undefined} className="flex w-[270px] shrink-0 flex-col whitespace-normal rounded-2xl border border-amber-200/80 bg-white/95 p-4 shadow-sm transition hover:shadow-md sm:w-[290px]">
              <div className="mb-2 flex items-center justify-between gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800"><CountryFlag country={countryInfo}/>{course.country}</span><span className="text-[10px] text-slate-500">Verified {course.lastVerified}</span></div>
              <h3 className="text-xs font-bold text-slate-700">{course.university}</h3>
              <p className="mt-1 line-clamp-2 min-h-10 font-serif text-base leading-snug text-slate-900">{course.courseName}</p>
              <div className="mt-3 flex flex-wrap gap-1.5"><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-700">{course.field}</span><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-700">{course.level}</span></div>
              <div className="mt-3 space-y-1 text-xs text-slate-700"><p><span className="font-semibold">Duration:</span> {course.duration}</p><p className="line-clamp-1"><span className="font-semibold">Fee:</span> {course.tuitionFee}</p><p className="line-clamp-1"><span className="font-semibold">Intake:</span> {course.intake}</p><p className="line-clamp-1"><span className="font-semibold">Deadline:</span> {course.applicationDeadline}</p></div>
              <div className="mt-auto flex gap-2 pt-4">
                <Link tabIndex={isDuplicate ? -1 : undefined} to={`/international-courses/${course.id}`} className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-center text-xs font-bold text-white transition hover:bg-amber-600">View Details</Link>
                <a tabIndex={isDuplicate ? -1 : undefined} className="inline-flex items-center justify-center rounded-lg border border-stone-300 px-3 text-amber-800 hover:border-amber-500" href={course.officialUrl} target="_blank" rel="noreferrer" aria-label={`Open official page for ${course.courseName}`}><ExternalLink size={15}/></a>
              </div>
            </article>
          })}
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-600">Course details and fees were reviewed on 7 October 2026 using the linked university pages. Availability and fees can change; confirm them with the institution before applying.</p>
    </div>
  </section>
}


